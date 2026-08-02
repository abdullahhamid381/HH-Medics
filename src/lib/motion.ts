import type { Transition, Variants } from "framer-motion";

export const drawerSpring: Transition = { type: "spring", damping: 28, stiffness: 260 };

const easeOut: Transition = { duration: 0.4, ease: [0.16, 1, 0.3, 1] };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: easeOut },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: easeOut },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

// Given the OS "reduce motion" preference, collapse a variants object's
// translate/scale distances to 0 and shorten transitions to ~0, so
// Framer Motion (unlike CSS transitions) still honors the setting.
export function withReducedMotion(variants: Variants, reduced: boolean): Variants {
  if (!reduced) return variants;
  const strip = (v: Record<string, unknown>) => ({
    ...v,
    y: 0,
    x: 0,
    scale: 1,
    transition: { duration: 0.01 },
  });
  const result: Variants = {};
  for (const [key, value] of Object.entries(variants)) {
    result[key] = typeof value === "object" && value !== null ? strip(value as Record<string, unknown>) : value;
  }
  return result;
}
