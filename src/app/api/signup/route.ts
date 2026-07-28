import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getUserByEmail, createUser, setUserOtp } from "@/lib/db/users";
import { generateOtp, hashOtp, otpExpiryIso } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await getUserByEmail(normalizedEmail);
    if (existing && existing.email_verified) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Unverified accounts from an abandoned signup are allowed to retry —
    // just resend a fresh code instead of dead-ending the user.
    const user =
      existing ??
      (await createUser({
        name,
        email: normalizedEmail,
        password_hash: await bcrypt.hash(password, 10),
        provider: "credentials",
        role: "customer",
        email_verified: false,
      }));

    const otp = generateOtp();
    await setUserOtp(user.id, await hashOtp(otp), otpExpiryIso());
    await sendOtpEmail(user.email, otp);

    return NextResponse.json({
      requiresVerification: true,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
