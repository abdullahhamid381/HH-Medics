"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Pencil, Trash2, Check, X, Image as ImageIcon } from "lucide-react";
import type { Banner } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Badge } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty-state";
import { confirmAction } from "@/store/confirm";
import { pushToast } from "@/store/toast";

const emptyForm = {
  title: "",
  subtitle: "",
  image: "",
  link_href: "",
  cta_label: "",
  sort_order: "0",
};
type FormState = typeof emptyForm;

export function BannersTable({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(emptyForm);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);

  function payloadFrom(form: FormState) {
    return {
      title: form.title,
      subtitle: form.subtitle || null,
      image: form.image,
      link_href: form.link_href || null,
      cta_label: form.cta_label || null,
      sort_order: parseInt(form.sort_order, 10) || 0,
    };
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadFrom(addForm)),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setAddForm(emptyForm);
    setAdding(false);
    pushToast({ title: "Banner created", tone: "success" });
    router.refresh();
  }

  function startEdit(b: Banner) {
    setEditingId(b.id);
    setEditForm({
      title: b.title,
      subtitle: b.subtitle ?? "",
      image: b.image,
      link_href: b.link_href ?? "",
      cta_label: b.cta_label ?? "",
      sort_order: String(b.sort_order),
    });
    setError("");
  }

  async function handleEdit(id: string, e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch(`/api/admin/banners/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadFrom(editForm)),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setEditingId(null);
    pushToast({ title: "Banner updated", tone: "success" });
    router.refresh();
  }

  async function toggleActive(b: Banner) {
    await fetch(`/api/admin/banners/${b.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: b.active ? 0 : 1 }),
    });
    router.refresh();
  }

  async function handleDelete(b: Banner) {
    const confirmed = await confirmAction({
      title: `Delete "${b.title}"?`,
      description: "This cannot be undone.",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    const res = await fetch(`/api/admin/banners/${b.id}`, { method: "DELETE" });
    if (!res.ok) {
      pushToast({ title: "Could not delete banner", tone: "warning" });
      return;
    }
    pushToast({ title: "Banner deleted", tone: "success" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAdding((v) => !v)}>
          <Plus size={15} /> {adding ? "Cancel" : "New banner"}
        </Button>
      </div>

      {adding && (
        <form
          onSubmit={handleAdd}
          className="grid gap-3 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2"
        >
          <div>
            <Label>Title</Label>
            <Input
              required
              value={addForm.title}
              onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
            />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input
              value={addForm.subtitle}
              onChange={(e) => setAddForm({ ...addForm, subtitle: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Image URL</Label>
            <Input
              required
              value={addForm.image}
              onChange={(e) => setAddForm({ ...addForm, image: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label>Link (optional)</Label>
            <Input
              value={addForm.link_href}
              onChange={(e) => setAddForm({ ...addForm, link_href: e.target.value })}
              placeholder="/shop?category=serums"
            />
          </div>
          <div>
            <Label>Button label (optional)</Label>
            <Input
              value={addForm.cta_label}
              onChange={(e) => setAddForm({ ...addForm, cta_label: e.target.value })}
              placeholder="Shop now"
            />
          </div>
          <div>
            <Label>Sort order</Label>
            <Input
              type="number"
              value={addForm.sort_order}
              onChange={(e) => setAddForm({ ...addForm, sort_order: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" loading={saving} className="w-full">
              Create
            </Button>
          </div>
          {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
        </form>
      )}

      {banners.length === 0 && !adding ? (
        <EmptyState
          icon={ImageIcon}
          title="No banners yet"
          description="Add a promotional banner to feature on the homepage."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {banners.map((b) =>
            editingId === b.id ? (
              <form
                key={b.id}
                onSubmit={(e) => handleEdit(b.id, e)}
                className="col-span-full grid gap-3 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2"
              >
                <Input
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
                <Input
                  value={editForm.subtitle}
                  onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                />
                <Input
                  required
                  className="sm:col-span-2"
                  value={editForm.image}
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                />
                <Input
                  value={editForm.link_href}
                  onChange={(e) => setEditForm({ ...editForm, link_href: e.target.value })}
                />
                <Input
                  value={editForm.cta_label}
                  onChange={(e) => setEditForm({ ...editForm, cta_label: e.target.value })}
                />
                <Input
                  type="number"
                  value={editForm.sort_order}
                  onChange={(e) => setEditForm({ ...editForm, sort_order: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" loading={saving}>
                    <Check size={14} /> Save
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(null)}
                  >
                    <X size={14} />
                  </Button>
                </div>
                {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
              </form>
            ) : (
              <div
                key={b.id}
                className="overflow-hidden rounded-2xl border border-line bg-surface"
              >
                <div className="relative aspect-[21/9] bg-surface-soft">
                  {b.image && (
                    <Image src={b.image} alt={b.title} fill sizes="400px" className="object-cover" />
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-display text-sm text-ink">{b.title}</p>
                    <button onClick={() => toggleActive(b)} className="mt-1">
                      <Badge tone={b.active ? "primary" : "default"}>
                        {b.active ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(b)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-soft hover:bg-surface-soft"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(b)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-danger hover:bg-danger/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
