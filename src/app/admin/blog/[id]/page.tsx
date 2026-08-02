import { notFound } from "next/navigation";
import { getPostById } from "@/lib/db/blog";
import { BlogPostForm } from "@/components/admin/blog-post-form";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">Blog</p>
        <h1 className="mt-1 font-display text-3xl text-ink">Edit post</h1>
      </div>
      <BlogPostForm post={post} />
    </div>
  );
}
