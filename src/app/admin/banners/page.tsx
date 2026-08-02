import { Image as ImageIcon } from "lucide-react";
import { listAllBanners } from "@/lib/db/banners";
import { BannersTable } from "@/components/admin/banners-table";

export default async function AdminBannersPage() {
  const banners = await listAllBanners();
  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <ImageIcon size={18} />
        </span>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-primary">
            Homepage
          </p>
          <h1 className="mt-0.5 font-display text-2xl text-ink">Promotional banners</h1>
        </div>
      </div>
      <BannersTable banners={banners} />
    </div>
  );
}
