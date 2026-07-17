import { cn } from "@/lib/utils";

type Tone = "brass" | "forest" | "amber" | "rust" | "ink";

const TONE_CLASSES: Record<Tone, string> = {
  brass: "bg-brass-soft text-brass-deep",
  forest: "bg-forest-soft text-forest-deep",
  amber: "bg-amber-soft text-amber-deep",
  rust: "bg-rust-soft text-rust-deep",
  ink: "bg-paper-dim text-ink-faint",
};

export function StatusBadge({
  label,
  tone,
  className,
}: {
  label: string;
  tone: Tone;
  className?: string;
}) {
  return (
    <span className={cn("ledger-stamp", TONE_CLASSES[tone], className)}>
      {label}
    </span>
  );
}