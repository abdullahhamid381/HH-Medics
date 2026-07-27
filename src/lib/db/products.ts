import "./schema";
import { db, genId } from "./index";
import type { Product, Category, ProductType } from "@/types";

export function listCategories(): Category[] {
  return db
    .prepare(`SELECT * FROM categories ORDER BY sort_order ASC, name ASC`)
    .all() as unknown as Category[];
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return db.prepare(`SELECT * FROM categories WHERE slug = ?`).get(slug) as
    | Category
    | undefined;
}

export function getCategoryById(id: string): Category | undefined {
  return db.prepare(`SELECT * FROM categories WHERE id = ?`).get(id) as
    | Category
    | undefined;
}

export function listCategoriesWithCounts(): (Category & { product_count: number })[] {
  return db
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
       FROM categories c ORDER BY c.sort_order ASC, c.name ASC`
    )
    .all() as unknown as (Category & { product_count: number })[];
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  sort_order?: number;
}

export function createCategory(input: CategoryInput): Category {
  const id = genId("cat");
  db.prepare(
    `INSERT INTO categories (id, name, slug, description, icon, sort_order) VALUES (?,?,?,?,?,?)`
  ).run(
    id,
    input.name,
    input.slug,
    input.description ?? null,
    input.icon ?? null,
    input.sort_order ?? 0
  );
  return getCategoryById(id)!;
}

export function updateCategory(
  id: string,
  input: Partial<CategoryInput>
): Category | undefined {
  const existing = getCategoryById(id);
  if (!existing) return undefined;
  const merged = { ...existing, ...input };
  db.prepare(
    `UPDATE categories SET name=?, slug=?, description=?, icon=?, sort_order=? WHERE id=?`
  ).run(
    merged.name,
    merged.slug,
    merged.description,
    merged.icon,
    merged.sort_order,
    id
  );
  return getCategoryById(id);
}

export function countProductsInCategory(id: string): number {
  return (
    db
      .prepare(`SELECT COUNT(*) as c FROM products WHERE category_id = ?`)
      .get(id) as { c: number }
  ).c;
}

export function deleteCategory(id: string): void {
  db.prepare(`DELETE FROM categories WHERE id = ?`).run(id);
}

export interface ProductFilters {
  q?: string;
  category?: string;
  type?: ProductType | string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "rating" | "featured";
  featured?: boolean;
  status?: string;
  limit?: number;
  offset?: number;
}

const BASE_SELECT = `
  SELECT p.*, c.name as category_name, c.slug as category_slug
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;

export function listProducts(filters: ProductFilters = {}): {
  items: Product[];
  total: number;
} {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (filters.status && filters.status !== "all") {
    where.push(`p.status = ?`);
    params.push(filters.status);
  } else if (!filters.status) {
    where.push(`p.status = ?`);
    params.push("active");
  }

  if (filters.q) {
    where.push(`(p.name LIKE ? OR p.brand LIKE ? OR p.tags LIKE ?)`);
    const like = `%${filters.q}%`;
    params.push(like, like, like);
  }
  if (filters.category) {
    where.push(`c.slug = ?`);
    params.push(filters.category);
  }
  if (filters.type) {
    where.push(`p.type = ?`);
    params.push(filters.type);
  }
  if (filters.minPrice !== undefined) {
    where.push(`p.price >= ?`);
    params.push(filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    where.push(`p.price <= ?`);
    params.push(filters.maxPrice);
  }
  if (filters.featured) {
    where.push(`p.featured = 1`);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  let orderBy = "p.created_at DESC";
  switch (filters.sort) {
    case "price_asc":
      orderBy = "p.price ASC";
      break;
    case "price_desc":
      orderBy = "p.price DESC";
      break;
    case "rating":
      orderBy = "p.rating DESC";
      break;
    case "featured":
      orderBy = "p.featured DESC, p.created_at DESC";
      break;
  }

  const total = (
    db
      .prepare(
        `SELECT COUNT(*) as c FROM products p LEFT JOIN categories c ON c.id = p.category_id ${whereClause}`
      )
      .get(...params) as { c: number }
  ).c;

  const limit = filters.limit ?? 24;
  const offset = filters.offset ?? 0;

  const items = db
    .prepare(
      `${BASE_SELECT} ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset) as unknown as Product[];

  return { items, total };
}

export function getProductBySlug(slug: string): Product | undefined {
  return db.prepare(`${BASE_SELECT} WHERE p.slug = ?`).get(slug) as
    | Product
    | undefined;
}

export function getProductById(id: string): Product | undefined {
  return db.prepare(`${BASE_SELECT} WHERE p.id = ?`).get(id) as
    | Product
    | undefined;
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return db
    .prepare(
      `${BASE_SELECT} WHERE p.category_id = ? AND p.id != ? AND p.status = 'active' ORDER BY p.rating DESC LIMIT ?`
    )
    .all(product.category_id, product.id, limit) as unknown as Product[];
}

export interface ProductInput {
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  category_id?: string | null;
  brand?: string;
  type: ProductType;
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  stock: number;
  sku?: string;
  unit?: string;
  image?: string;
  images?: string[];
  requires_prescription?: boolean;
  featured?: boolean;
  status?: string;
  tags?: string[];
}

export function createProduct(input: ProductInput): Product {
  const id = genId("prod");
  db.prepare(
    `INSERT INTO products (
      id, name, slug, description, short_description, category_id, brand, type,
      price, compare_at_price, cost_price, stock, sku, unit, image, images,
      requires_prescription, featured, status, tags
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    input.name,
    input.slug,
    input.description ?? null,
    input.short_description ?? null,
    input.category_id ?? null,
    input.brand ?? null,
    input.type,
    input.price,
    input.compare_at_price ?? null,
    input.cost_price ?? null,
    input.stock,
    input.sku ?? null,
    input.unit ?? null,
    input.image ?? null,
    JSON.stringify(input.images ?? []),
    input.requires_prescription ? 1 : 0,
    input.featured ? 1 : 0,
    input.status ?? "active",
    JSON.stringify(input.tags ?? [])
  );
  return getProductById(id)!;
}

export function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Product | undefined {
  const existing = getProductById(id);
  if (!existing) return undefined;
  const merged = {
    ...existing,
    ...input,
    images: input.images ? JSON.stringify(input.images) : existing.images,
    tags: input.tags ? JSON.stringify(input.tags) : existing.tags,
    requires_prescription:
      input.requires_prescription !== undefined
        ? input.requires_prescription
          ? 1
          : 0
        : existing.requires_prescription,
    featured:
      input.featured !== undefined
        ? input.featured
          ? 1
          : 0
        : existing.featured,
  };
  db.prepare(
    `UPDATE products SET name=?, slug=?, description=?, short_description=?, category_id=?,
      brand=?, type=?, price=?, compare_at_price=?, cost_price=?, stock=?, sku=?, unit=?,
      image=?, images=?, requires_prescription=?, featured=?, status=?, tags=?, updated_at=datetime('now')
     WHERE id=?`
  ).run(
    merged.name,
    merged.slug,
    merged.description,
    merged.short_description,
    merged.category_id,
    merged.brand,
    merged.type,
    merged.price,
    merged.compare_at_price,
    merged.cost_price,
    merged.stock,
    merged.sku,
    merged.unit,
    merged.image,
    merged.images,
    merged.requires_prescription,
    merged.featured,
    merged.status,
    merged.tags,
    id
  );
  return getProductById(id);
}

export function deleteProduct(id: string): void {
  db.prepare(`DELETE FROM products WHERE id = ?`).run(id);
}

export function decrementStock(productId: string, qty: number): void {
  db.prepare(
    `UPDATE products SET stock = MAX(stock - ?, 0) WHERE id = ?`
  ).run(qty, productId);
}

export function restockProduct(productId: string, qty: number): void {
  db.prepare(`UPDATE products SET stock = stock + ? WHERE id = ?`).run(
    qty,
    productId
  );
}
