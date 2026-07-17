
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { roleValidator } from "./lib/validators";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      // Extra signup fields (role, name) get validated here and are
      // available in the `profile` callback below.
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
          role: (params.role as string) ?? "tenant",
        };
      },
    }),
  ],
  callbacks: {
    /**
     * Runs after a user record is created/looked up during sign-in.
     * We use it to stamp app-specific defaults onto the users table
     * the first time a given auth identity signs in.
     */
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId, profile }) {
      if (existingUserId) return; // already has app fields set

      await ctx.db.patch(userId, {
        role: (profile as any).role ?? "tenant",
        isActive: true,
        createdAt: Date.now(),
      });
    },
  },
});

// Re-exported so schema.ts / other files can share the same validator
// if the auth config itself ever needs to validate a role at the edge.
export const _roleValidator = v.optional(roleValidator);
