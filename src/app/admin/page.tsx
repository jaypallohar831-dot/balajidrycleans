
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Calendar,
  Clock,
  PackageCheck,
  ArrowRight,
  Download,
  RefreshCw,
  Loader2,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  Plus,
  Sparkles,
} from "lucide-react";

interface StatsData {
  metrics: {
    newInquiries: number;
    newBookingsToday: number;
    pendingPickups: number;
    readyForDelivery: number;
  };
  recentActivity: Array<{
    id: string;
    type: "booking" | "inquiry";
    title: string;
    subtitle: string;
    status: string;
    created_at: string;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportType, setExportType] = useState<"bookings" | "inquiries">("bookings");
  const [isExporting, setIsExporting] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message || "Failed to load dashboard");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err?.message || "Stats fetch error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExportCsv = (type: "bookings" | "inquiries") => {
    const url = `/api/admin/export?type=${type}`;
    window.open(url, "_blank");
  };

  const statusColors: Record<string, string> = {
    new: "bg-amber-100 text-amber-800 border-amber-200",
    pending: "bg-sky-100 text-sky-800 border-sky-200",
    contacted: "bg-blue-100 text-blue-800 border-blue-200",
    confirmed: "bg-indigo-100 text-indigo-800 border-indigo-200",
    picked_up: "bg-purple-100 text-purple-800 border-purple-200",
    delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
    closed: "bg-slate-100 text-slate-800 border-slate-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1278BF]">
            Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2540] tracking-tight mt-0.5">
            Store Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time orders, customer inquiries, and daily updates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchStats}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
            title="Refresh Stats"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#1278BF]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => handleExportCsv("bookings")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#0B2540] hover:bg-[#163A5C] transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-[#38A8F5]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchStats} className="ml-auto text-xs underline font-bold">
            Try again
          </button>
        </div>
      )}

      {/* ── 4 SUMMARY METRIC CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 mb-8">
        {/* Card 1: New Inquiries */}
        <Link
          href="/admin/inquiries?status=new"
          className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-soft hover:shadow-elevated transition-all duration-200 hover:-translate-y-1 block group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              New Inquiries
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B2540]">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : data?.metrics.newInquiries ?? 0}
          </div>
          <span className="text-[11px] sm:text-xs text-amber-600 font-semibold mt-1 inline-flex items-center gap-1">
            <span>View Inquiries</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        {/* Card 2: Bookings Today */}
        <Link
          href="/admin/bookings"
          className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-soft hover:shadow-elevated transition-all duration-200 hover:-translate-y-1 block group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Bookings Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B2540]">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : data?.metrics.newBookingsToday ?? 0}
          </div>
          <span className="text-[11px] sm:text-xs text-blue-600 font-semibold mt-1 inline-flex items-center gap-1">
            <span>Today&apos;s orders</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        {/* Card 3: Pending Pickups */}
        <Link
          href="/admin/bookings?status=pending"
          className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-soft hover:shadow-elevated transition-all duration-200 hover:-translate-y-1 block group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Pickups
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B2540]">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : data?.metrics.pendingPickups ?? 0}
          </div>
          <span className="text-[11px] sm:text-xs text-purple-600 font-semibold mt-1 inline-flex items-center gap-1">
            <span>Pickups pending</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        {/* Card 4: Ready for Delivery */}
        <Link
          href="/admin/bookings?status=picked_up"
          className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-soft hover:shadow-elevated transition-all duration-200 hover:-translate-y-1 block group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Ready for Delivery
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B2540]">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : data?.metrics.readyForDelivery ?? 0}
          </div>
          <span className="text-[11px] sm:text-xs text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
            <span>Out for delivery</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
      </div>

      {/* ── WORK SHOWCASE QUICK ACCESS BANNER ── */}
      <div className="bg-gradient-to-r from-[#0B2540] to-[#14426E] rounded-3xl p-5 sm:p-6 mb-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#38A8F5]/20 border border-[#38A8F5]/30 flex items-center justify-center text-[#38A8F5] shrink-0">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Our Work (Showcase Gallery)
              </h3>
              <span className="text-[10px] font-extrabold uppercase bg-[#38A8F5] text-[#0B2540] px-2 py-0.5 rounded-full">
                New Page
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Add and manage Before & After dry cleaning transformation photos and tags.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/work"
            target="_blank"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            View Live Page
          </Link>
          <Link
            href="/admin/work"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#38A8F5] hover:bg-[#2597e8] text-[#0B2540] flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Manage Showcase</span>
          </Link>
        </div>
      </div>

      {/* ── LATEST ACTIVITY FEED ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-5 sm:p-7">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#0B2540]">
              Latest Activity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Recent pickup bookings and contact inquiries.
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-bold text-[#1278BF] hover:underline"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#38A8F5] mb-2" />
            <p className="text-sm">Loading activity...</p>
          </div>
        ) : !data?.recentActivity || data.recentActivity.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No recent activity recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.recentActivity.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${item.type === "booking"
                        ? "bg-sky-50 text-[#1278BF]"
                        : "bg-amber-50 text-amber-600"
                      }`}
                  >
                    {item.type === "booking" ? (
                      <CalendarCheck className="w-4 h-4" />
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0B2540]">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center ml-12 sm:ml-0">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${statusColors[item.status] || "bg-slate-100 text-slate-700"
                      }`}
                  >
                    {item.status.replace("_", " ")}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
