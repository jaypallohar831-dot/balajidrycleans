"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { siteConfig, getWhatsAppLink } from "@/config/site";

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const [showTooltip, setShowTooltip] = useState(false);
  const prefersReduced = useReducedMotion();

  if (pathname?.startsWith("/admin")) return null;

  const whatsappUrl = getWhatsAppLink(
    `Namaste ${siteConfig.name}! Mujhe dry cleaning service ke baare mein poochna hai.`
  );

  return (
    <aside
      aria-label="WhatsApp quick contact"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center justify-end pointer-events-auto"
    >
      <div className="relative flex items-center">
        {/* Tooltip on hover (desktop) */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              role="tooltip"
              initial={{ opacity: 0, x: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="hidden sm:block absolute right-full mr-3 px-3.5 py-1.5 rounded-full bg-[#0B2540] text-white text-xs font-bold shadow-lg whitespace-nowrap pointer-events-none border border-slate-700/50"
            >
              <span>WhatsApp karein</span>
              {/* Pointer Triangle */}
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-[#0B2540] rotate-45 border-r border-t border-slate-700/50" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulsing Ring Behind Button */}
        {!prefersReduced && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none"
          />
        )}

        {/* Circular Green Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          aria-label="WhatsApp karein"
          className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
        >
          <MessageCircle className="w-7 h-7 sm:w-7.5 sm:h-7.5 fill-white/20 stroke-[2.2]" />
        </a>
      </div>
    </aside>
  );
}
