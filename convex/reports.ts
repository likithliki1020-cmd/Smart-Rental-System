
import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireRole } from "./lib/permissions";

/** Occupancy snapshot: vacant / occupied / maintenance counts, scoped by role. */
export const occupancyReport = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireRole(ctx, ["owner", "manager", "admin"]);

    const properties =
      user.role === "owner"
        ? await ctx.db
            .query("properties")
            .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
            .collect()
        : await ctx.db.query("properties").collect();

    const counts = { vacant: 0, occupied: 0, maintenance: 0 };
    for (const p of properties) counts[p.status] += 1;

    return { total: properties.length, ...counts };
  },
});

/** Rent collection totals for a given date range, scoped by role. */
export const rentCollectionReport = query({
  args: {
    from: v.number(),
    to: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["owner", "manager", "admin"]);

    const payments =
      user.role === "owner"
        ? await ctx.db
            .query("payments")
            .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
            .collect()
        : await ctx.db.query("payments").collect();

    const inRange = payments.filter((p) => p.dueDate >= args.from && p.dueDate <= args.to);

    const collected = inRange.filter((p) => p.status === "paid");
    const pending = inRange.filter((p) => p.status === "pending");
    const overdue = inRange.filter((p) => p.status === "overdue");

    const sum = (rows: typeof inRange) => rows.reduce((acc, r) => acc + r.amount, 0);

    return {
      totalDue: sum(inRange),
      totalCollected: sum(collected),
      totalPending: sum(pending),
      totalOverdue: sum(overdue),
      collectionRate: inRange.length > 0 ? collected.length / inRange.length : 0,
    };
  },
});

/** Per-property performance: rent collected vs. expected, open maintenance count. */
export const propertyPerformanceReport = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["owner", "manager", "admin"]);

    // Payments are keyed by lease, so pull leases for this property first,
    // then fetch each lease's payments via the indexed lookup.
    const leases = await ctx.db
      .query("leases")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();

    const paymentsPerLease = await Promise.all(
      leases.map((lease) =>
        ctx.db
          .query("payments")
          .withIndex("by_lease", (q) => q.eq("leaseId", lease._id))
          .collect(),
      ),
    );
    const relevantPayments = paymentsPerLease.flat();
    const expected = relevantPayments.reduce((acc, p) => acc + p.amount, 0);
    const collected = relevantPayments
      .filter((p) => p.status === "paid")
      .reduce((acc, p) => acc + p.amount, 0);

    const openMaintenance = await ctx.db
      .query("maintenanceRequests")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();

    return {
      expectedRent: expected,
      collectedRent: collected,
      openMaintenanceCount: openMaintenance.filter((m) => m.status !== "closed").length,
    };
  },
});
