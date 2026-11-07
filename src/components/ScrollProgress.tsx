"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const prefersReduced = useReducedMotion();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  if (prefersReduced) return null;

  return (
    <motion.div
      style={{ scaleX }}
      aria-hidden="true"
      className="fixed top-0 inset-x-0 h-1 bg-gradient-to-r from-[#38A8F5] via-[#1B96E6] to-[#0E5E99] origin-left z-[60] pointer-events-none shadow-xs"
    />
  );
}
