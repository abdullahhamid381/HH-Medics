"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyCouponButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button size="sm" variant={copied ? "primary" : "outline"} onClick={handleCopy}>
      {copied ? (
        <>
          <Check size={14} /> Copied
        </>
      ) : (
        <>
          <Copy size={14} /> Copy code
        </>
      )}
    </Button>
  );
}
