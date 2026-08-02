import { MessageSquareQuote } from "lucide-react";
import { listAllTestimonials } from "@/lib/db/testimonials";
import { TestimonialsTable } from "@/components/admin/testimonials-table";

export default async function AdminTestimonialsPage() {
  const testimonials = await listAllTestimonials();
  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <MessageSquareQuote size={18} />
        </span>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-primary">
            Homepage
          </p>
          <h1 className="mt-0.5 font-display text-2xl text-ink">Testimonials</h1>
        </div>
      </div>
      <TestimonialsTable testimonials={testimonials} />
    </div>
  );
}
