"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/primitives";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16 text-center">
        <h1 className="font-display text-3xl text-ink">Password updated</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Redirecting you to sign in&hellip;
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-3xl text-ink">Reset your password</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Enter the code we emailed you, along with your new password.
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
        <div>
          <Label>Verification code</Label>
          <div className="relative">
            <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <Input
              required
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="pl-10 tracking-widest"
              placeholder="123456"
            />
          </div>
        </div>
        <div>
          <Label>New password</Label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              placeholder="At least 6 characters"
            />
          </div>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Reset password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Didn&apos;t get a code?{" "}
        <Link href="/forgot-password" className="font-medium text-primary hover:underline">
          Request a new one
        </Link>
      </p>
    </div>
  );
}
