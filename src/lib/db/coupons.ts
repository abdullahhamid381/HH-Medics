import "./schema";
import { db } from "./index";

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  active: number;
  expires_at: string | null;
}

export function getCouponByCode(code: string): Coupon | undefined {
  return db
    .prepare(`SELECT * FROM coupons WHERE code = ? AND active = 1`)
    .get(code.toUpperCase()) as Coupon | undefined;
}
