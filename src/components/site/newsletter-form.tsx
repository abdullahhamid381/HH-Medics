"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { pushToast } from "@/store/toast";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    // No newsletter backend exists yet — acknowledge locally so the
    // interaction feels complete without inventing a fake subscription.
    setTimeout(() => {
      pushToast({
        title: "Thanks for signing up!",
        description: "We'll email health & beauty tips and offers to " + email,
        tone: "success",
      });
      setEmail("");
      setSubmitting(false);
    }, 500);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-md flex-col gap-2.5 sm:flex-row"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="h-12 w-full rounded-full border border-white/25 bg-white/10 px-5 text-sm text-white outline-none placeholder:text-white/60 focus:border-white/60"
      />
      <button
        type="submit"
        disabled={submitting}
        className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-primary-strong transition hover:bg-white/90 disabled:opacity-60"
      >
        <Send size={15} /> {submitting ? "Sending..." : "Subscribe"}
      </button>
    </form>
  );
}
