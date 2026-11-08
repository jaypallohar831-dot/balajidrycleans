"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, HelpCircle, PhoneCall, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";

const FAQS = [
  {
    id: "faq-1",
    question: "Do you offer doorstep pickup and delivery in Bhilwara?",
    answer:
      "Yes, Balaji Dry Cleaners provides convenient doorstep pickup and delivery across RK Colony, Patel Nagar, Shastri Nagar, Subhash Nagar, and surrounding Bhilwara neighborhoods.",
  },
  {
    id: "faq-2",
    question: "What items can I get dry cleaned at Balaji Dry Cleaners?",
    answer:
      "We specialize in suits, blazers, sherwanis, heavy bridal lehengas, delicate silk sarees, winter jackets, quilts, blankets, and window curtains.",
  },
  {
    id: "faq-3",
    question: "How much time does dry cleaning take?",
    answer:
      "Standard dry cleaning service takes 24 to 48 hours. Express urgent processing is also available upon request.",
  },
  {
    id: "faq-4",
    question: "Can tough stains like oil, curry, or ink be safely removed?",
    answer:
      "Yes, our certified fabric technicians use imported non-bleaching solvents and spot-treatment equipment to gently treat tough stains without harming delicate fibers or colors.",
  },
  {
    id: "faq-5",
    question: "How do I schedule a pickup?",
    answer:
      "You can book directly via our online booking form on this website or message us on WhatsApp at +91 80058 17455.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const prefersReduced = useReducedMotion();

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="faq"
      aria-label="Frequently Asked Questions"
      className="py-16 sm:py-24 bg-gradient-to-b from-white via-[#F6FAFD] to-white relative overflow-hidden"
    >
      {/* Decorative background glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#38A8F5]/10 rounded-full blur-3xl pointer-events-none"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF6FE] text-[#1278BF] text-xs font-bold uppercase tracking-wider mb-3.5 border border-[#D2ECFD]">
            <HelpCircle className="w-3.5 h-3.5 text-[#38A8F5]" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B2540] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-slate-600">
            Everything you need to know about our dry cleaning process, pricing, and free doorstep pickup in Bhilwara.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={faq.id}
                initial={prefersReduced ? false : { opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-white border-[#38A8F5]/50 shadow-md shadow-[#1278BF]/5"
                    : "bg-white/80 hover:bg-white border-slate-200/80 shadow-xs"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-[#0B2540] pr-2">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? "bg-[#EBF6FE] text-[#1278BF] rotate-180"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${faq.id}`}
                      initial={prefersReduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        <p className="pt-3">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Help Banner */}
        <div className="mt-10 p-5 sm:p-6 rounded-2xl bg-[#EBF6FE]/70 border border-[#D2ECFD] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#1278BF] flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5 text-[#38A8F5]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#0B2540]">
                Have a special garment or urgent requirement?
              </p>
              <p className="text-xs text-slate-500">
                Call our master dry cleaner directly for personalized care advice.
              </p>
            </div>
          </div>
          <a
            href={`tel:+${siteConfig.whatsapp}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B2540] hover:bg-[#163A5C] text-white text-xs sm:text-sm font-bold transition-all shadow-sm shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call +91 80058 17455</span>
          </a>
        </div>
      </div>
    </section>
  );
}
