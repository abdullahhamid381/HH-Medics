import { db, genId } from "./index";

export async function subscribeToNewsletter(email: string): Promise<{ alreadySubscribed: boolean }> {
  const { data: existing, error: findError } = await db
    .from("newsletter_subscribers")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (findError) throw new Error(findError.message);
  if (existing) return { alreadySubscribed: true };

  const { error } = await db.from("newsletter_subscribers").insert({
    id: genId("sub"),
    email: email.toLowerCase(),
  });
  if (error) throw new Error(error.message);
  return { alreadySubscribed: false };
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  created_at: string;
}

export async function countSubscribers(): Promise<number> {
  const { count, error } = await db
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}
