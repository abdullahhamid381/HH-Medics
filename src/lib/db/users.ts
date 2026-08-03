import { db, genId, unwrap } from "./index";
import type { User, Address } from "@/types";

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as User) ?? undefined;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const { data, error } = await db.from("users").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as User) ?? undefined;
}

export async function createUser(input: {
  name: string;
  email: string;
  password_hash?: string | null;
  image?: string | null;
  provider?: string;
  role?: "customer" | "admin";
  email_verified?: boolean;
}): Promise<User> {
  const id = genId("user");
  const { error } = await db.from("users").insert({
    id,
    name: input.name,
    email: input.email,
    password_hash: input.password_hash ?? null,
    image: input.image ?? null,
    provider: input.provider ?? "credentials",
    role: input.role ?? "customer",
    email_verified: input.email_verified ? 1 : 0,
  });
  if (error) throw new Error(error.message);
  return (await getUserById(id))!;
}

export async function setUserOtp(
  userId: string,
  otpHash: string,
  expiresAt: string
): Promise<void> {
  const { error } = await db
    .from("users")
    .update({ otp_code_hash: otpHash, otp_expires_at: expiresAt })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function markEmailVerified(userId: string): Promise<void> {
  const { error } = await db
    .from("users")
    .update({ email_verified: 1, otp_code_hash: null, otp_expires_at: null })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
  const { error } = await db
    .from("users")
    .update({ password_hash: passwordHash, otp_code_hash: null, otp_expires_at: null })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  orders_count: number;
  total_spent: number;
  last_order_at: string | null;
}

export async function listCustomers(
  limit = 50,
  offset = 0,
  q?: string
): Promise<CustomerRow[]> {
  const result = await db.rpc("list_customers", {
    search: q ?? null,
    lim: limit,
    off: offset,
  });
  return unwrap<CustomerRow[]>(result);
}

export async function countCustomers(q?: string): Promise<number> {
  const result = await db.rpc("count_customers", { search: q ?? null });
  return unwrap<number>(result);
}

export interface CustomerDetail {
  user: User;
  addresses: Address[];
  ordersCount: number;
  totalSpent: number;
  avgOrderValue: number;
  lastOrderAt: string | null;
}

export async function getCustomerDetail(id: string): Promise<CustomerDetail | undefined> {
  const user = await getUserById(id);
  if (!user) return undefined;

  const statsResult = await db.rpc("customer_order_stats", { uid: id });
  const rows = unwrap<
    { orders_count: number; total_spent: number; last_order_at: string | null }[]
  >(statsResult);
  const stats = rows[0] ?? { orders_count: 0, total_spent: 0, last_order_at: null };

  return {
    user,
    addresses: await listAddresses(id),
    ordersCount: stats.orders_count,
    totalSpent: stats.total_spent,
    avgOrderValue: stats.orders_count ? stats.total_spent / stats.orders_count : 0,
    lastOrderAt: stats.last_order_at,
  };
}

export async function listAddresses(userId: string): Promise<Address[]> {
  const { data, error } = await db
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Address[]) ?? [];
}

export async function createAddress(input: Omit<Address, "id">): Promise<Address> {
  const id = genId("addr");
  if (input.is_default) {
    const { error: resetError } = await db
      .from("addresses")
      .update({ is_default: 0 })
      .eq("user_id", input.user_id);
    if (resetError) throw new Error(resetError.message);
  }
  const { error } = await db.from("addresses").insert({
    id,
    user_id: input.user_id,
    full_name: input.full_name,
    phone: input.phone,
    line1: input.line1,
    city: input.city,
    state: input.state,
    postal_code: input.postal_code,
    is_default: input.is_default ? 1 : 0,
  });
  if (error) throw new Error(error.message);
  const { data, error: fetchError } = await db
    .from("addresses")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError) throw new Error(fetchError.message);
  return data as Address;
}
