// src/app/(dashboard)/owner/payments/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { FilterBar } from "@/components/shared/filter-bar";
import { PaymentForm } from "@/components/forms/payment-form";
import { PAYMENT_STATUS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

type Payment = Doc<"payments">;

export default function OwnerPaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const payments = useQuery(api.payments.listPayments, {
    status: (statusFilter ?? undefined) as Payment["status"] | undefined,
  });

  const columns: Column<Payment>[] = [
    { header: "Due date", cell: (p) => formatDate(p.dueDate) },
    { header: "Amount", cell: (p) => <span className="font-mono">{formatCurrency(p.amount)}</span> },
    {
      header: "Status",
      cell: (p) => {
        const s = PAYMENT_STATUS[p.status];
        return <StatusBadge label={s.label} tone={s.tone} />;
      },
    },
    {
      header: "Action",
      cell: (p) => (p.status !== "paid" ? <PaymentForm paymentId={p._id} amount={p.amount} /> : <span className="text-ink-faint">—</span>),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-brass-deep">Payments</p>
          <h1 className="font-display text-2xl font-bold text-ink">Rent payments</h1>
        </div>
        <button className="rounded border border-line bg-white px-4 py-2 text-sm font-semibold text-ink shadow-card hover:border-brass hover:text-brass-deep">
          Export report
        </button>
      </div>

      <FilterBar
        options={Object.entries(PAYMENT_STATUS).map(([value, s]) => ({ value, label: s.label }))}
        active={statusFilter}
        onChange={setStatusFilter}
      />

      <DataTable columns={columns} rows={payments} emptyMessage="No payments recorded yet." />
    </div>
  );
}