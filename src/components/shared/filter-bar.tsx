"use client";

import { cn } from "@/lib/utils";

export type FilterOption = { value: string; label: string };

export function FilterBar({
  options,
  active,
  onChange,
}: {
  options: FilterOption[];
  active: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onChange(null)}
        className={cn(
          "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          active === null
            ? "bg-gradient-to-r from-brass to-violet text-white shadow-card"
            : "bg-paper-dim text-ink-faint hover:bg-brass-soft hover:text-brass-deep",
        )}
      >
        All
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            active === opt.value
              ? "bg-gradient-to-r from-brass to-violet text-white shadow-card"
              : "bg-paper-dim text-ink-faint hover:bg-brass-soft hover:text-brass-deep",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}