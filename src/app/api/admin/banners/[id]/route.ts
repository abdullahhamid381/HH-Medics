import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { updateBanner, deleteBanner } from "@/lib/db/banners";

const schema = z.object({
  title: z.string().min(2).optional(),
  subtitle: z.string().nullable().optional(),
  image: z.string().min(1).optional(),
  link_href: z.string().nullable().optional(),
  cta_label: z.string().nullable().optional(),
  sort_order: z.number().int().optional(),
  active: z.number().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid banner data" },
      { status: 400 }
    );
  }
  const banner = await updateBanner(id, parsed.data);
  if (!banner) return NextResponse.json({ error: "Banner not found" }, { status: 404 });
  return NextResponse.json({ banner });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  await deleteBanner(id);
  return NextResponse.json({ ok: true });
}
