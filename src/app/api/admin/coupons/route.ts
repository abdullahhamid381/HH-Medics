import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { createCoupon } from "@/lib/db/coupons";

const schema = z.object({
  code: z.string().min(2),
  discount_percent: z.number().min(1).max(100),
  active: z.number().optional(),
  expires_at: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid coupon data" },
      { status: 400 }
    );
  }
  const coupon = await createCoupon(parsed.data);
  return NextResponse.json({ coupon });
}
