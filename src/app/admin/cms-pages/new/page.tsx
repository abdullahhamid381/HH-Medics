import { CmsPageForm } from "@/components/admin/cms-page-form";

export default function NewCmsPagePage() {
  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">Pages</p>
        <h1 className="mt-1 font-display text-3xl text-ink">New page</h1>
      </div>
      <CmsPageForm />
    </div>
  );
}
