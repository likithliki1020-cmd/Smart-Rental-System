// src/app/(dashboard)/admin/users/page.tsx
"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { FilterBar } from "@/components/shared/filter-bar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/constants";

type User = Doc<"users">;

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const users = useQuery(api.users.listUsers, { role: (roleFilter ?? undefined) as User["role"] | undefined });
  const updateRole = useMutation(api.users.updateUserRole);
  const setActive = useMutation(api.users.setUserActive);

  const columns: Column<User>[] = [
    { header: "Name", cell: (u) => u.name ?? "—" },
    { header: "Email", cell: (u) => u.email ?? "—" },
    {
      header: "Role",
      cell: (u) => (
        <Select value={u.role} onValueChange={(v) => updateRole({ userId: u._id, role: v as User["role"] })}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      header: "Status",
      cell: (u) => <StatusBadge label={u.isActive ? "Active" : "Disabled"} tone={u.isActive ? "forest" : "ink"} />,
    },
    {
      header: "Action",
      cell: (u) => (
        <Button size="sm" variant="outline" onClick={() => setActive({ userId: u._id, isActive: !u.isActive })}>
          {u.isActive ? "Deactivate" : "Activate"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-ledger text-brass-deep">02 · Users</p>
        <h1 className="font-display text-2xl text-ink">User management</h1>
      </div>

      <FilterBar
        options={Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))}
        active={roleFilter}
        onChange={setRoleFilter}
      />

      <DataTable columns={columns} rows={users} emptyMessage="No users found." />
    </div>
  );
}