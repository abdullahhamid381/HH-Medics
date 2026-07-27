"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function CustomerSearch({ query }: { query?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(query ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="mb-4 flex max-w-sm items-center gap-2 rounded-full border border-line bg-surface px-4 py-2"
    >
      <Search size={15} className="text-ink-soft" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search customers by name, email or phone..."
        className="w-full bg-transparent text-sm outline-none"
      />
    </form>
  );
}
