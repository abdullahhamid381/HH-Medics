import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublishedPostBySlug } from "@/lib/db/blog";
import { formatDate } from "@/lib/utils";
import { AnimatedSection } from "@/components/site/animated-section";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const paragraphs = post.content.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <AnimatedSection>
        <p className="font-mono text-xs uppercase tracking-wider text-primary">
          {post.published_at ? formatDate(post.published_at) : ""}
          {post.author ? ` · ${post.author}` : ""}
        </p>
        <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
          {post.title}
        </h1>
        {post.cover_image && (
          <div className="relative mt-6 aspect-[16/8] overflow-hidden rounded-hero border border-line bg-surface-soft">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}
        <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-ink-soft">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}
