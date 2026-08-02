import nodemailer from "nodemailer";

declare global {
  var __medistoreMailer__: nodemailer.Transporter | undefined;
}

function getTransporter(): nodemailer.Transporter {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error(
      "Missing GMAIL_USER or GMAIL_APP_PASSWORD. Set them in .env (see AGENTS.md)."
    );
  }
  if (!globalThis.__medistoreMailer__) {
    globalThis.__medistoreMailer__ = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return globalThis.__medistoreMailer__;
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `HH Medics <${process.env.GMAIL_USER}>`,
    to,
    subject: "Verify your HH Medics account",
    text: `Your HH Medics verification code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Your HH Medics verification code is:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${otp}</p>
        <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}
