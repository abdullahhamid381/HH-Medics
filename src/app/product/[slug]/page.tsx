import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, ChevronRight } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/db/products";
import { AddToCartWidget } from "@/components/site/add-to-cart-widget";
import { ProductCard } from "@/components/site/product-card";
import { ProductGallery } from "@/components/site/product-gallery";
import { WishlistButton } from "@/components/site/wishlist-button";
import { RecordProductView } from "@/components/site/record-product-view";
import { Badge } from "@/components/ui/primitives";
import { formatCurrency, PRODUCT_TYPE_LABELS } from "@/lib/utils";
import { AnimatedGrid, AnimatedItem, AnimatedSection } from "@/components/site/animated-section";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const onSale =
    product.compare_at_price && product.compare_at_price > product.price;
  const images: string[] = product.images ? JSON.parse(product.images) : [];
  const gallery = images.length ? images : product.image ? [product.image] : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <RecordProductView product={product} />
      <div className="mb-6 flex items-center gap-1.5 text-xs text-ink-soft">
        <Link href="/shop" className="hover:text-primary">
          Shop
        </Link>
        <ChevronRight size={12} />
        {product.category_name && (
          <>
            <Link
              href={`/shop?category=${product.category_slug}`}
              className="hover:text-primary"
            >
              {product.category_name}
            </Link>
            <ChevronRight size={12} />
          </>
        )}
        <span className="text-ink">{product.name}</span>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <AnimatedSection variant="fadeIn">
          <ProductGallery images={gallery} name={product.name} />
        </AnimatedSection>

        <AnimatedSection>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary">
              {PRODUCT_TYPE_LABELS[product.type] ?? product.type}
            </Badge>
            {onSale && <Badge tone="accent">On sale</Badge>}
            {product.requires_prescription === 1 && (
              <Badge tone="warning">Prescription required</Badge>
            )}
          </div>

          <h1 className="mt-3 font-display text-3xl leading-tight text-ink">
            {product.name}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {product.brand} · {product.unit}
          </p>

          <div className="mt-2 flex items-center gap-1.5 text-sm">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.round(product.rating)
                      ? "fill-warning text-warning"
                      : "text-line"
                  }
                />
              ))}
            </div>
            <span className="text-ink-soft">
              {product.rating.toFixed(1)} ({product.reviews_count} reviews)
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-mono text-3xl font-semibold text-ink">
              {formatCurrency(product.price)}
            </span>
            {onSale && (
              <span className="font-mono text-lg text-ink-soft line-through">
                {formatCurrency(product.compare_at_price!)}
              </span>
            )}
          </div>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-soft">
            {product.short_description}
          </p>

          <div className="my-6 space-y-3">
            <AddToCartWidget product={product} />
            <WishlistButton product={product} />
          </div>

          <div className="label-perforation" />

          <div className="mt-6 space-y-2 text-sm">
            <p className="font-display text-base text-ink">Product details</p>
            <p className="leading-relaxed text-ink-soft">{product.description}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 font-mono text-xs">
              <div>
                <dt className="text-ink-soft">SKU</dt>
                <dd className="text-ink">{product.sku}</dd>
              </div>
              <div>
                <dt className="text-ink-soft">Unit</dt>
                <dd className="text-ink">{product.unit}</dd>
              </div>
              <div>
                <dt className="text-ink-soft">Brand</dt>
                <dd className="text-ink">{product.brand}</dd>
              </div>
              <div>
                <dt className="text-ink-soft">Category</dt>
                <dd className="text-ink">{product.category_name}</dd>
              </div>
            </dl>
          </div>
        </AnimatedSection>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 font-display text-2xl text-ink">
            You might also like
          </h2>
          <AnimatedGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <AnimatedItem key={p.id} className="flex">
                <ProductCard product={p} />
              </AnimatedItem>
            ))}
          </AnimatedGrid>
        </div>
      )}
    </div>
  );
}
