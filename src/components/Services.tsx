"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Shirt,
  Sparkle,
  Layers,
  Crown,
  Flower2,
  Wind,
  MessageCircle,
} from "lucide-react";
import { siteConfig, getWhatsAppLink } from "@/config/site";

// Icon mapping based on siteConfig
const iconMap = {
  Shirt: Shirt,
  Sparkle: Sparkle,
  Sparkles: Sparkles,
  Layers: Layers,
  Crown: Crown,
  Flower2: Flower2,
  Wind: Wind,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function Services() {
  const prefersReduced = useReducedMotion();
  const [services, setServices] = useState(siteConfig.services);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/services")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (isMounted && json.ok && Array.isArray(json.data) && json.data.length > 0) {
          const merged = json.data.map(
            (apiService: { id: string; title: string; description: string }) => {
              const localMatch = siteConfig.services.find((s) => s.id === apiService.id);
              return {
                id: apiService.id,
                title: apiService.title,
                description: apiService.description,
                icon: (localMatch?.icon || "Sparkles") as keyof typeof iconMap,
                inquiry:
                  localMatch?.inquiry ||
                  `Hello Balaji Dry Cleaners! I would like to inquire about ${apiService.title} dry cleaning.`,
              };
            }
          );
          setServices(merged);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch /api/services, falling back to siteConfig:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      id="services"
      className="w-full section-padding bg-gradient-to-b from-[#F7FBFF] via-white to-[#F7FBFF]/60 relative overflow-hidden"
    >
      {/* Background Soft Glow Accents */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-[#EBF6FE] blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-[#D2ECFD]/50 blur-3xl pointer-events-none -z-10" />

      <div className="container-site">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#1278BF] bg-[#EBF6FE] rounded-full border border-[#D2ECFD] mb-2.5 sm:mb-3.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#38A8F5]" />
            <span>Our Services</span>
          </motion.div>

          <motion.h2
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0B2540] tracking-tight leading-tight"
          >
            Tailored Care for Every Garment
          </motion.h2>

          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-2.5 sm:mt-3.5 text-slate-600 text-xs sm:text-base lg:text-lg max-w-xl mx-auto leading-relaxed"
          >
            From delicate bridal wear to everyday business formals, our modern fabric care ensures garments stay spotless, vibrant, and protected.
          </motion.p>
        </div>

        {/* 6 Services Responsive Grid */}
        <motion.div
          variants={containerVariants}
          initial={prefersReduced ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 items-stretch"
        >
          {services.map((service) => {
            const IconComponent =
              iconMap[service.icon as keyof typeof iconMap] || Sparkles;
            const whatsappLink = getWhatsAppLink(service.inquiry);

            return (
              <motion.div
                key={service.id}
                variants={cardVariants}
                className="group relative flex flex-col justify-between h-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 border border-slate-200/80 shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 hover:border-[#A5D8FB]"
              >
                {/* Top Section: Icon, Title, Description */}
                <div>
                  {/* Sky-Blue Rounded Square Icon Container */}
                  <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-[#EBF6FE] group-hover:bg-[#38A8F5] text-[#38A8F5] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs group-hover:scale-105 mb-3.5 sm:mb-5">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2] transition-colors" />
                  </div>

                  <h3 className="text-base sm:text-xl font-bold text-[#0B2540] group-hover:text-[#1278BF] transition-colors">
                    {service.title}
                  </h3>

                  <p className="mt-1.5 sm:mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Bottom Section: CTA Link */}
                <div className="pt-3.5 mt-3.5 sm:pt-5 sm:mt-5 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 sm:gap-2 min-h-[38px] sm:min-h-[44px] py-1 text-xs sm:text-sm font-semibold text-[#0B2540] group-hover:text-[#38A8F5] transition-colors"
                  >
                    <span>Inquire on WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.2] transform group-hover:translate-x-1 transition-transform" />
                  </a>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-50 group-hover:bg-[#EBF6FE] text-slate-400 group-hover:text-[#38A8F5] flex items-center justify-center transition-colors"
                    aria-label={`Inquire about ${service.title} on WhatsApp`}
                  >
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current/10" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
