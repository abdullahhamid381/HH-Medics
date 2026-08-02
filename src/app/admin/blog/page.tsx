import Link from "next/link";
import { Newspaper, Plus } from "lucide-react";
import { listAllPosts } from "@/lib/db/blog";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export default async function AdminBlogPage() {
  const posts = await listAllPosts();
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Newspaper size={18} />
          </span>
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-primary">
              Content
            </p>
            <h1 className="mt-0.5 font-display text-2xl text-ink">Blog</h1>
          </div>
        </div>
        <LinkButton href="/admin/blog/new" size="sm">
          <Plus size={15} /> New post
        </LinkButton>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No posts yet"
          description="Write your first article — it'll appear at /blog once published."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-soft">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/blog/${p.id}`} className="font-medium text-ink hover:text-primary">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{p.author ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={p.status === "published" ? "primary" : "default"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
