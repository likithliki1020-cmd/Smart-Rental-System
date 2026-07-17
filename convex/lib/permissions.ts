import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;
export type Role = "owner" | "tenant" | "manager" | "admin";

/**
 * Resolves the signed-in user's profile document, or null if not signed in.
 * Every other helper here builds on top of this.
 */
export async function getCurrentUser(ctx: Ctx): Promise<Doc<"users"> | null> {
  const authUserId = await getAuthUserId(ctx);
  if (!authUserId) return null;
  const user = await ctx.db.get(authUserId as Id<"users">);
  return user ?? null;
}

/**
 * Throws if there is no signed-in user. Returns the user doc otherwise.
 */
export async function requireAuth(ctx: Ctx): Promise<Doc<"users">> {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Not authenticated.");
  return user;
}

/**
 * Throws unless the signed-in user's role is one of `roles`.
 * Usage: const user = await requireRole(ctx, ["owner", "manager"]);
 */
export async function requireRole(ctx: Ctx, roles: Role[]): Promise<Doc<"users">> {
  const user = await requireAuth(ctx);
  if (!roles.includes(user.role)) {
    throw new Error(`Forbidden: requires one of [${roles.join(", ")}], got "${user.role}".`);
  }
  return user;
}

/**
 * Throws unless the user owns the given property, or is a manager/admin
 * (who have cross-property access). Returns the property doc.
 */
export async function requirePropertyAccess(
  ctx: Ctx,
  propertyId: Id<"properties">,
  user: Doc<"users">,
): Promise<Doc<"properties">> {
  const property = await ctx.db.get(propertyId);
  if (!property) throw new Error("Property not found.");

  if (user.role === "manager" || user.role === "admin") return property;
  if (user.role === "owner" && property.ownerId === user._id) return property;

  throw new Error("Forbidden: you do not have access to this property.");
}
