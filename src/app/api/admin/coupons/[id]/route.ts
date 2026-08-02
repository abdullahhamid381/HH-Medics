import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { updateCoupon, deleteCoupon } from "@/lib/db/coupons";

const schema = z.object({
  code: z.string().min(2).optional(),
  discount_percent: z.number().min(1).max(100).optional(),
  active: z.number().optional(),
  expires_at: z.string().nullable().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid coupon data" },
      { status: 400 }
    );
  }
  const coupon = await updateCoupon(id, parsed.data);
  if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  return NextResponse.json({ coupon });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  await deleteCoupon(id);
  return NextResponse.json({ ok: true });
}
