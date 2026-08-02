import { Ticket } from "lucide-react";
import { listCoupons } from "@/lib/db/coupons";
import { CouponsTable } from "@/components/admin/coupons-table";

export default async function AdminCouponsPage() {
  const coupons = await listCoupons();
  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Ticket size={18} />
        </span>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-primary">
            Promotions
          </p>
          <h1 className="mt-0.5 font-display text-2xl text-ink">Coupons</h1>
        </div>
      </div>
      <CouponsTable coupons={coupons} />
    </div>
  );
}
