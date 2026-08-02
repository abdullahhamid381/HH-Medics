import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { createFaq } from "@/lib/db/faqs";

const schema = z.object({
  question: z.string().min(3),
  answer: z.string().min(3),
  sort_order: z.number().int().optional(),
  active: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid FAQ data" },
      { status: 400 }
    );
  }
  const faq = await createFaq(parsed.data);
  return NextResponse.json({ faq });
}
