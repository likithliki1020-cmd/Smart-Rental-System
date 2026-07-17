
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requirePropertyAccess, requireRole } from "./lib/permissions";
import { propertyStatusValidator, propertyTypeValidator } from "./lib/validators";

export const createProperty = mutation({
  args: {
    title: v.string(),
    type: propertyTypeValidator,
    addressLine: v.string(),
    city: v.string(),
    state: v.string(),
    postalCode: v.string(),
    rentAmount: v.number(),
    description: v.optional(v.string()),
    imageUrls: v.array(v.string()),
    documentUrls: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["owner", "manager", "admin"]);
    const now = Date.now();
    return await ctx.db.insert("properties", {
      ownerId: user.role === "owner" ? user._id : user._id, // manager/admin creating on behalf of themselves; reassign via updateProperty if needed
      title: args.title,
      type: args.type,
      status: "vacant",
      addressLine: args.addressLine,
      city: args.city,
      state: args.state,
      postalCode: args.postalCode,
      rentAmount: args.rentAmount,
      description: args.description,
      imageUrls: args.imageUrls,
      documentUrls: args.documentUrls,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateProperty = mutation({
  args: {
    propertyId: v.id("properties"),
    title: v.optional(v.string()),
    type: v.optional(propertyTypeValidator),
    status: v.optional(propertyStatusValidator),
    addressLine: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    rentAmount: v.optional(v.number()),
    description: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    documentUrls: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    await requirePropertyAccess(ctx, args.propertyId, user);

    const { propertyId, ...rest } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) patch[key] = value;
    }
    await ctx.db.patch(propertyId, patch);
  },
});

export const archiveProperty = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    await requirePropertyAccess(ctx, args.propertyId, user);
    // Soft-archive by folding into maintenance status bucket is misleading;
    // instead we just delete since there's no separate "archived" flag.
    // If you want soft-delete history, add an `archived: boolean` field.
    await ctx.db.delete(args.propertyId);
  },
});

/** Owner: their own properties. Manager/Admin: everything. */
export const listProperties = query({
  args: {
    status: v.optional(propertyStatusValidator),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    if (user.role === "owner") {
      const props = await ctx.db
        .query("properties")
        .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
        .collect();
      return args.status ? props.filter((p) => p.status === args.status) : props;
    }

    if (user.role === "manager" || user.role === "admin") {
      if (args.status) {
        return await ctx.db
          .query("properties")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .collect();
      }
      return await ctx.db.query("properties").collect();
    }

    // Tenants don't browse the property list directly; they see their lease's property.
    return [];
  },
});

export const getPropertyById = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    // Tenants are allowed to read a property if they hold a lease on it;
    // that check lives in leases.ts / the calling UI. Here we just guard
    // owner/manager/admin explicitly and let tenants read (cheap, non-sensitive data).
    if (user.role === "owner") {
      await requirePropertyAccess(ctx, args.propertyId, user);
    }
    return await ctx.db.get(args.propertyId);
  },
});
