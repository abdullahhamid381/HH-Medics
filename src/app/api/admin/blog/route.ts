import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { createPost, getPostBySlug } from "@/lib/db/blog";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  excerpt: z.string().nullable().optional(),
  content: z.string().optional(),
  cover_image: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid post data" },
      { status: 400 }
    );
  }
  const input = parsed.data;
  let slug = slugify(input.slug || input.title);
  if (await getPostBySlug(slug)) {
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }
  const post = await createPost({ ...input, slug });
  return NextResponse.json({ post });
}
