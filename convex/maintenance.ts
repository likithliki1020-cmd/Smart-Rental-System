
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireRole } from "./lib/permissions";
import { maintenanceCategoryValidator, maintenanceStatusValidator } from "./lib/validators";
import type { Doc } from "./_generated/dataModel";

export const createRequest = mutation({
  args: {
    leaseId: v.id("leases"),
    category: maintenanceCategoryValidator,
    title: v.string(),
    description: v.string(),
    imageUrls: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["tenant"]);
    const lease = await ctx.db.get(args.leaseId);
    if (!lease) throw new Error("Lease not found.");
    if (lease.tenantId !== user._id) throw new Error("Forbidden: not your lease.");

    const requestId = await ctx.db.insert("maintenanceRequests", {
      leaseId: args.leaseId,
      propertyId: lease.propertyId,
      ownerId: lease.ownerId,
      tenantId: user._id,
      category: args.category,
      status: "open",
      title: args.title,
      description: args.description,
      imageUrls: args.imageUrls,
      createdAt: Date.now(),
    });

    await ctx.db.patch(lease.propertyId, { status: "maintenance", updatedAt: Date.now() });

    await ctx.db.insert("notifications", {
      userId: lease.ownerId,
      type: "maintenance_update",
      title: "New maintenance request",
      body: args.title,
      read: false,
      relatedId: requestId,
      createdAt: Date.now(),
    });

    return requestId;
  },
});

export const assignRequest = mutation({
  args: {
    requestId: v.id("maintenanceRequests"),
    managerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["owner", "manager", "admin"]);
    const manager = await ctx.db.get(args.managerId);
    if (!manager || manager.role !== "manager") {
      throw new Error("managerId must reference a user with role 'manager'.");
    }
    await ctx.db.patch(args.requestId, {
      assignedManagerId: args.managerId,
      status: "in_progress",
    });
  },
});

export const updateRequestStatus = mutation({
  args: {
    requestId: v.id("maintenanceRequests"),
    status: maintenanceStatusValidator,
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["owner", "manager", "admin"]);
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found.");
    if (user.role === "owner" && request.ownerId !== user._id) {
      throw new Error("Forbidden: not your property.");
    }

    await ctx.db.patch(args.requestId, {
      status: args.status,
      resolvedAt: args.status === "closed" ? Date.now() : undefined,
    });

    if (args.status === "closed") {
      const remainingOpen = await ctx.db
        .query("maintenanceRequests")
        .withIndex("by_property", (q) => q.eq("propertyId", request.propertyId))
        .collect();
      const stillUnderMaintenance = remainingOpen.some(
        (r) => r._id !== request._id && r.status !== "closed",
      );

      if (!stillUnderMaintenance) {
        const activeLease = await ctx.db
          .query("leases")
          .withIndex("by_property", (q) => q.eq("propertyId", request.propertyId))
          .collect();
        const hasActiveLease = activeLease.some((l) => l.status === "active");
        await ctx.db.patch(request.propertyId, {
          status: hasActiveLease ? "occupied" : "vacant",
          updatedAt: Date.now(),
        });
      }
    }

    await ctx.db.insert("notifications", {
      userId: request.tenantId,
      type: "maintenance_update",
      title: "Maintenance request updated",
      body: `Your request "${request.title}" is now ${args.status}.`,
      read: false,
      relatedId: request._id,
      createdAt: Date.now(),
    });
  },
});

/** Role-scoped list: tenant sees their own, owner sees their properties', manager/admin see all (or by status). */
export const listRequests = query({
  args: { status: v.optional(maintenanceStatusValidator) },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    let rows: Doc<"maintenanceRequests">[];
    if (user.role === "tenant") {
      rows = await ctx.db
        .query("maintenanceRequests")
        .withIndex("by_tenant", (q) => q.eq("tenantId", user._id))
        .collect();
    } else if (user.role === "owner") {
      rows = await ctx.db
        .query("maintenanceRequests")
        .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
        .collect();
    } else if (user.role === "manager") {
      // Managers need to see unclaimed (open) requests so they can take them,
      // plus anything already assigned to them specifically.
      const [openRequests, myRequests] = await Promise.all([
        ctx.db
          .query("maintenanceRequests")
          .withIndex("by_status", (q) => q.eq("status", "open"))
          .collect(),
        ctx.db
          .query("maintenanceRequests")
          .withIndex("by_manager", (q) => q.eq("assignedManagerId", user._id))
          .collect(),
      ]);
      const merged = new Map(openRequests.map((r) => [r._id, r]));
      for (const r of myRequests) merged.set(r._id, r);
      rows = Array.from(merged.values());
    } else {
      rows = await ctx.db.query("maintenanceRequests").collect();
    }

    return args.status ? rows.filter((r) => r.status === args.status) : rows;
  },
});