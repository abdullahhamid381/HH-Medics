"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pushToast } from "@/store/toast";
import { cn, formatCurrency } from "@/lib/utils";
import type { OrderCreatedPayload, OrderUpdatedPayload } from "@/lib/events";

// Mounted once in the admin layout. Opens a single SSE connection to
// /api/admin/orders/stream and refreshes the current server-rendered page
// whenever an order is placed or updated, so the dashboard, orders list,
// order detail and reports all stay live without polling or manual reload.
// Also renders a small connection-status pill so the live link is visible,
// not just functional.
export function AdminRealtimeListener() {
  const router = useRouter();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const source = new EventSource("/api/admin/orders/stream");

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);

    source.addEventListener("order:created", (e) => {
      const payload = JSON.parse((e as MessageEvent).data) as OrderCreatedPayload;
      pushToast({
        title: `New order ${payload.orderNumber}`,
        description: `${payload.customerName} · ${formatCurrency(payload.total)}`,
        tone: "success",
      });
      router.refresh();
    });

    source.addEventListener("order:updated", (e) => {
      const payload = JSON.parse((e as MessageEvent).data) as OrderUpdatedPayload;
      pushToast({
        title: `Order ${payload.orderNumber} updated`,
        description: payload.trackingNumber
          ? `Status: ${payload.status} · Tracking ${payload.trackingNumber}`
          : `Status: ${payload.status}`,
        tone: "info",
      });
      router.refresh();
    });

    return () => {
      source.close();
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-50 hidden lg:block">
      <div className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-soft shadow-sm">
        <span className="relative flex h-2 w-2">
          {connected && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          )}
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              connected ? "bg-primary" : "bg-ink-soft/50"
            )}
          />
        </span>
        {connected ? "Live" : "Reconnecting..."}
      </div>
    </div>
  );
}
