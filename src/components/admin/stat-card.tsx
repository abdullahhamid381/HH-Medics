import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  sub,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "primary" | "accent" | "warning" | "danger";
  sub?: string;
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary-soft text-primary-strong",
    accent: "bg-accent-soft text-accent",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
  };
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-soft">{label}</span>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tones[tone])}>
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}
