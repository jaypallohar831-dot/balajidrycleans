"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import {
  motion,
  useInView,
  useReducedMotion,
  animate,
} from "framer-motion";
import { MapPin, MessageCircle, ArrowDown, Sparkles } from "lucide-react";
import { siteConfig, getWhatsAppLink } from "@/config/site";

// Helper for count-up animation
function StatCounter({ rawValue }: { rawValue: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  const prefersReduced = useReducedMotion();

  // Extract number and suffix (e.g. "50,000+" -> num: 50000, suffix: "+")
  const numericPart = parseInt(rawValue.replace(/[^0-9]/g, ""), 10) || 0;
  const suffix = rawValue.replace(/[0-9,]/g, "");

  const [displayValue, setDisplayValue] = useState(
    prefersReduced ? rawValue : "0" + suffix
  );

  useEffect(() => {
    if (!isInView || prefersReduced) return;

    const controls = animate(0, numericPart, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        const rounded = Math.floor(latest);
        setDisplayValue(rounded.toLocaleString("en-IN") + suffix);
      },
    });

    return () => controls.stop();
  }, [isInView, numericPart, suffix, prefersReduced]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}
    </span>
  );
}

// Soap bubbles configuration
const BUBBLES = [
  { size: 44, left: "15%", delay: 0, duration: 6, xWobble: 18 },
  { size: 28, left: "32%", delay: 1.8, duration: 5.2, xWobble: -14 },
  { size: 56, left: "55%", delay: 0.9, duration: 6.8, xWobble: 22 },
  { size: 22, left: "70%", delay: 2.6, duration: 4.8, xWobble: -16 },
  { size: 36, left: "82%", delay: 1.2, duration: 5.8, xWobble: 20 },
  { size: 48, left: "42%", delay: 3.4, duration: 6.2, xWobble: -18 },
];

