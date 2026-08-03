import { listActiveFaqs } from "@/lib/db/faqs";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { AnimatedSection } from "@/components/site/animated-section";

export const metadata = {
  title: "FAQ — HH Medics",
  description: "Answers to common questions about orders, prescriptions, shipping and returns at HH Medics.",
};

export default async function FaqPage() {
  const faqs = await listActiveFaqs();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <AnimatedSection>
        <p className="font-mono text-xs uppercase tracking-wider text-primary">
          Good to know
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          Answers to the questions we hear most about prescriptions, shipping,
          returns and your account. Can&apos;t find what you need?{" "}
          <a href="/contact" className="font-medium text-primary hover:underline">
            Contact us
          </a>
          .
        </p>
      </AnimatedSection>

      <div className="mt-10">
        {faqs.length > 0 ? (
          <FaqAccordion faqs={faqs} />
        ) : (
          <p className="text-sm text-ink-soft">No FAQs published yet.</p>
        )}
      </div>
    </div>
  );
}
