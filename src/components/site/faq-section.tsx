import { listActiveFaqs } from "@/lib/db/faqs";
import { FaqAccordion } from "@/components/site/faq-accordion";

export async function FaqSection() {
  const faqs = await listActiveFaqs();
  if (faqs.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">
          Good to know
        </p>
        <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
          Frequently asked questions
        </h2>
      </div>
      <FaqAccordion faqs={faqs} />
    </section>
  );
}

