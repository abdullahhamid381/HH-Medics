import Image from "next/image";
import {
  DollarSign,
  ShoppingCart,
  Users,
  RotateCcw,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  getDashboardStats,
  getRevenueSeries,
  getCategoryBreakdown,
  getTopProducts,
  getOrderStatusBreakdown,
} from "@/lib/db/analytics";
import { StatCard } from "@/components/admin/stat-card";
import {
  RevenueChart,
  CategoryBarChart,
  OrderStatusPie,
  PIE_COLORS,
} from "@/components/admin/dashboard-charts";
import { formatCurrency } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const stats = await getDashboardStats();
  const revenueSeries = await getRevenueSeries(14);
  const categoryBreakdown = await getCategoryBreakdown();
  const topProducts = await getTopProducts(5);
  const statusBreakdown = await getOrderStatusBreakdown();

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">
          Dashboard
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">
          Store overview
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          A snapshot of sales, orders and returns across your store.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          tone="primary"
          sub={`${formatCurrency(stats.revenueLast30)} in last 30 days`}
        />
        <StatCard
          label="Orders"
          value={String(stats.ordersCount)}
          icon={ShoppingCart}
          tone="accent"
          sub={`${stats.ordersLast30} in last 30 days`}
        />
        <StatCard
          label="Customers"
          value={String(stats.customersCount)}
          icon={Users}
          tone="primary"
          sub={`Avg order ${formatCurrency(stats.avgOrderValue)}`}
        />
        <StatCard
          label="Pending returns"
          value={String(stats.pendingReturns)}
          icon={RotateCcw}
          tone="warning"
          sub={`${formatCurrency(stats.refundedAmount)} refunded to date`}
        />
      </div>

      {(stats.pendingOrders > 0 || stats.lowStockCount > 0) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {stats.pendingOrders > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-warning/10 px-4 py-2.5 text-sm text-warning">
              <AlertTriangle size={15} />
              {stats.pendingOrders} order(s) awaiting processing
            </div>
          )}
          {stats.lowStockCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-2.5 text-sm text-danger">
              <AlertTriangle size={15} />
              {stats.lowStockCount} product(s) low on stock
            </div>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-display text-lg text-ink">Revenue trend</p>
              <p className="text-xs text-ink-soft">Last 14 days</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              <TrendingUp size={14} />
              {formatCurrency(stats.revenueLast30)} / 30d
            </span>
          </div>
          <RevenueChart data={revenueSeries} />
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <p className="mb-4 font-display text-lg text-ink">Orders by status</p>
          <OrderStatusPie data={statusBreakdown} />
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
            {statusBreakdown.map((s, i) => (
              <div key={s.status} className="flex items-center gap-1.5 text-xs">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="capitalize text-ink-soft">{s.status}</span>
                <span className="ml-auto font-mono text-ink">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <p className="mb-4 font-display text-lg text-ink">Revenue by category</p>
          <CategoryBarChart data={categoryBreakdown} />
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <p className="mb-4 font-display text-lg text-ink">Top products</p>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-soft font-mono text-xs text-ink-soft">
                  {i + 1}
                </span>
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-soft">
                  {p.image && (
                    <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="line-clamp-1 text-sm text-ink">{p.name}</p>
                  <p className="text-xs text-ink-soft">{p.units} units sold</p>
                </div>
                <span className="font-mono text-sm font-semibold text-ink">
                  {formatCurrency(p.revenue)}
                </span>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-sm text-ink-soft">No sales recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
