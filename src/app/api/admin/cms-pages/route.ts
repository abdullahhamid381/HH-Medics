import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { createCmsPage, getCmsPageBySlug } from "@/lib/db/cms";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid page data" },
      { status: 400 }
    );
  }
  const input = parsed.data;
  let slug = slugify(input.slug || input.title);
  if (await getCmsPageBySlug(slug)) {
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }
  const page = await createCmsPage({ ...input, slug });
  return NextResponse.json({ page });
}
