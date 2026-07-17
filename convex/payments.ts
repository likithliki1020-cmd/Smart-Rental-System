
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireRole } from "./lib/permissions";
import { paymentStatusValidator } from "./lib/validators";

/**
 * Generates the payment schedule rows (status "pending") for a lease,
 * one row per month between startDate and endDate. Call once after
 * a lease is activated.
 */
export const generateScheduleForLease = mutation({
  args: { leaseId: v.id("leases") },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["owner", "manager", "admin"]);
    const lease = await ctx.db.get(args.leaseId);
    if (!lease) throw new Error("Lease not found.");
    if (user.role === "owner" && lease.ownerId !== user._id) {
      throw new Error("Forbidden: not your lease.");
    }

    const existing = await ctx.db
      .query("payments")
      .withIndex("by_lease", (q) => q.eq("leaseId", args.leaseId))
      .collect();
    if (existing.length > 0) {
      throw new Error("Schedule already generated for this lease.");
    }

    const start = new Date(lease.startDate);
    const end = new Date(lease.endDate);
    const rows: number[] = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), lease.dueDayOfMonth);
    if (cursor < start) cursor.setMonth(cursor.getMonth() + 1);

    while (cursor <= end) {
      rows.push(cursor.getTime());
      cursor.setMonth(cursor.getMonth() + 1);
    }

    for (const dueDate of rows) {
      await ctx.db.insert("payments", {
        leaseId: lease._id,
        propertyId: lease.propertyId,
        ownerId: lease.ownerId,
        tenantId: lease.tenantId,
        amount: lease.rentAmount,
        dueDate,
        status: "pending",
        createdAt: Date.now(),
      });
    }

    return rows.length;
  },
});

/** Tenant pays, or owner/manager records a manually-collected payment. */
export const recordPayment = mutation({
  args: {
    paymentId: v.id("payments"),
    method: v.optional(v.string()),
    referenceId: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new Error("Payment not found.");

    const allowed =
      user.role === "admin" ||
      user.role === "manager" ||
      (user.role === "owner" && payment.ownerId === user._id) ||
      (user.role === "tenant" && payment.tenantId === user._id);
    if (!allowed) throw new Error("Forbidden.");

    await ctx.db.patch(args.paymentId, {
      status: "paid",
      paidDate: Date.now(),
      method: args.method,
      referenceId: args.referenceId,
      receiptUrl: args.receiptUrl,
    });

    await ctx.db.insert("notifications", {
      userId: payment.ownerId,
      type: "payment_received",
      title: "Rent payment received",
      body: `A payment of ${payment.amount} was recorded.`,
      read: false,
      relatedId: payment._id,
      createdAt: Date.now(),
    });
  },
});

/** Sweep job (call from a cron action) to flip past-due "pending" rows to "overdue". */
export const markOverduePayments = mutation({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin", "manager"]);
    const now = Date.now();
    const pending = await ctx.db
      .query("payments")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    let updated = 0;
    for (const p of pending) {
      if (p.dueDate < now) {
        await ctx.db.patch(p._id, { status: "overdue" });
        updated += 1;
      }
    }
    return updated;
  },
});

export const listPaymentsForLease = query({
  args: { leaseId: v.id("leases") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("payments")
      .withIndex("by_lease", (q) => q.eq("leaseId", args.leaseId))
      .collect();
  },
});

/** Role-scoped payment history with optional status filter. */
export const listPayments = query({
  args: { status: v.optional(paymentStatusValidator) },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    let rows: Doc<"payments">[];
    if (user.role === "tenant") {
      rows = await ctx.db
        .query("payments")
        .withIndex("by_tenant", (q) => q.eq("tenantId", user._id))
        .collect();
    } else if (user.role === "owner") {
      rows = await ctx.db
        .query("payments")
        .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
        .collect();
    } else {
      rows = await ctx.db.query("payments").collect();
    }

    return args.status ? rows.filter((r) => r.status === args.status) : rows;
  },
});
