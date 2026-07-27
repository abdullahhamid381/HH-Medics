"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, RotateCcw, MapPin, ChevronRight } from "lucide-react";
import type { Order, ReturnRequest, Address } from "@/types";
import { Badge } from "@/components/ui/primitives";
import {
  formatCurrency,
  formatDate,
  ORDER_STATUS_LABELS,
  RETURN_STATUS_LABELS,
  cn,
} from "@/lib/utils";

const ORDER_STATUS_TONE: Record<string, "primary" | "accent" | "warning" | "danger" | "default"> = {
  pending: "warning",
  processing: "accent",
  shipped: "primary",
  delivered: "primary",
  cancelled: "danger",
};

const RETURN_STATUS_TONE: Record<string, "primary" | "accent" | "warning" | "danger" | "default"> = {
  requested: "warning",
  approved: "accent",
  refunded: "primary",
  rejected: "danger",
};

export function AccountTabs({
  orders,
  returns,
  addresses,
  defaultTab = "orders",
}: {
  orders: Order[];
  returns: ReturnRequest[];
  addresses: Address[];
  defaultTab?: "orders" | "returns" | "addresses";
}) {
  const [tab, setTab] = useState<"orders" | "returns" | "addresses">(defaultTab);

  const tabs = [
    { key: "orders" as const, label: "Orders", icon: Package, count: orders.length },
    { key: "returns" as const, label: "Returns", icon: RotateCcw, count: returns.length },
    { key: "addresses" as const, label: "Addresses", icon: MapPin, count: addresses.length },
  ];

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition",
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-ink-soft hover:text-ink"
            )}
          >
            <t.icon size={15} />
            {t.label}
            <span className="rounded-full bg-surface-soft px-1.5 text-xs">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="space-y-3">
          {orders.length === 0 && (
            <EmptyState label="No orders yet" hint="Your order history will show up here." />
          )}
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:border-primary/40"
            >
              <div className="flex items-center gap-4">
                <div className="hidden gap-1 sm:flex">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <div
                      key={i}
                      className="relative h-12 w-12 overflow-hidden rounded-lg bg-surface-soft"
                    >
                      {item.image && (
                        <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-mono text-sm text-ink">{order.order_number}</p>
                  <p className="text-xs text-ink-soft">
                    {formatDate(order.created_at)} · {order.items?.length ?? 0} item(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={ORDER_STATUS_TONE[order.status] ?? "default"}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
                <span className="hidden font-mono text-sm font-semibold text-ink sm:block">
                  {formatCurrency(order.total)}
                </span>
                <ChevronRight size={16} className="text-ink-soft" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab === "returns" && (
        <div className="space-y-3">
          {returns.length === 0 && (
            <EmptyState
              label="No return requests"
              hint="Request a return from any delivered order's detail page."
            />
          )}
          {returns.map((ret) => (
            <div
              key={ret.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-surface-soft">
                  {ret.item_image && (
                    <Image src={ret.item_image} alt="" fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-ink">{ret.item_name}</p>
                  <p className="text-xs text-ink-soft">
                    {ret.return_number} · Order {ret.order_number} · {formatDate(ret.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden font-mono text-sm text-ink sm:block">
                  {formatCurrency(ret.refund_amount)}
                </span>
                <Badge tone={RETURN_STATUS_TONE[ret.status] ?? "default"}>
                  {RETURN_STATUS_LABELS[ret.status]}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "addresses" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.length === 0 && (
            <EmptyState
              label="No saved addresses"
              hint="Addresses you use at checkout will be saved here."
            />
          )}
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink">{addr.full_name}</p>
                {addr.is_default === 1 && <Badge tone="primary">Default</Badge>}
              </div>
              <p className="mt-1 text-sm text-ink-soft">{addr.phone}</p>
              <p className="mt-2 text-sm text-ink-soft">
                {addr.line1}, {addr.city}, {addr.state} {addr.postal_code}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line py-14 text-center">
      <p className="font-display text-base text-ink">{label}</p>
      <p className="mt-1 text-sm text-ink-soft">{hint}</p>
    </div>
  );
}
