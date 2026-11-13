"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  MessageCircle,
  ExternalLink,
  Navigation,
  Send,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Car,
  Sparkles,
} from "lucide-react";
import { siteConfig, getWhatsAppLink } from "@/config/site";
import { Turnstile, type TurnstileRef } from "@/components/Turnstile";

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Contact() {
  const prefersReduced = useReducedMotion();
  const turnstileRef = useRef<TurnstileRef>(null);

  // Inquiry Form State
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [honeypot, setHoneypot] = useState<string>("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
  }>({});
  const [touched, setTouched] = useState<{
    name?: boolean;
    phone?: boolean;
  }>({});

  const googleMapsUrl = siteConfig.address.mapsUrl;
  const directionsUrl = siteConfig.address.directionsUrl;
  const embedMapUrl = siteConfig.address.embedUrl;
  const instagramUrl = `https://instagram.com/${siteConfig.instagram}`;
  const whatsappUrl = getWhatsAppLink("Hello Balaji Dry Cleaners! I would like to inquire about your services.");

  const validate = () => {
    const newErrors: { name?: string; phone?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Please enter your full name";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const cleanPhone = phone.replace(/[\s\-().]/g, "");
    if (!cleanPhone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^(?:\+?91|0)?([6-9]\d{9})$/.test(cleanPhone)) {
      newErrors.phone = "Please enter a valid 10-digit Indian mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true });
    setSubmitError(null);

    if (!validate()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim() || undefined,
        turnstileToken: turnstileToken || "dummy-test-token",
        honeypot,
      };

      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        const errorMsg =
          json?.error?.message ||
          "Something went wrong. Please try again shortly.";
        setSubmitError(errorMsg);
        turnstileRef.current?.reset();
        return;
      }

      setIsSuccess(true);
      setName("");
      setPhone("");
      setMessage("");
      setTouched({});
      setErrors({});
    } catch {
      setSubmitError("Network error. Please check your internet connection.");
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactBlocks = [
    {
      icon: MapPin,
      title: "Store Location",
      primary: siteConfig.address.full,
      subtitle: "RK Colony, Bhilwara (Raj.)",
      actionText: "View on Google Maps",
      actionHref: googleMapsUrl,
      external: true,
      badge: "Open Daily: 9 AM - 8:30 PM",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      primary: `+${siteConfig.whatsapp}`,
      subtitle: "Instant pickup & inquiry replies",
      actionText: "Chat on WhatsApp",
      actionHref: whatsappUrl,
      external: true,
      badge: "Quick Response",
    },
    {
      icon: InstagramIcon,
      title: "Instagram",
      primary: `@${siteConfig.instagram}`,
      subtitle: "Cleaning tips & customer transformations",
      actionText: "View Profile",
      actionHref: instagramUrl,
      external: true,
      badge: "Follow on Instagram",
    },
  ];

  return (
    <section
      id="contact"
      className="w-full section-padding bg-white relative overflow-hidden"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full bg-[#EBF6FE]/70 blur-3xl pointer-events-none -z-10" />

      <div className="container-site">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1278BF] bg-[#EBF6FE] rounded-full border border-[#D2ECFD] mb-3.5 shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-[#38A8F5]" />
            <span>Contact Us</span>
          </motion.div>

          <motion.h2
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0B2540] tracking-tight leading-tight"
          >
            Visit Our Store or Get in Touch
          </motion.h2>

          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mt-2.5 sm:mt-3.5 text-slate-600 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Conveniently located in RK Colony, Bhilwara. We are always ready to assist you.
          </motion.p>
        </div>

        {/* 3 Info Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-7 items-stretch">
          {contactBlocks.map((block, idx) => {
            const Icon = block.icon;
            return (
              <motion.div
                key={idx}
                initial={prefersReduced ? false : { opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.55,
                  delay: 0.1 + idx * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative flex flex-col justify-between h-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-8 border border-slate-200/80 shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1.5 hover:border-[#A5D8FB]"
              >
                <div>
                  {/* Top Bar: Icon & Badge */}
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#EBF6FE] group-hover:bg-[#38A8F5] text-[#38A8F5] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs group-hover:scale-105">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2] transition-colors" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#1278BF] bg-[#EBF6FE] px-2.5 py-0.5 sm:py-1 rounded-full border border-[#D2ECFD]">
                      {block.badge}
                    </span>
                  </div>

                  {/* Block Title */}
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                    {block.title}
                  </span>

                  {/* Primary text */}
                  <h3 className="text-base sm:text-xl font-bold text-[#0B2540] group-hover:text-[#1278BF] transition-colors mt-0.5 sm:mt-1">
                    {block.primary}
                  </h3>

                  {/* Subtitle */}
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {block.subtitle}
                  </p>
                </div>

                {/* Action Link */}
                <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-slate-100">
                  <a
                    href={block.actionHref}
                    target={block.external ? "_blank" : undefined}
                    rel={block.external ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 sm:gap-2 min-h-[38px] sm:min-h-[44px] py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#0B2540] group-hover:text-[#38A8F5] transition-colors"
                  >
                    <span>{block.actionText}</span>
                    <ExternalLink className="w-3.5 h-3.5 stroke-[2.2] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── INQUIRY SUBMISSION FORM CARD ── */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="mt-6 sm:mt-12 p-4 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-50 via-white to-[#EBF6FE]/40 border border-slate-200/90 shadow-card"
        >
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-5 sm:mb-6">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#1278BF] bg-[#EBF6FE] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-[#D2ECFD]">
                Direct Message
              </span>
              <h3 className="text-xl sm:text-3xl font-black text-[#0B2540] mt-1.5 sm:mt-2">
                Send an Inquiry
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Have a question or need details regarding a specific garment? Leave a message and we will respond promptly.
              </p>
            </div>

            {/* Success message */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-5 sm:mb-6 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 shadow-xs"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold">Your inquiry has been received!</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Balaji Dry Cleaners will get back to you shortly. Thank you!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSuccess(false)}
                    className="text-xs font-semibold text-emerald-800 underline ml-auto cursor-pointer"
                  >
                    Send another message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Banner */}
            {submitError && (
              <div className="mb-4 sm:mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleInquirySubmit} noValidate className="flex flex-col gap-3.5 sm:gap-4">
              {/* Hidden Honeypot Field */}
              <input
                type="text"
                name="contact_hp_verification"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ position: "absolute", left: "-9999px", opacity: 0 }}
                aria-hidden="true"
              />

              {/* Turnstile Invisible Widget */}
              <Turnstile
                ref={turnstileRef}
                action="inquiry"
                onSuccess={(token) => setTurnstileToken(token)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1 sm:gap-1.5">
                  <label
                    htmlFor="inquiry-name"
                    className="text-xs sm:text-sm font-bold text-[#0B2540] flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-[#38A8F5]" />
                    <span>Full Name</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="inquiry-name"
                    type="text"
                    placeholder="e.g. Sunil Jain"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                    className={`w-full h-10 sm:h-12 rounded-lg sm:rounded-xl border bg-white px-3 sm:px-4 text-xs sm:text-base text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-[#38A8F5] focus:ring-4 focus:ring-[#38A8F5]/15 ${
                      touched.name && errors.name
                        ? "border-red-400 ring-2 ring-red-100"
                        : "border-slate-200"
                    }`}
                  />
                  {touched.name && errors.name && (
                    <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1 sm:gap-1.5">
                  <label
                    htmlFor="inquiry-phone"
                    className="text-xs sm:text-sm font-bold text-[#0B2540] flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#38A8F5]" />
                    <span>Mobile Number</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="inquiry-phone"
                    type="tel"
                    placeholder="e.g. 9829012345"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                    className={`w-full h-10 sm:h-12 rounded-lg sm:rounded-xl border bg-white px-3 sm:px-4 text-xs sm:text-base text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-[#38A8F5] focus:ring-4 focus:ring-[#38A8F5]/15 ${
                      touched.phone && errors.phone
                        ? "border-red-400 ring-2 ring-red-100"
                        : "border-slate-200"
                    }`}
                  />
                  {touched.phone && errors.phone && (
                    <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <label
                  htmlFor="inquiry-message"
                  className="text-xs sm:text-sm font-bold text-[#0B2540] flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#38A8F5]" />
                  <span>Your Message or Question</span>
                  <span className="text-slate-400 text-xs font-normal">(Optional)</span>
                </label>
                <textarea
                  id="inquiry-message"
                  rows={3}
                  placeholder="e.g. Inquiring about delicate embroidery cleaning on a bridal lehenga..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg sm:rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3.5 text-xs sm:text-base text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-[#38A8F5] focus:ring-4 focus:ring-[#38A8F5]/15 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1.5 sm:mt-2 w-full sm:w-auto self-center sm:px-10 py-2.5 sm:py-3 min-h-[42px] sm:min-h-[48px] rounded-full font-bold text-xs sm:text-sm text-white bg-[#0B2540] hover:bg-[#163A5C] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#38A8F5]" />
                    <span>Sending inquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#38A8F5]" />
                    <span>Send Inquiry</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* ── LIVE INTERACTIVE MAP & DUKAAN LOCATION SECTION ── */}
        <motion.div
          id="location"
          initial={prefersReduced ? false : { opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, delay: 0.35 }}
          className="mt-6 sm:mt-12 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-card overflow-hidden"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-8 bg-gradient-to-r from-slate-50 via-white to-[#EBF6FE]/60 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#EBF6FE] border border-[#A5D8FB] text-[#38A8F5] flex items-center justify-center shrink-0 shadow-xs">
                <Navigation className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Location
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Open Today: 9:00 AM – 8:30 PM
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-[#0B2540] tracking-tight mt-0.5 sm:mt-1">
                  Visit Our Store (Shop Location)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#38A8F5] shrink-0" />
                  <span>{siteConfig.address.full}</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 min-h-[38px] sm:min-h-[44px] rounded-full font-bold text-xs sm:text-sm text-white bg-[#0B2540] hover:bg-[#163A5C] active:scale-95 transition-all shadow-md hover:shadow-lg"
              >
                <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white/20 stroke-[2.2]" />
                <span>Get Directions</span>
              </a>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 min-h-[38px] sm:min-h-[44px] rounded-full font-bold text-xs sm:text-sm text-[#0B2540] bg-white hover:bg-slate-50 border border-slate-300 active:scale-95 transition-all shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Google Maps App</span>
              </a>
            </div>
          </div>

          {/* Interactive Live Google Map Viewport */}
          <div className="relative w-full h-[250px] sm:h-[420px] md:h-[460px] bg-slate-100 overflow-hidden">
            <iframe
              src={embedMapUrl}
              title="Balaji Dry Cleaners Live Location Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full filter saturate-[1.05] contrast-[1.02]"
            />

            {/* Floating Glassmorphic Store Badge on the Map (hidden on small screens to prevent covering the map) */}
            <div className="hidden sm:block absolute top-4 left-4 max-w-[280px] sm:max-w-xs bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 shadow-elevated pointer-events-auto">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-0.5 overflow-hidden shadow-xs shrink-0 border border-slate-100">
                  <Image
                    src="/logo.png"
                    alt="Balaji Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0B2540] leading-none">
                    Balaji Dry Cleaners
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    RK Colony, Bhilwara (Raj.)
                  </p>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Store Open Today
                </span>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#1278BF] hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Route</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Store Highlights Bar */}
          <div className="p-4 sm:p-5 bg-white border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
              <div className="w-8 h-8 rounded-lg bg-[#EBF6FE] text-[#38A8F5] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0B2540]">9:00 AM – 8:30 PM</p>
                <p className="text-[11px] text-slate-500">Open Monday to Sunday</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
              <div className="w-8 h-8 rounded-lg bg-[#EBF6FE] text-[#38A8F5] flex items-center justify-center shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0B2540]">Easy Parking</p>
                <p className="text-[11px] text-slate-500">Hassle-free parking near the store</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
              <div className="w-8 h-8 rounded-lg bg-[#EBF6FE] text-[#38A8F5] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0B2540]">Doorstep Pickup</p>
                <p className="text-[11px] text-slate-500">Pickup & delivery across Bhilwara</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
