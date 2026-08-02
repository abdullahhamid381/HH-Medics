"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeIn, fadeUp, staggerContainer, withReducedMotion } from "@/lib/motion";

// Thin scroll-reveal wrapper for server-component pages (homepage etc.) —
// keeps the page itself a server component while isolating the one client
// boundary Framer Motion needs.
export function AnimatedSection({
  children,
  className,
  variant = "fadeUp",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "fadeUp" | "fadeIn";
}) {
  const reduced = !!useReducedMotion();
  const base = variant === "fadeIn" ? fadeIn : fadeUp;
  return (
    <motion.div
      className={className}
      variants={withReducedMotion(base, reduced)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

// Parent for a staggered grid — pair with <AnimatedItem> children.
export function AnimatedGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = !!useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={withReducedMotion(staggerContainer, reduced)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = !!useReducedMotion();
  return (
    <motion.div className={className} variants={withReducedMotion(fadeUp, reduced)}>
      {children}
    </motion.div>
  );
}
