import Image from "next/image";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  RotateCcw,
  Percent,
} from "lucide-react";
import {
  getSalesReport,
  getSalesSeries,
  getCategoryBreakdown,
  getTopProducts,
  getOrderStatusBreakdown,
} from "@/lib/db/analytics";
import { StatCard } from "@/components/admin/stat-card";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import { ProfitLossChart } from "@/components/admin/reports-charts";
import { CategoryBarChart } from "@/components/admin/dashboard-charts";
import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { formatCurrency } from "@/lib/utils";

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function resolveRange(from?: string, to?: string) {
  if (from && to) return { start: from, end: to };
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return { start: toISODate(start), end: toISODate(end) };
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  const { start, end } = resolveRange(from, to);

  const report = getSalesReport({ start, end });
  const series = getSalesSeries(start, end);
  const categories = getCategoryBreakdown({ start, end });
  const topProducts = getTopProducts(8, { start, end });
  const statusBreakdown = getOrderStatusBreakdown({ start, end });

  const csvRows = series.map((d) => ({
    date: d.day,
    orders: d.orders,
    revenue: d.revenue,
    cost_of_goods: d.cost,
    gross_profit: d.profit,
  }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-primary">
            Reports
          </p>
          <h1 className="mt-1 font-display text-3xl text-ink">
            Sales & profit/loss
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {start} to {end} &middot; {report.ordersCount} orders
          </p>
        </div>
        <ExportCsvButton rows={csvRows} filename={`sales-report_${start}_to_${end}.csv`} />
      </div>

      <div className="mb-6">
        <DateRangePicker from={start} to={end} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatCurrency(report.revenue)}
          icon={DollarSign}
          tone="primary"
          sub={`${report.ordersCount} orders in range`}
        />
        <StatCard
          label="Cost of goods sold"
          value={formatCurrency(report.cogs)}
          icon={TrendingDown}
          tone="danger"
          sub={`${report.unitsSold} units sold`}
        />
        <StatCard
          label="Gross profit"
          value={formatCurrency(report.grossProfit)}
          icon={TrendingUp}
          tone="accent"
          sub={`${report.grossMarginPct.toFixed(1)}% margin`}
        />
        <StatCard
          label="Net profit"
          value={formatCurrency(report.netProfit)}
          icon={Percent}
          tone={report.netProfit >= 0 ? "primary" : "danger"}
          sub={`After ${formatCurrency(report.refunds)} refunded`}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Avg order value"
          value={formatCurrency(report.avgOrderValue)}
          icon={ShoppingCart}
          tone="primary"
        />
        <StatCard
          label="Customers"
          value={String(report.customersCount)}
          icon={Users}
          tone="accent"
          sub="Placed an order in range"
        />
        <StatCard
          label="Discounts given"
          value={formatCurrency(report.discounts)}
          icon={RotateCcw}
          tone="warning"
        />
        <StatCard
          label="Cancelled orders"
          value={String(report.cancelledCount)}
          icon={Package}
          tone="danger"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <div className="mb-4">
          <p className="font-display text-lg text-ink">Revenue, cost & profit</p>
          <p className="text-xs text-ink-soft">Daily breakdown for the selected range</p>
        </div>
        <ProfitLossChart data={series} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <p className="mb-4 font-display text-lg text-ink">Revenue by category</p>
          {categories.length > 0 ? (
            <CategoryBarChart data={categories} />
          ) : (
            <p className="py-10 text-center text-sm text-ink-soft">No sales in this range.</p>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <p className="mb-4 font-display text-lg text-ink">Orders by status</p>
          <div className="space-y-2.5">
            {statusBreakdown.map((s) => (
              <div key={s.status} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm capitalize text-ink-soft">
                  {s.status}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${(s.count / Math.max(...statusBreakdown.map((x) => x.count), 1)) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-sm text-ink">{s.count}</span>
              </div>
            ))}
            {statusBreakdown.length === 0 && (
              <p className="text-sm text-ink-soft">No orders in this range.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface p-6">
        <p className="mb-4 font-display text-lg text-ink">Product profitability</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-soft">
                <th className="py-2.5 pr-4 font-medium">Product</th>
                <th className="py-2.5 pr-4 font-medium">Units</th>
                <th className="py-2.5 pr-4 font-medium">Revenue</th>
                <th className="py-2.5 pr-4 font-medium">Cost</th>
                <th className="py-2.5 pr-4 font-medium">Profit</th>
                <th className="py-2.5 font-medium">Margin</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.name} className="border-b border-line last:border-0">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-surface-soft">
                        {p.image && (
                          <Image src={p.image} alt="" fill sizes="32px" className="object-cover" />
                        )}
                      </div>
                      <span className="line-clamp-1 max-w-[220px] text-ink">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-ink-soft">{p.units}</td>
                  <td className="py-2.5 pr-4 font-mono text-ink">{formatCurrency(p.revenue)}</td>
                  <td className="py-2.5 pr-4 font-mono text-ink-soft">
                    {formatCurrency(p.cost ?? 0)}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-ink">
                    {formatCurrency(p.profit ?? 0)}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={
                        (p.marginPct ?? 0) >= 0 ? "text-primary" : "text-danger"
                      }
                    >
                      {(p.marginPct ?? 0).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-ink-soft">
                    No sales in this range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {topProducts.some((p) => p.cost === 0) && (
          <p className="mt-3 text-xs text-ink-soft">
            Products without a cost price set show cost as ₨0 — add one from the product
            editor for accurate margins.
          </p>
        )}
      </div>
    </div>
  );
}
