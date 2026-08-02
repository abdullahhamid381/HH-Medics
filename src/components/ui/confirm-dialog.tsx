"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { useConfirmStore, resolveConfirm } from "@/store/confirm";
import { Button } from "@/components/ui/button";
import { withReducedMotion, fadeIn, scaleIn } from "@/lib/motion";

export function ConfirmDialogHost() {
  const state = useConfirmStore();
  const reduced = !!useReducedMotion();

  return (
    <AnimatePresence>
      {state.isOpen && (
        <motion.div
          variants={withReducedMotion(fadeIn, reduced)}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
          onClick={() => resolveConfirm(false)}
        >
          <motion.div
            variants={withReducedMotion(scaleIn, reduced)}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-panel border border-line bg-surface p-6 shadow-elevated"
          >
            <div
              className={
                "flex h-11 w-11 items-center justify-center rounded-full " +
                (state.tone === "primary"
                  ? "bg-primary-soft text-primary"
                  : "bg-danger/10 text-danger")
              }
            >
              {state.tone === "primary" ? (
                <HelpCircle size={20} />
              ) : (
                <AlertTriangle size={20} />
              )}
            </div>
            <h2 className="mt-4 font-display text-lg text-ink">{state.title}</h2>
            {state.description && (
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                {state.description}
              </p>
            )}
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <Button variant="ghost" size="sm" onClick={() => resolveConfirm(false)}>
                {state.cancelLabel}
              </Button>
              <Button
                variant={state.tone === "primary" ? "primary" : "danger"}
                size="sm"
                onClick={() => resolveConfirm(true)}
              >
                {state.confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
