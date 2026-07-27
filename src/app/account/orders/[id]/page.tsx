import Image from "next/image";
import { redirect, notFound } from "next/navigation";
import { CheckCircle2, Truck } from "lucide-react";
import { auth } from "@/auth";
import { getOrderById } from "@/lib/db/orders";
import { listReturnsForUser } from "@/lib/db/returns";
import { Badge } from "@/components/ui/primitives";
import { ReturnRequestForm } from "@/components/site/return-request-form";
import { OrderTrackingListener } from "@/components/site/order-tracking-listener";
import {
  formatCurrency,
  formatDate,
  ORDER_STATUS_LABELS,
  cn,
} from "@/lib/utils";

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const { placed } = await searchParams;
  const order = getOrderById(id);
  if (!order || order.user_id !== session.user.id) notFound();

  const returns = listReturnsForUser(session.user.id).filter(
    (r) => r.order_id === order.id
  );
  const returnedItemIds = new Set(returns.map((r) => r.order_item_id));
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <OrderTrackingListener orderId={order.id} />
      {placed && (
        <div className="mb-6 flex items-center gap-2.5 rounded-2xl bg-primary-soft px-5 py-4 text-primary-strong">
          <CheckCircle2 size={20} />
          <div>
            <p className="font-medium">Order placed successfully!</p>
            <p className="text-sm opacity-90">
              We&apos;ll notify you as it moves through processing.
            </p>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-primary">
            {order.order_number}
          </p>
          <h1 className="mt-1 font-display text-2xl text-ink">Order details</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
        <Badge tone={order.status === "cancelled" ? "danger" : "primary"}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      {order.status !== "cancelled" && (
        <div className="mb-10 flex items-center">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                    i <= currentStepIndex
                      ? "border-primary bg-primary text-white"
                      : "border-line text-ink-soft"
                  )}
                >
                  {i + 1}
                </div>
                <span className="text-[11px] capitalize text-ink-soft">{step}</span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1",
                    i < currentStepIndex ? "bg-primary" : "bg-line"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {order.items?.map((item) => (
            <div key={item.id} className="rounded-2xl border border-line bg-surface p-4">
              <div className="flex gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-soft">
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-ink-soft">
                    Qty {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <span className="font-mono text-sm font-semibold text-ink">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
              {order.status === "delivered" && (
                <div className="mt-3">
                  {returnedItemIds.has(item.id) ? (
                    <p className="text-xs text-ink-soft">
                      Return already requested for this item.
                    </p>
                  ) : (
                    <ReturnRequestForm orderId={order.id} item={item} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="h-fit space-y-5 rounded-2xl border border-line bg-surface p-6">
          {order.tracking_number && (
            <>
              <div>
                <p className="mb-2 flex items-center gap-1.5 font-display text-sm text-ink">
                  <Truck size={15} /> Shipment tracking
                </p>
                <p className="text-sm text-ink-soft">
                  {order.carrier && <>{order.carrier} · </>}
                  <span className="font-mono text-ink">{order.tracking_number}</span>
                </p>
              </div>
              <div className="label-perforation" />
            </>
          )}
          <div>
            <p className="mb-2 font-display text-sm text-ink">Shipping address</p>
            <p className="text-sm text-ink-soft">
              {order.full_name}
              <br />
              {order.address_line1}
              <br />
              {order.city}, {order.state} {order.postal_code}
              <br />
              {order.phone}
            </p>
          </div>
          <div className="label-perforation" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-ink-soft">
              <span>Subtotal</span>
              <span className="font-mono text-ink">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-primary">
                <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
                <span className="font-mono">-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink-soft">
              <span>Shipping</span>
              <span className="font-mono text-ink">
                {order.shipping_fee === 0 ? "Free" : formatCurrency(order.shipping_fee)}
              </span>
            </div>
          </div>
          <div className="label-perforation" />
          <div className="flex justify-between font-display text-lg text-ink">
            <span>Total</span>
            <span className="font-mono">{formatCurrency(order.total)}</span>
          </div>
          <p className="text-xs capitalize text-ink-soft">
            Payment: {order.payment_method === "cod" ? "Cash on delivery" : "Card"} ·{" "}
            {order.payment_status.replace("_", " ")}
          </p>
        </div>
      </div>
    </div>
  );
}
