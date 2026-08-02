"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { BlogPost } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/primitives";
import { confirmAction } from "@/store/confirm";
import { pushToast } from "@/store/toast";

export function BlogPostForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    cover_image: post?.cover_image ?? "",
    author: post?.author ?? "",
    status: post?.status ?? "draft",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(post ? `/api/admin/blog/${post.id}` : "/api/admin/blog", {
      method: post ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    pushToast({ title: post ? "Post updated" : "Post created", tone: "success" });
    router.push("/admin/blog");
    router.refresh();
  }

  async function handleDelete() {
    if (!post) return;
    const confirmed = await confirmAction({
      title: `Delete "${post.title}"?`,
      description: "This cannot be undone.",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    const res = await fetch(`/api/admin/blog/${post.id}`, { method: "DELETE" });
    if (!res.ok) {
      pushToast({ title: "Could not delete post", tone: "warning" });
      return;
    }
    pushToast({ title: "Post deleted", tone: "success" });
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div>
        <Label>Title</Label>
        <Input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div>
        <Label>Slug (optional — auto-generated from title if left blank)</Label>
        <Input
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label>Author (optional)</Label>
          <Input
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
        </div>
        <div>
          <Label>Cover image URL (optional)</Label>
          <Input
            value={form.cover_image}
            onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>
      <div>
        <Label>Excerpt (optional — shown on the blog index)</Label>
        <Textarea
          rows={2}
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
        />
      </div>
      <div>
        <Label>Content</Label>
        <Textarea
          rows={12}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="Separate paragraphs with a blank line."
        />
      </div>
      <div>
        <Label>Status</Label>
        <Select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })}
        >
          <option value="draft">Draft (not publicly visible)</option>
          <option value="published">Published</option>
        </Select>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" loading={loading}>
          {post ? "Save changes" : "Publish post"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/blog")}>
          Cancel
        </Button>
        {post && (
          <Button type="button" variant="danger" className="ml-auto" onClick={handleDelete}>
            <Trash2 size={15} /> Delete
          </Button>
        )}
      </div>
    </form>
  );
}
