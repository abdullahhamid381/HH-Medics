import Link from "next/link";
import { listCustomers, countCustomers } from "@/lib/db/users";
import { CustomerSearch } from "@/components/admin/customer-search";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  const customers = listCustomers(PAGE_SIZE, (currentPage - 1) * PAGE_SIZE, q);
  const total = countCustomers(q);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `/admin/customers?${params.toString()}`;
  }

  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">
          People
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">Customers</h1>
        <p className="mt-1 text-sm text-ink-soft">{total} registered customers</p>
      </div>

      <CustomerSearch query={q} />

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink-soft">
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Total spent</th>
              <th className="px-4 py-3 font-medium">Last order</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/customers/${c.id}`}
                    className="font-medium text-ink hover:text-primary hover:underline"
                  >
                    {c.name}
                  </Link>
                  <p className="text-xs text-ink-soft">{c.email}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(c.created_at)}</td>
                <td className="px-4 py-3 text-ink">{c.orders_count}</td>
                <td className="px-4 py-3 font-mono text-ink">
                  {formatCurrency(c.total_spent)}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {c.last_order_at ? formatDate(c.last_order_at) : "—"}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-soft">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition",
                p === currentPage
                  ? "bg-primary text-white"
                  : "border border-line text-ink-soft hover:bg-surface-soft"
              )}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
