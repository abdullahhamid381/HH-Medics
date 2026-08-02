"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { CmsPage } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/primitives";
import { confirmAction } from "@/store/confirm";
import { pushToast } from "@/store/toast";

export function CmsPageForm({ page }: { page?: CmsPage }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: page?.title ?? "",
    slug: page?.slug ?? "",
    content: page?.content ?? "",
    status: page?.status ?? "draft",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(page ? `/api/admin/cms-pages/${page.id}` : "/api/admin/cms-pages", {
      method: page ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    pushToast({ title: page ? "Page updated" : "Page created", tone: "success" });
    router.push("/admin/cms-pages");
    router.refresh();
  }

  async function handleDelete() {
    if (!page) return;
    const confirmed = await confirmAction({
      title: `Delete "${page.title}"?`,
      description: "This cannot be undone.",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    const res = await fetch(`/api/admin/cms-pages/${page.id}`, { method: "DELETE" });
    if (!res.ok) {
      pushToast({ title: "Could not delete page", tone: "warning" });
      return;
    }
    pushToast({ title: "Page deleted", tone: "success" });
    router.push("/admin/cms-pages");
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
          placeholder="shipping-info"
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
          {page ? "Save changes" : "Create page"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/cms-pages")}>
          Cancel
        </Button>
        {page && (
          <Button type="button" variant="danger" className="ml-auto" onClick={handleDelete}>
            <Trash2 size={15} /> Delete
          </Button>
        )}
      </div>
    </form>
  );
}
