import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getUserByEmail, updatePasswordHash } from "@/lib/db/users";
import { verifyOtpMatch } from "@/lib/otp";

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
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
    const { email, otp, password } = parsed.data;
    const user = await getUserByEmail(email.toLowerCase());
    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const matches = await verifyOtpMatch(otp, user.otp_code_hash, user.otp_expires_at);
    if (!matches) {
      return NextResponse.json(
        { error: "That code is incorrect or has expired." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await updatePasswordHash(user.id, passwordHash);

    return NextResponse.json({ reset: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
