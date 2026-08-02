import { db, genId } from "./index";
import type { BlogPost } from "@/types";

export interface BlogFilters {
  limit?: number;
  offset?: number;
}

export async function listPublishedPosts(filters: BlogFilters = {}): Promise<{
  items: BlogPost[];
  total: number;
}> {
  const limit = filters.limit ?? 12;
  const offset = filters.offset ?? 0;
  const { data, error, count } = await db
    .from("blog_posts")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return { items: (data as BlogPost[]) ?? [], total: count ?? 0 };
}

export async function listAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as BlogPost[]) ?? [];
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as BlogPost) ?? undefined;
}

export async function getPostById(id: string): Promise<BlogPost | undefined> {
  const { data, error } = await db.from("blog_posts").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as BlogPost) ?? undefined;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const { data, error } = await db.from("blog_posts").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as BlogPost) ?? undefined;
}

export interface BlogPostInput {
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string;
  cover_image?: string | null;
  author?: string | null;
  status?: "draft" | "published";
  published_at?: string | null;
}

export async function createPost(input: BlogPostInput): Promise<BlogPost> {
  const id = genId("post");
  const now = new Date().toISOString();
  const publishing = input.status === "published";
  const { error } = await db.from("blog_posts").insert({
    id,
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt ?? null,
    content: input.content ?? "",
    cover_image: input.cover_image ?? null,
    author: input.author ?? null,
    status: input.status ?? "draft",
    published_at: input.published_at ?? (publishing ? now : null),
    created_at: now,
    updated_at: now,
  });
  if (error) throw new Error(error.message);
  return (await getPostById(id))!;
}

export async function updatePost(
  id: string,
  input: Partial<BlogPostInput>
): Promise<BlogPost | undefined> {
  const payload: Record<string, unknown> = { ...input, updated_at: new Date().toISOString() };
  if (input.status === "published") {
    const existing = await getPostById(id);
    if (existing && !existing.published_at) {
      payload.published_at = new Date().toISOString();
    }
  }
  const { data, error } = await db
    .from("blog_posts")
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as BlogPost) ?? undefined;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await db.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
