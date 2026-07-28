import { db, genId } from "./index";
import type { ReturnRequest, ReturnStatus } from "@/types";
import { restockProduct } from "./products";
import { updatePaymentStatus, getOrderById } from "./orders";

async function nextReturnNumber(): Promise<string> {
  const { count, error } = await db
    .from("returns")
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return `RT-${String(5000 + (count ?? 0) + 1)}`;
}

export interface CreateReturnInput {
  orderId: string;
  orderItemId: string;
  userId: string;
  reason: string;
  comment?: string;
  quantity: number;
  refundAmount: number;
}

export async function createReturn(input: CreateReturnInput): Promise<ReturnRequest> {
  const id = genId("ret");
  const { error } = await db.from("returns").insert({
    id,
    return_number: await nextReturnNumber(),
    order_id: input.orderId,
    order_item_id: input.orderItemId,
    user_id: input.userId,
    reason: input.reason,
    comment: input.comment ?? null,
    quantity: input.quantity,
    status: "requested",
    refund_amount: input.refundAmount,
  });
  if (error) throw new Error(error.message);
  return (await getReturnById(id))!;
}

const SELECT = "*, order:orders(order_number), item:order_items(name, image, product_id), customer:users(name)";

interface ReturnRow extends ReturnRequest {
  order: { order_number: string } | null;
  item: { name: string; image: string | null; product_id: string | null } | null;
  customer: { name: string } | null;
}

function flattenReturn(row: ReturnRow): ReturnRequest & { item_product_id?: string } {
  const { order, item, customer, ...rest } = row;
  return {
    ...rest,
    order_number: order?.order_number,
    item_name: item?.name,
    item_image: item?.image ?? undefined,
    item_product_id: item?.product_id ?? undefined,
    customer_name: customer?.name,
  };
}

export async function getReturnById(id: string): Promise<ReturnRequest | undefined> {
  const { data, error } = await db.from("returns").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? flattenReturn(data as unknown as ReturnRow) : undefined;
}

export async function listReturnsForUser(userId: string): Promise<ReturnRequest[]> {
  const { data, error } = await db
    .from("returns")
    .select(SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data as unknown as ReturnRow[]) ?? []).map(flattenReturn);
}

export async function listReturns(
  status?: ReturnStatus | "all",
  limit = 50,
  offset = 0
): Promise<{ items: ReturnRequest[]; total: number }> {
  let query = db.from("returns").select(SELECT, { count: "exact" });
  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return {
    items: ((data as unknown as ReturnRow[]) ?? []).map(flattenReturn),
    total: count ?? 0,
  };
}

export async function updateReturnStatus(
  id: string,
  status: ReturnStatus,
  adminNote?: string
): Promise<ReturnRequest | undefined> {
  const existing = await getReturnById(id);
  if (!existing) return undefined;

  const { error } = await db
    .from("returns")
    .update({
      status,
      admin_note: adminNote ?? existing.admin_note,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  if (status === "refunded") {
    const productId = (existing as unknown as { item_product_id?: string }).item_product_id;
    if (productId) await restockProduct(productId, existing.quantity);
    const order = await getOrderById(existing.order_id);
    if (order) {
      const fullyRefunded = existing.refund_amount >= order.total;
      await updatePaymentStatus(order.id, fullyRefunded ? "refunded" : "partial_refund");
    }
  }

  return getReturnById(id);
}
