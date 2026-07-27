import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import {
  updateCategory,
  deleteCategory,
  countProductsInCategory,
  getCategoryBySlug,
} from "@/lib/db/products";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
  sort_order: z.number().int().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid category data" },
      { status: 400 }
    );
  }
  const input = parsed.data;
  let slug: string | undefined;
  if (input.name) {
    slug = slugify(input.name);
    const existing = getCategoryBySlug(slug);
    if (existing && existing.id !== id) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }
  }
  const category = updateCategory(id, { ...input, ...(slug ? { slug } : {}) });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  return NextResponse.json({ category });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const productCount = countProductsInCategory(id);
  if (productCount > 0) {
    return NextResponse.json(
      {
        error: `Move or delete the ${productCount} product(s) in this category first.`,
      },
      { status: 400 }
    );
  }
  deleteCategory(id);
  return NextResponse.json({ ok: true });
}
