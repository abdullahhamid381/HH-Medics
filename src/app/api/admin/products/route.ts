import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { createProduct } from "@/lib/db/products";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  short_description: z.string().optional(),
  category_id: z.string().optional(),
  brand: z.string().optional(),
  type: z.string(),
  price: z.number().positive(),
  compare_at_price: z.number().nullable().optional(),
  cost_price: z.number().nullable().optional(),
  stock: z.number().int().min(0),
  sku: z.string().optional(),
  unit: z.string().optional(),
  image: z.string().optional(),
  requires_prescription: z.boolean().optional(),
  featured: z.boolean().optional(),
  status: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid product data" },
      { status: 400 }
    );
  }
  const input = parsed.data;
  const product = createProduct({
    ...input,
    type: input.type as never,
    slug: `${slugify(input.name)}-${Date.now().toString(36).slice(-4)}`,
  });

  return NextResponse.json({ product });
}
