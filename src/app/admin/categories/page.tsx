import { listCategoriesWithCounts } from "@/lib/db/products";
import { CategoriesTable } from "@/components/admin/categories-table";

export default async function AdminCategoriesPage() {
  const categories = await listCategoriesWithCounts();

  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">
          Catalog
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">Categories</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {categories.length} categories organizing your catalog
        </p>
      </div>

      <CategoriesTable categories={categories} />
    </div>
  );
}
