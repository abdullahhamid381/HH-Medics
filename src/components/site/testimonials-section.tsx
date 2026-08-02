import { Star } from "lucide-react";
import { listActiveTestimonials } from "@/lib/db/testimonials";
import { AnimatedGrid, AnimatedItem } from "@/components/site/animated-section";

export async function TestimonialsSection() {
  const testimonials = await listActiveTestimonials();
  if (testimonials.length === 0) return null;

  return (
    <section className="border-y border-line bg-surface py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-primary">
            From our customers
          </p>
          <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
            Trusted for the everyday essentials
          </h2>
        </div>
        <AnimatedGrid className="grid gap-5 sm:grid-cols-3">
          {testimonials.map((t) => (
            <AnimatedItem
              key={t.id}
              className="rounded-panel border border-line bg-bg p-6"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={
                      i < t.rating ? "fill-warning text-warning" : "text-line"
                    }
                  />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="mt-4 font-display text-sm text-ink">
                {t.author_name}
                {t.author_detail && (
                  <span className="ml-2 font-sans text-xs font-normal text-ink-soft">
                    {t.author_detail}
                  </span>
                )}
              </p>
            </AnimatedItem>
          ))}
        </AnimatedGrid>
      </div>
    </section>
  );
}
