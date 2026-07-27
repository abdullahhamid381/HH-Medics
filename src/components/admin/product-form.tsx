"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/primitives";

const TYPES = [
  { value: "medicine", label: "Medicine" },
  { value: "supplement", label: "Supplement" },
  { value: "facewash", label: "Face Wash" },
  { value: "serum", label: "Serum" },
  { value: "cosmetic", label: "Cosmetic" },
  { value: "general", label: "General" },
];

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    brand: product?.brand ?? "",
    type: product?.type ?? "medicine",
    category_id: product?.category_id ?? categories[0]?.id ?? "",
    price: product?.price?.toString() ?? "",
    compare_at_price: product?.compare_at_price?.toString() ?? "",
    cost_price: product?.cost_price?.toString() ?? "",
    stock: product?.stock?.toString() ?? "",
    sku: product?.sku ?? "",
    unit: product?.unit ?? "",
    image: product?.image ?? "",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    requires_prescription: product?.requires_prescription === 1,
    featured: product?.featured === 1,
    status: product?.status ?? "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      name: form.name,
      brand: form.brand,
      type: form.type as Product["type"],
      category_id: form.category_id,
      price: parseFloat(form.price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
      stock: parseInt(form.stock, 10),
      sku: form.sku,
      unit: form.unit,
      image: form.image || `https://picsum.photos/seed/${encodeURIComponent(form.name)}/640/640`,
      short_description: form.short_description,
      description: form.description,
      requires_prescription: form.requires_prescription,
      featured: form.featured,
      status: form.status as Product["status"],
    };

    try {
      const res = await fetch(
        isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-4 font-display text-lg text-ink">Basic information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Product name</Label>
            <Input required value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <Label>Brand</Label>
            <Input required value={form.brand} onChange={(e) => update("brand", e.target.value)} />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={form.type} onChange={(e) => update("type", e.target.value as typeof form.type)}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select
              value={form.category_id}
              onChange={(e) => update("category_id", e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Unit (e.g. &quot;30 tablets&quot;)</Label>
            <Input value={form.unit} onChange={(e) => update("unit", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Image URL (optional — a placeholder is used if left blank)</Label>
            <Input value={form.image} onChange={(e) => update("image", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Short description</Label>
            <Input
              required
              value={form.short_description}
              onChange={(e) => update("short_description", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Full description</Label>
            <Textarea
              rows={4}
              required
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-4 font-display text-lg text-ink">Pricing & inventory</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Price (PKR)</Label>
            <Input
              type="number"
              required
              min={0}
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
            />
          </div>
          <div>
            <Label>Compare-at price (optional)</Label>
            <Input
              type="number"
              min={0}
              value={form.compare_at_price}
              onChange={(e) => update("compare_at_price", e.target.value)}
            />
          </div>
          <div>
            <Label>Cost price (optional, not shown to customers)</Label>
            <Input
              type="number"
              min={0}
              value={form.cost_price}
              onChange={(e) => update("cost_price", e.target.value)}
            />
            {form.cost_price && form.price && parseFloat(form.price) > 0 && (
              <p className="mt-1 text-xs text-ink-soft">
                Margin:{" "}
                <span
                  className={
                    parseFloat(form.price) - parseFloat(form.cost_price) >= 0
                      ? "text-primary"
                      : "text-danger"
                  }
                >
                  {(
                    ((parseFloat(form.price) - parseFloat(form.cost_price)) /
                      parseFloat(form.price)) *
                    100
                  ).toFixed(1)}
                  %
                </span>{" "}
                per unit
              </p>
            )}
          </div>
          <div>
            <Label>Stock quantity</Label>
            <Input
              type="number"
              required
              min={0}
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>SKU</Label>
            <Input required value={form.sku} onChange={(e) => update("sku", e.target.value)} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onChange={(e) => update("status", e.target.value as typeof form.status)}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.requires_prescription}
              onChange={(e) => update("requires_prescription", e.target.checked)}
              className="h-4 w-4 rounded border-line accent-primary"
            />
            Requires prescription
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update("featured", e.target.checked)}
              className="h-4 w-4 rounded border-line accent-primary"
            />
            Featured on homepage
          </label>
        </div>
      </section>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          {isEdit ? "Save changes" : "Create product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
