import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { updatePost, deletePost, getPostBySlug } from "@/lib/db/blog";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(2).optional(),
  slug: z.string().optional(),
  excerpt: z.string().nullable().optional(),
  content: z.string().optional(),
  cover_image: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
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
      { error: parsed.error.issues[0]?.message ?? "Invalid post data" },
      { status: 400 }
    );
  }
  const input = parsed.data;
  let slug: string | undefined;
  if (input.slug) {
    slug = slugify(input.slug);
    const existing = await getPostBySlug(slug);
    if (existing && existing.id !== id) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }
  const post = await updatePost(id, { ...input, ...(slug ? { slug } : {}) });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  await deletePost(id);
  return NextResponse.json({ ok: true });
}
