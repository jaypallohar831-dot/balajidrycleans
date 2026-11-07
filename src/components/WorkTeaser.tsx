"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

interface WorkPreviewItem {
  id: string;
  title: string;
  category: string;
  before_image?: string | null;
  after_image: string;
  tag_text?: string | null;
}

export function WorkTeaser() {
  const [items, setItems] = useState<WorkPreviewItem[]>([]);
  const [activeViews, setActiveViews] = useState<Record<string, "after" | "before">>({});

  useEffect(() => {
    fetch("/api/work")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
          setItems(json.data.slice(0, 3));
        }
      })
      .catch((err) => console.error("Work teaser load failed:", err));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white via-sky-50/30 to-white relative overflow-hidden">
      <div className="container-site">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF6FE] text-[#1278BF] text-xs font-bold mb-3 border border-[#D2ECFD]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HAMARA KAAM · LIVE RESULTS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0B2540] tracking-tight">
              Before & After Dekhein — <span className="text-[#1278BF]">Asli Safai Ka Saboot</span>
            </h2>
            <p className="text-xs sm:text-base text-slate-600 mt-2 max-w-xl">
              Designer lehengas, suits aur winter blazers par hamara live cleaning aur steam finish result dekhein.
            </p>
          </div>

          <Link
            href="/work"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0B2540] hover:bg-[#163A5C] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-105 shrink-0 self-start sm:self-auto"
          >
            <span>Sabhi Work Dekhein</span>
            <ArrowRight className="w-4 h-4 text-[#38A8F5]" />
          </Link>
        </div>

        {/* 3 Work Cards Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => {
            const currentView = activeViews[item.id] || "after";
            const currentImg =
              currentView === "before" && item.before_image
                ? item.before_image
                : item.after_image;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[16/11] bg-slate-900 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentImg}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute top-2.5 left-2.5">
                      <span className="bg-[#0B2540]/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        {item.category}
                      </span>
                    </div>

                    {item.before_image && (
                      <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between">
                        <div className="bg-black/75 backdrop-blur-md p-0.5 rounded-full flex items-center gap-0.5 border border-white/20">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveViews((p) => ({ ...p, [item.id]: "before" }))
                            }
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                              currentView === "before"
                                ? "bg-amber-500 text-white"
                                : "text-slate-300 hover:text-white"
                            }`}
                          >
                            BEFORE
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveViews((p) => ({ ...p, [item.id]: "after" }))
                            }
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                              currentView === "after"
                                ? "bg-emerald-500 text-white"
                                : "text-slate-300 hover:text-white"
                            }`}
                          >
                            AFTER
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 sm:p-5">
                    <h3 className="font-bold text-base text-[#0B2540] group-hover:text-[#1278BF] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    {item.tag_text && (
                      <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-sky-50 text-[#1278BF] text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.tag_text}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link
                    href="/work"
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Full Details & Results</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#1278BF]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

