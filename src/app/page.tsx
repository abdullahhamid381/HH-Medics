import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, BadgeCheck, Star, Award, Sparkles } from "lucide-react";
import { listCategories, listProducts, listBrands } from "@/lib/db/products";
import { getCategoryIcon } from "@/lib/category-icons";
import { ProductCard } from "@/components/site/product-card";
import { LinkButton } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { AnimatedGrid, AnimatedItem, AnimatedSection } from "@/components/site/animated-section";
import { RecentlyViewedSection } from "@/components/site/recently-viewed-section";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { FaqSection } from "@/components/site/faq-section";
import { NewsletterSection } from "@/components/site/newsletter-section";
import { PromoBanners } from "@/components/site/promo-banners";

const CERTIFICATIONS = [
  { icon: ShieldCheck, label: "Licensed pharmacy partners" },
  { icon: Award, label: "GMP-certified suppliers only" },
  { icon: BadgeCheck, label: "Pharmacist-verified listings" },
  { icon: Sparkles, label: "Authenticity guaranteed" },
];

export default async function HomePage() {
  const categories = await listCategories();
  const { items: featured } = await listProducts({ featured: true, limit: 8 });
  const { items: newest } = await listProducts({ sort: "newest", limit: 8 });
  const { items: bestSellers } = await listProducts({ sort: "rating", limit: 8 });
  const brands = await listBrands(8);
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
              {categories[0] && (
                <LinkButton
                  href={`/shop?category=${categories[0].slug}`}
                  size="lg"
                  variant="outline"
                >
                  Explore {categories[0].name}
                </LinkButton>
              )}
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

          <AnimatedSection className="relative mx-auto w-full max-w-md">
            <div className="label-notch overflow-hidden rounded-hero border border-line bg-bg p-5 shadow-elevated">
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
          </AnimatedSection>
        </div>

        <div className="border-t border-line bg-bg">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-4 sm:px-6 lg:px-8">
            {CERTIFICATIONS.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-xs font-medium text-ink-soft">
                <c.icon size={14} className="text-primary" />
                {c.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <PromoBanners />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-primary">
              Browse by aisle
            </p>
            <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
              Popular Categories
            </h2>
          </div>
        </div>
        <AnimatedGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            return (
              <AnimatedItem key={cat.id}>
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="group flex h-full flex-col items-start gap-3 rounded-card border border-line bg-surface p-5 shadow-card transition hover:border-primary/40 hover:shadow-elevated"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-panel bg-primary-soft text-primary transition group-hover:bg-primary group-hover:text-white">
                    <Icon size={20} />
                  </span>
                  <span className="font-display text-[15px] text-ink">
                    {cat.name}
                  </span>
                  <span className="text-xs text-ink-soft">{cat.description}</span>
                </Link>
              </AnimatedItem>
            );
          })}
        </AnimatedGrid>
      </section>

      {brands.length > 0 && (
        <section className="border-y border-line bg-surface py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-5 text-center font-mono text-xs uppercase tracking-wider text-ink-soft">
              Shop by brand
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {brands.map((b) => (
                <Link
                  key={b.brand}
                  href={`/shop?q=${encodeURIComponent(b.brand)}`}
                  className="rounded-full border border-line bg-bg px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-primary/40 hover:text-primary"
                >
                  {b.brand}
                  <span className="ml-1.5 text-xs text-ink-soft/70">({b.count})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-primary">
              Staff picks
            </p>
            <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
              Health Products
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>
        <AnimatedGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <AnimatedItem key={p.id} className="flex">
              <ProductCard product={p} />
            </AnimatedItem>
          ))}
        </AnimatedGrid>
      </section>

      <section className="border-y border-line bg-surface py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-primary">
                Highest rated
              </p>
              <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
                Trending Products
              </h2>
            </div>
          </div>
          <AnimatedGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {bestSellers.map((p) => (
              <AnimatedItem key={p.id} className="flex">
                <ProductCard product={p} />
              </AnimatedItem>
            ))}
          </AnimatedGrid>
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
        <AnimatedGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {newest.map((p) => (
            <AnimatedItem key={p.id}>
              <ProductCard product={p} />
            </AnimatedItem>
          ))}
        </AnimatedGrid>
      </section>

      <RecentlyViewedSection />
      <TestimonialsSection />
      <FaqSection />
      <NewsletterSection />

      <section id="contact" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <AnimatedSection variant="fadeIn" className="label-notch overflow-hidden rounded-hero border border-line bg-primary px-8 py-12 text-center text-white sm:px-16">
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
        </AnimatedSection>
      </section>
    </div>
  );
}
