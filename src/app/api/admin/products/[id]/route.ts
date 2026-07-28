import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { updateProduct, deleteProduct } from "@/lib/db/products";

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
      { error: parsed.error.issues[0]?.message ?? "Invalid product data" },
      { status: 400 }
    );
  }
  const product = await updateProduct(id, parsed.data as never);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
