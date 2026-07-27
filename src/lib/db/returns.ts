import "./schema";
import { db, genId } from "./index";
import type { ReturnRequest, ReturnStatus } from "@/types";
import { restockProduct } from "./products";
import { updatePaymentStatus, getOrderById } from "./orders";

function nextReturnNumber(): string {
  const count = (
    db.prepare(`SELECT COUNT(*) as c FROM returns`).get() as { c: number }
  ).c;
  return `RT-${String(5000 + count + 1)}`;
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

export function createReturn(input: CreateReturnInput): ReturnRequest {
  const id = genId("ret");
  db.prepare(
    `INSERT INTO returns (id, return_number, order_id, order_item_id, user_id, reason, comment, quantity, status, refund_amount)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    nextReturnNumber(),
    input.orderId,
    input.orderItemId,
    input.userId,
    input.reason,
    input.comment ?? null,
    input.quantity,
    "requested",
    input.refundAmount
  );
  return getReturnById(id)!;
}

const BASE_SELECT = `
  SELECT r.*, o.order_number as order_number, oi.name as item_name, oi.image as item_image, oi.product_id as item_product_id,
         u.name as customer_name
  FROM returns r
  JOIN orders o ON o.id = r.order_id
  JOIN order_items oi ON oi.id = r.order_item_id
  JOIN users u ON u.id = r.user_id
`;

export function getReturnById(id: string): ReturnRequest | undefined {
  return db.prepare(`${BASE_SELECT} WHERE r.id = ?`).get(id) as
    | ReturnRequest
    | undefined;
}

export function listReturnsForUser(userId: string): ReturnRequest[] {
  return db
    .prepare(`${BASE_SELECT} WHERE r.user_id = ? ORDER BY r.created_at DESC`)
    .all(userId) as unknown as ReturnRequest[];
}

export function listReturns(
  status?: ReturnStatus | "all",
  limit = 50,
  offset = 0
): { items: ReturnRequest[]; total: number } {
  const where = status && status !== "all" ? `WHERE r.status = ?` : "";
  const params = status && status !== "all" ? [status] : [];
  const total = (
    db
      .prepare(`SELECT COUNT(*) as c FROM returns r ${where}`)
      .get(...params) as { c: number }
  ).c;
  const items = db
    .prepare(
      `${BASE_SELECT} ${where} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset) as unknown as ReturnRequest[];
  return { items, total };
}

export function updateReturnStatus(
  id: string,
  status: ReturnStatus,
  adminNote?: string
): ReturnRequest | undefined {
  const existing = getReturnById(id);
  if (!existing) return undefined;

  db.prepare(
    `UPDATE returns SET status = ?, admin_note = ?, resolved_at = datetime('now') WHERE id = ?`
  ).run(status, adminNote ?? existing.admin_note, id);

  if (status === "approved" || status === "refunded") {
    const productId = (existing as unknown as { item_product_id?: string })
      .item_product_id;
    if (status === "refunded") {
      if (productId) restockProduct(productId, existing.quantity);
      const order = getOrderById(existing.order_id);
      if (order) {
        const fullyRefunded = existing.refund_amount >= order.total;
        updatePaymentStatus(
          order.id,
          fullyRefunded ? "refunded" : "partial_refund"
        );
      }
    }
  }

  return getReturnById(id);
}
