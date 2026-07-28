import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, BadgeCheck, Star } from "lucide-react";
import { listCategories, listProducts } from "@/lib/db/products";
import { getCategoryIcon } from "@/lib/category-icons";
import { ProductCard } from "@/components/site/product-card";
import { LinkButton } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default async function HomePage() {
  const categories = await listCategories();
  const { items: featured } = await listProducts({ featured: true, limit: 8 });
  const { items: newest } = await listProducts({ sort: "newest", limit: 8 });
  const heroProduct = featured[0];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-bg px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-primary">
              <BadgeCheck size={14} /> Pharmacist-verified catalog
            </span>
            <h1 className="mt-5 font-display text-[2.6rem] leading-[1.05] tracking-tight text-ink sm:text-6xl">
              Health &amp; beauty,
              <br />
              <span className="text-primary">clearly labeled.</span>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft sm:text-base">
              Medicines, supplements, face wash, serums and cosmetics —
              every listing shows exactly what&apos;s inside, sourced from
              trusted brands and delivered to your door.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton href="/shop" size="lg">
                Shop the catalog <ArrowRight size={17} />
              </LinkButton>
              <LinkButton href="/shop?category=serums" size="lg" variant="outline">
                Explore skincare
              </LinkButton>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              <div className="flex items-center gap-2 text-sm text-ink-soft">
                <ShieldCheck size={17} className="text-primary" /> Verified authenticity
              </div>
              <div className="flex items-center gap-2 text-sm text-ink-soft">
                <Truck size={17} className="text-primary" /> Nationwide delivery
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="label-notch overflow-hidden rounded-[1.5rem] border border-line bg-bg p-5 shadow-xl shadow-black/5">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                <span>Rx / OTC · Verified</span>
                <span>No. {heroProduct?.sku ?? "SKU-1000"}</span>
              </div>
              <div className="label-perforation my-3" />
              {heroProduct && (
                <>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-soft">
                    <Image
                      src={heroProduct.image ?? ""}
                      alt={heroProduct.name}
                      fill
                      sizes="400px"
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg text-ink">
                        {heroProduct.name}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
                        <Star size={12} className="fill-warning text-warning" />
                        {heroProduct.rating.toFixed(1)} · {heroProduct.brand}
                      </p>
                    </div>
                    <span className="whitespace-nowrap font-mono text-lg font-semibold text-primary">
                      {formatCurrency(heroProduct.price)}
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="absolute -right-6 -top-6 -z-10 h-32 w-32 rounded-full bg-accent-soft blur-2xl" />
            <div className="absolute -bottom-8 -left-8 -z-10 h-40 w-40 rounded-full bg-primary-soft blur-2xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-primary">
              Browse by aisle
            </p>
            <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
              Shop by category
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            return (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-5 transition hover:border-primary/40 hover:shadow-md hover:shadow-black/5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary transition group-hover:bg-primary group-hover:text-white">
                  <Icon size={20} />
                </span>
                <span className="font-display text-[15px] text-ink">
                  {cat.name}
                </span>
                <span className="text-xs text-ink-soft">{cat.description}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-line bg-surface py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-primary">
                Staff picks
              </p>
              <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
                Featured this week
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
            >
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-primary">
              Just landed
            </p>
            <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
              New arrivals
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {newest.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="label-notch overflow-hidden rounded-[1.75rem] border border-line bg-primary px-8 py-12 text-center text-white sm:px-16">
          <h2 className="font-display text-2xl sm:text-3xl">
            Questions about a product or your order?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/85">
            Our pharmacist-backed support team replies within a few hours,
            every day of the week.
          </p>
          <LinkButton
            href="/account"
            size="lg"
            variant="secondary"
            className="mt-6"
          >
            Go to my account
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
