"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Tag, Banknote, CreditCard, ShieldCheck } from "lucide-react";
import { useCart, cartSubtotal } from "@/store/cart";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/primitives";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const subtotal = cartSubtotal(lines);

  const [form, setForm] = useState({
    fullName: session?.user?.name ?? "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const discount = Math.round((subtotal * discountPercent) / 100);
  const shippingFee = subtotal - discount > 3000 ? 0 : 200;
  const total = subtotal - discount + shippingFee;

  function updateField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function applyCoupon() {
    setCouponError("");
    const known: Record<string, number> = { WELCOME10: 10, HEALTH20: 20 };
    const percent = known[couponInput.toUpperCase()];
    if (!percent) {
      setCouponError("That coupon code isn't valid or has expired.");
      setAppliedCoupon(null);
      setDiscountPercent(0);
      return;
    }
    setAppliedCoupon(couponInput.toUpperCase());
    setDiscountPercent(percent);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (status !== "authenticated") {
      router.push("/login?callbackUrl=/checkout");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
          couponCode: appliedCoupon ?? undefined,
          paymentMethod,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong placing your order.");
        setLoading(false);
        return;
      }
      clear();
      router.push(`/account/orders/${data.order.id}?placed=1`);
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-2xl text-ink">Your cart is empty</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Add a few products before checking out.
        </p>
        <Button className="mt-5" onClick={() => router.push("/shop")}>
          Browse the shop
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-3xl text-ink">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="mb-4 font-display text-lg text-ink">
              Delivery details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Full name</Label>
                <Input
                  required
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                />
              </div>
              <div>
                <Label>Phone number</Label>
                <Input
                  required
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="03XX-XXXXXXX"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Address</Label>
                <Input
                  required
                  value={form.addressLine1}
                  onChange={(e) => updateField("addressLine1", e.target.value)}
                  placeholder="House, street, area"
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  required
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                />
              </div>
              <div>
                <Label>State / Province</Label>
                <Input
                  required
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                />
              </div>
              <div>
                <Label>Postal code</Label>
                <Input
                  required
                  value={form.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Delivery notes (optional)</Label>
                <Textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Gate code, landmark, preferred time..."
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="mb-4 font-display text-lg text-ink">
              Payment method
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4 text-left transition",
                  paymentMethod === "cod"
                    ? "border-primary bg-primary-soft"
                    : "border-line hover:bg-surface-soft"
                )}
              >
                <Banknote size={20} className="text-primary" />
                <div>
                  <p className="text-sm font-medium text-ink">Cash on delivery</p>
                  <p className="text-xs text-ink-soft">Pay when your order arrives</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4 text-left transition",
                  paymentMethod === "card"
                    ? "border-primary bg-primary-soft"
                    : "border-line hover:bg-surface-soft"
                )}
              >
                <CreditCard size={20} className="text-primary" />
                <div>
                  <p className="text-sm font-medium text-ink">Credit / debit card</p>
                  <p className="text-xs text-ink-soft">Simulated for this demo</p>
                </div>
              </button>
            </div>

            {paymentMethod === "card" && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Card number</Label>
                  <Input placeholder="4242 4242 4242 4242" maxLength={19} />
                </div>
                <div>
                  <Label>Expiry</Label>
                  <Input placeholder="MM/YY" maxLength={5} />
                </div>
                <div>
                  <Label>CVC</Label>
                  <Input placeholder="123" maxLength={3} />
                </div>
                <p className="flex items-center gap-1.5 text-xs text-ink-soft sm:col-span-2">
                  <ShieldCheck size={13} /> No real payment is processed in this demo.
                </p>
              </div>
            )}
          </section>
        </div>

        <div className="h-fit space-y-4 rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-lg text-ink">Order summary</h2>
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {lines.map((l) => (
              <div key={l.productId} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-soft">
                  {l.image && (
                    <Image src={l.image} alt={l.name} fill sizes="56px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 text-sm">
                  <p className="line-clamp-1 text-ink">{l.name}</p>
                  <p className="text-xs text-ink-soft">Qty {l.quantity}</p>
                </div>
                <span className="font-mono text-sm text-ink">
                  {formatCurrency(l.price * l.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="label-perforation" />

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
              <Input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Coupon code"
                className="pl-9"
              />
            </div>
            <Button type="button" variant="outline" onClick={applyCoupon}>
              Apply
            </Button>
          </div>
          {couponError && <p className="text-xs text-danger">{couponError}</p>}
          {appliedCoupon && (
            <p className="text-xs text-primary">
              {appliedCoupon} applied — {discountPercent}% off
            </p>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-ink-soft">
              <span>Subtotal</span>
              <span className="font-mono text-ink">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-primary">
                <span>Discount</span>
                <span className="font-mono">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink-soft">
              <span>Shipping</span>
              <span className="font-mono text-ink">
                {shippingFee === 0 ? "Free" : formatCurrency(shippingFee)}
              </span>
            </div>
          </div>

          <div className="label-perforation" />

          <div className="flex justify-between font-display text-lg text-ink">
            <span>Total</span>
            <span className="font-mono">{formatCurrency(total)}</span>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Place order
          </Button>
          {status !== "authenticated" && (
            <p className="text-center text-xs text-ink-soft">
              You&apos;ll be asked to sign in to complete your order.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
