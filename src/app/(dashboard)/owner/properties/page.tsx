"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../../../convex/_generated/api";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { FilterBar } from "@/components/shared/filter-bar";
import { PROPERTY_STATUS, PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Doc } from "../../../../../convex/_generated/dataModel";

type Property = Doc<"properties">;

export default function OwnerPropertiesPage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const properties = useQuery(api.properties.listProperties, {
    status: (statusFilter ?? undefined) as Property["status"] | undefined,
  });

  const columns: Column<Property>[] = [
    {
      header: "Property",
      cell: (p) => (
        <Link href={`/owner/properties/${p._id}`} className="font-medium text-ink hover:underline">
          {p.title}
        </Link>
      ),
    },
    { header: "Type", cell: (p) => PROPERTY_TYPE_LABELS[p.type] },
    { header: "City", cell: (p) => p.city },
    {
      header: "Rent",
      cell: (p) => <span className="font-mono">{formatCurrency(p.rentAmount)}</span>,
    },
    {
      header: "Status",
      cell: (p) => {
        const s = PROPERTY_STATUS[p.status];
        return <StatusBadge label={s.label} tone={s.tone} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-ledger text-brass-deep">
            02 · Properties
          </p>
          <h1 className="font-display text-2xl text-ink">Your properties</h1>
        </div>
        <Link
          href="/owner/properties/new"
          className="rounded-sm bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-ledger text-paper hover:opacity-90"
        >
          Add property
        </Link>
      </div>

      <FilterBar
        options={Object.entries(PROPERTY_STATUS).map(([value, s]) => ({
          value,
          label: s.label,
        }))}
        active={statusFilter}
        onChange={setStatusFilter}
      />

      <DataTable
        columns={columns}
        rows={properties}
        emptyMessage="No properties yet. Add your first one to get started."
      />
    </div>
  );
}