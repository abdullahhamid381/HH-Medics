import bcrypt from "bcryptjs";

const OTP_TTL_MS = 10 * 60 * 1000;

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export function otpExpiryIso(): string {
  return new Date(Date.now() + OTP_TTL_MS).toISOString();
}

export async function verifyOtpMatch(
  otp: string,
  hash: string | null,
  expiresAt: string | null
): Promise<boolean> {
  if (!hash || !expiresAt) return false;
  if (new Date(expiresAt).getTime() < Date.now()) return false;
  return bcrypt.compare(otp, hash);
}
