import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { updateCmsPage, deleteCmsPage, getCmsPageBySlug } from "@/lib/db/cms";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(2).optional(),
  slug: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
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
      { error: parsed.error.issues[0]?.message ?? "Invalid page data" },
      { status: 400 }
    );
  }
  const input = parsed.data;
  let slug: string | undefined;
  if (input.slug) {
    slug = slugify(input.slug);
    const existing = await getCmsPageBySlug(slug);
    if (existing && existing.id !== id) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }
  const page = await updateCmsPage(id, { ...input, ...(slug ? { slug } : {}) });
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  return NextResponse.json({ page });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  await deleteCmsPage(id);
  return NextResponse.json({ ok: true });
}
