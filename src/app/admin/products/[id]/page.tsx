import { notFound } from "next/navigation";
import { getProductById, listCategories } from "@/lib/db/products";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  const categories = await listCategories();

  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">
          Products
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">Edit product</h1>
      </div>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
