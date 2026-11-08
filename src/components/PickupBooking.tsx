"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  MessageCircle,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
  User,
  Phone,
  AlertCircle,
  Truck,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { siteConfig, getWhatsAppLink } from "@/config/site";
import { Turnstile, type TurnstileRef } from "@/components/Turnstile";

const TIME_SLOTS = [
  { id: "subah", label: "Morning", time: "9 AM - 12 PM" },
  { id: "dopahar", label: "Afternoon", time: "12 PM - 4 PM" },
  { id: "shaam", label: "Evening", time: "4 PM - 8 PM" },
] as const;

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMaxDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function PickupBooking() {
  const prefersReduced = useReducedMotion();
  const turnstileRef = useRef<TurnstileRef>(null);

  // Form State
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [service, setService] = useState<string>(siteConfig.services[0].id);
  const [pickupSlot, setPickupSlot] = useState<"subah" | "dopahar" | "shaam">("subah");
  const [pickupDate, setPickupDate] = useState<string>("");
  const [todayStr, setTodayStr] = useState<string>("");
  const [maxDateStr, setMaxDateStr] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [honeypot, setHoneypot] = useState<string>("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  useEffect(() => {
    const today = getTodayString();
    const max = getMaxDateString();
    setTodayStr(today);
    setMaxDateStr(max);
    setPickupDate((prev) => (prev ? prev : today));
  }, []);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<{
    bookingCode: string;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Validation State
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    pickupDate?: string;
    address?: string;
  }>({});
  const [touched, setTouched] = useState<{
    name?: boolean;
    phone?: boolean;
    pickupDate?: boolean;
    address?: boolean;
  }>({});

  const selectedServiceObj =
    siteConfig.services.find((s) => s.id === service) || siteConfig.services[0];
  const selectedSlotObj =
    TIME_SLOTS.find((s) => s.id === pickupSlot) || TIME_SLOTS[0];

  // Live WhatsApp message preview
  const composedMessage = `Hello ${siteConfig.name}! I would like to book a doorstep pickup for dry cleaning:

👤 Name: ${name.trim() || "[Your Name]"}
📞 Phone: ${phone.trim() || "[Your Phone]"}
🧺 Service: ${selectedServiceObj.title}
📅 Pickup Date: ${pickupDate || "[Date]"}
⏰ Pickup Slot: ${selectedSlotObj.label} (${selectedSlotObj.time})
📍 Address: ${address.trim() || "[Your Address, RK Colony]"}`;

  const validate = () => {
    const newErrors: {
      name?: string;
      phone?: string;
      pickupDate?: string;
      address?: string;
    } = {};

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

    if (!pickupDate) {
      newErrors.pickupDate = "Please select a pickup date";
    }

    if (!address.trim()) {
      newErrors.address = "Please enter your address or landmark";
    } else if (address.trim().length < 10) {
      newErrors.address = "Address must be at least 10 characters (House/Flat No., Street, Landmark)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, pickupDate: true, address: true });
    setSubmitError(null);

    if (!validate()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        service,
        pickupSlot,
        pickupDate,
        address: address.trim(),
        turnstileToken: turnstileToken || "dummy-test-token",
        honeypot,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        const errorMsg =
          json?.error?.message ||
          "Something went wrong. Please try again or message us on WhatsApp.";
        setSubmitError(errorMsg);
        turnstileRef.current?.reset();
        return;
      }

      // Success
      setBookingSuccess({
        bookingCode: json.data.bookingCode,
        message: json.data.message,
      });
    } catch {
      setSubmitError("Network error. Please check your connection or contact us directly on WhatsApp.");
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setPhone("");
    setAddress("");
    setPickupDate(todayStr);
    setPickupSlot("subah");
    setService(siteConfig.services[0].id);
    setBookingSuccess(null);
    setSubmitError(null);
    setTouched({});
    setErrors({});
    turnstileRef.current?.reset();
  };

  const copyBookingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="pickup"
      className="w-full section-padding bg-gradient-to-b from-[#F7FBFF]/60 via-white to-[#F7FBFF] relative overflow-hidden"
    >
      {/* Background Soft Glow Accents */}
      <div className="absolute top-1/4 -right-24 w-96 h-96 rounded-full bg-[#EBF6FE] blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 -left-24 w-96 h-96 rounded-full bg-[#D2ECFD]/40 blur-3xl pointer-events-none -z-10" />

      <div className="container-site">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* ── LEFT COLUMN: Heading & Details ── */}
          <div className="lg:col-span-5 flex flex-col items-start">
            {/* Eyebrow */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1278BF] bg-[#EBF6FE] rounded-full border border-[#D2ECFD] mb-3.5 shadow-xs"
            >
              <Truck className="w-3.5 h-3.5 text-[#38A8F5]" />
              <span>Doorstep Pickup</span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={prefersReduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0B2540] tracking-tight leading-tight"
            >
              Schedule a Doorstep Pickup
            </motion.h2>

            {/* Short Note */}
            <motion.p
              initial={prefersReduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="mt-2.5 sm:mt-4 text-slate-600 text-xs sm:text-base lg:text-lg leading-relaxed"
            >
              No need to visit our store in person. Simply fill in your details, receive an instant booking reference code, and our team will collect your garments from your doorstep.
            </motion.p>

            {/* Feature Perks List */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="mt-4 sm:mt-8 flex flex-col gap-2.5 sm:gap-4 w-full"
            >
              <div className="flex items-start gap-2.5 sm:gap-3.5 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/70 shadow-xs">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#EBF6FE] text-[#38A8F5] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0B2540]">
                    Area Coverage
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                    RK Colony, Subhash Nagar, Azad Nagar, and all surrounding areas in Bhilwara.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 sm:gap-3.5 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/70 shadow-xs">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#EBF6FE] text-[#38A8F5] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0B2540]">
                    Same-Day Pickup
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                    Book a morning slot and get doorstep collection the very same afternoon or evening.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 sm:gap-3.5 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/70 shadow-xs">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#EBF6FE] text-[#38A8F5] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0B2540]">
                    Hygienic Protective Packaging
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                    Every cleaned garment is delivered on a premium hanger with sealed dust-proof garment bags.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN: Form Card ── */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-7 w-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-9 border border-slate-200/80 shadow-card relative"
          >
            {/* Success State Overlay */}
            <AnimatePresence>
              {bookingSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 bg-white/98 backdrop-blur-md rounded-3xl z-30 flex flex-col items-center justify-center p-6 sm:p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.1,
                    }}
                    className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-sm border border-emerald-200"
                  >
                    <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
                  </motion.div>

                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full mb-2">
                    Pickup Order Registered
                  </span>

                  <h3 className="text-2xl sm:text-3xl font-black text-[#0B2540]">
                    Booking Confirmed!
                  </h3>

                  {/* Booking Code Card */}
                  <div className="my-4 px-6 py-4 rounded-2xl bg-[#F0F8FF] border border-[#BAE0FD] flex items-center gap-3">
                    <div className="text-left">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Booking Reference Code
                      </p>
                      <p className="text-2xl font-black text-[#0B2540] tracking-wider">
                        {bookingSuccess.bookingCode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyBookingCode(bookingSuccess.bookingCode)}
                      className="ml-auto p-2 rounded-xl bg-white border border-[#BAE0FD] text-[#0284c7] hover:bg-[#E0F2FE] transition-colors"
                      title="Copy Booking Code"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <p className="text-slate-600 text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
                    Your pickup request has been saved. Click below to share your booking reference code directly with Balaji Dry Cleaners on WhatsApp for instant confirmation.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <a
                      href={getWhatsAppLink(
                        `Hello Balaji Dry Cleaners! I have booked a doorstep pickup via the website. My Booking Reference Code is: ${bookingSuccess.bookingCode}.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-5 min-h-[48px] rounded-full font-bold text-sm text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Confirm on WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="py-3 px-5 min-h-[48px] rounded-full text-xs sm:text-sm font-semibold text-[#0B2540] bg-slate-100 hover:bg-slate-200 transition-colors inline-flex items-center justify-center cursor-pointer"
                    >
                      Book Another Pickup
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 sm:gap-5">
              {/* Hidden Honeypot Field */}
              <input
                type="text"
                name="pickup_hp_verification"
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
                action="booking"
                onSuccess={(token) => setTurnstileToken(token)}
              />

              {/* Error Banner */}
              {submitError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Field 1: Name & Phone in 2-col on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1 sm:gap-1.5">
                  <label
                    htmlFor="pickup-name"
                    className="text-[11px] sm:text-sm font-bold text-[#0B2540] flex items-center gap-1.5"
                  >
                    <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#38A8F5]" />
                    <span>Full Name</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pickup-name"
                    type="text"
                    placeholder="e.g. Rajesh Sharma"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                    className={`w-full h-10 sm:h-12 rounded-xl border bg-slate-50/60 px-3 sm:px-4 text-xs sm:text-base text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#38A8F5] focus:ring-4 focus:ring-[#38A8F5]/15 ${
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
                    htmlFor="pickup-phone"
                    className="text-[11px] sm:text-sm font-bold text-[#0B2540] flex items-center gap-1.5"
                  >
                    <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#38A8F5]" />
                    <span>Mobile Number</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pickup-phone"
                    type="tel"
                    placeholder="e.g. 9829012345"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                    className={`w-full h-10 sm:h-12 rounded-xl border bg-slate-50/60 px-3 sm:px-4 text-xs sm:text-base text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#38A8F5] focus:ring-4 focus:ring-[#38A8F5]/15 ${
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

              {/* Field 2: Service Selection */}
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <label
                  htmlFor="pickup-service"
                  className="text-[11px] sm:text-sm font-bold text-[#0B2540] flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#38A8F5]" />
                  <span>Select Service</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="pickup-service"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full h-10 sm:h-12 rounded-xl border border-slate-200 bg-slate-50/60 px-3 sm:px-4 text-xs sm:text-base text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-[#38A8F5] focus:ring-4 focus:ring-[#38A8F5]/15 appearance-none cursor-pointer"
                  >
                    {siteConfig.services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Field 3: Pickup Date Picker (min today, max 30 days) */}
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <label
                  htmlFor="pickup-date"
                  className="text-[11px] sm:text-sm font-bold text-[#0B2540] flex items-center gap-1.5"
                >
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#38A8F5]" />
                  <span>Pickup Date</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="pickup-date"
                  type="date"
                  min={todayStr || undefined}
                  max={maxDateStr || undefined}
                  value={pickupDate}
                  onChange={(e) => {
                    setPickupDate(e.target.value);
                    if (errors.pickupDate)
                      setErrors((prev) => ({ ...prev, pickupDate: undefined }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, pickupDate: true }))}
                  className={`w-full h-10 sm:h-12 rounded-xl border bg-slate-50/60 px-3 sm:px-4 text-xs sm:text-base text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-[#38A8F5] focus:ring-4 focus:ring-[#38A8F5]/15 cursor-pointer ${
                    touched.pickupDate && errors.pickupDate
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-slate-200"
                  }`}
                />
                {touched.pickupDate && errors.pickupDate && (
                  <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.pickupDate}</span>
                  </p>
                )}
              </div>

              {/* Field 4: Pickup Time Slot Pills */}
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <label className="text-[11px] sm:text-sm font-bold text-[#0B2540] flex items-center gap-1.5">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#38A8F5]" />
                  <span>Pickup Time Slot</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = pickupSlot === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setPickupSlot(slot.id)}
                        className={`h-10 sm:h-12 px-1 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer border ${
                          isSelected
                            ? "bg-[#0B2540] text-white border-[#0B2540] shadow-xs scale-[1.02]"
                            : "bg-slate-50/60 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-[11px] sm:text-sm font-bold leading-none">
                          {slot.label}
                        </span>
                        <span
                          className={`text-[9px] sm:text-[11px] mt-0.5 sm:mt-1 leading-none tracking-tight ${
                            isSelected ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {slot.time}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 5: Address */}
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <label
                  htmlFor="pickup-address"
                  className="text-[11px] sm:text-sm font-bold text-[#0B2540] flex items-center gap-1.5"
                >
                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#38A8F5]" />
                  <span>Pickup Address & Landmark</span>
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="pickup-address"
                  rows={2}
                  placeholder="House/Flat No., Street, Landmark, RK Colony..."
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address)
                      setErrors((prev) => ({ ...prev, address: undefined }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, address: true }))}
                  className={`w-full rounded-xl border bg-slate-50/60 p-2.5 sm:p-3.5 text-xs sm:text-base text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#38A8F5] focus:ring-4 focus:ring-[#38A8F5]/15 resize-none ${
                    touched.address && errors.address
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-slate-200"
                  }`}
                />
                {touched.address && errors.address && (
                  <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.address}</span>
                  </p>
                )}
              </div>

              {/* Live Message Preview */}
              <div className="mt-0.5 flex flex-col gap-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 text-[#38A8F5]" />
                  <span>Live Booking Summary Preview</span>
                </span>
                <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#EBF6FE]/70 border border-[#A5D8FB]/60 text-[11px] sm:text-xs text-slate-800 font-mono whitespace-pre-line break-words leading-relaxed shadow-xs overflow-hidden">
                  {composedMessage}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full min-h-[44px] sm:min-h-[48px] rounded-full font-bold text-xs sm:text-base text-white bg-[#0B2540] hover:bg-[#163A5C] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#38A8F5]" />
                    <span>Confirming booking...</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-[#38A8F5] stroke-[2.2]" />
                    <span>Schedule Pickup</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
