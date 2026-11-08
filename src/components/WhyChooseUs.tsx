"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Sparkles, Wind, Tag, ShieldCheck } from "lucide-react";

const REASONS = [
  {
    icon: Sparkles,
    title: "Delicate Zari & Embroidery Care",
    description:
      "Specialized solvent care for bridal lehengas, pure silk sarees, and designer outfits — ensuring zero damage to threads, sequins, or fabric luster.",
  },
  {
    icon: Wind,
    title: "Industrial Steam Press",
    description:
      "Advanced industrial steam equipment and vacuum tables providing a gentle, wrinkle-free finish that preserves natural fabric softness and drape.",
  },
  {
    icon: Tag,
    title: "Individual Barcode Tagging",
    description:
      "Every single garment is barcoded and inventoried individually, ensuring zero mix-ups while keeping delicate buttons and embellishments safe.",
  },
  {
    icon: ShieldCheck,
    title: "Local & Trusted in Bhilwara",
    description:
      "RK Colony's proven dry cleaning experts with over 10 years of trust. Transparent pricing, strict on-time delivery, and personalized customer care.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.12,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function WhyChooseUs() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="about"
      className="w-full section-padding bg-gradient-to-b from-white via-[#F7FBFF] to-white relative overflow-hidden"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-[#EBF6FE] blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 -left-24 w-80 h-80 rounded-full bg-[#D2ECFD]/40 blur-3xl pointer-events-none -z-10" />

      <div className="container-site">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1278BF] bg-[#EBF6FE] rounded-full border border-[#D2ECFD] mb-3.5 shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#38A8F5]" />
            <span>Why Choose Us</span>
          </motion.div>

          <motion.h2
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-3.5xl sm:text-4xl lg:text-5xl font-black text-[#0B2540] tracking-tight leading-tight"
          >
            Why Balaji Dry Cleaners
          </motion.h2>

          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mt-3.5 text-slate-600 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
          >
            We understand that every garment carries special memories. That is why we treat every piece with the utmost care, precision, and respect.
          </motion.p>
        </div>

        {/* 4-Point Grid */}
        <motion.div
          variants={containerVariants}
          initial={prefersReduced ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 lg:gap-8 items-stretch"
        >
          {REASONS.map((reason, idx) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="group relative flex flex-col justify-between h-full bg-white/75 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-9 border border-slate-200/80 shadow-soft hover:shadow-[0_12px_36px_rgba(56,168,245,0.18)] hover:border-[#38A8F5]/60 hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Subtle Card Glow in the corner on hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#38A8F5]/10 to-transparent rounded-tr-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Sky Icon Square */}
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#EBF6FE] group-hover:bg-[#38A8F5] text-[#38A8F5] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs mb-6 group-hover:scale-105 group-hover:rotate-1">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2] transition-colors duration-300" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0B2540] group-hover:text-[#1278BF] transition-colors leading-snug">
                    {reason.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
