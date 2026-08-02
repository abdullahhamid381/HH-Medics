"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Check, X, MessageSquareQuote, Star } from "lucide-react";
import type { Testimonial } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, Badge } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty-state";
import { confirmAction } from "@/store/confirm";
import { pushToast } from "@/store/toast";

const emptyForm = { author_name: "", author_detail: "", quote: "", rating: "5", sort_order: "0" };
type FormState = typeof emptyForm;

export function TestimonialsTable({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(emptyForm);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);

  function payloadFrom(form: FormState) {
    return {
      author_name: form.author_name,
      author_detail: form.author_detail || null,
      quote: form.quote,
      rating: parseInt(form.rating, 10) || 5,
      sort_order: parseInt(form.sort_order, 10) || 0,
    };
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/admin/testimonials", {
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
    pushToast({ title: "Testimonial added", tone: "success" });
    router.refresh();
  }

  function startEdit(t: Testimonial) {
    setEditingId(t.id);
    setEditForm({
      author_name: t.author_name,
      author_detail: t.author_detail ?? "",
      quote: t.quote,
      rating: String(t.rating),
      sort_order: String(t.sort_order),
    });
    setError("");
  }

  async function handleEdit(id: string, e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch(`/api/admin/testimonials/${id}`, {
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
    pushToast({ title: "Testimonial updated", tone: "success" });
    router.refresh();
  }

  async function toggleActive(t: Testimonial) {
    await fetch(`/api/admin/testimonials/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: t.active ? 0 : 1 }),
    });
    router.refresh();
  }

  async function handleDelete(t: Testimonial) {
    const confirmed = await confirmAction({
      title: `Remove ${t.author_name}'s testimonial?`,
      description: "This cannot be undone.",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    const res = await fetch(`/api/admin/testimonials/${t.id}`, { method: "DELETE" });
    if (!res.ok) {
      pushToast({ title: "Could not delete testimonial", tone: "warning" });
      return;
    }
    pushToast({ title: "Testimonial deleted", tone: "success" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAdding((v) => !v)}>
          <Plus size={15} /> {adding ? "Cancel" : "New testimonial"}
        </Button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="grid gap-3 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2">
          <div>
            <Label>Customer name</Label>
            <Input
              required
              value={addForm.author_name}
              onChange={(e) => setAddForm({ ...addForm, author_name: e.target.value })}
            />
          </div>
          <div>
            <Label>Detail (optional)</Label>
            <Input
              value={addForm.author_detail}
              onChange={(e) => setAddForm({ ...addForm, author_detail: e.target.value })}
              placeholder="Verified buyer"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Quote</Label>
            <Textarea
              required
              rows={3}
              value={addForm.quote}
              onChange={(e) => setAddForm({ ...addForm, quote: e.target.value })}
            />
          </div>
          <div>
            <Label>Rating</Label>
            <Select
              value={addForm.rating}
              onChange={(e) => setAddForm({ ...addForm, rating: e.target.value })}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? "s" : ""}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="submit" loading={saving} className="w-full">
              Create
            </Button>
          </div>
          {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
        </form>
      )}

      {testimonials.length === 0 && !adding ? (
        <EmptyState
          icon={MessageSquareQuote}
          title="No testimonials yet"
          description="Add a customer quote to build trust on the homepage."
        />
      ) : (
        <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {testimonials.map((t) =>
            editingId === t.id ? (
              <form
                key={t.id}
                onSubmit={(e) => handleEdit(t.id, e)}
                className="grid gap-3 p-5 sm:grid-cols-2"
              >
                <Input
                  required
                  value={editForm.author_name}
                  onChange={(e) => setEditForm({ ...editForm, author_name: e.target.value })}
                />
                <Input
                  value={editForm.author_detail}
                  onChange={(e) => setEditForm({ ...editForm, author_detail: e.target.value })}
                />
                <Textarea
                  required
                  rows={3}
                  className="sm:col-span-2"
                  value={editForm.quote}
                  onChange={(e) => setEditForm({ ...editForm, quote: e.target.value })}
                />
                <Select
                  value={editForm.rating}
                  onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </Select>
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
              <div key={t.id} className="flex items-start justify-between gap-4 p-5">
                <div className="flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <button onClick={() => toggleActive(t)}>
                      <Badge tone={t.active ? "primary" : "default"}>
                        {t.active ? "Visible" : "Hidden"}
                      </Badge>
                    </button>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < t.rating ? "fill-warning text-warning" : "text-line"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm italic text-ink-soft">&ldquo;{t.quote}&rdquo;</p>
                  <p className="mt-1 font-display text-sm text-ink">
                    {t.author_name}
                    {t.author_detail && (
                      <span className="ml-2 font-sans text-xs font-normal text-ink-soft">
                        {t.author_detail}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => startEdit(t)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-soft hover:bg-surface-soft"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(t)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-danger hover:bg-danger/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
