"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../../../convex/_generated/api";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { FilterBar } from "@/components/shared/filter-bar";
import { PROPERTY_STATUS, PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

type Property = Doc<"properties">;

export default function ManagerPropertiesPage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const properties = useQuery(api.properties.listProperties, {
    status: (statusFilter ?? undefined) as Property["status"] | undefined,
  });

  const columns: Column<Property>[] = [
    {
      header: "Property",
      cell: (p) => (
        <Link href={`/manager/properties/${p._id}`} className="flex items-center gap-3 font-medium text-ink hover:underline">
          {p.imageUrls[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.imageUrls[0]} alt="" className="h-10 w-10 rounded-md object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-md bg-paper-dim" />
          )}
          {p.title}
        </Link>
      ),
    },
    { header: "Type", cell: (p) => PROPERTY_TYPE_LABELS[p.type] },
    { header: "City", cell: (p) => p.city },
    { header: "Rent", cell: (p) => <span className="font-mono">{formatCurrency(p.rentAmount)}</span> },
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
      <div>
        <p className="text-sm font-semibold text-brass-deep">Properties</p>
        <h1 className="font-display text-2xl font-bold text-ink">All properties</h1>
      </div>

      <FilterBar
        options={Object.entries(PROPERTY_STATUS).map(([value, s]) => ({ value, label: s.label }))}
        active={statusFilter}
        onChange={setStatusFilter}
      />

      <DataTable columns={columns} rows={properties} emptyMessage="No properties in the portfolio yet." />
    </div>
  );
}