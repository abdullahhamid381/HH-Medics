import { listCategories } from "@/lib/db/products";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  const categories = listCategories();
  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">
          Products
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">Add product</h1>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
