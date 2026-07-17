
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireAuth, requireRole } from "./lib/permissions";
import { roleValidator } from "./lib/validators";

/** The signed-in user's own profile, or null if signed out. */
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

/** Update the signed-in user's own editable profile fields. */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    tenantType: v.optional(
      v.union(v.literal("individual"), v.literal("family"), v.literal("corporate")),
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.phone !== undefined) patch.phone = args.phone;
    if (args.tenantType !== undefined) patch.tenantType = args.tenantType;
    await ctx.db.patch(user._id, patch);
  },
});

/** Admin: list all users, optionally filtered by role. */
export const listUsers = query({
  args: {
    role: v.optional(roleValidator),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    if (args.role) {
      return await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role!))
        .collect();
    }
    return await ctx.db.query("users").collect();
  },
});

/** Admin: change a user's role. */
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin"]);
    await ctx.db.patch(args.userId, { role: args.role });
    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      action: "user.role_change",
      targetTable: "users",
      targetId: args.userId,
      metadata: JSON.stringify({ newRole: args.role }),
      createdAt: Date.now(),
    });
  },
});

/** Admin: activate/deactivate a user (soft delete / access revoke). */
export const setUserActive = mutation({
  args: {
    userId: v.id("users"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin"]);
    await ctx.db.patch(args.userId, { isActive: args.isActive });
    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      action: args.isActive ? "user.activate" : "user.deactivate",
      targetTable: "users",
      targetId: args.userId,
      createdAt: Date.now(),
    });
  },
});

/** Owner/manager/admin: find a tenant by exact email, for assigning to a lease. */
export const findTenantByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["owner", "manager", "admin"]);
    const match = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();
    if (!match || match.role !== "tenant") return null;
    return match;
  },
});

/** Helper query used by dashboards to look up any tenant/owner by id for display. */
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.get(args.userId);
  },
});
