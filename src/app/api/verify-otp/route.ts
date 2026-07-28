import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserByEmail, markEmailVerified } from "@/lib/db/users";
import { verifyOtpMatch } from "@/lib/otp";

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { email, otp } = parsed.data;
    const user = await getUserByEmail(email.toLowerCase());
    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }
    if (user.email_verified) {
      return NextResponse.json({ verified: true });
    }

    const matches = await verifyOtpMatch(otp, user.otp_code_hash, user.otp_expires_at);
    if (!matches) {
      return NextResponse.json(
        { error: "That code is incorrect or has expired." },
        { status: 400 }
      );
    }

    await markEmailVerified(user.id);
    return NextResponse.json({ verified: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
