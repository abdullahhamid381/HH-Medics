import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listActiveBanners } from "@/lib/db/banners";
import { AnimatedGrid, AnimatedItem } from "@/components/site/animated-section";

export async function PromoBanners() {
  const banners = await listActiveBanners();
  if (banners.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <AnimatedGrid
        className={
          banners.length === 1
            ? "grid grid-cols-1"
            : "grid gap-4 sm:grid-cols-2"
        }
      >
        {banners.map((banner) => {
          const content = (
            <div className="group relative aspect-[21/9] w-full overflow-hidden rounded-hero border border-line bg-surface-soft sm:aspect-[16/7]">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <h3 className="font-display text-lg text-white sm:text-xl">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="mt-1 max-w-sm text-sm text-white/80">
                    {banner.subtitle}
                  </p>
                )}
                {banner.cta_label && (
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white">
                    {banner.cta_label} <ArrowRight size={14} />
                  </span>
                )}
              </div>
            </div>
          );
          return (
            <AnimatedItem key={banner.id}>
              {banner.link_href ? (
                <Link href={banner.link_href}>{content}</Link>
              ) : (
                content
              )}
            </AnimatedItem>
          );
        })}
      </AnimatedGrid>
    </section>
  );
}
