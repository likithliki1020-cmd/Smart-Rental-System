"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function ManagerOverviewPage() {
  const occupancy = useQuery(api.reports.occupancyReport);
  const openRequests = useQuery(api.maintenance.listRequests, { status: "open" });

  const stats = [
    { label: "Total properties", value: occupancy?.total ?? "—" },
    { label: "Occupied", value: occupancy?.occupied ?? "—" },
    { label: "Vacant", value: occupancy?.vacant ?? "—" },
    { label: "Open requests", value: openRequests?.length ?? "—" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-ledger text-brass-deep">
          01 · Overview
        </p>
        <h1 className="font-display text-2xl text-ink">Portfolio overview</h1>
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
    </div>
  );
}
