import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { updateFaq, deleteFaq } from "@/lib/db/faqs";

const schema = z.object({
  question: z.string().min(3).optional(),
  answer: z.string().min(3).optional(),
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
      { error: parsed.error.issues[0]?.message ?? "Invalid FAQ data" },
      { status: 400 }
    );
  }
  const faq = await updateFaq(id, parsed.data);
  if (!faq) return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
  return NextResponse.json({ faq });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  await deleteFaq(id);
  return NextResponse.json({ ok: true });
}
