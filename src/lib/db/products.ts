import { db, genId, unwrap } from "./index";
import type { Product, Category, ProductType } from "@/types";

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await db
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Category[]) ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const { data, error } = await db
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Category) ?? undefined;
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  const { data, error } = await db.from("categories").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Category) ?? undefined;
}

export async function listCategoriesWithCounts(): Promise<
  (Category & { product_count: number })[]
> {
  const categories = await listCategories();
  const counts = await Promise.all(
    categories.map((c) => countProductsInCategory(c.id))
  );
  return categories.map((c, i) => ({ ...c, product_count: counts[i] }));
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  sort_order?: number;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const id = genId("cat");
  const { error } = await db.from("categories").insert({
    id,
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    icon: input.icon ?? null,
    sort_order: input.sort_order ?? 0,
  });
  if (error) throw new Error(error.message);
  return (await getCategoryById(id))!;
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>
): Promise<Category | undefined> {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.slug !== undefined) payload.slug = input.slug;
  if (input.description !== undefined) payload.description = input.description;
  if (input.icon !== undefined) payload.icon = input.icon;
  if (input.sort_order !== undefined) payload.sort_order = input.sort_order;

  const { data, error } = await db
    .from("categories")
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Category) ?? undefined;
}

export async function countProductsInCategory(id: string): Promise<number> {
  const { count, error } = await db
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await db.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
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

// PostgREST's `.or()` filter syntax uses `,` `(` `)` as structural
// characters — strip them out of free-text search input so a stray
// character in a search box can't break (or redefine) the filter.
function sanitizeSearchTerm(q: string): string {
  return q.replace(/[,()]/g, " ").trim();
}

type ProductRow = Omit<Product, "category_name" | "category_slug"> & {
  categories: { name: string; slug: string } | null;
};

function flattenProduct(row: ProductRow): Product {
  const { categories, ...rest } = row;
  return {
    ...rest,
    category_name: categories?.name,
    category_slug: categories?.slug,
  };
}

export async function listProducts(filters: ProductFilters = {}): Promise<{
  items: Product[];
  total: number;
}> {
  let categoryId: string | null | undefined;
  if (filters.category) {
    const cat = await getCategoryBySlug(filters.category);
    if (!cat) return { items: [], total: 0 };
    categoryId = cat.id;
  }

  let query = db.from("products").select("*, categories(name, slug)", { count: "exact" });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  } else if (!filters.status) {
    query = query.eq("status", "active");
  }
  if (filters.q) {
    const term = sanitizeSearchTerm(filters.q);
    if (term) {
      query = query.or(`name.ilike.%${term}%,brand.ilike.%${term}%,tags.ilike.%${term}%`);
    }
  }
  if (categoryId) query = query.eq("category_id", categoryId);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);
  if (filters.featured) query = query.eq("featured", 1);

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    case "featured":
      query = query
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const limit = filters.limit ?? 24;
  const offset = filters.offset ?? 0;
  const { data, error, count } = await query.range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);

  return {
    items: ((data as unknown as ProductRow[]) ?? []).map(flattenProduct),
    total: count ?? 0,
  };
}

export interface BrandSummary {
  brand: string;
  count: number;
}

// Derives a "shop by brand" list straight from the existing products table —
// no new table or admin surface, just a distinct/count over data that's
// already there.
export async function listBrands(limit = 8): Promise<BrandSummary[]> {
  const { data, error } = await db
    .from("products")
    .select("brand")
    .eq("status", "active")
    .not("brand", "is", null);
  if (error) throw new Error(error.message);
  const counts = new Map<string, number>();
  for (const row of (data as { brand: string | null }[]) ?? []) {
    if (!row.brand) continue;
    counts.set(row.brand, (counts.get(row.brand) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const { data, error } = await db
    .from("products")
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? flattenProduct(data as unknown as ProductRow) : undefined;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const { data, error } = await db
    .from("products")
    .select("*, categories(name, slug)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? flattenProduct(data as unknown as ProductRow) : undefined;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  if (!product.category_id) return [];
  const { data, error } = await db
    .from("products")
    .select("*, categories(name, slug)")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .eq("status", "active")
    .order("rating", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return ((data as unknown as ProductRow[]) ?? []).map(flattenProduct);
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

export async function createProduct(input: ProductInput): Promise<Product> {
  const id = genId("prod");
  const { error } = await db.from("products").insert({
    id,
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    short_description: input.short_description ?? null,
    category_id: input.category_id ?? null,
    brand: input.brand ?? null,
    type: input.type,
    price: input.price,
    compare_at_price: input.compare_at_price ?? null,
    cost_price: input.cost_price ?? null,
    stock: input.stock,
    sku: input.sku ?? null,
    unit: input.unit ?? null,
    image: input.image ?? null,
    images: JSON.stringify(input.images ?? []),
    requires_prescription: input.requires_prescription ? 1 : 0,
    featured: input.featured ? 1 : 0,
    status: input.status ?? "active",
    tags: JSON.stringify(input.tags ?? []),
  });
  if (error) throw new Error(error.message);
  return (await getProductById(id))!;
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<Product | undefined> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) payload.name = input.name;
  if (input.slug !== undefined) payload.slug = input.slug;
  if (input.description !== undefined) payload.description = input.description;
  if (input.short_description !== undefined) payload.short_description = input.short_description;
  if (input.category_id !== undefined) payload.category_id = input.category_id;
  if (input.brand !== undefined) payload.brand = input.brand;
  if (input.type !== undefined) payload.type = input.type;
  if (input.price !== undefined) payload.price = input.price;
  if (input.compare_at_price !== undefined) payload.compare_at_price = input.compare_at_price;
  if (input.cost_price !== undefined) payload.cost_price = input.cost_price;
  if (input.stock !== undefined) payload.stock = input.stock;
  if (input.sku !== undefined) payload.sku = input.sku;
  if (input.unit !== undefined) payload.unit = input.unit;
  if (input.image !== undefined) payload.image = input.image;
  if (input.images !== undefined) payload.images = JSON.stringify(input.images);
  if (input.requires_prescription !== undefined)
    payload.requires_prescription = input.requires_prescription ? 1 : 0;
  if (input.featured !== undefined) payload.featured = input.featured ? 1 : 0;
  if (input.status !== undefined) payload.status = input.status;
  if (input.tags !== undefined) payload.tags = JSON.stringify(input.tags);

  const { error } = await db.from("products").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  return getProductById(id);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await db.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function decrementStock(productId: string, qty: number): Promise<void> {
  unwrap(await db.rpc("decrement_stock", { pid: productId, qty }));
}

export async function restockProduct(productId: string, qty: number): Promise<void> {
  unwrap(await db.rpc("restock_product", { pid: productId, qty }));
}
