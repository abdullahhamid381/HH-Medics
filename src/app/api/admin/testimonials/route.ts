import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { createTestimonial } from "@/lib/db/testimonials";

const schema = z.object({
  author_name: z.string().min(2),
  author_detail: z.string().nullable().optional(),
  quote: z.string().min(3),
  rating: z.number().int().min(1).max(5).optional(),
  sort_order: z.number().int().optional(),
  active: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid testimonial data" },
      { status: 400 }
    );
  }
  const testimonial = await createTestimonial(parsed.data);
  return NextResponse.json({ testimonial });
}
