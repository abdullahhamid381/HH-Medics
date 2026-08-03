"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/primitives";
import { GoogleGlyph } from "@/components/ui/google-glyph";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(
        "Incorrect email or password, or your account isn't verified yet — sign up again with the same email to get a new verification code."
      );
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-3xl text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Sign in to track orders, manage returns and check out faster.
      </p>

      <div className="mt-8 space-y-3">
        {googleEnabled && (
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-line bg-surface py-3 text-sm font-medium text-ink transition hover:bg-surface-soft"
          >
            <GoogleGlyph size={16} /> Continue with Google
          </button>
        )}

        {googleEnabled && (
          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-ink-soft">or</span>
            <div className="h-px flex-1 bg-line" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <Label>Password</Label>
              <Link href="/forgot-password" className="mb-1.5 text-xs font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>
      </div>

      <p className="mt-6 rounded-panel bg-surface-soft px-4 py-3 text-xs text-ink-soft">
        Admin login — admin@medistore.test / Admin@123
      </p>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
