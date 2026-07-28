import Link from "next/link";
import Image from "next/image";
import { listReturns } from "@/lib/db/returns";
import { ReturnActions } from "@/components/admin/return-actions";
import { Badge } from "@/components/ui/primitives";
import {
  formatCurrency,
  formatDate,
  RETURN_STATUS_LABELS,
  cn,
} from "@/lib/utils";
import type { ReturnStatus } from "@/types";

const FILTERS: (ReturnStatus | "all")[] = ["all", "requested", "approved", "refunded", "rejected"];

const TONE: Record<string, "primary" | "accent" | "warning" | "danger" | "default"> = {
  requested: "warning",
  approved: "accent",
  refunded: "primary",
  rejected: "danger",
};

export default async function AdminReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = (status as ReturnStatus | "all") ?? "all";
  const { items, total } = await listReturns(activeStatus, 50, 0);

  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">
          Post-sale
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">Returns & refunds</h1>
        <p className="mt-1 text-sm text-ink-soft">{total} requests total</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin/returns" : `/admin/returns?status=${s}`}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition",
              activeStatus === s
                ? "border-primary bg-primary text-white"
                : "border-line bg-surface text-ink-soft hover:bg-surface-soft"
            )}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line py-16 text-center">
            <p className="font-display text-base text-ink">No return requests</p>
            <p className="mt-1 text-sm text-ink-soft">
              Requests from customers will show up here for review.
            </p>
          </div>
        )}
        {items.map((ret) => (
          <div
            key={ret.id}
            className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-soft">
                {ret.item_image && (
                  <Image src={ret.item_image} alt="" fill sizes="56px" className="object-cover" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-ink">{ret.item_name}</p>
                <p className="text-xs text-ink-soft">
                  {ret.return_number} · Order {ret.order_number} · {ret.customer_name}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Reason: {ret.reason} · {formatDate(ret.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-ink">
                  {formatCurrency(ret.refund_amount)}
                </span>
                <Badge tone={TONE[ret.status] ?? "default"}>
                  {RETURN_STATUS_LABELS[ret.status]}
                </Badge>
              </div>
              <ReturnActions returnId={ret.id} status={ret.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
