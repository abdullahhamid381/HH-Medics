"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, X } from "lucide-react";
import type { OrderItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Select, Textarea, Label } from "@/components/ui/primitives";

const REASONS = [
  "Damaged on arrival",
  "Wrong item received",
  "Changed my mind",
  "Product didn't suit me",
  "Item arrived expired / near expiry",
  "Other",
];

export function ReturnRequestForm({
  orderId,
  item,
}: {
  orderId: string;
  item: OrderItem;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/returns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        orderItemId: item.id,
        reason,
        comment,
        quantity: item.quantity,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <p className="rounded-lg bg-primary-soft px-3 py-2 text-xs text-primary-strong">
        Return requested — we&apos;ll review it shortly.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-surface-soft"
      >
        <RotateCcw size={13} /> Request return
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 space-y-3 rounded-xl border border-line bg-surface-soft p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Request a return</p>
        <button type="button" onClick={() => setOpen(false)} className="text-ink-soft">
          <X size={15} />
        </button>
      </div>
      <div>
        <Label>Reason</Label>
        <Select value={reason} onChange={(e) => setReason(e.target.value)}>
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Details (optional)</Label>
        <Textarea
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us a bit more..."
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <Button type="submit" size="sm" loading={loading}>
        Submit request
      </Button>
    </form>
  );
}
