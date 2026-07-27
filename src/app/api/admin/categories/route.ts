import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { createCategory, getCategoryBySlug } from "@/lib/db/products";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
  sort_order: z.number().int().optional(),
});

export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid category data" },
      { status: 400 }
    );
  }
  const input = parsed.data;
  let slug = slugify(input.name);
  if (getCategoryBySlug(slug)) {
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }
  const category = createCategory({ ...input, slug });
  return NextResponse.json({ category });
}
