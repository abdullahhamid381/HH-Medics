import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserByEmail, setUserOtp } from "@/lib/db/users";
import { generateOtp, hashOtp, otpExpiryIso } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const user = await getUserByEmail(parsed.data.email.toLowerCase());
    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }
    if (user.email_verified) {
      return NextResponse.json({ verified: true });
    }

    const otp = generateOtp();
    await setUserOtp(user.id, await hashOtp(otp), otpExpiryIso());
    await sendOtpEmail(user.email, otp);

    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
