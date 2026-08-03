import { Tag } from "lucide-react";
import { listCoupons } from "@/lib/db/coupons";
import { formatDate } from "@/lib/utils";
import { CopyCouponButton } from "@/components/site/copy-coupon-button";
import { AnimatedGrid, AnimatedItem, AnimatedSection } from "@/components/site/animated-section";

export const metadata = {
  title: "Coupons & Offers — HH Medics",
  description: "Active discount codes you can apply at checkout on HH Medics.",
};

export default async function CouponsPage() {
  const allCoupons = await listCoupons();
  const now = Date.now();
  const coupons = allCoupons.filter(
    (c) => c.active === 1 && (!c.expires_at || new Date(c.expires_at).getTime() > now)
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <AnimatedSection>
        <p className="font-mono text-xs uppercase tracking-wider text-primary">
          Save more
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">
          Coupons &amp; Offers
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          Copy a code below and apply it at checkout to get your discount.
        </p>
      </AnimatedSection>

      {coupons.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-card border border-dashed border-line py-20 text-center">
          <Tag size={28} className="text-ink-soft" />
          <p className="font-display text-lg text-ink">No active offers right now</p>
          <p className="max-w-xs text-sm text-ink-soft">
            Check back soon — new coupons show up here as soon as they&apos;re live.
          </p>
        </div>
      ) : (
        <AnimatedGrid className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {coupons.map((c) => (
            <AnimatedItem key={c.id}>
              <div className="label-notch flex items-center justify-between gap-4 rounded-card border border-line bg-surface p-5 shadow-card">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-panel bg-primary-soft text-primary">
                      <Tag size={16} />
                    </span>
                    <span className="font-mono text-lg font-semibold tracking-wider text-ink">
                      {c.code}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink-soft">
                    {c.discount_percent}% off your order
                  </p>
                  {c.expires_at && (
                    <p className="mt-1 text-xs text-ink-soft/70">
                      Valid until {formatDate(c.expires_at)}
                    </p>
                  )}
                </div>
                <CopyCouponButton code={c.code} />
              </div>
            </AnimatedItem>
          ))}
        </AnimatedGrid>
      )}
    </div>
  );
}
