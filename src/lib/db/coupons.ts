import { db, genId } from "./index";

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

export async function listCoupons(): Promise<Coupon[]> {
  const { data, error } = await db
    .from("coupons")
    .select("*")
    .order("code", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Coupon[]) ?? [];
}

export interface CouponInput {
  code: string;
  discount_percent: number;
  active?: number;
  expires_at?: string | null;
}

export async function createCoupon(input: CouponInput): Promise<Coupon> {
  const id = genId("cpn");
  const { error } = await db.from("coupons").insert({
    id,
    code: input.code.toUpperCase(),
    discount_percent: input.discount_percent,
    active: input.active ?? 1,
    expires_at: input.expires_at ?? null,
  });
  if (error) throw new Error(error.message);
  const { data } = await db.from("coupons").select("*").eq("id", id).maybeSingle();
  return data as Coupon;
}

export async function updateCoupon(
  id: string,
  input: Partial<CouponInput>
): Promise<Coupon | undefined> {
  const payload: Record<string, unknown> = { ...input };
  if (input.code) payload.code = input.code.toUpperCase();
  const { data, error } = await db
    .from("coupons")
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Coupon) ?? undefined;
}

export async function deleteCoupon(id: string): Promise<void> {
  const { error } = await db.from("coupons").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
