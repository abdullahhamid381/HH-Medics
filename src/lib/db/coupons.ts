import { db } from "./index";

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  active: number;
  expires_at: string | null;
}

export async function getCouponByCode(code: string): Promise<Coupon | undefined> {
  const { data, error } = await db
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("active", 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Coupon) ?? undefined;
}
