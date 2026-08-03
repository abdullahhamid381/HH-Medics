"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/primitives";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-3xl text-ink">Forgot your password?</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Enter your email and we&apos;ll send you a code to reset it.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <Label>Email</Label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              placeholder="you@example.com"
            />
          </div>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Send reset code
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
