import { db, genId } from "./index";
import type { Banner } from "@/types";

export async function listActiveBanners(): Promise<Banner[]> {
  const nowIso = new Date().toISOString();
  const { data, error } = await db
    .from("banners")
    .select("*")
    .eq("active", 1)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data as Banner[]) ?? []).filter((b) => {
    if (b.starts_at && b.starts_at > nowIso) return false;
    if (b.ends_at && b.ends_at < nowIso) return false;
    return true;
  });
}

export async function listAllBanners(): Promise<Banner[]> {
  const { data, error } = await db
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Banner[]) ?? [];
}

export interface BannerInput {
  title: string;
  subtitle?: string | null;
  image: string;
  link_href?: string | null;
  cta_label?: string | null;
  sort_order?: number;
  active?: number;
  starts_at?: string | null;
  ends_at?: string | null;
}

export async function createBanner(input: BannerInput): Promise<Banner> {
  const id = genId("ban");
  const { error } = await db.from("banners").insert({
    id,
    title: input.title,
    subtitle: input.subtitle ?? null,
    image: input.image,
    link_href: input.link_href ?? null,
    cta_label: input.cta_label ?? null,
    sort_order: input.sort_order ?? 0,
    active: input.active ?? 1,
    starts_at: input.starts_at ?? null,
    ends_at: input.ends_at ?? null,
  });
  if (error) throw new Error(error.message);
  const { data } = await db.from("banners").select("*").eq("id", id).maybeSingle();
  return data as Banner;
}

export async function updateBanner(
  id: string,
  input: Partial<BannerInput>
): Promise<Banner | undefined> {
  const { data, error } = await db
    .from("banners")
    .update(input)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Banner) ?? undefined;
}

export async function deleteBanner(id: string): Promise<void> {
  const { error } = await db.from("banners").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
