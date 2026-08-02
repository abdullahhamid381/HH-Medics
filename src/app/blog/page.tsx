import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { listPublishedPosts } from "@/lib/db/blog";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { AnimatedGrid, AnimatedItem } from "@/components/site/animated-section";

export default async function BlogIndexPage() {
  const { items: posts } = await listPublishedPosts({ limit: 24 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">
          Healthcare blog
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">
          Guides &amp; wellness notes
        </h1>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No articles published yet"
          description="Check back soon — our team is working on wellness guides and product explainers."
        />
      ) : (
        <AnimatedGrid className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <AnimatedItem key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow hover:shadow-elevated"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-soft">
                  {post.cover_image && (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                    {post.published_at ? formatDate(post.published_at) : ""}
                    {post.author ? ` · ${post.author}` : ""}
                  </span>
                  <h2 className="font-display text-lg leading-snug text-ink">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="line-clamp-2 text-sm text-ink-soft">{post.excerpt}</p>
                  )}
                </div>
              </Link>
            </AnimatedItem>
          ))}
        </AnimatedGrid>
      )}
    </div>
  );
}
