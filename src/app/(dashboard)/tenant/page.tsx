"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { LEASE_STATUS, PAYMENT_STATUS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { api } from "../../../../convex/_generated/api";

export default function TenantOverviewPage() {
  const leases = useQuery(api.leases.listLeases, {});
  const payments = useQuery(api.payments.listPayments, {});
  const notifications = useQuery(api.notifications.listMyNotifications, { unreadOnly: true });

  const lease = leases?.[0];
  const nextDue = payments
    ?.filter((p) => p.status !== "paid")
    .sort((a, b) => a.dueDate - b.dueDate)[0];

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-ledger text-brass-deep">
          01 · Overview
        </p>
        <h1 className="font-display text-2xl text-ink">Welcome back</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="ledger-panel p-6">
          <p className="font-mono text-[11px] uppercase tracking-ledger text-ink-faint">
            Current lease
          </p>
          {lease ? (
            <>
              <p className="mt-2 font-mono text-2xl text-ink">{formatCurrency(lease.rentAmount)}</p>
              <p className="text-sm text-ink-faint">per month</p>
              <StatusBadge
                className="mt-3"
                label={LEASE_STATUS[lease.status].label}
                tone={LEASE_STATUS[lease.status].tone}
              />
            </>
          ) : (
            <p className="mt-2 text-sm text-ink-faint">No active lease on file.</p>
          )}
        </div>

        <div className="ledger-panel p-6">
          <p className="font-mono text-[11px] uppercase tracking-ledger text-ink-faint">
            Next payment due
          </p>
          {nextDue ? (
            <>
              <p className="mt-2 font-mono text-2xl text-ink">{formatCurrency(nextDue.amount)}</p>
              <p className="text-sm text-ink-faint">due {formatDate(nextDue.dueDate)}</p>
              <StatusBadge
                className="mt-3"
                label={PAYMENT_STATUS[nextDue.status].label}
                tone={PAYMENT_STATUS[nextDue.status].tone}
              />
            </>
          ) : (
            <p className="mt-2 text-sm text-ink-faint">Nothing due right now.</p>
          )}
        </div>
      </div>

      <div className="ledger-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">Unread notifications</h2>
          <Link
            href="/tenant/maintenance"
            className="font-mono text-[11px] uppercase tracking-ledger text-brass-deep hover:underline"
          >
            Maintenance
          </Link>
        </div>
        {notifications === undefined ? (
          <p className="font-mono text-[11px] text-ink-faint">Loading…</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-ink-faint">You're all caught up.</p>
        ) : (
          <ul className="divide-y divide-line">
            {notifications.map((n) => (
              <li key={n._id} className="py-2 text-sm">
                <p className="text-ink">{n.title}</p>
                <p className="text-ink-faint">{n.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
