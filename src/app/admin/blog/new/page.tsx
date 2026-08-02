import { BlogPostForm } from "@/components/admin/blog-post-form";

export default function NewBlogPostPage() {
  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">Blog</p>
        <h1 className="mt-1 font-display text-3xl text-ink">New post</h1>
      </div>
      <BlogPostForm />
    </div>
  );
}
