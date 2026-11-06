"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Truck,
  Search,
  Sparkles,
  PackageCheck,
  Check,
} from "lucide-react";
import { siteConfig } from "@/config/site";

const iconMap = {
  Truck: Truck,
  Search: Search,
  Sparkles: Sparkles,
  PackageCheck: PackageCheck,
};

// Line drawing animation variants
const lineVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const verticalLineVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function Process() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="process"
      className="w-full section-padding bg-white relative overflow-hidden"
    >
      {/* Background Soft Glow Accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full bg-[#EBF6FE]/60 blur-3xl pointer-events-none -z-10" />

      <div className="container-site">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1278BF] bg-[#EBF6FE] rounded-full border border-[#D2ECFD] mb-3.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#38A8F5]" />
            <span>How It Works</span>
          </motion.div>

          <motion.h2
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-3.5xl sm:text-4xl lg:text-5xl font-black text-[#0B2540] tracking-tight leading-tight"
          >
            Chaar kadam mein
          </motion.h2>

          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-3.5 text-slate-600 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Simple, transparent aur bina kisi pareshani ke — aapke kapde 4 aasan
            steps mein bilkul naye jaise taiyaar.
          </motion.p>
        </div>

        {/* ── DESKTOP HORIZONTAL TIMELINE (Hidden on mobile / tablet < lg) ── */}
        <div className="hidden lg:block relative max-w-[1140px] mx-auto">
          {/* Base Track Line */}
          <div className="absolute top-[26.5px] left-[12.5%] right-[12.5%] h-[3px] bg-slate-200/90 rounded-full z-0 overflow-hidden">
            {/* Animated Connecting Line that draws itself */}
            <motion.div
              variants={lineVariants}
              initial={prefersReduced ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              style={{ transformOrigin: "left" }}
              className="h-full w-full bg-gradient-to-r from-[#38A8F5] via-[#1B96E6] to-[#0E5E99] rounded-full"
            />
          </div>

          {/* 4 Steps Row */}
          <div className="grid grid-cols-4 gap-6 relative z-10">
            {siteConfig.process.map((step, idx) => {
              const IconComponent =
                iconMap[step.icon as keyof typeof iconMap] || Sparkles;

              return (
                <motion.div
                  key={step.step}
                  initial={prefersReduced ? false : { opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.2 + idx * 0.22,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group flex flex-col items-center text-center cursor-default"
                >
                  {/* Numbered Circle (56x56) - Sits exactly on the line */}
                  <div className="relative mb-6">
                    {/* Pulsing Sky Glow when lights up */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: [1, 1.35, 1.2], opacity: [0, 0.6, 0] }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.35 + idx * 0.25,
                        duration: 1.2,
                        ease: "easeOut",
                      }}
                      className="absolute inset-0 rounded-full bg-[#38A8F5] blur-md -z-10"
                    />

                    {/* Step Circle */}
                    <motion.div
                      initial={
                        prefersReduced
                          ? false
                          : {
                              borderColor: "#E2E8F0",
                              backgroundColor: "#FFFFFF",
                              color: "#64748B",
                            }
                      }
                      whileInView={{
                        borderColor: "#38A8F5",
                        backgroundColor: "#FFFFFF",
                        color: "#0B2540",
                      }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.3 + idx * 0.22,
                        duration: 0.5,
                      }}
                      className="w-14 h-14 rounded-full border-3 flex items-center justify-center font-extrabold text-base shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:border-[#1278BF]"
                    >
                      <span className="tracking-tight text-sm font-black text-[#0B2540] group-hover:text-[#38A8F5] transition-colors">
                        0{step.step}
                      </span>
                    </motion.div>
                  </div>

                  {/* Step Card with subtle hover lift */}
                  <div className="w-full h-full flex flex-col items-center p-6 bg-white rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-[#A5D8FB] group-hover:bg-[#F7FBFF]/60">
                    {/* Icon Container that lights up */}
                    <motion.div
                      initial={
                        prefersReduced
                          ? false
                          : {
                              backgroundColor: "#F1F5F9",
                              color: "#64748B",
                            }
                      }
                      whileInView={{
                        backgroundColor: "#EBF6FE",
                        color: "#38A8F5",
                      }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.35 + idx * 0.22,
                        duration: 0.5,
                      }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-[#38A8F5] group-hover:text-white group-hover:scale-105 shadow-xs"
                    >
                      <IconComponent className="w-6 h-6 stroke-[2.2]" />
                    </motion.div>

                    {/* Step Title */}
                    <h3 className="text-lg font-bold text-[#0B2540] group-hover:text-[#1278BF] transition-colors duration-200 leading-snug">
                      {step.title}
                    </h3>

                    {/* Short Hinglish Line */}
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── MOBILE / TABLET VERTICAL TIMELINE (Shown on < lg) ── */}
        <div className="lg:hidden relative max-w-lg mx-auto pl-16 sm:pl-20">
          {/* Base Track Vertical Line */}
          <div className="absolute top-7 bottom-7 left-[26.5px] w-[3px] bg-slate-200/90 rounded-full z-0 overflow-hidden">
            {/* Animated Vertical Line that draws itself downward */}
            <motion.div
              variants={verticalLineVariants}
              initial={prefersReduced ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              style={{ transformOrigin: "top" }}
              className="w-full h-full bg-gradient-to-b from-[#38A8F5] via-[#1B96E6] to-[#0E5E99] rounded-full"
            />
          </div>

          {/* 4 Steps Stack */}
          <div className="flex flex-col gap-7 sm:gap-8 relative z-10">
            {siteConfig.process.map((step, idx) => {
              const IconComponent =
                iconMap[step.icon as keyof typeof iconMap] || Sparkles;

              return (
                <motion.div
                  key={step.step}
                  initial={prefersReduced ? false : { opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.15 + idx * 0.18,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group relative flex items-start cursor-default"
                >
                  {/* Numbered Circle sitting exactly on the vertical line */}
                  <div className="absolute -left-16 sm:-left-20 top-2 sm:top-2.5">
                    {/* Glowing pulse */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: [1, 1.4, 1.2], opacity: [0, 0.6, 0] }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.25 + idx * 0.2,
                        duration: 1,
                        ease: "easeOut",
                      }}
                      className="absolute inset-0 rounded-full bg-[#38A8F5] blur-md -z-10"
                    />

                    {/* Circle Node */}
                    <motion.div
                      initial={
                        prefersReduced
                          ? false
                          : {
                              borderColor: "#E2E8F0",
                              backgroundColor: "#FFFFFF",
                              color: "#64748B",
                            }
                      }
                      whileInView={{
                        borderColor: "#38A8F5",
                        backgroundColor: "#FFFFFF",
                        color: "#0B2540",
                      }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.2 + idx * 0.18,
                        duration: 0.45,
                      }}
                      className="w-14 h-14 rounded-full border-3 flex items-center justify-center font-extrabold text-sm shadow-soft transition-transform duration-200 group-hover:scale-105"
                    >
                      <span className="font-black text-[#0B2540] group-hover:text-[#38A8F5] transition-colors">
                        0{step.step}
                      </span>
                    </motion.div>
                  </div>

                  {/* Card with subtle hover lift */}
                  <div className="w-full p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-[#A5D8FB]">
                    <div className="flex items-center gap-3.5 mb-2.5">
                      {/* Icon Container */}
                      <motion.div
                        initial={
                          prefersReduced
                            ? false
                            : {
                                backgroundColor: "#F1F5F9",
                                color: "#64748B",
                              }
                        }
                        whileInView={{
                          backgroundColor: "#EBF6FE",
                          color: "#38A8F5",
                        }}
                        viewport={{ once: true }}
                        transition={{
                          delay: 0.25 + idx * 0.18,
                          duration: 0.45,
                        }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:bg-[#38A8F5] group-hover:text-white"
                      >
                        <IconComponent className="w-5 h-5 stroke-[2.2]" />
                      </motion.div>

                      <h3 className="text-base sm:text-lg font-bold text-[#0B2540] group-hover:text-[#1278BF] transition-colors">
                        {step.title}
                      </h3>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed pl-0.5">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
