"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/primitives";

export function OrderTrackingForm({
  orderId,
  trackingNumber,
  carrier,
}: {
  orderId: string;
  trackingNumber: string | null;
  carrier: string | null;
}) {
  const router = useRouter();
  const [tracking, setTracking] = useState(trackingNumber ?? "");
  const [carrierName, setCarrierName] = useState(carrier ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const dirty = tracking !== (trackingNumber ?? "") || carrierName !== (carrier ?? "");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tracking_number: tracking || null,
        carrier: carrierName || null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save tracking details.");
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <p className="flex items-center gap-1.5 font-display text-sm text-ink">
        <Truck size={15} /> Shipment tracking
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Carrier</Label>
          <Input
            value={carrierName}
            onChange={(e) => setCarrierName(e.target.value)}
            placeholder="e.g. TCS, Leopards"
            className="h-9 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">Tracking ID</Label>
          <Input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="e.g. TCS-8839201"
            className="h-9 text-sm"
          />
        </div>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <Button type="submit" size="sm" variant="outline" loading={loading} disabled={!dirty}>
        {saved ? "Saved" : "Save tracking"}
      </Button>
    </form>
  );
}
