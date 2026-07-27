import "./schema";
import { db, genId } from "./index";
import type { User, Address } from "@/types";

export function getUserByEmail(email: string): User | undefined {
  return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as
    | User
    | undefined;
}

export function getUserById(id: string): User | undefined {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as
    | User
    | undefined;
}

export function createUser(input: {
  name: string;
  email: string;
  password_hash?: string | null;
  image?: string | null;
  provider?: string;
  role?: "customer" | "admin";
}): User {
  const id = genId("user");
  db.prepare(
    `INSERT INTO users (id, name, email, password_hash, image, provider, role)
     VALUES (?,?,?,?,?,?,?)`
  ).run(
    id,
    input.name,
    input.email,
    input.password_hash ?? null,
    input.image ?? null,
    input.provider ?? "credentials",
    input.role ?? "customer"
  );
  return getUserById(id)!;
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

export function listCustomers(limit = 50, offset = 0, q?: string): CustomerRow[] {
  const where = ["u.role = 'customer'"];
  const params: (string | number)[] = [];
  if (q) {
    where.push(`(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`);
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  return db
    .prepare(
      `SELECT u.*,
        (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) as orders_count,
        (SELECT COALESCE(SUM(total),0) FROM orders o WHERE o.user_id = u.id AND o.status != 'cancelled') as total_spent,
        (SELECT MAX(created_at) FROM orders o WHERE o.user_id = u.id) as last_order_at
       FROM users u WHERE ${where.join(" AND ")}
       ORDER BY u.created_at DESC LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset) as unknown as CustomerRow[];
}

export function countCustomers(q?: string): number {
  const where = ["role = 'customer'"];
  const params: string[] = [];
  if (q) {
    where.push(`(name LIKE ? OR email LIKE ? OR phone LIKE ?)`);
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  return (
    db
      .prepare(`SELECT COUNT(*) as c FROM users WHERE ${where.join(" AND ")}`)
      .get(...params) as { c: number }
  ).c;
}

export interface CustomerDetail {
  user: User;
  addresses: Address[];
  ordersCount: number;
  totalSpent: number;
  avgOrderValue: number;
  lastOrderAt: string | null;
}

export function getCustomerDetail(id: string): CustomerDetail | undefined {
  const user = getUserById(id);
  if (!user) return undefined;
  const stats = db
    .prepare(
      `SELECT COUNT(*) as orders_count,
              COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END),0) as total_spent,
              MAX(created_at) as last_order_at
       FROM orders WHERE user_id = ?`
    )
    .get(id) as { orders_count: number; total_spent: number; last_order_at: string | null };

  return {
    user,
    addresses: listAddresses(id),
    ordersCount: stats.orders_count,
    totalSpent: stats.total_spent,
    avgOrderValue: stats.orders_count ? stats.total_spent / stats.orders_count : 0,
    lastOrderAt: stats.last_order_at,
  };
}

export function listAddresses(userId: string): Address[] {
  return db
    .prepare(
      `SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`
    )
    .all(userId) as unknown as Address[];
}

export function createAddress(input: Omit<Address, "id">): Address {
  const id = genId("addr");
  if (input.is_default) {
    db.prepare(`UPDATE addresses SET is_default = 0 WHERE user_id = ?`).run(
      input.user_id
    );
  }
  db.prepare(
    `INSERT INTO addresses (id, user_id, full_name, phone, line1, city, state, postal_code, is_default)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    input.user_id,
    input.full_name,
    input.phone,
    input.line1,
    input.city,
    input.state,
    input.postal_code,
    input.is_default ? 1 : 0
  );
  return db.prepare(`SELECT * FROM addresses WHERE id = ?`).get(id) as Address;
}
