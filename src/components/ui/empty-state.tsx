import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-panel border border-dashed border-line px-6 py-14 text-center",
        className
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-soft text-ink-soft">
        <Icon size={20} />
      </span>
      <div>
        <p className="font-display text-base text-ink">{title}</p>
        {description && (
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