export function Hero() {
  const prefersReduced = useReducedMotion();

  const headlineWords = ["Kapde", "wahi,", "chamak", "nayi."];

  const handleScrollToServices = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById("services");
    if (element) {
      const offsetTop = element.offsetTop - 85;
      window.scrollTo({
        top: Math.max(0, offsetTop),
        behavior: "smooth",
      });
      window.history.pushState(null, "", "#services");
    }
  };

  const whatsappUrl = getWhatsAppLink(
    `Namaste ${siteConfig.name}! Mujhe dry cleaning ke liye pickup book karna hai.`
  );

  return (
    <section
      id="home"
      className="w-full px-3 sm:px-6 pt-2 pb-8 sm:pb-12 max-w-[1240px] mx-auto"
    >
      {/* Large rounded Hero Container */}
      <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#D2ECFD]/70 via-[#EBF6FE] to-white border border-[#A5D8FB]/40 shadow-card min-h-[calc(100vh-6.5rem)] flex items-center">
        {/* Subtle Drifting Clouds */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Cloud 1 */}
          <motion.div
            animate={
              prefersReduced
                ? false
                : {
                    x: [-60, 60, -60],
                    y: [0, -10, 0],
                  }
            }
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-6 left-10 w-72 h-28 bg-white/60 rounded-full blur-2xl"
          />

          {/* Cloud 2 */}
          <motion.div
            animate={
              prefersReduced
                ? false
                : {
                    x: [80, -80, 80],
                    y: [0, 12, 0],
                  }
            }
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-24 right-16 w-96 h-36 bg-white/70 rounded-full blur-3xl"
          />

          {/* Cloud 3 - Soft base glow */}
          <motion.div
            animate={
              prefersReduced
                ? false
                : {
                    x: [-30, 30, -30],
                  }
            }
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-10 left-1/3 w-[500px] h-40 bg-[#A5D8FB]/30 rounded-full blur-3xl"
          />
        </div>

        {/* Content Grid */}
        <div className="relative z-10 w-full px-5 sm:px-8 md:px-12 lg:px-14 py-8 sm:py-12 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Mobile-first Reorder: On mobile, image on top, text below */}

          {/* RIGHT / TOP: Crisp White Shirt + Bubbles */}
          <div className="order-1 lg:order-2 lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-[280px] sm:w-[360px] md:w-[400px] lg:w-[440px] xl:w-[480px] aspect-square flex items-center justify-center">
              {/* Animated Floating Bubbles */}
              <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
                {BUBBLES.map((b, i) => (
                  <motion.div
                    key={i}
                    style={{
                      width: b.size,
                      height: b.size,
                      left: b.left,
                      bottom: "-5%",
                    }}
                    animate={
                      prefersReduced
                        ? false
                        : {
                            y: [40, -340],
                            x: [0, b.xWobble, -b.xWobble, 0],
                            opacity: [0, 0.85, 0.85, 0],
                            scale: [0.7, 1.05, 1],
                          }
                    }
                    transition={{
                      duration: b.duration,
                      repeat: Infinity,
                      delay: b.delay,
                      ease: "easeInOut",
                    }}
                    className="absolute rounded-full border border-white/90 bg-white/30 backdrop-blur-[2px] shadow-[inset_0_2px_6px_rgba(255,255,255,0.9),0_4px_16px_rgba(56,168,245,0.2)]"
                  >
                    {/* Soap Bubble Gleam / Specular Highlight */}
                    <div className="absolute top-1.5 left-2 w-2.5 h-1.5 rounded-full bg-white/90 rotate-[-30deg]" />
                    <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-[#A5D8FB]/60" />
                  </motion.div>
                ))}
              </div>

              {/* Swaying White Shirt with soft radial edge blending */}
              <motion.div
                initial={prefersReduced ? false : { opacity: 0, scale: 0.92, y: 20 }}
                animate={
                  prefersReduced
                    ? { opacity: 1 }
                    : {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        rotate: [-2.2, 2.2, -2.2],
                      }
                }
                transition={{
                  opacity: { duration: 0.6, ease: "easeOut" },
                  scale: { duration: 0.6, ease: "easeOut" },
                  y: { duration: 0.6, ease: "easeOut" },
                  rotate: {
                    duration: 4.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                style={{ transformOrigin: "50% 8%" }}
                className="relative z-10 w-full h-full select-none [mask-image:radial-gradient(circle_at_center,black_62%,transparent_96%)] [-webkit-mask-image:radial-gradient(circle_at_center,black_62%,transparent_96%)]"
              >
                <Image
                  src="/hero-shirt.jpg"
                  alt="Spotless crisp white shirt hanging fresh on a clothesline"
                  fill
                  priority
                  sizes="(max-width: 640px) 280px, (max-width: 1024px) 400px, 480px"
                  className="object-contain filter contrast-[1.02] brightness-[1.01]"
                />
              </motion.div>

              {/* Sparkle Badges Floating */}
              <motion.div
                animate={
                  prefersReduced
                    ? false
                    : {
                        scale: [1, 1.15, 1],
                        rotate: [0, 8, -8, 0],
                      }
                }
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-2 -left-2 z-20 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#D2ECFD] shadow-md flex items-center gap-1.5 text-xs font-bold text-[#0E5E99]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#38A8F5]" />
                <span>100% Steam Pressed</span>
              </motion.div>
            </div>
          </div>

          {/* LEFT / BOTTOM: Copy, CTAs, and Stats */}
          <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col items-start text-left">
            {/* Pill Label */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-[#0E5E99] bg-white/90 border border-[#A5D8FB]/70 shadow-sm backdrop-blur-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-[#38A8F5]" />
              <span>RK Colony, Bhilwara</span>
            </motion.div>

            {/* Headline with Staggered Word-by-Word Reveal */}
            <h1 className="mt-4 sm:mt-5 text-3.5xl sm:text-5xl lg:text-5.5xl xl:text-6xl font-extrabold text-[#0B2540] tracking-tight leading-[1.12]">
              {headlineWords.map((word, idx) => (
                <span
                  key={idx}
                  className="inline-block mr-2 sm:mr-3 overflow-hidden py-0.5"
                >
                  <motion.span
                    initial={prefersReduced ? false : { y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.15 + idx * 0.11,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>

            {/* 2-Line Hinglish Subtext */}
            <motion.p
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-700 max-w-xl leading-relaxed"
            >
              Bhilwara ki sabse bharosemand dry cleaning service. Aapke mehnge
              kapdo ko mile spotless chamak, taazgi aur expert care — bilkul time
              par.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.72 }}
              className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto"
            >
              {/* Primary Dark Pill Button: Pickup book karein */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-3.5 rounded-full font-semibold text-sm sm:text-base text-white bg-[#0B2540] hover:bg-[#163A5C] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg min-h-[48px]"
              >
                <MessageCircle className="w-4 h-4 fill-white/20 stroke-[2.2]" />
                <span>Pickup book karein</span>
              </a>

              {/* Secondary Button: Services dekhein */}
              <a
                href="#services"
                onClick={handleScrollToServices}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-3.5 rounded-full font-semibold text-sm sm:text-base text-[#0B2540] bg-white/90 hover:bg-white border-2 border-[#38A8F5] active:scale-95 transition-all duration-200 shadow-sm hover:shadow min-h-[48px]"
              >
                <span>Services dekhein</span>
                <ArrowDown className="w-4 h-4 text-[#38A8F5]" />
              </a>
            </motion.div>

            {/* Thin Divider */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              style={{ originX: 0 }}
              className="w-full h-px bg-gradient-to-r from-slate-300/80 via-slate-200/60 to-transparent mt-8 mb-6 sm:mt-10 sm:mb-7"
            />

            {/* Row of 3 Stats from config with Count-Up Numbers */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.95 }}
              className="w-full grid grid-cols-3 gap-2 sm:gap-6"
            >
              {siteConfig.stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-xl sm:text-3xl lg:text-3.5xl font-black text-[#0B2540] tracking-tight">
                    <StatCounter rawValue={stat.value} />
                  </span>
                  <span className="text-[11px] sm:text-xs md:text-sm font-medium text-slate-600 mt-0.5 sm:mt-1 leading-snug">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
