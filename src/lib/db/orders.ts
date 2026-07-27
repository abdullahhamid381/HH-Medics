import "./schema";
import { db, genId } from "./index";
import type { Order, OrderItem, OrderStatus, CartLine } from "@/types";
import { decrementStock, restockProduct } from "./products";

// Explicit column list — never select cost_price here. Order/OrderItem
// objects returned from these functions flow into customer-facing pages
// (and are passed as props to client components), so business-sensitive
// cost data must never end up on this path. Admin profit reporting reads
// cost_price directly via dedicated queries in analytics.ts / getOrderItemsWithCost.
const ORDER_ITEM_COLUMNS = "id, order_id, product_id, name, image, price, quantity";

function nextOrderNumber(): string {
  const count = (
    db.prepare(`SELECT COUNT(*) as c FROM orders`).get() as { c: number }
  ).c;
  return `MS-${String(10000 + count + 1)}`;
}

export interface CreateOrderInput {
  userId: string;
  items: CartLine[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string | null;
  paymentMethod: "cod" | "card";
  fullName: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  notes?: string;
}

export function createOrder(input: CreateOrderInput): Order {
  const id = genId("order");
  const orderNumber = nextOrderNumber();
  db.prepare(
    `INSERT INTO orders (
      id, order_number, user_id, status, payment_method, payment_status,
      subtotal, discount, shipping_fee, total, coupon_code,
      full_name, phone, address_line1, city, state, postal_code, notes
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    orderNumber,
    input.userId,
    "pending",
    input.paymentMethod,
    input.paymentMethod === "card" ? "paid" : "unpaid",
    input.subtotal,
    input.discount,
    input.shippingFee,
    input.total,
    input.couponCode ?? null,
    input.fullName,
    input.phone,
    input.addressLine1,
    input.city,
    input.state,
    input.postalCode,
    input.notes ?? null
  );

  const insertItem = db.prepare(
    `INSERT INTO order_items (id, order_id, product_id, name, image, price, quantity, cost_price)
     VALUES (?,?,?,?,?,?,?,?)`
  );
  for (const line of input.items) {
    insertItem.run(
      genId("item"),
      id,
      line.productId,
      line.name,
      line.image,
      line.price,
      line.quantity,
      line.costPrice ?? null
    );
    decrementStock(line.productId, line.quantity);
  }

  return getOrderById(id)!;
}

export function getOrderById(id: string): Order | undefined {
  const order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id) as
    | Order
    | undefined;
  if (!order) return undefined;
  order.items = db
    .prepare(`SELECT ${ORDER_ITEM_COLUMNS} FROM order_items WHERE order_id = ?`)
    .all(id) as unknown as OrderItem[];
  return order;
}

export function getOrderByNumber(orderNumber: string): Order | undefined {
  const order = db
    .prepare(`SELECT * FROM orders WHERE order_number = ?`)
    .get(orderNumber) as Order | undefined;
  if (!order) return undefined;
  order.items = db
    .prepare(`SELECT ${ORDER_ITEM_COLUMNS} FROM order_items WHERE order_id = ?`)
    .all(order.id) as unknown as OrderItem[];
  return order;
}

export function listOrdersForUser(userId: string): Order[] {
  const orders = db
    .prepare(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`)
    .all(userId) as unknown as Order[];
  for (const order of orders) {
    order.items = db
      .prepare(`SELECT ${ORDER_ITEM_COLUMNS} FROM order_items WHERE order_id = ?`)
      .all(order.id) as unknown as OrderItem[];
  }
  return orders;
}

export interface OrderFilters {
  status?: OrderStatus | "all";
  q?: string;
  limit?: number;
  offset?: number;
}

export function listOrders(filters: OrderFilters = {}): {
  items: Order[];
  total: number;
} {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (filters.status && filters.status !== "all") {
    where.push(`o.status = ?`);
    params.push(filters.status);
  }
  if (filters.q) {
    where.push(`(o.order_number LIKE ? OR o.full_name LIKE ? OR u.email LIKE ?)`);
    const like = `%${filters.q}%`;
    params.push(like, like, like);
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;

  const total = (
    db
      .prepare(
        `SELECT COUNT(*) as c FROM orders o LEFT JOIN users u ON u.id = o.user_id ${whereClause}`
      )
      .get(...params) as { c: number }
  ).c;

  const items = db
    .prepare(
      `SELECT o.*, u.name as customer_name, u.email as customer_email
       FROM orders o LEFT JOIN users u ON u.id = o.user_id
       ${whereClause}
       ORDER BY o.created_at DESC LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset) as unknown as Order[];

  for (const order of items) {
    order.items = db
      .prepare(`SELECT ${ORDER_ITEM_COLUMNS} FROM order_items WHERE order_id = ?`)
      .all(order.id) as unknown as OrderItem[];
  }

  return { items, total };
}

export interface OrderFulfillmentInput {
  status?: OrderStatus;
  trackingNumber?: string | null;
  carrier?: string | null;
}

export function updateOrderFulfillment(
  id: string,
  input: OrderFulfillmentInput
): Order | undefined {
  const existing = getOrderById(id);
  if (!existing) return undefined;

  const status = input.status ?? existing.status;
  const trackingNumber =
    input.trackingNumber !== undefined ? input.trackingNumber : existing.tracking_number;
  const carrier = input.carrier !== undefined ? input.carrier : existing.carrier;

  db.prepare(
    `UPDATE orders SET status = ?, tracking_number = ?, carrier = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(status, trackingNumber, carrier, id);

  if (input.status === "cancelled" && existing.status !== "cancelled") {
    if (existing.items) {
      for (const item of existing.items) {
        if (item.product_id) restockProduct(item.product_id, item.quantity);
      }
    }
  }

  return getOrderById(id);
}

// Admin-only: includes cost_price for per-order profit display. Never pass
// the result of this into a "use client" component prop.
export interface OrderItemWithCost extends OrderItem {
  cost_price: number | null;
}

export function getOrderItemsWithCost(orderId: string): OrderItemWithCost[] {
  return db
    .prepare(`SELECT * FROM order_items WHERE order_id = ?`)
    .all(orderId) as unknown as OrderItemWithCost[];
}

export function updatePaymentStatus(
  id: string,
  paymentStatus: Order["payment_status"]
) {
  db.prepare(`UPDATE orders SET payment_status = ? WHERE id = ?`).run(
    paymentStatus,
    id
  );
}
