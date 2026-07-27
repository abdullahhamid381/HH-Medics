import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar, ShoppingBag, Wallet } from "lucide-react";
import { getCustomerDetail } from "@/lib/db/users";
import { listOrdersForUser } from "@/lib/db/orders";
import { listReturnsForUser } from "@/lib/db/returns";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/primitives";
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, RETURN_STATUS_LABELS } from "@/lib/utils";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = getCustomerDetail(id);
  if (!detail || detail.user.role !== "customer") notFound();

  const orders = listOrdersForUser(id);
  const returns = listReturnsForUser(id);

  return (
    <div>
      <Link
        href="/admin/customers"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to customers
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-primary">
            Customer
          </p>
          <h1 className="mt-1 font-display text-3xl text-ink">{detail.user.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
            <span className="flex items-center gap-1.5">
              <Mail size={14} /> {detail.user.email}
            </span>
            {detail.user.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={14} /> {detail.user.phone}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> Joined {formatDate(detail.user.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total spent"
          value={formatCurrency(detail.totalSpent)}
          icon={Wallet}
          tone="primary"
        />
        <StatCard
          label="Orders placed"
          value={String(detail.ordersCount)}
          icon={ShoppingBag}
          tone="accent"
        />
        <StatCard
          label="Avg order value"
          value={formatCurrency(detail.avgOrderValue)}
          icon={Wallet}
          tone="primary"
        />
        <StatCard
          label="Last order"
          value={detail.lastOrderAt ? formatDate(detail.lastOrderAt) : "—"}
          icon={Calendar}
          tone="warning"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="mb-3 font-display text-lg text-ink">Order history</p>
          <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-ink-soft">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-mono text-sm text-primary hover:underline"
                      >
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3 font-mono text-ink">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={o.status === "cancelled" ? "danger" : "primary"}>
                        {ORDER_STATUS_LABELS[o.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-ink-soft">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {returns.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 font-display text-lg text-ink">Return requests</p>
              <div className="space-y-2">
                {returns.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-xl border border-line bg-surface p-3.5 text-sm"
                  >
                    <div>
                      <p className="text-ink">{r.item_name}</p>
                      <p className="text-xs text-ink-soft">
                        {r.return_number} · Order {r.order_number} · {formatDate(r.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-ink">
                        {formatCurrency(r.refund_amount)}
                      </span>
                      <Badge tone={r.status === "refunded" ? "primary" : "default"}>
                        {RETURN_STATUS_LABELS[r.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 font-display text-lg text-ink">Saved addresses</p>
          <div className="space-y-3">
            {detail.addresses.map((a) => (
              <div key={a.id} className="rounded-2xl border border-line bg-surface p-4 text-sm">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium text-ink">{a.full_name}</p>
                  {a.is_default === 1 && <Badge tone="primary">Default</Badge>}
                </div>
                <p className="text-ink-soft">{a.phone}</p>
                <p className="mt-1 text-ink-soft">
                  {a.line1}, {a.city}, {a.state} {a.postal_code}
                </p>
              </div>
            ))}
            {detail.addresses.length === 0 && (
              <p className="text-sm text-ink-soft">No saved addresses.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
