import { db, unwrap } from "./index";

// All the queries in this file involve joins, GROUP BY and date-range
// filtering that are much cleaner expressed as SQL than rebuilt with the
// supabase-js query builder, so they're implemented as Postgres functions
// (see supabase/schema.sql) and called here via supabase.rpc(...).

export interface DashboardStats {
  totalRevenue: number;
  revenueLast30: number;
  ordersCount: number;
  ordersLast30: number;
  customersCount: number;
  avgOrderValue: number;
  pendingOrders: number;
  pendingReturns: number;
  refundedAmount: number;
  lowStockCount: number;
}

interface DashboardStatsRow {
  total_revenue: number;
  revenue_last30: number;
  orders_count: number;
  orders_last30: number;
  customers_count: number;
  avg_order_value: number;
  pending_orders: number;
  pending_returns: number;
  refunded_amount: number;
  low_stock_count: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const rows = unwrap<DashboardStatsRow[]>(await db.rpc("dashboard_stats"));
  const r = rows[0];
  return {
    totalRevenue: r.total_revenue,
    revenueLast30: r.revenue_last30,
    ordersCount: r.orders_count,
    ordersLast30: r.orders_last30,
    customersCount: r.customers_count,
    avgOrderValue: r.avg_order_value,
    pendingOrders: r.pending_orders,
    pendingReturns: r.pending_returns,
    refundedAmount: r.refunded_amount,
    lowStockCount: r.low_stock_count,
  };
}

export interface RevenuePoint {
  day: string;
  revenue: number;
  orders: number;
}

export async function getRevenueSeries(days = 14): Promise<RevenuePoint[]> {
  const rows = unwrap<RevenuePoint[]>(
    await db.rpc("revenue_series", { days_back: days })
  );

  // fill missing days with zero so the chart doesn't have gaps
  const map = new Map(rows.map((r) => [r.day, r]));
  const result: RevenuePoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push(map.get(key) ?? { day: key, revenue: 0, orders: 0 });
  }
  return result;
}

export interface CategoryBreakdown {
  category: string;
  revenue: number;
  units: number;
}

export interface DateRange {
  start?: string; // 'YYYY-MM-DD', inclusive
  end?: string; // 'YYYY-MM-DD', inclusive
}

export async function getCategoryBreakdown(range: DateRange = {}): Promise<CategoryBreakdown[]> {
  return unwrap<CategoryBreakdown[]>(
    await db.rpc("category_breakdown", {
      range_start: range.start ?? null,
      range_end: range.end ?? null,
    })
  );
}

export interface TopProduct {
  name: string;
  units: number;
  revenue: number;
  image: string | null;
  cost?: number;
  profit?: number;
  marginPct?: number;
}

export async function getTopProducts(limit = 5, range: DateRange = {}): Promise<TopProduct[]> {
  const rows = unwrap<(TopProduct & { cost: number })[]>(
    await db.rpc("top_products", {
      lim: limit,
      range_start: range.start ?? null,
      range_end: range.end ?? null,
    })
  );

  return rows.map((r) => ({
    ...r,
    profit: r.revenue - r.cost,
    marginPct: r.revenue > 0 ? ((r.revenue - r.cost) / r.revenue) * 100 : 0,
  }));
}

export async function getOrderStatusBreakdown(
  range: DateRange = {}
): Promise<{ status: string; count: number }[]> {
  return unwrap<{ status: string; count: number }[]>(
    await db.rpc("order_status_breakdown", {
      range_start: range.start ?? null,
      range_end: range.end ?? null,
    })
  );
}

// ---------------------------------------------------------------------------
// Sales report / profit & loss (date-range aware) — powers /admin/reports
// ---------------------------------------------------------------------------

export interface SalesReport {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPct: number;
  discounts: number;
  shippingCollected: number;
  refunds: number;
  netProfit: number;
  ordersCount: number;
  cancelledCount: number;
  unitsSold: number;
  avgOrderValue: number;
  customersCount: number;
}

interface SalesReportRow {
  revenue: number;
  cogs: number;
  gross_profit: number;
  gross_margin_pct: number;
  discounts: number;
  shipping_collected: number;
  refunds: number;
  net_profit: number;
  orders_count: number;
  cancelled_count: number;
  units_sold: number;
  avg_order_value: number;
  customers_count: number;
}

export async function getSalesReport(range: DateRange = {}): Promise<SalesReport> {
  const rows = unwrap<SalesReportRow[]>(
    await db.rpc("sales_report", {
      range_start: range.start ?? null,
      range_end: range.end ?? null,
    })
  );
  const r = rows[0];
  return {
    revenue: r.revenue,
    cogs: r.cogs,
    grossProfit: r.gross_profit,
    grossMarginPct: r.gross_margin_pct,
    discounts: r.discounts,
    shippingCollected: r.shipping_collected,
    refunds: r.refunds,
    netProfit: r.net_profit,
    ordersCount: r.orders_count,
    cancelledCount: r.cancelled_count,
    unitsSold: r.units_sold,
    avgOrderValue: r.avg_order_value,
    customersCount: r.customers_count,
  };
}

export interface DailySalesPoint {
  day: string;
  revenue: number;
  cost: number;
  profit: number;
  orders: number;
}

export async function getSalesSeries(
  startDate: string,
  endDate: string
): Promise<DailySalesPoint[]> {
  const rows = unwrap<Omit<DailySalesPoint, "profit">[]>(
    await db.rpc("sales_series", { start_date: startDate, end_date: endDate })
  );

  const map = new Map(rows.map((r) => [r.day, r]));
  const result: DailySalesPoint[] = [];
  const cursor = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    const existing = map.get(key);
    result.push(
      existing
        ? { ...existing, profit: existing.revenue - existing.cost }
        : { day: key, revenue: 0, cost: 0, profit: 0, orders: 0 }
    );
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}
