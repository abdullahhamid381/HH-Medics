import { db, genId } from "./index";
import type { CmsPage } from "@/types";

export async function getPublishedPageBySlug(slug: string): Promise<CmsPage | undefined> {
  const { data, error } = await db
    .from("cms_pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as CmsPage) ?? undefined;
}

export async function listPublishedPages(): Promise<CmsPage[]> {
  const { data, error } = await db
    .from("cms_pages")
    .select("*")
    .eq("status", "published")
    .order("title", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as CmsPage[]) ?? [];
}

export async function listCmsPages(): Promise<CmsPage[]> {
  const { data, error } = await db
    .from("cms_pages")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as CmsPage[]) ?? [];
}

export async function getCmsPageById(id: string): Promise<CmsPage | undefined> {
  const { data, error } = await db.from("cms_pages").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as CmsPage) ?? undefined;
}

export async function getCmsPageBySlug(slug: string): Promise<CmsPage | undefined> {
  const { data, error } = await db.from("cms_pages").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as CmsPage) ?? undefined;
}

export interface CmsPageInput {
  slug: string;
  title: string;
  content?: string;
  status?: "draft" | "published";
}

export async function createCmsPage(input: CmsPageInput): Promise<CmsPage> {
  const id = genId("page");
  const now = new Date().toISOString();
  const { error } = await db.from("cms_pages").insert({
    id,
    slug: input.slug,
    title: input.title,
    content: input.content ?? "",
    status: input.status ?? "draft",
    created_at: now,
    updated_at: now,
  });
  if (error) throw new Error(error.message);
  return (await getCmsPageById(id))!;
}

export async function updateCmsPage(
  id: string,
  input: Partial<CmsPageInput>
): Promise<CmsPage | undefined> {
  const { data, error } = await db
    .from("cms_pages")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as CmsPage) ?? undefined;
}

export async function deleteCmsPage(id: string): Promise<void> {
  const { error } = await db.from("cms_pages").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
