
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requirePropertyAccess, requireRole } from "./lib/permissions";
import { leaseStatusValidator } from "./lib/validators";

export const createLease = mutation({
  args: {
    propertyId: v.id("properties"),
    tenantId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
    rentAmount: v.number(),
    dueDayOfMonth: v.number(),
    depositAmount: v.number(),
    agreementUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["owner", "manager", "admin"]);
    const property = await requirePropertyAccess(ctx, args.propertyId, user);

    const tenant = await ctx.db.get(args.tenantId);
    if (!tenant || tenant.role !== "tenant") {
      throw new Error("tenantId must reference a user with role 'tenant'.");
    }

    const leaseId = await ctx.db.insert("leases", {
      propertyId: args.propertyId,
      ownerId: property.ownerId,
      tenantId: args.tenantId,
      status: "pending",
      startDate: args.startDate,
      endDate: args.endDate,
      rentAmount: args.rentAmount,
      dueDayOfMonth: args.dueDayOfMonth,
      depositAmount: args.depositAmount,
      agreementUrl: args.agreementUrl,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.propertyId, {
      status: "occupied",
      updatedAt: Date.now(),
    });

    return leaseId;
  },
});

export const updateLeaseStatus = mutation({
  args: {
    leaseId: v.id("leases"),
    status: leaseStatusValidator,
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["owner", "manager", "admin"]);
    const lease = await ctx.db.get(args.leaseId);
    if (!lease) throw new Error("Lease not found.");
    if (user.role === "owner" && lease.ownerId !== user._id) {
      throw new Error("Forbidden: not your lease.");
    }

    await ctx.db.patch(args.leaseId, { status: args.status });

    if (args.status === "inactive") {
      await ctx.db.patch(lease.propertyId, {
        status: "vacant",
        updatedAt: Date.now(),
      });
    }
  },
});

/** Tenant: their own lease(s). Owner: leases on their properties. Manager/Admin: all. */
export const listLeases = query({
  args: {
    propertyId: v.optional(v.id("properties")),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    if (user.role === "tenant") {
      return await ctx.db
        .query("leases")
        .withIndex("by_tenant", (q) => q.eq("tenantId", user._id))
        .collect();
    }

    if (user.role === "owner") {
      const leases = await ctx.db
        .query("leases")
        .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
        .collect();
      return args.propertyId ? leases.filter((l) => l.propertyId === args.propertyId) : leases;
    }

    // manager / admin
    if (args.propertyId) {
      return await ctx.db
        .query("leases")
        .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId!))
        .collect();
    }
    return await ctx.db.query("leases").collect();
  },
});

/** Owner/manager/admin: tenants + their lease + property, joined server-side for the Tenants list screen. */
export const listTenantSummaries = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireRole(ctx, ["owner", "manager", "admin"]);

    const leases =
      user.role === "owner"
        ? await ctx.db
            .query("leases")
            .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
            .collect()
        : await ctx.db.query("leases").collect();

    return await Promise.all(
      leases.map(async (lease) => {
        const [tenant, property] = await Promise.all([
          ctx.db.get(lease.tenantId),
          ctx.db.get(lease.propertyId),
        ]);
        return { lease, tenant, property };
      }),
    );
  },
});

export const getLeaseById = query({
  args: { leaseId: v.id("leases") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const lease = await ctx.db.get(args.leaseId);
    if (!lease) return null;

    const allowed =
      user.role === "manager" ||
      user.role === "admin" ||
      (user.role === "owner" && lease.ownerId === user._id) ||
      (user.role === "tenant" && lease.tenantId === user._id);

    if (!allowed) throw new Error("Forbidden: not your lease.");
    return lease;
  },
});
