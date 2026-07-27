"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/types";
import { Select } from "@/components/ui/primitives";

const OPTIONS: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [loading, setLoading] = useState(false);

  async function handleChange(next: OrderStatus) {
    setValue(next);
    setLoading(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Select
      value={value}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value as OrderStatus)}
      className="h-9 w-auto min-w-[130px] text-xs capitalize"
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o} className="capitalize">
          {o}
        </option>
      ))}
    </Select>
  );
}
