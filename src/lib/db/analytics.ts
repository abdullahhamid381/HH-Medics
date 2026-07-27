import "./schema";
import { db } from "./index";

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

export function getDashboardStats(): DashboardStats {
  const totalRevenue = (
    db
      .prepare(
        `SELECT COALESCE(SUM(total),0) as v FROM orders WHERE status != 'cancelled'`
      )
      .get() as { v: number }
  ).v;

  const revenueLast30 = (
    db
      .prepare(
        `SELECT COALESCE(SUM(total),0) as v FROM orders WHERE status != 'cancelled' AND created_at >= datetime('now','-30 days')`
      )
      .get() as { v: number }
  ).v;

  const ordersCount = (
    db.prepare(`SELECT COUNT(*) as v FROM orders`).get() as { v: number }
  ).v;

  const ordersLast30 = (
    db
      .prepare(
        `SELECT COUNT(*) as v FROM orders WHERE created_at >= datetime('now','-30 days')`
      )
      .get() as { v: number }
  ).v;

  const customersCount = (
    db.prepare(`SELECT COUNT(*) as v FROM users WHERE role = 'customer'`).get() as {
      v: number;
    }
  ).v;

  const pendingOrders = (
    db
      .prepare(
        `SELECT COUNT(*) as v FROM orders WHERE status IN ('pending','processing')`
      )
      .get() as { v: number }
  ).v;

  const pendingReturns = (
    db
      .prepare(`SELECT COUNT(*) as v FROM returns WHERE status = 'requested'`)
      .get() as { v: number }
  ).v;

  const refundedAmount = (
    db
      .prepare(
        `SELECT COALESCE(SUM(refund_amount),0) as v FROM returns WHERE status = 'refunded'`
      )
      .get() as { v: number }
  ).v;

  const lowStockCount = (
    db
      .prepare(
        `SELECT COUNT(*) as v FROM products WHERE stock <= 10 AND status = 'active'`
      )
      .get() as { v: number }
  ).v;

  return {
    totalRevenue,
    revenueLast30,
    ordersCount,
    ordersLast30,
    customersCount,
    avgOrderValue: ordersCount ? totalRevenue / ordersCount : 0,
    pendingOrders,
    pendingReturns,
    refundedAmount,
    lowStockCount,
  };
}

export interface RevenuePoint {
  day: string;
  revenue: number;
  orders: number;
}

