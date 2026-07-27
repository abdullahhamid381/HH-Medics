"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISODate(d);
}

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  return toISODate(d);
}

const PRESETS: { label: string; from: () => string; to: () => string }[] = [
  { label: "Today", from: () => toISODate(new Date()), to: () => toISODate(new Date()) },
  { label: "Last 7 days", from: () => daysAgo(6), to: () => toISODate(new Date()) },
  { label: "Last 30 days", from: () => daysAgo(29), to: () => toISODate(new Date()) },
  { label: "Last 90 days", from: () => daysAgo(89), to: () => toISODate(new Date()) },
  { label: "This month", from: () => startOfMonth(), to: () => toISODate(new Date()) },
];

export function DateRangePicker({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);

  function apply(f: string, t: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", f);
    params.set("to", t);
    router.push(`${pathname}?${params.toString()}`);
  }

  const activePreset = PRESETS.find((p) => p.from() === from && p.to() === to)?.label;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.label}
          onClick={() => apply(p.from(), p.to())}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
            activePreset === p.label
              ? "border-primary bg-primary text-white"
              : "border-line bg-surface text-ink-soft hover:bg-surface-soft"
          )}
        >
          {p.label}
        </button>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply(customFrom, customTo);
        }}
        className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5"
      >
        <Calendar size={14} className="text-ink-soft" />
        <input
          type="date"
          value={customFrom}
          max={customTo}
          onChange={(e) => setCustomFrom(e.target.value)}
          className="bg-transparent text-xs text-ink outline-none"
        />
        <span className="text-xs text-ink-soft">to</span>
        <input
          type="date"
          value={customTo}
          min={customFrom}
          max={toISODate(new Date())}
          onChange={(e) => setCustomTo(e.target.value)}
          className="bg-transparent text-xs text-ink outline-none"
        />
        <button
          type="submit"
          className="ml-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-white"
        >
          Apply
        </button>
      </form>
    </div>
  );
}
