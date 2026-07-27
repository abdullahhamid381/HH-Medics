"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { pushToast } from "@/store/toast";
import { ORDER_STATUS_LABELS } from "@/lib/utils";
import type { OrderUpdatedPayload } from "@/lib/events";

// Subscribes to live updates for a single order so a customer watching
// their order page sees status changes and tracking numbers the moment an
// admin saves them — no refresh needed.
export function OrderTrackingListener({ orderId }: { orderId: string }) {
  const router = useRouter();

  useEffect(() => {
    const source = new EventSource(`/api/orders/${orderId}/stream`);

    source.addEventListener("order:updated", (e) => {
      const payload = JSON.parse((e as MessageEvent).data) as OrderUpdatedPayload;
      pushToast({
        title: `Order status: ${ORDER_STATUS_LABELS[payload.status as keyof typeof ORDER_STATUS_LABELS] ?? payload.status}`,
        description: payload.trackingNumber
          ? `Tracking added: ${payload.trackingNumber}${payload.carrier ? ` (${payload.carrier})` : ""}`
          : "Your order has been updated.",
        tone: "info",
      });
      router.refresh();
    });

    return () => source.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return null;
}
