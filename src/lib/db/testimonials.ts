import { db, genId } from "./index";
import type { Testimonial } from "@/types";

export async function listActiveTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await db
    .from("testimonials")
    .select("*")
    .eq("active", 1)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Testimonial[]) ?? [];
}

export async function listAllTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await db
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Testimonial[]) ?? [];
}

export interface TestimonialInput {
  author_name: string;
  author_detail?: string | null;
  quote: string;
  rating?: number;
  sort_order?: number;
  active?: number;
}

export async function createTestimonial(input: TestimonialInput): Promise<Testimonial> {
  const id = genId("test");
  const { error } = await db.from("testimonials").insert({
    id,
    author_name: input.author_name,
    author_detail: input.author_detail ?? null,
    quote: input.quote,
    rating: input.rating ?? 5,
    sort_order: input.sort_order ?? 0,
    active: input.active ?? 1,
  });
  if (error) throw new Error(error.message);
  const { data } = await db.from("testimonials").select("*").eq("id", id).maybeSingle();
  return data as Testimonial;
}

export async function updateTestimonial(
  id: string,
  input: Partial<TestimonialInput>
): Promise<Testimonial | undefined> {
  const { data, error } = await db
    .from("testimonials")
    .update(input)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Testimonial) ?? undefined;
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await db.from("testimonials").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
