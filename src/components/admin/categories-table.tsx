"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/primitives";

type CategoryRow = Category & { product_count: number };

export function CategoriesTable({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const emptyForm = { name: "", description: "", icon: "", sort_order: "0" };
  const [addForm, setAddForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: addForm.name,
        description: addForm.description || undefined,
        icon: addForm.icon || undefined,
        sort_order: parseInt(addForm.sort_order, 10) || 0,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setAddForm(emptyForm);
    setAdding(false);
    router.refresh();
  }

  function startEdit(c: CategoryRow) {
    setEditingId(c.id);
    setEditForm({
      name: c.name,
      description: c.description ?? "",
      icon: c.icon ?? "",
      sort_order: String(c.sort_order),
    });
    setError("");
  }

  async function handleEdit(id: string, e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        description: editForm.description || undefined,
        icon: editForm.icon || undefined,
        sort_order: parseInt(editForm.sort_order, 10) || 0,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(c: CategoryRow) {
    if (c.product_count > 0) {
      alert(
        `"${c.name}" has ${c.product_count} product(s) assigned. Move or delete them before removing this category.`
      );
      return;
    }
    if (!confirm(`Delete category "${c.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Could not delete category.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus size={15} /> Add category
          </Button>
        )}
      </div>

      {adding && (
        <form
          onSubmit={handleAdd}
          className="mb-5 space-y-3 rounded-2xl border border-line bg-surface p-5"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input
                required
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Icon (lucide-react name, optional)</Label>
              <Input
                value={addForm.icon}
                onChange={(e) => setAddForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="e.g. Pill"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={addForm.description}
                onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <Label>Sort order</Label>
              <Input
                type="number"
                value={addForm.sort_order}
                onChange={(e) => setAddForm((f) => ({ ...f, sort_order: e.target.value }))}
              />
            </div>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={saving}>
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setAdding(false);
                setError("");
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink-soft">
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3 font-medium">Sort</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) =>
              editingId === c.id ? (
                <tr key={c.id} className="border-b border-line last:border-0 bg-surface-soft/40">
                  <td className="px-4 py-3" colSpan={5}>
                    <form
                      onSubmit={(e) => handleEdit(c.id, e)}
                      className="flex flex-wrap items-end gap-3"
                    >
                      <div className="min-w-[160px]">
                        <Label>Name</Label>
                        <Input
                          required
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, name: e.target.value }))
                          }
                        />
                      </div>
                      <div className="min-w-[200px] flex-1">
                        <Label>Description</Label>
                        <Input
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, description: e.target.value }))
                          }
                        />
                      </div>
                      <div className="w-24">
                        <Label>Sort</Label>
                        <Input
                          type="number"
                          value={editForm.sort_order}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, sort_order: e.target.value }))
                          }
                        />
                      </div>
                      <div className="flex gap-2 pb-0.5">
                        <button
                          type="submit"
                          disabled={saving}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white disabled:opacity-50"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-soft"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </form>
                    {error && <p className="mt-2 text-sm text-danger">{error}</p>}
                  </td>
                </tr>
              ) : (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{c.name}</p>
                    {c.description && (
                      <p className="line-clamp-1 max-w-xs text-xs text-ink-soft">
                        {c.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{c.slug}</td>
                  <td className="px-4 py-3 text-ink">{c.product_count}</td>
                  <td className="px-4 py-3 text-ink-soft">{c.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(c)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-soft hover:bg-surface-soft"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-danger hover:bg-danger/10"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-soft">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
