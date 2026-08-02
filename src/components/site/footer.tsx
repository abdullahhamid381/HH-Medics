import Link from "next/link";
import { ShieldCheck, Truck, PhoneCall, Sparkles } from "lucide-react";
import { listPublishedPages } from "@/lib/db/cms";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "Medicines", href: "/shop?category=medicines" },
      { label: "Supplements", href: "/shop?category=supplements" },
      { label: "Face Wash", href: "/shop?category=face-wash" },
      { label: "Serums", href: "/shop?category=serums" },
      { label: "Cosmetics", href: "/shop?category=cosmetics" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My orders", href: "/account" },
      { label: "Returns & refunds", href: "/account/returns" },
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/signup" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Track an order", href: "/account" },
      { label: "Shipping info", href: "/shop" },
      { label: "Contact us", href: "/#contact" },
      { label: "Blog", href: "/blog" },
    ],
  },
];

const trust = [
  { icon: ShieldCheck, label: "Verified pharmacist checks" },
  { icon: Truck, label: "Same-day dispatch, nationwide" },
  { icon: PhoneCall, label: "Support 7 days a week" },
  { icon: Sparkles, label: "Authentic products only" },
];

export async function Footer() {
  const cmsPages = await listPublishedPages();

  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 border-b border-line pb-10 sm:grid-cols-4">
          {trust.map((t) => (
            <div key={t.label} className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-panel bg-primary-soft text-primary">
                <t.icon size={16} />
              </span>
              <span className="pt-1 text-xs text-ink-soft sm:text-sm">{t.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8 py-10 md:grid-cols-6">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white font-display text-lg">
                +
              </span>
              <span className="font-display text-xl text-ink">
                HH <span className="text-primary">Medics</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink-soft">
              Your everyday pharmacy, supplements and skincare counter — clearly
              labeled, honestly priced, delivered to your door.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-display text-sm text-ink">{col.title}</p>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-ink-soft transition hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {cmsPages.length > 0 && (
            <div>
              <p className="font-display text-sm text-ink">Company</p>
              <ul className="mt-3 space-y-2.5">
                {cmsPages.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/pages/${p.slug}`}
                      className="text-sm text-ink-soft transition hover:text-primary"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink-soft sm:flex-row">
          <p>© {new Date().getFullYear()} HH Medics. All rights reserved.</p>
          <p>Demo store — no real payments are processed.</p>
        </div>
      </div>
    </footer>
  );
}
