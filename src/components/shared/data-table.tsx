"use client";

import { cn } from "@/lib/utils";

export type Column<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

export function DataTable<T extends { _id: string }>({
  columns,
  rows,
  emptyMessage = "Nothing here yet.",
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[] | undefined;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}) {
  if (rows === undefined) {
    return (
      <div className="ledger-panel p-10 text-center text-sm text-ink-faint">
        Loading…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="ledger-panel p-10 text-center">
        <p className="font-display text-lg font-semibold text-ink">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="ledger-panel overflow-hidden">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-paper-dim/60">
            {columns.map((col) => (
              <th
                key={col.header}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row._id}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "border-b border-line last:border-b-0",
                onRowClick && "cursor-pointer hover:bg-brass-soft/30",
              )}
            >
              {columns.map((col) => (
                <td key={col.header} className={cn("px-4 py-3.5 align-middle", col.className)}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}