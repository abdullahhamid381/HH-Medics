import Link from "next/link";
import { listOrders } from "@/lib/db/orders";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const PAGE_SIZE = 20;
const STATUS_FILTERS: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { status, q, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const activeStatus = (status as OrderStatus | "all") ?? "all";

  const { items, total } = await listOrders({
    status: activeStatus,
    q,
    limit: PAGE_SIZE,
    offset: (currentPage - 1) * PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function hrefFor(s: string) {
    const params = new URLSearchParams();
    if (s !== "all") params.set("status", s);
    if (q) params.set("q", q);
    return `/admin/orders?${params.toString()}`;
  }

  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">Sales</p>
        <h1 className="mt-1 font-display text-3xl text-ink">Orders</h1>
        <p className="mt-1 text-sm text-ink-soft">{total} orders total</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={hrefFor(s)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition",
              activeStatus === s
                ? "border-primary bg-primary text-white"
                : "border-line bg-surface text-ink-soft hover:bg-surface-soft"
            )}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink-soft">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((order) => (
              <tr key={order.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-mono text-sm text-primary hover:underline"
                  >
                    {order.order_number}
                  </Link>
                  <p className="text-xs text-ink-soft">
                    {order.items?.length ?? 0} item(s)
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-ink">{order.customer_name ?? order.full_name}</p>
                  <p className="text-xs text-ink-soft">{order.customer_email}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(order.created_at)}</td>
                <td className="px-4 py-3 font-mono text-ink">{formatCurrency(order.total)}</td>
                <td className="px-4 py-3 text-ink-soft">
                  <span className="capitalize">{order.payment_method}</span>
                  <span className="mx-1">·</span>
                  <span className="capitalize">{order.payment_status.replace("_", " ")}</span>
                </td>
                <td className="px-4 py-3">
                  <OrderStatusSelect orderId={order.id} status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            if (activeStatus !== "all") params.set("status", activeStatus);
            if (q) params.set("q", q);
            params.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/admin/orders?${params.toString()}`}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition",
                  p === currentPage
                    ? "bg-primary text-white"
                    : "border border-line text-ink-soft hover:bg-surface-soft"
                )}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
