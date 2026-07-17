"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

const PERIODS = {
  monthly: 30,
  quarterly: 90,
  yearly: 365,
} as const;

export default function ManagerReportsPage() {
  const [period, setPeriod] = useState<keyof typeof PERIODS>("monthly");

  const { from, to } = useMemo(() => {
    const to = Date.now();
    const from = to - PERIODS[period] * 24 * 60 * 60 * 1000;
    return { from, to };
  }, [period]);

  const occupancy = useQuery(api.reports.occupancyReport);
  const collection = useQuery(api.reports.rentCollectionReport, { from, to });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-brass-deep">Reports</p>
          <h1 className="font-display text-2xl font-bold text-ink">Reports</h1>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as keyof typeof PERIODS)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <button className="rounded border border-line bg-white px-4 py-2 text-sm font-semibold text-ink shadow-card hover:border-brass hover:text-brass-deep">
            Export (PDF/Excel)
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Occupancy</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total properties", value: occupancy?.total },
            { label: "Occupied", value: occupancy?.occupied },
            { label: "Vacant", value: occupancy?.vacant },
            { label: "In maintenance", value: occupancy?.maintenance },
          ].map((s) => (
            <div key={s.label} className="ledger-panel p-5">
              <p className="font-mono text-3xl text-ink">{s.value ?? "—"}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-faint">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Rent collection ({period})</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total due", value: collection && formatCurrency(collection.totalDue) },
            { label: "Collected", value: collection && formatCurrency(collection.totalCollected) },
            { label: "Pending", value: collection && formatCurrency(collection.totalPending) },
            {
              label: "Collection rate",
              value: collection && `${Math.round(collection.collectionRate * 100)}%`,
            },
          ].map((s) => (
            <div key={s.label} className="ledger-panel p-5">
              <p className="font-mono text-2xl text-ink">{s.value ?? "—"}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-faint">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}