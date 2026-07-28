import { db, genId } from "./index";
import type { Order, OrderItem, OrderStatus, CartLine } from "@/types";
import { decrementStock, restockProduct } from "./products";

// Explicit column list — never select cost_price here. Order/OrderItem
// objects returned from these functions flow into customer-facing pages
// (and are passed as props to client components), so business-sensitive
// cost data must never end up on this path. Admin profit reporting reads
// cost_price directly via dedicated queries in analytics.ts / getOrderItemsWithCost.
const ORDER_ITEM_COLUMNS = "id, order_id, product_id, name, image, price, quantity";

async function nextOrderNumber(): Promise<string> {
  const { count, error } = await db
    .from("orders")
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return `MS-${String(10000 + (count ?? 0) + 1)}`;
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

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const id = genId("order");
  const orderNumber = await nextOrderNumber();

  const { error: orderError } = await db.from("orders").insert({
    id,
    order_number: orderNumber,
    user_id: input.userId,
    status: "pending",
    payment_method: input.paymentMethod,
    payment_status: input.paymentMethod === "card" ? "paid" : "unpaid",
    subtotal: input.subtotal,
    discount: input.discount,
    shipping_fee: input.shippingFee,
    total: input.total,
    coupon_code: input.couponCode ?? null,
    full_name: input.fullName,
    phone: input.phone,
    address_line1: input.addressLine1,
    city: input.city,
    state: input.state,
    postal_code: input.postalCode,
    notes: input.notes ?? null,
  });
  if (orderError) throw new Error(orderError.message);

  const { error: itemsError } = await db.from("order_items").insert(
    input.items.map((line) => ({
      id: genId("item"),
      order_id: id,
      product_id: line.productId,
      name: line.name,
      image: line.image,
      price: line.price,
      quantity: line.quantity,
      cost_price: line.costPrice ?? null,
    }))
  );
  if (itemsError) throw new Error(itemsError.message);

  await Promise.all(input.items.map((line) => decrementStock(line.productId, line.quantity)));

  return (await getOrderById(id))!;
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const { data, error } = await db.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return undefined;
  const order = data as Order;
  order.items = await getOrderItems(id);
  return order;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
  const { data, error } = await db
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return undefined;
  const order = data as Order;
  order.items = await getOrderItems(order.id);
  return order;
}

async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await db
    .from("order_items")
    .select(ORDER_ITEM_COLUMNS)
    .eq("order_id", orderId);
  if (error) throw new Error(error.message);
  return (data as unknown as OrderItem[]) ?? [];
}

export async function listOrdersForUser(userId: string): Promise<Order[]> {
  const { data, error } = await db
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const orders = (data as Order[]) ?? [];
  await Promise.all(
    orders.map(async (order) => {
      order.items = await getOrderItems(order.id);
    })
  );
  return orders;
}

export interface OrderFilters {
  status?: OrderStatus | "all";
  q?: string;
  limit?: number;
  offset?: number;
}

export async function listOrders(filters: OrderFilters = {}): Promise<{
  items: Order[];
  total: number;
}> {
  let query = db.from("orders").select("*, customer:users(name, email)", { count: "exact" });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.q) {
    const term = filters.q.replace(/[,()%]/g, " ").trim();
    if (term) {
      const { data: matchingUsers } = await db
        .from("users")
        .select("id")
        .ilike("email", `%${term}%`);
      const userIds = (matchingUsers as { id: string }[] | null)?.map((u) => u.id) ?? [];
      const orClauses = [`order_number.ilike.%${term}%`, `full_name.ilike.%${term}%`];
      if (userIds.length > 0) {
        orClauses.push(`user_id.in.(${userIds.join(",")})`);
      }
      query = query.or(orClauses.join(","));
    }
  }

  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);

  const rows = (data as unknown as (Order & {
    customer: { name: string; email: string } | null;
  })[]) ?? [];
  const items: Order[] = rows.map((row) => {
    const { customer, ...order } = row;
    return {
      ...order,
      customer_name: customer?.name,
      customer_email: customer?.email,
    };
  });
  await Promise.all(
    items.map(async (order) => {
      order.items = await getOrderItems(order.id);
    })
  );

  return { items, total: count ?? 0 };
}

export interface OrderFulfillmentInput {
  status?: OrderStatus;
  trackingNumber?: string | null;
  carrier?: string | null;
}

export async function updateOrderFulfillment(
  id: string,
  input: OrderFulfillmentInput
): Promise<Order | undefined> {
  const existing = await getOrderById(id);
  if (!existing) return undefined;

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.status !== undefined) payload.status = input.status;
  if (input.trackingNumber !== undefined) payload.tracking_number = input.trackingNumber;
  if (input.carrier !== undefined) payload.carrier = input.carrier;

  const { error } = await db.from("orders").update(payload).eq("id", id);
  if (error) throw new Error(error.message);

  if (input.status === "cancelled" && existing.status !== "cancelled" && existing.items) {
    await Promise.all(
      existing.items
        .filter((item) => item.product_id)
        .map((item) => restockProduct(item.product_id!, item.quantity))
    );
  }

  return getOrderById(id);
}

// Admin-only: includes cost_price for per-order profit display. Never pass
// the result of this into a "use client" component prop.
export interface OrderItemWithCost extends OrderItem {
  cost_price: number | null;
}

export async function getOrderItemsWithCost(orderId: string): Promise<OrderItemWithCost[]> {
  const { data, error } = await db
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);
  if (error) throw new Error(error.message);
  return (data as OrderItemWithCost[]) ?? [];
}

export async function updatePaymentStatus(
  id: string,
  paymentStatus: Order["payment_status"]
): Promise<void> {
  const { error } = await db
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
