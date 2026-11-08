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
  { size: 40, left: "15%", delay: 0, duration: 6, xWobble: 18 },
  { size: 24, left: "32%", delay: 1.8, duration: 5.2, xWobble: -14 },
  { size: 48, left: "55%", delay: 0.9, duration: 6.8, xWobble: 22 },
  { size: 20, left: "70%", delay: 2.6, duration: 4.8, xWobble: -16 },
  { size: 32, left: "82%", delay: 1.2, duration: 5.8, xWobble: 20 },
  { size: 42, left: "42%", delay: 3.4, duration: 6.2, xWobble: -18 },
];

export function Hero() {
  const prefersReduced = useReducedMotion();

  const headlineWords = ["Same", "clothes,", "fresh", "new", "shine."];

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
    `Hello ${siteConfig.name}! I would like to book a doorstep dry cleaning pickup.`
  );

  return (
    <section
      id="home"
      className="w-full px-2.5 sm:px-6 pt-1 pb-6 sm:pb-12 max-w-[1240px] mx-auto"
    >
      {/* Large rounded Hero Container */}
      <div className="relative rounded-2xl sm:rounded-[32px] overflow-hidden bg-gradient-to-br from-[#D2ECFD]/70 via-[#EBF6FE] to-white border border-[#A5D8FB]/40 shadow-card py-5 sm:py-8 lg:min-h-[calc(100vh-6.5rem)] flex items-center">
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
        <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-14 py-4 sm:py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
          {/* Mobile-first: Text first, Shirt second on mobile; 7-5 split on desktop */}

          {/* LEFT / TOP: Copy, CTAs, and Stats */}
          <div className="order-1 lg:order-1 lg:col-span-7 flex flex-col items-start text-left">
            {/* Pill Label */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-sm font-semibold text-[#0E5E99] bg-white/90 border border-[#A5D8FB]/70 shadow-xs backdrop-blur-sm"
            >
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#38A8F5]" />
              <span>RK Colony, Bhilwara</span>
            </motion.div>

            {/* Headline with Staggered Word-by-Word Reveal */}
            <h1 className="mt-2.5 sm:mt-5 text-2.5xl sm:text-4.5xl lg:text-5.5xl xl:text-6xl font-extrabold text-[#0B2540] tracking-tight leading-[1.15]">
              {headlineWords.map((word, idx) => (
                <span
                  key={idx}
                  className="inline-block mr-1.5 sm:mr-3 overflow-hidden py-0.5"
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

            {/* 2-Line Subtext */}
            <motion.p
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-2 sm:mt-4 text-xs sm:text-base lg:text-lg text-slate-700 max-w-xl leading-relaxed"
            >
              Bhilwara&apos;s trusted dry cleaning and laundry specialists. Spotless shine,
              delicate fabric preservation, and reliable doorstep service in RK Colony.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.72 }}
              className="mt-4 sm:mt-8 flex flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto"
            >
              {/* Primary Dark Pill Button: Book Pickup */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-full font-bold text-xs sm:text-base text-white bg-[#0B2540] hover:bg-[#163A5C] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg min-h-[42px] sm:min-h-[48px]"
              >
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white/20 stroke-[2.2]" />
                <span>Book Pickup</span>
              </a>

              {/* Secondary Button: Explore Services */}
              <a
                href="#services"
                onClick={handleScrollToServices}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-full font-bold text-xs sm:text-base text-[#0B2540] bg-white/90 hover:bg-white border sm:border-2 border-[#38A8F5] active:scale-95 transition-all duration-200 shadow-xs min-h-[42px] sm:min-h-[48px]"
              >
                <span>Services</span>
                <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#38A8F5]" />
              </a>
            </motion.div>
          </div>

          {/* RIGHT / MIDDLE: Crisp White Shirt + Bubbles */}
          <div className="order-2 lg:order-2 lg:col-span-5 flex flex-col items-center justify-center relative my-2 lg:my-0">
            <div className="relative w-[190px] sm:w-[280px] md:w-[340px] lg:w-[440px] aspect-square flex items-center justify-center">
              {/* Animated Floating Bubbles */}
              <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
                {BUBBLES.map((b, i) => (
                  <motion.div
                    key={i}
                    style={{
                      width: b.size * 0.75,
                      height: b.size * 0.75,
                      left: b.left,
                      bottom: "-5%",
                    }}
                    animate={
                      prefersReduced
                        ? false
                        : {
                            y: [30, -260],
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
                    <div className="absolute top-1 left-1.5 w-2 h-1 rounded-full bg-white/90 rotate-[-30deg]" />
                    <div className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-[#A5D8FB]/60" />
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
                  sizes="(max-width: 640px) 190px, (max-width: 1024px) 340px, 440px"
                  className="object-contain filter contrast-[1.02] brightness-[1.01]"
                />
              </motion.div>

              {/* Steam Pressed Badge floating */}
              <motion.div
                initial={prefersReduced ? false : { scale: 0.8, opacity: 0 }}
                animate={
                  prefersReduced
                    ? { opacity: 1, scale: 1 }
                    : {
                        opacity: 1,
                        scale: [1, 1.08, 1],
                        rotate: [0, 4, -4, 0],
                      }
                }
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 z-20 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#D2ECFD] shadow-xs flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-[#0E5E99]"
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#38A8F5]" />
                <span>100% Steam Pressed</span>
              </motion.div>
            </div>
          </div>

          {/* Stats Bar (Spanning across full bottom row) */}
          <div className="order-3 lg:col-span-12 w-full pt-3 sm:pt-6 border-t border-[#A5D8FB]/60">
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.95 }}
              className="w-full grid grid-cols-3 gap-2 sm:gap-6 text-center sm:text-left"
            >
              {siteConfig.stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-lg sm:text-2xl lg:text-3.5xl font-black text-[#0B2540] tracking-tight">
                    <StatCounter rawValue={stat.value} />
                  </span>
                  <span className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-600 mt-0.5 leading-snug">
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
