"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { FilterBar } from "@/components/shared/filter-bar";
import { Button } from "@/components/ui/button";
import { LEASE_STATUS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

type Row = { _id: string; lease: any; tenant: any; property: any };

export default function ManagerTenantsPage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const summaries = useQuery(api.leases.listTenantSummaries);
  const updateLeaseStatus = useMutation(api.leases.updateLeaseStatus);

  const rows: Row[] | undefined = summaries
    ?.filter((s) => !statusFilter || s.lease.status === statusFilter)
    .map((s) => ({ _id: s.lease._id, ...s }));

  const cols: Column<Row>[] = [
    { header: "Tenant", cell: (r) => r.tenant?.name ?? r.tenant?.email ?? "—" },
    { header: "Property", cell: (r) => r.property?.title ?? "—" },
    { header: "Owner", cell: (r) => r.property?.ownerId ?? "—" },
    { header: "Rent", cell: (r) => <span className="font-mono">{formatCurrency(r.lease.rentAmount)}</span> },
    {
      header: "Status",
      cell: (r) => {
        const s = LEASE_STATUS[r.lease.status];
        return <StatusBadge label={s.label} tone={s.tone} />;
      },
    },
    {
      header: "Action",
      cell: (r) => {
        if (r.lease.status === "pending") {
          return (
            <Button
              size="sm"
              onClick={() => updateLeaseStatus({ leaseId: r.lease._id, status: "active" })}
            >
              Activate lease
            </Button>
          );
        }
        if (r.lease.status === "active") {
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateLeaseStatus({ leaseId: r.lease._id, status: "inactive" })}
            >
              End lease
            </Button>
          );
        }
        return <span className="text-ink-faint">—</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-brass-deep">Tenants</p>
        <h1 className="font-display text-2xl font-bold text-ink">All tenants</h1>
      </div>

      <FilterBar
        options={Object.entries(LEASE_STATUS).map(([value, s]) => ({ value, label: s.label }))}
        active={statusFilter}
        onChange={setStatusFilter}
      />

      <DataTable columns={cols} rows={rows} emptyMessage="No tenants across the portfolio yet." />
    </div>
  );
}