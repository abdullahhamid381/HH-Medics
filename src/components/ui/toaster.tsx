"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, Info, AlertTriangle, PackageCheck } from "lucide-react";
import { useToast, type ToastTone } from "@/store/toast";
import { cn } from "@/lib/utils";

const ICONS: Record<ToastTone, typeof PackageCheck> = {
  default: PackageCheck,
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
};

const TONE_CLASSES: Record<ToastTone, string> = {
  default: "border-line bg-surface text-ink",
  success: "border-primary/30 bg-primary-soft text-primary-strong",
  info: "border-accent/30 bg-accent-soft text-accent",
  warning: "border-warning/30 bg-warning/10 text-warning",
};

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = ICONS[t.tone ?? "default"];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-lg shadow-black/10 backdrop-blur",
                TONE_CLASSES[t.tone ?? "default"]
              )}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs opacity-80">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 opacity-60 transition hover:opacity-100"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
