import { notFound } from "next/navigation";
import { getPublishedPageBySlug } from "@/lib/db/cms";
import { AnimatedSection } from "@/components/site/animated-section";

export default async function CmsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) notFound();

  const paragraphs = page.content.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <AnimatedSection>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{page.title}</h1>
        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-soft">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p>This page doesn&apos;t have any content yet.</p>
          )}
        </div>
      </AnimatedSection>
    </div>
  );
}