export function getRevenueSeries(days = 14): RevenuePoint[] {
  const rows = db
    .prepare(
      `SELECT date(created_at) as day, COALESCE(SUM(total),0) as revenue, COUNT(*) as orders
       FROM orders
       WHERE status != 'cancelled' AND created_at >= datetime('now', ?)
       GROUP BY date(created_at)
       ORDER BY day ASC`
    )
    .all(`-${days} days`) as unknown as RevenuePoint[];

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

function orderDateClause(range: DateRange, alias = "o"): { clause: string; params: string[] } {
  if (range.start && range.end) {
    return { clause: `AND date(${alias}.created_at) BETWEEN ? AND ?`, params: [range.start, range.end] };
  }
  if (range.start) {
    return { clause: `AND date(${alias}.created_at) >= ?`, params: [range.start] };
  }
  if (range.end) {
    return { clause: `AND date(${alias}.created_at) <= ?`, params: [range.end] };
  }
  return { clause: "", params: [] };
}

export function getCategoryBreakdown(range: DateRange = {}): CategoryBreakdown[] {
  const { clause, params } = orderDateClause(range);
  return db
    .prepare(
      `SELECT COALESCE(c.name, 'Uncategorized') as category,
              COALESCE(SUM(oi.price * oi.quantity),0) as revenue,
              COALESCE(SUM(oi.quantity),0) as units
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id AND o.status != 'cancelled' ${clause}
       LEFT JOIN products p ON p.id = oi.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       GROUP BY category
       ORDER BY revenue DESC`
    )
    .all(...params) as unknown as CategoryBreakdown[];
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

export function getTopProducts(limit = 5, range: DateRange = {}): TopProduct[] {
  const { clause, params } = orderDateClause(range);
  const rows = db
    .prepare(
      `SELECT oi.name as name, SUM(oi.quantity) as units, SUM(oi.price*oi.quantity) as revenue,
              SUM(COALESCE(oi.cost_price,0)*oi.quantity) as cost, oi.image as image
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id AND o.status != 'cancelled' ${clause}
       GROUP BY oi.name
       ORDER BY revenue DESC
       LIMIT ?`
    )
    .all(...params, limit) as unknown as (TopProduct & { cost: number })[];

  return rows.map((r) => ({
    ...r,
    profit: r.revenue - r.cost,
    marginPct: r.revenue > 0 ? ((r.revenue - r.cost) / r.revenue) * 100 : 0,
  }));
}

export function getOrderStatusBreakdown(range: DateRange = {}): { status: string; count: number }[] {
  const { clause, params } = orderDateClause(range, "orders");
  return db
    .prepare(
      `SELECT status, COUNT(*) as count FROM orders WHERE 1=1 ${clause} GROUP BY status ORDER BY count DESC`
    )
    .all(...params) as unknown as { status: string; count: number }[];
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

export function getSalesReport(range: DateRange = {}): SalesReport {
  const orderClause = orderDateClause(range);

  const orderTotals = db
    .prepare(
      `SELECT COALESCE(SUM(total),0) as revenue,
              COALESCE(SUM(discount),0) as discounts,
              COALESCE(SUM(shipping_fee),0) as shipping,
              COUNT(*) as count,
              COUNT(DISTINCT user_id) as customers
       FROM orders o WHERE status != 'cancelled' ${orderClause.clause}`
    )
    .get(...orderClause.params) as {
    revenue: number;
    discounts: number;
    shipping: number;
    count: number;
    customers: number;
  };

  const cancelledCount = (
    db
      .prepare(
        `SELECT COUNT(*) as c FROM orders o WHERE status = 'cancelled' ${orderClause.clause}`
      )
      .get(...orderClause.params) as { c: number }
  ).c;

  const cogsRow = db
    .prepare(
      `SELECT COALESCE(SUM(COALESCE(oi.cost_price,0)*oi.quantity),0) as cogs,
              COALESCE(SUM(oi.quantity),0) as units
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id AND o.status != 'cancelled' ${orderClause.clause}`
    )
    .get(...orderClause.params) as { cogs: number; units: number };

  // Refunds are attributed to the day they were resolved (falling back to
  // request date), since that's when the money actually leaves the store.
  let refundClause = "";
  let refundParams: string[] = [];
  if (range.start && range.end) {
    refundClause = `AND date(COALESCE(resolved_at, created_at)) BETWEEN ? AND ?`;
    refundParams = [range.start, range.end];
  } else if (range.start) {
    refundClause = `AND date(COALESCE(resolved_at, created_at)) >= ?`;
    refundParams = [range.start];
  } else if (range.end) {
    refundClause = `AND date(COALESCE(resolved_at, created_at)) <= ?`;
    refundParams = [range.end];
  }
  const refunds = (
    db
      .prepare(
        `SELECT COALESCE(SUM(refund_amount),0) as v FROM returns WHERE status = 'refunded' ${refundClause}`
      )
      .get(...refundParams) as { v: number }
  ).v;

  const revenue = orderTotals.revenue;
  const cogs = cogsRow.cogs;
  const grossProfit = revenue - cogs;

  return {
    revenue,
    cogs,
    grossProfit,
    grossMarginPct: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
    discounts: orderTotals.discounts,
    shippingCollected: orderTotals.shipping,
    refunds,
    netProfit: grossProfit - refunds,
    ordersCount: orderTotals.count,
    cancelledCount,
    unitsSold: cogsRow.units,
    avgOrderValue: orderTotals.count ? revenue / orderTotals.count : 0,
    customersCount: orderTotals.customers,
  };
}

export interface DailySalesPoint {
  day: string;
  revenue: number;
  cost: number;
  profit: number;
  orders: number;
}

export function getSalesSeries(startDate: string, endDate: string): DailySalesPoint[] {
  const rows = db
    .prepare(
      `SELECT date(o.created_at) as day,
              COALESCE(SUM(o.total),0) as revenue,
              COUNT(DISTINCT o.id) as orders,
              COALESCE((
                SELECT SUM(COALESCE(oi.cost_price,0) * oi.quantity)
                FROM order_items oi WHERE oi.order_id = o.id
              ), 0) as cost
       FROM orders o
       WHERE o.status != 'cancelled' AND date(o.created_at) BETWEEN ? AND ?
       GROUP BY date(o.created_at)
       ORDER BY day ASC`
    )
    .all(startDate, endDate) as unknown as DailySalesPoint[];

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
