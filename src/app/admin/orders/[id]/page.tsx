import Image from "next/image";
import { notFound } from "next/navigation";
import { getOrderById, getOrderItemsWithCost } from "@/lib/db/orders";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { OrderTrackingForm } from "@/components/admin/order-tracking-form";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) notFound();

  // Server-only: cost_price must never be forwarded to a client component.
  const itemsWithCost = getOrderItemsWithCost(order.id);
  const cogs = itemsWithCost.reduce(
    (sum, item) => sum + (item.cost_price ?? 0) * item.quantity,
    0
  );
  const orderProfit = order.subtotal - order.discount - cogs;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-primary">
            {order.order_number}
          </p>
          <h1 className="mt-1 font-display text-3xl text-ink">Order detail</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4"
            >
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
          ))}
        </div>

        <div className="h-fit space-y-5 rounded-2xl border border-line bg-surface p-6">
          <OrderTrackingForm
            orderId={order.id}
            trackingNumber={order.tracking_number}
            carrier={order.carrier}
          />
          <div className="label-perforation" />
          <div>
            <p className="mb-2 font-display text-sm text-ink">Customer</p>
            <p className="text-sm text-ink-soft">
              {order.full_name}
              <br />
              {order.phone}
            </p>
          </div>
          <div>
            <p className="mb-2 font-display text-sm text-ink">Shipping address</p>
            <p className="text-sm text-ink-soft">
              {order.address_line1}
              <br />
              {order.city}, {order.state} {order.postal_code}
            </p>
          </div>
          {order.notes && (
            <div>
              <p className="mb-2 font-display text-sm text-ink">Delivery notes</p>
              <p className="text-sm text-ink-soft">{order.notes}</p>
            </div>
          )}
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
          <div className="label-perforation" />
          <div>
            <p className="mb-2 font-display text-sm text-ink">Profit (admin only)</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>Cost of goods</span>
                <span className="font-mono text-ink">{formatCurrency(cogs)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-ink-soft">Order profit</span>
                <span
                  className={cn(
                    "font-mono",
                    orderProfit >= 0 ? "text-primary" : "text-danger"
                  )}
                >
                  {formatCurrency(orderProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
