import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { listCmsPages } from "@/lib/db/cms";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export default async function AdminCmsPagesPage() {
  const pages = await listCmsPages();
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <FileText size={18} />
          </span>
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-primary">
              Content
            </p>
            <h1 className="mt-0.5 font-display text-2xl text-ink">Pages</h1>
          </div>
        </div>
        <LinkButton href="/admin/cms-pages/new" size="sm">
          <Plus size={15} /> New page
        </LinkButton>
      </div>

      {pages.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No pages yet"
          description="Create pages like Shipping Info, Privacy Policy, or About Us — they'll appear at /pages/[slug] and in the footer once published."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-soft">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/cms-pages/${p.id}`} className="font-medium text-ink hover:text-primary">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">/pages/{p.slug}</td>
                  <td className="px-4 py-3">
                    <Badge tone={p.status === "published" ? "primary" : "default"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{formatDate(p.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
