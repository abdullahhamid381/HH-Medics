import { PackageSearch } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
        <PackageSearch size={28} />
      </div>
      <p className="mt-6 font-mono text-sm uppercase tracking-wider text-primary">
        404
      </p>
      <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink-soft">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
        Let&apos;s get you back on track.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <LinkButton href="/" size="lg">
          Back to home
        </LinkButton>
        <LinkButton href="/shop" size="lg" variant="outline">
          Browse the shop
        </LinkButton>
      </div>
    </div>
  );
}
