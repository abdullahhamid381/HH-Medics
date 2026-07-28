import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { updateOrderFulfillment } from "@/lib/db/orders";
import { emitOrderEvent } from "@/lib/events";

const schema = z
  .object({
    status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
    tracking_number: z.string().max(100).nullable().optional(),
    carrier: z.string().max(100).nullable().optional(),
  })
  .refine(
    (v) => v.status !== undefined || v.tracking_number !== undefined || v.carrier !== undefined,
    { message: "Nothing to update" }
  );

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid update" },
      { status: 400 }
    );
  }

  const order = await updateOrderFulfillment(id, {
    status: parsed.data.status,
    trackingNumber: parsed.data.tracking_number,
    carrier: parsed.data.carrier,
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  emitOrderEvent({
    type: "order:updated",
    id: order.id,
    orderNumber: order.order_number,
    userId: order.user_id,
    status: order.status,
    trackingNumber: order.tracking_number,
    carrier: order.carrier,
    updatedAt: order.updated_at,
  });

  return NextResponse.json({ order });
}
