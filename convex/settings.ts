
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./lib/permissions";

const securityLevelValidator = v.union(v.literal("low"), v.literal("medium"), v.literal("high"));

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);
    const settings = await ctx.db.query("platformSettings").first();
    return (
      settings ?? {
        securityLevel: "medium" as const,
        lateFeePercentage: 0,
        gracePeriodDays: 5,
      }
    );
  },
});

export const updateSettings = mutation({
  args: {
    securityLevel: securityLevelValidator,
    lateFeePercentage: v.number(),
    gracePeriodDays: v.number(),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin"]);
    const existing = await ctx.db.query("platformSettings").first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedBy: admin._id,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("platformSettings", {
        ...args,
        updatedBy: admin._id,
        updatedAt: Date.now(),
      });
    }

    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      action: "settings.update",
      targetTable: "platformSettings",
      targetId: "singleton",
      metadata: JSON.stringify(args),
      createdAt: Date.now(),
    });
  },
});
