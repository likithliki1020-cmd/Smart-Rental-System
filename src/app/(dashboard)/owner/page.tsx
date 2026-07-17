"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { api } from "../../../../convex/_generated/api";

export default function OwnerOverviewPage() {
  const occupancy = useQuery(api.reports.occupancyReport);
  const properties = useQuery(api.properties.listProperties, {});
  const payments = useQuery(api.payments.listPayments, { status: "overdue" });

  const stats = [
    { label: "Total properties", value: occupancy?.total ?? "—" },
    { label: "Occupied", value: occupancy?.occupied ?? "—" },
    { label: "Vacant", value: occupancy?.vacant ?? "—" },
    { label: "Overdue payments", value: payments?.length ?? "—" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-ledger text-brass-deep">
          01 · Overview
        </p>
        <h1 className="font-display text-2xl text-ink">Good to see you</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="ledger-panel p-5">
            <p className="font-mono text-3xl text-ink">{s.value}</p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-ledger text-ink-faint">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="ledger-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">Your properties</h2>
          <Link
            href="/owner/properties"
            className="font-mono text-[11px] uppercase tracking-ledger text-brass-deep hover:underline"
          >
            View all
          </Link>
        </div>
        {properties === undefined ? (
          <p className="font-mono text-[11px] text-ink-faint">Loading…</p>
        ) : properties.length === 0 ? (
          <p className="text-sm text-ink-faint">
            No properties yet.{" "}
            <Link href="/owner/properties/new" className="text-brass-deep underline">
              Add your first one
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {properties.slice(0, 5).map((p) => (
              <li key={p._id} className="flex items-center justify-between py-2 text-sm">
                <span>{p.title}</span>
                <span className="font-mono text-ink-faint">{formatCurrency(p.rentAmount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
