"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Banknote } from "lucide-react";
import type { ReturnStatus } from "@/types";
import { Button } from "@/components/ui/button";

export function ReturnActions({
  returnId,
  status,
}: {
  returnId: string;
  status: ReturnStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<ReturnStatus | null>(null);

  async function updateStatus(next: ReturnStatus) {
    setLoading(next);
    await fetch(`/api/admin/returns/${returnId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(null);
    router.refresh();
  }

  if (status === "requested") {
    return (
      <div className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          loading={loading === "rejected"}
          onClick={() => updateStatus("rejected")}
        >
          <X size={13} /> Reject
        </Button>
        <Button
          size="sm"
          loading={loading === "approved"}
          onClick={() => updateStatus("approved")}
        >
          <Check size={13} /> Approve
        </Button>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div className="flex justify-end">
        <Button size="sm" loading={loading === "refunded"} onClick={() => updateStatus("refunded")}>
          <Banknote size={13} /> Mark refunded
        </Button>
      </div>
    );
  }

  return <span className="text-xs text-ink-soft">No action needed</span>;
}
