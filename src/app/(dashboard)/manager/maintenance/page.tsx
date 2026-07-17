"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { FilterBar } from "@/components/shared/filter-bar";
import { Button } from "@/components/ui/button";
import { ImageThumbnails } from "@/components/shared/image-thumbnails";
import { MAINTENANCE_STATUS, MAINTENANCE_CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";

type Request = Doc<"maintenanceRequests">;

export default function ManagerMaintenancePage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { user } = useCurrentUser();
  const requests = useQuery(api.maintenance.listRequests, {
    status: (statusFilter ?? undefined) as Request["status"] | undefined,
  });
  const assignRequest = useMutation(api.maintenance.assignRequest);
  const updateStatus = useMutation(api.maintenance.updateRequestStatus);

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
    {
      header: "Action",
      cell: (r) => {
        if (r.status === "closed") return <span className="text-ink-faint">—</span>;
        if (r.status === "open") {
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() => user && assignRequest({ requestId: r._id, managerId: user._id })}
            >
              Take request
            </Button>
          );
        }
        return (
          <Button size="sm" variant="brass" onClick={() => updateStatus({ requestId: r._id, status: "closed" })}>
            Mark resolved
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-brass-deep">Maintenance</p>
        <h1 className="font-display text-2xl font-bold text-ink">Maintenance queue</h1>
      </div>

      <FilterBar
        options={Object.entries(MAINTENANCE_STATUS).map(([value, s]) => ({ value, label: s.label }))}
        active={statusFilter}
        onChange={setStatusFilter}
      />

      <DataTable columns={columns} rows={requests} emptyMessage="No maintenance requests." />
    </div>
  );
}