"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Check, X, HelpCircle } from "lucide-react";
import type { Faq } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Badge } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty-state";
import { confirmAction } from "@/store/confirm";
import { pushToast } from "@/store/toast";

const emptyForm = { question: "", answer: "", sort_order: "0" };
type FormState = typeof emptyForm;

export function FaqsTable({ faqs }: { faqs: Faq[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(emptyForm);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);

  function payloadFrom(form: FormState) {
    return {
      question: form.question,
      answer: form.answer,
      sort_order: parseInt(form.sort_order, 10) || 0,
    };
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/admin/faqs", {
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
    pushToast({ title: "FAQ added", tone: "success" });
    router.refresh();
  }

  function startEdit(f: Faq) {
    setEditingId(f.id);
    setEditForm({ question: f.question, answer: f.answer, sort_order: String(f.sort_order) });
    setError("");
  }

  async function handleEdit(id: string, e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch(`/api/admin/faqs/${id}`, {
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
    pushToast({ title: "FAQ updated", tone: "success" });
    router.refresh();
  }

  async function toggleActive(f: Faq) {
    await fetch(`/api/admin/faqs/${f.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: f.active ? 0 : 1 }),
    });
    router.refresh();
  }

  async function handleDelete(f: Faq) {
    const confirmed = await confirmAction({
      title: "Delete this FAQ?",
      description: "This cannot be undone.",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    const res = await fetch(`/api/admin/faqs/${f.id}`, { method: "DELETE" });
    if (!res.ok) {
      pushToast({ title: "Could not delete FAQ", tone: "warning" });
      return;
    }
    pushToast({ title: "FAQ deleted", tone: "success" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAdding((v) => !v)}>
          <Plus size={15} /> {adding ? "Cancel" : "New FAQ"}
        </Button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="space-y-3 rounded-2xl border border-line bg-surface p-5">
          <div>
            <Label>Question</Label>
            <Input
              required
              value={addForm.question}
              onChange={(e) => setAddForm({ ...addForm, question: e.target.value })}
            />
          </div>
          <div>
            <Label>Answer</Label>
            <Textarea
              required
              rows={3}
              value={addForm.answer}
              onChange={(e) => setAddForm({ ...addForm, answer: e.target.value })}
            />
          </div>
          <div className="flex items-end gap-3">
            <div className="w-32">
              <Label>Sort order</Label>
              <Input
                type="number"
                value={addForm.sort_order}
                onChange={(e) => setAddForm({ ...addForm, sort_order: e.target.value })}
              />
            </div>
            <Button type="submit" loading={saving}>
              Create
            </Button>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
        </form>
      )}

      {faqs.length === 0 && !adding ? (
        <EmptyState
          icon={HelpCircle}
          title="No FAQs yet"
          description="Add common questions to show on the homepage."
        />
      ) : (
        <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {faqs.map((f) =>
            editingId === f.id ? (
              <form
                key={f.id}
                onSubmit={(e) => handleEdit(f.id, e)}
                className="space-y-3 p-5"
              >
                <Input
                  required
                  value={editForm.question}
                  onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                />
                <Textarea
                  required
                  rows={3}
                  value={editForm.answer}
                  onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                />
                <div className="flex items-end gap-3">
                  <div className="w-32">
                    <Input
                      type="number"
                      value={editForm.sort_order}
                      onChange={(e) => setEditForm({ ...editForm, sort_order: e.target.value })}
                    />
                  </div>
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
                {error && <p className="text-sm text-danger">{error}</p>}
              </form>
            ) : (
              <div key={f.id} className="flex items-start justify-between gap-4 p-5">
                <div className="flex-1">
                  <button onClick={() => toggleActive(f)} className="mb-1.5">
                    <Badge tone={f.active ? "primary" : "default"}>
                      {f.active ? "Visible" : "Hidden"}
                    </Badge>
                  </button>
                  <p className="font-display text-[15px] text-ink">{f.question}</p>
                  <p className="mt-1 text-sm text-ink-soft">{f.answer}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => startEdit(f)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-soft hover:bg-surface-soft"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(f)}
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
