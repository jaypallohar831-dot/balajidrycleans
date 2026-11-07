"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Snowflake, MessageCircle, ArrowRight } from "lucide-react";
import { siteConfig, getWhatsAppLink } from "@/config/site";

const WINTER_ITEMS = [
  "Rajai",
  "Kambal",
  "Sweater",
  "Jacket",
  "Shawl",
  "Topi-muffler",
];

export function WinterBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInView = useInView(containerRef, { margin: "100px" });
  const prefersReduced = useReducedMotion();

  // Canvas-based lightweight falling snowflakes
  useEffect(() => {
    if (prefersReduced || !isInView) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    // Generate 28 lightweight flakes
    const flakes = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 1,
      speed: Math.random() * 0.7 + 0.35,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.01,
      opacity: Math.random() * 0.5 + 0.25,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (const flake of flakes) {
        flake.y += flake.speed;
        flake.wobble += flake.wobbleSpeed;
        flake.x += Math.sin(flake.wobble) * 0.45;

        // Wrap around bottom
        if (flake.y > height + 5) {
          flake.y = -5;
          flake.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isInView, prefersReduced]);

  const whatsappUrl = getWhatsAppLink(
    `Namaste ${siteConfig.name}! Sardi ke kapde (Rajai/Kambal/Sweater/Jacket) dry clean karwane hain.`
  );

  return (
    <section className="w-full px-3 sm:px-6 py-8 sm:py-12 max-w-[1240px] mx-auto">
      <div
        ref={containerRef}
        className="relative rounded-[32px] overflow-hidden bg-[#0B2540] text-white p-6 sm:p-10 md:p-14 border border-sky-400/20 shadow-elevated"
      >
        {/* Subtle Decorative Background Snowflake Grid Pattern */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.04] pointer-events-none select-none bg-[radial-gradient(#38A8F5_1px,transparent_1px)] [background-size:24px_24px]"
        />

        {/* Ambient Sky Glow at corners */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#38A8F5]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#1278BF]/25 blur-3xl pointer-events-none" />

        {/* Canvas for Falling Snowflakes */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Content */}
        <div className="relative z-20 max-w-3xl">
          {/* Eyebrow with Snowflake icon */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#A5D8FB] bg-white/10 rounded-full border border-white/15 backdrop-blur-md mb-4 sm:mb-5"
          >
            <Snowflake className="w-4 h-4 text-[#6EC0F8] animate-spin-slow" />
            <span>Winter Special Care</span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-3xl sm:text-4xl lg:text-4.5xl font-extrabold tracking-tight leading-tight text-white"
          >
            Sardi aa gayi, rajai aur sweater saaf karwa lein
          </motion.h2>

          {/* Hinglish Subtext */}
          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mt-3.5 sm:mt-4 text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl"
          >
            Mausam badalte hi apne winter collection aur heavy blankets ko
            hygienic deep clean karwayein. Bina shrink hue, fresh khushbu aur
            100% dust-mite free protection ke sath.
          </motion.p>

          {/* Item Chips */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="mt-6 sm:mt-7 flex flex-wrap gap-2 sm:gap-2.5 items-center"
          >
            {WINTER_ITEMS.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-white/95 bg-white/10 border border-white/15 backdrop-blur-sm shadow-xs hover:bg-white/20 hover:border-sky-300/40 transition-colors cursor-default"
              >
                {item}
              </span>
            ))}
          </motion.div>

          {/* CTA Sky-blue Pill Button */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="mt-8 sm:mt-9"
          >
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 min-h-[48px] rounded-full font-bold text-sm sm:text-base text-white bg-[#38A8F5] hover:bg-[#1B96E6] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg shadow-sky-500/25"
            >
              <MessageCircle className="w-4 h-4 fill-white/25 stroke-[2.2]" />
              <span>WhatsApp par booking karein</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
