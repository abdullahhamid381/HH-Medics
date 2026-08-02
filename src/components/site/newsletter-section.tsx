"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pushToast } from "@/store/toast";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        pushToast({ title: data.error ?? "Could not subscribe", tone: "warning" });
        return;
      }
      setEmail("");
      pushToast({
        title: data.alreadySubscribed ? "You're already on the list" : "You're on the list",
        description: "We'll only email about restocks and real offers.",
        tone: "success",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="label-notch flex flex-col items-center gap-5 rounded-hero border border-line bg-surface px-6 py-10 text-center sm:px-12">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Mail size={19} />
        </span>
        <div>
          <h2 className="font-display text-xl text-ink sm:text-2xl">
            Get restock alerts and honest deals
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
            No spam — just a note when something you browse comes back in
            stock or drops in price.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-sm flex-col gap-2.5 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 w-full rounded-full border border-line bg-bg px-4 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-primary"
          />
          <Button type="submit" loading={submitting} className="shrink-0">
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
}
