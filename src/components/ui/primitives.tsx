import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export function Badge({
  children,
  className,
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "primary" | "accent" | "danger" | "warning" | "outline";
}) {
  const tones: Record<string, string> = {
    default: "bg-surface-soft text-ink-soft",
    primary: "bg-primary-soft text-primary-strong",
    accent: "bg-accent-soft text-accent",
    danger: "bg-danger/10 text-danger",
    warning: "bg-warning/10 text-warning",
    outline: "border border-line text-ink-soft",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-xl border border-line bg-surface px-4 text-sm text-ink placeholder:text-ink-soft/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-11 w-full rounded-xl border border-line bg-surface px-4 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("mb-1.5 block text-sm font-medium text-ink", className)}>
      {children}
    </label>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-line bg-surface",
        className
      )}
    >
      {children}
    </div>
  );
}
