import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { createBanner } from "@/lib/db/banners";

const schema = z.object({
  title: z.string().min(2),
  subtitle: z.string().nullable().optional(),
  image: z.string().min(1),
  link_href: z.string().nullable().optional(),
  cta_label: z.string().nullable().optional(),
  sort_order: z.number().int().optional(),
  active: z.number().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid banner data" },
      { status: 400 }
    );
  }
  const banner = await createBanner(parsed.data);
  return NextResponse.json({ banner });
}
