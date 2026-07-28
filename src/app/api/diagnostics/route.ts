import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    nodeVersion: process.version,
    env: {
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_API_KEY: !!process.env.SUPABASE_API_KEY,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    },
  });
}
