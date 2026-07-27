import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createOrder } from "@/lib/db/orders";
import { getProductById } from "@/lib/db/products";
import { getCouponByCode } from "@/lib/db/coupons";
import { emitOrderEvent } from "@/lib/events";

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["cod", "card"]),
  fullName: z.string().min(2),
  phone: z.string().min(7),
  addressLine1: z.string().min(4),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Please sign in to check out" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid checkout data" },
      { status: 400 }
    );
  }
  const input = parsed.data;

  const lines = [];
  let subtotal = 0;
  for (const item of input.items) {
    const product = getProductById(item.productId);
    if (!product) {
      return NextResponse.json(
        { error: `A product in your cart is no longer available` },
        { status: 400 }
      );
    }
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Only ${product.stock} left of "${product.name}"` },
        { status: 400 }
      );
    }
    subtotal += product.price * item.quantity;
    lines.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      compareAtPrice: product.compare_at_price,
      quantity: item.quantity,
      stock: product.stock,
      requiresPrescription: product.requires_prescription,
      costPrice: product.cost_price,
    });
  }

  let discount = 0;
  if (input.couponCode) {
    const coupon = getCouponByCode(input.couponCode);
    if (coupon) {
      discount = Math.round((subtotal * coupon.discount_percent) / 100);
    }
  }

  const shippingFee = subtotal - discount > 3000 ? 0 : 200;
  const total = subtotal - discount + shippingFee;

  const order = createOrder({
    userId: session.user.id,
    items: lines,
    subtotal,
    discount,
    shippingFee,
    total,
    couponCode: input.couponCode,
    paymentMethod: input.paymentMethod,
    fullName: input.fullName,
    phone: input.phone,
    addressLine1: input.addressLine1,
    city: input.city,
    state: input.state,
    postalCode: input.postalCode,
    notes: input.notes,
  });

  emitOrderEvent({
    type: "order:created",
    id: order.id,
    orderNumber: order.order_number,
    userId: order.user_id,
    customerName: order.full_name,
    total: order.total,
    status: order.status,
    createdAt: order.created_at,
  });

  return NextResponse.json({ order });
}
