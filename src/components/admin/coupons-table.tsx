"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Check, X, Ticket } from "lucide-react";
import type { Coupon } from "@/lib/db/coupons";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty-state";
import { confirmAction } from "@/store/confirm";
import { pushToast } from "@/store/toast";
import { formatDate } from "@/lib/utils";

const emptyForm = { code: "", discount_percent: "10", expires_at: "" };

export function CouponsTable({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: addForm.code,
        discount_percent: parseInt(addForm.discount_percent, 10) || 0,
        expires_at: addForm.expires_at || null,
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
    pushToast({ title: "Coupon created", tone: "success" });
    router.refresh();
  }

  function startEdit(c: Coupon) {
    setEditingId(c.id);
    setEditForm({
      code: c.code,
      discount_percent: String(c.discount_percent),
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : "",
    });
    setError("");
  }

  async function handleEdit(id: string, e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch(`/api/admin/coupons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: editForm.code,
        discount_percent: parseInt(editForm.discount_percent, 10) || 0,
        expires_at: editForm.expires_at || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setEditingId(null);
    pushToast({ title: "Coupon updated", tone: "success" });
    router.refresh();
  }

  async function toggleActive(c: Coupon) {
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: c.active ? 0 : 1 }),
    });
    router.refresh();
  }

  async function handleDelete(c: Coupon) {
    const confirmed = await confirmAction({
      title: `Delete "${c.code}"?`,
      description: "This cannot be undone.",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    const res = await fetch(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
    if (!res.ok) {
      pushToast({ title: "Could not delete coupon", tone: "warning" });
      return;
    }
    pushToast({ title: "Coupon deleted", tone: "success" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAdding((v) => !v)}>
          <Plus size={15} /> {adding ? "Cancel" : "New coupon"}
        </Button>
      </div>

      {adding && (
        <form
          onSubmit={handleAdd}
          className="grid gap-3 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-4"
        >
          <div>
            <Label>Code</Label>
            <Input
              required
              value={addForm.code}
              onChange={(e) => setAddForm({ ...addForm, code: e.target.value.toUpperCase() })}
              placeholder="SAVE10"
            />
          </div>
          <div>
            <Label>Discount %</Label>
            <Input
              required
              type="number"
              min={1}
              max={100}
              value={addForm.discount_percent}
              onChange={(e) => setAddForm({ ...addForm, discount_percent: e.target.value })}
            />
          </div>
          <div>
            <Label>Expires (optional)</Label>
            <Input
              type="date"
              value={addForm.expires_at}
              onChange={(e) => setAddForm({ ...addForm, expires_at: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" loading={saving} className="w-full">
              Create
            </Button>
          </div>
          {error && <p className="text-sm text-danger sm:col-span-4">{error}</p>}
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        {coupons.length === 0 && !adding ? (
          <EmptyState
            icon={Ticket}
            title="No coupons yet"
            description="Create a discount code customers can apply at checkout."
            className="border-none"
          />
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-soft">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) =>
                editingId === c.id ? (
                  <tr key={c.id} className="border-b border-line last:border-0">
                    <td colSpan={5} className="p-4">
                      <form
                        onSubmit={(e) => handleEdit(c.id, e)}
                        className="grid gap-3 sm:grid-cols-4"
                      >
                        <Input
                          required
                          value={editForm.code}
                          onChange={(e) =>
                            setEditForm({ ...editForm, code: e.target.value.toUpperCase() })
                          }
                        />
                        <Input
                          required
                          type="number"
                          min={1}
                          max={100}
                          value={editForm.discount_percent}
                          onChange={(e) =>
                            setEditForm({ ...editForm, discount_percent: e.target.value })
                          }
                        />
                        <Input
                          type="date"
                          value={editForm.expires_at}
                          onChange={(e) => setEditForm({ ...editForm, expires_at: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" loading={saving}>
                            <Check size={14} />
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
                        {error && (
                          <p className="text-sm text-danger sm:col-span-4">{error}</p>
                        )}
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={c.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-mono font-medium text-ink">{c.code}</td>
                    <td className="px-4 py-3 text-ink">{c.discount_percent}%</td>
                    <td className="px-4 py-3 text-ink-soft">
                      {c.expires_at ? formatDate(c.expires_at) : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(c)}>
                        <Badge tone={c.active ? "primary" : "default"}>
                          {c.active ? "Active" : "Inactive"}
                        </Badge>
                      </button>
                    </td>
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
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
