import { notFound } from "next/navigation";
import { getCmsPageById } from "@/lib/db/cms";
import { CmsPageForm } from "@/components/admin/cms-page-form";

export default async function EditCmsPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await getCmsPageById(id);
  if (!page) notFound();

  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">Pages</p>
        <h1 className="mt-1 font-display text-3xl text-ink">Edit page</h1>
      </div>
      <CmsPageForm page={page} />
    </div>
  );
}
