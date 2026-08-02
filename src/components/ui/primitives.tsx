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
  padding = "none",
  interactive = false,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}) {
  const paddings: Record<string, string> = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface shadow-card",
        paddings[padding],
        interactive &&
          "transition-shadow duration-200 hover:shadow-elevated",
        className
      )}
    >
      {children}
    </div>
  );
}
