"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRecentlyViewed } from "@/store/recently-viewed";
import { formatCurrency } from "@/lib/utils";
import { AnimatedGrid, AnimatedItem } from "@/components/site/animated-section";

export function RecentlyViewedSection() {
  const lines = useRecentlyViewed((s) => s.lines);
  // Zustand's persisted store hydrates from localStorage after mount, so
  // render nothing until then to avoid a server/client markup mismatch.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated || lines.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">
          Pick up where you left off
        </p>
        <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
          Recently viewed
        </h2>
      </div>
      <AnimatedGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {lines.map((line) => (
          <AnimatedItem key={line.productId}>
            <Link
              href={`/product/${line.slug}`}
              className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow hover:shadow-elevated"
            >
              <div className="relative aspect-square overflow-hidden bg-surface-soft">
                {line.image && (
                  <Image
                    src={line.image}
                    alt={line.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex flex-col gap-1 p-3.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                  {line.brand}
                </span>
                <h3 className="line-clamp-1 font-display text-sm text-ink">
                  {line.name}
                </h3>
                <span className="font-mono text-sm font-semibold text-ink">
                  {formatCurrency(line.price)}
                </span>
              </div>
            </Link>
          </AnimatedItem>
        ))}
      </AnimatedGrid>
    </section>
  );
}
