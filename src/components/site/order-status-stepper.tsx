"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function OrderStatusStepper({
  steps,
  currentStepIndex,
}: {
  steps: string[];
  currentStepIndex: number;
}) {
  const reduced = !!useReducedMotion();

  return (
    <div className="mb-10 flex items-center">
      {steps.map((step, i) => (
        <div key={step} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 text-xs font-semibold",
                i <= currentStepIndex ? "border-primary text-white" : "border-line text-ink-soft"
              )}
            >
              {i <= currentStepIndex && (
                <motion.div
                  initial={reduced ? { scale: 1 } : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={reduced ? { duration: 0.01 } : { type: "spring", damping: 15, stiffness: 260 }}
                  className="absolute inset-0 bg-primary"
                />
              )}
              <span className="relative z-10">{i + 1}</span>
            </div>
            <span className="text-[11px] capitalize text-ink-soft">{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="mx-2 h-0.5 flex-1 overflow-hidden bg-line">
              <motion.div
                initial={reduced ? false : { scaleX: 0 }}
                animate={{ scaleX: i < currentStepIndex ? 1 : 0 }}
                transition={reduced ? { duration: 0.01 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "left" }}
                className="h-full bg-primary"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
