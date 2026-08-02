import { HelpCircle } from "lucide-react";
import { listAllFaqs } from "@/lib/db/faqs";
import { FaqsTable } from "@/components/admin/faqs-table";

export default async function AdminFaqsPage() {
  const faqs = await listAllFaqs();
  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <HelpCircle size={18} />
        </span>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-primary">
            Homepage
          </p>
          <h1 className="mt-0.5 font-display text-2xl text-ink">FAQs</h1>
        </div>
      </div>
      <FaqsTable faqs={faqs} />
    </div>
  );
}
