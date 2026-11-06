"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  MessageCircle,
  CalendarCheck,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers,
  ChevronRight,
  Droplet,
  ExternalLink,
  Flame,
  Shirt,
  X,
  Maximize2,
} from "lucide-react";
import { siteConfig, getWhatsAppLink } from "@/config/site";
import { Footer } from "@/components/Footer";

interface WorkItem {
  id: string;
  title: string;
  category: string;
  description: string;
  before_image?: string | null;
  after_image: string;
  tags?: string[];
  tag_text?: string | null;
  customer_note?: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function WorkShowcasePage() {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeViews, setActiveViews] = useState<Record<string, "after" | "before">>({});
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    fetch("/api/work")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && Array.isArray(json.data)) {
          setWorks(json.data);
        }
      })
      .catch((err) => console.error("Error fetching works:", err))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    "all",
    ...Array.from(new Set(works.map((w) => w.category).filter(Boolean))),
  ];

  const filteredWorks =
    selectedCategory === "all"
      ? works
      : works.filter((w) => w.category === selectedCategory);

  const toggleView = (id: string, view: "before" | "after") => {
    setActiveViews((prev) => ({ ...prev, [id]: view }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col">
      {/* ── MAIN SHOWCASE HERO ── */}
      <section className="pt-28 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-[#0B2540] via-[#0F355A] to-[#F8FAFC]">
        {/* Glow lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#38A8F5]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#6EC0F8] text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#38A8F5]" />
            <span>Balaji Dry Cleaners · Live Results</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Hamara Kaam · <span className="text-[#38A8F5]">Before & After</span>
          </h1>

          <p className="mt-4 text-sm sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Dekhein hamari safai, delicate fabric care aur steam finishing ka live
            result. Wedding wear se lekar heavy blankets tak, har kapde par 100%
            quality guarantee.
          </p>

          {/* Quick Stats Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-white/90">
            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#38A8F5]" />
              <span>100% Fabric & Color Safe</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Italian Steam Finishing</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-2">
              <Droplet className="w-4 h-4 text-sky-400" />
              <span>Specialised Spotting Treatment</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER TABS ── */}
      <section className="sticky top-20 z-30 bg-[#F8FAFC]/95 backdrop-blur-md py-4 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0B2540] text-white shadow-sm scale-[1.02]"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat === "all" ? `Sabhi Work (${works.length})` : cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WORK ITEMS GRID ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-10 h-10 border-4 border-[#1278BF] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-semibold">Work showcase load ho raha hai...</p>
          </div>
        ) : filteredWorks.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">
            <Sparkles className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">
              Is category mein abhi koi work nahi hai.
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Jald hi nayi photos update hongi. Dusri category check karein.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="mt-4 px-4 py-2 rounded-xl bg-[#1278BF] text-white text-sm font-bold"
            >
              Sabhi Work Dekhein
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredWorks.map((item) => {
              const currentView = activeViews[item.id] || "after";
              const currentImageUrl =
                currentView === "before" && item.before_image
                  ? item.before_image
                  : item.after_image;

              const whatsappInquiryText = `Namaste Balaji Dry Cleaners! Maine aapki website par "${item.title}" ka result dekha. Mujhe bhi aisa dry cleaning kaam karwana hai. Kripya details aur pickup ki jaankari dein.`;
              const itemWaUrl = getWhatsAppLink(whatsappInquiryText);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Area with Interactive Before/After Toggle */}
                    <div className="relative aspect-[16/11] bg-slate-900 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentImageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Top Category Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                        <span className="bg-[#0B2540]/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                          {item.category}
                        </span>
                        {item.is_featured && (
                          <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
                            FEATURED
                          </span>
                        )}
                      </div>

                      {/* Fullscreen Zoom Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxImage({
                            url: currentImageUrl,
                            title: `${item.title} (${currentView === "before" ? "Before" : "After"})`,
                          })
                        }
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-transform hover:scale-110 z-10 cursor-pointer"
                        title="Bada karke dekhein"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Bottom Toggle Pills (Before / After) if Before exists */}
                      {item.before_image ? (
                        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between z-10">
                          <div className="bg-black/75 backdrop-blur-md p-1 rounded-full flex items-center gap-1 shadow-lg border border-white/20">
                            <button
                              type="button"
                              onClick={() => toggleView(item.id, "before")}
                              className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer ${
                                currentView === "before"
                                  ? "bg-amber-500 text-white shadow-xs"
                                  : "text-slate-300 hover:text-white"
                              }`}
                            >
                              BEFORE (Pehle)
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleView(item.id, "after")}
                              className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer ${
                                currentView === "after"
                                  ? "bg-emerald-500 text-white shadow-xs"
                                  : "text-slate-300 hover:text-white"
                              }`}
                            >
                              AFTER (Naya)
                            </button>
                          </div>

                          <span className="text-[10px] font-bold text-white/90 bg-black/60 px-2 py-1 rounded-md backdrop-blur-xs">
                            Tap to compare
                          </span>
                        </div>
                      ) : (
                        <div className="absolute bottom-3 right-3 z-10">
                          <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                            AFTER STEAM CLEAN
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-6">
                      <h2 className="text-lg font-bold text-[#0B2540] group-hover:text-[#1278BF] transition-colors leading-snug">
                        {item.title}
                      </h2>

                      <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {item.description}
                      </p>

                      {/* Tag pill */}
                      {item.tag_text && (
                        <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EBF6FE] text-[#1278BF] text-xs font-bold border border-[#D2ECFD]">
                          <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.tag_text}</span>
                        </div>
                      )}

                      {/* Customer Review Note if available */}
                      {item.customer_note && (
                        <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
                          &ldquo;{item.customer_note}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action CTAs */}
                  <div className="p-5 pt-0 flex flex-col gap-2">
                    <a
                      href={itemWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.01]"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Aisa Kaam Karwayein (WhatsApp)</span>
                    </a>

                    <Link
                      href="/#pickup"
                      className="w-full py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-[#1278BF]" />
                      <span>Pickup Book Karein</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── WHY BALAJI ASSURANCE BANNER ── */}
        <div className="mt-16 p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#0B2540] to-[#123A63] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#38A8F5]">
              Bhilwara Ka No. 1 Dry Cleaner
            </span>
            <h3 className="text-2xl sm:text-3xl font-black mt-1">
              Aapke Mehnge Kapde Hamare Saath Surakshit Hain
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Zari sarees, Italian blazers, ya delicate lehengas — hum har kapde ki
              fabric sensitivity samajhkar customised spotting aur steam pressing
              karte hain.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/#pickup"
                className="px-5 py-2.5 rounded-xl bg-[#38A8F5] hover:bg-[#2094E3] text-[#0B2540] text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-105 inline-flex items-center gap-2"
              >
                <span>Free Doorstep Pickup Book Karein</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/918005817455"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Call / WhatsApp: 8005817455</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* ── LIGHTBOX MODAL ── */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="max-w-4xl w-full max-h-[90vh] flex flex-col items-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 p-2"
            >
              <X className="w-6 h-6" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <p className="mt-3 text-white text-sm font-bold text-center">
              {lightboxImage.title}
            </p>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}

