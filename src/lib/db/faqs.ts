import { db, genId } from "./index";
import type { Faq } from "@/types";

export async function listActiveFaqs(): Promise<Faq[]> {
  const { data, error } = await db
    .from("faqs")
    .select("*")
    .eq("active", 1)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Faq[]) ?? [];
}

export async function listAllFaqs(): Promise<Faq[]> {
  const { data, error } = await db
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Faq[]) ?? [];
}

export interface FaqInput {
  question: string;
  answer: string;
  sort_order?: number;
  active?: number;
}

export async function createFaq(input: FaqInput): Promise<Faq> {
  const id = genId("faq");
  const { error } = await db.from("faqs").insert({
    id,
    question: input.question,
    answer: input.answer,
    sort_order: input.sort_order ?? 0,
    active: input.active ?? 1,
  });
  if (error) throw new Error(error.message);
  const { data } = await db.from("faqs").select("*").eq("id", id).maybeSingle();
  return data as Faq;
}

export async function updateFaq(id: string, input: Partial<FaqInput>): Promise<Faq | undefined> {
  const { data, error } = await db
    .from("faqs")
    .update(input)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Faq) ?? undefined;
}

export async function deleteFaq(id: string): Promise<void> {
  const { error } = await db.from("faqs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
