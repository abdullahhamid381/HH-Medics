import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { updateTestimonial, deleteTestimonial } from "@/lib/db/testimonials";

const schema = z.object({
  author_name: z.string().min(2).optional(),
  author_detail: z.string().nullable().optional(),
  quote: z.string().min(3).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  sort_order: z.number().int().optional(),
  active: z.number().optional(),
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
      { error: parsed.error.issues[0]?.message ?? "Invalid testimonial data" },
      { status: 400 }
    );
  }
  const testimonial = await updateTestimonial(id, parsed.data);
  if (!testimonial) return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
  return NextResponse.json({ testimonial });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  await deleteTestimonial(id);
  return NextResponse.json({ ok: true });
}
