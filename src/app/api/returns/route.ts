import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getOrderById } from "@/lib/db/orders";
import { createReturn } from "@/lib/db/returns";

const schema = z.object({
  orderId: z.string(),
  orderItemId: z.string(),
  reason: z.string().min(3),
  comment: z.string().optional(),
  quantity: z.number().int().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }
  const input = parsed.data;

  const order = await getOrderById(input.orderId);
  if (!order || order.user_id !== session.user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "delivered") {
    return NextResponse.json(
      { error: "Returns can only be requested for delivered orders" },
      { status: 400 }
    );
  }
  const item = order.items?.find((i) => i.id === input.orderItemId);
  if (!item) {
    return NextResponse.json({ error: "Order item not found" }, { status: 404 });
  }

  const returnRequest = await createReturn({
    orderId: order.id,
    orderItemId: item.id,
    userId: session.user.id,
    reason: input.reason,
    comment: input.comment,
    quantity: Math.min(input.quantity, item.quantity),
    refundAmount: item.price * Math.min(input.quantity, item.quantity),
  });

  return NextResponse.json({ returnRequest });
}
