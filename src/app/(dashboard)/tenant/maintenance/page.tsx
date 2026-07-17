"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { FilterBar } from "@/components/shared/filter-bar";
import { MaintenanceForm } from "@/components/forms/maintenance-form";
import { ImageThumbnails } from "@/components/shared/image-thumbnails";
import { MAINTENANCE_STATUS, MAINTENANCE_CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Doc } from "../../../../../convex/_generated/dataModel";

type Request = Doc<"maintenanceRequests">;

export default function TenantMaintenancePage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const leases = useQuery(api.leases.listLeases, {});
  const requests = useQuery(api.maintenance.listRequests, {
    status: (statusFilter ?? undefined) as Request["status"] | undefined,
  });

  const lease = leases?.[0];

  const columns: Column<Request>[] = [
    { header: "Issue", cell: (r) => r.title },
    { header: "Category", cell: (r) => MAINTENANCE_CATEGORY_LABELS[r.category] },
    { header: "Raised", cell: (r) => formatDate(r.createdAt) },
    { header: "Photos", cell: (r) => <ImageThumbnails urls={r.imageUrls} label={r.title} /> },
    {
      header: "Status",
      cell: (r) => {
        const s = MAINTENANCE_STATUS[r.status];
        return <StatusBadge label={s.label} tone={s.tone} />;
      },
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-brass-deep">Maintenance</p>
        <h1 className="font-display text-2xl font-bold text-ink">Maintenance requests</h1>
      </div>

      {lease ? (
        <MaintenanceForm leaseId={lease._id} />
      ) : (
        <p className="text-sm text-ink-faint">You need an active lease before raising a request.</p>
      )}

      <FilterBar
        options={Object.entries(MAINTENANCE_STATUS).map(([value, s]) => ({ value, label: s.label }))}
        active={statusFilter}
        onChange={setStatusFilter}
      />

      <DataTable columns={columns} rows={requests} emptyMessage="No requests raised yet." />
    </div>
  );
}