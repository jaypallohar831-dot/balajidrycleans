"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Phone,
  MessageCircle,
  Clock,
  Calendar,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  Download,
  MessageSquare,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: "new" | "contacted" | "closed";
  source: string;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

const STATUS_BADGES: Record<string, string> = {
  new: "bg-amber-100 text-amber-800 border-amber-200",
  contacted: "bg-sky-100 text-sky-800 border-sky-200",
  closed: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // Drawer / Detail state
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });
      if (searchTerm) params.set("q", searchTerm);
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      if (dateFilter) params.set("dateFrom", dateFilter);

      const res = await fetch(`/api/admin/inquiries?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setInquiries(json.data.inquiries || []);
        setTotal(json.data.total || 0);
        setTotalPages(json.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load inquiries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [page, statusFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInquiries();
  };

  const handleOpenDrawer = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setNewStatus(inquiry.status);
    setUpdateMsg(null);
  };

  const handleCloseDrawer = () => {
    setSelectedInquiry(null);
    setUpdateMsg(null);
  };

  const handleUpdateStatus = async (statusToSet?: string) => {
    if (!selectedInquiry) return;
    const targetStatus = statusToSet || newStatus;
    setIsUpdating(true);
    setUpdateMsg(null);
    try {
      const res = await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      const json = await res.json();
      if (json.ok) {
        setUpdateMsg("Inquiry status updated successfully!");
        setSelectedInquiry({ ...selectedInquiry, status: targetStatus as any });
        // Update item in local list
        setInquiries((prev) =>
          prev.map((i) =>
            i.id === selectedInquiry.id ? { ...i, status: targetStatus as any } : i
          )
        );
      } else {
        setUpdateMsg(json?.error?.message || "Failed to update inquiry status.");
      }
    } catch {
      setUpdateMsg("Network error.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportCsv = () => {
    let url = `/api/admin/export?type=inquiries`;
    if (dateFilter) url += `&dateFrom=${dateFilter}`;
    window.open(url, "_blank");
  };

  const cleanPhone = (phone: string) => phone.replace(/\D/g, "");

  const getWhatsAppLink = (inquiry: Inquiry) => {
    const raw = cleanPhone(inquiry.phone);
    const num = raw.startsWith("91") ? raw : `91${raw}`;
    const text = encodeURIComponent(
      `Hello ${inquiry.name}! This is Balaji Dry Cleaners Bhilwara regarding your website inquiry: "${inquiry.message}". How may we assist you?`
    );
    return `https://wa.me/${num}?text=${text}`;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* ── HEADER & EXPORT ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1278BF]">
            CRM & Customer Leads
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2540] tracking-tight mt-0.5">
            Customer Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage customer queries received from website contact forms.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 bg-[#0B2540] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#163A5C] transition-all shadow-sm active:scale-95"
        >
          <Download className="w-4 h-4 text-[#38A8F5]" />
          <span>CSV Export</span>
        </button>
      </div>

      {/* ── FILTERS & SEARCH BAR ── */}
      <div className="bg-white rounded-2xl p-4 mb-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38A8F5] focus:bg-white text-slate-800 placeholder-slate-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#38A8F5] text-[#0B2540] rounded-xl text-xs sm:text-sm font-bold hover:bg-[#2094E6] transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex-1 sm:flex-initial">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none w-full"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex-1 sm:flex-initial">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-medium text-slate-700 outline-none"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter("")}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── INQUIRIES LIST / TABLE ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#38A8F5] animate-spin mb-3" />
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Loading inquiries...
            </p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#1278BF] flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-[#0B2540]">No inquiries found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Reset your filters or try a different search keyword.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Message / Query</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inquiries.map((inq) => (
                    <tr
                      key={inq.id}
                      onClick={() => handleOpenDrawer(inq)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-[#0B2540] flex items-center justify-center font-bold text-xs">
                            {inq.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-[#0B2540] group-hover:text-[#1278BF] transition-colors block">
                              {inq.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              via {inq.source || "website"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {inq.phone}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="line-clamp-2 text-xs text-slate-600 font-medium leading-relaxed">
                          {inq.message || "—"}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${
                            STATUS_BADGES[inq.status] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {inq.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {new Date(inq.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a
                            href={`tel:${cleanPhone(inq.phone)}`}
                            title="Call customer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={getWhatsAppLink(inq)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="WhatsApp message"
                            className="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-slate-100">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  onClick={() => handleOpenDrawer(inq)}
                  className="p-4 hover:bg-slate-50 transition-colors cursor-pointer space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-[#0B2540]">{inq.name}</div>
                      <div className="text-xs font-mono text-slate-500">{inq.phone}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize shrink-0 ${
                        STATUS_BADGES[inq.status] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {inq.message || "No message provided."}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      {new Date(inq.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href={`tel:${cleanPhone(inq.phone)}`}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-xs flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                      <a
                        href={getWhatsAppLink(inq)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-green-50 text-green-700 font-bold rounded-lg text-xs flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination footer */}
            <div className="p-3.5 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                Total <strong className="text-slate-800">{total}</strong> inquiries
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold disabled:opacity-40 hover:bg-slate-50"
                >
                  Pichla
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold disabled:opacity-40 hover:bg-slate-50"
                >
                  Agla
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── DETAIL DRAWER (SLIDE-OVER) ── */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={handleCloseDrawer}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between overflow-y-auto">
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#38A8F5]/10 text-[#1278BF] flex items-center justify-center font-bold">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-black text-[#0B2540] text-base">Inquiry Details</h2>
                    <p className="text-[11px] text-slate-400">
                      ID: {selectedInquiry.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-5 space-y-5 flex-1">
                {/* Customer card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0B2540] text-white flex items-center justify-center font-bold text-sm">
                      {selectedInquiry.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-[#0B2540] truncate">
                        {selectedInquiry.name}
                      </h3>
                      <p className="text-xs font-mono text-slate-500">
                        {selectedInquiry.phone}
                      </p>
                    </div>
                  </div>

                  {/* Call & WhatsApp Quick Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${cleanPhone(selectedInquiry.phone)}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Customer</span>
                    </a>
                    <a
                      href={getWhatsAppLink(selectedInquiry)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#25D366] text-white rounded-xl text-xs font-bold hover:bg-[#20ba59] transition-colors shadow-xs active:scale-95"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Customer Message */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Customer Message
                  </label>
                  <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {selectedInquiry.message || "No message text provided."}
                  </div>
                </div>

                {/* Status Update Section */}
                <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-3">
                  <label className="text-xs font-bold text-[#0B2540] block">
                    Update Inquiry Status
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["new", "contacted", "closed"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleUpdateStatus(s)}
                        disabled={isUpdating}
                        className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                          selectedInquiry.status === s
                            ? "bg-[#0B2540] text-white border-[#0B2540] shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {updateMsg && (
                    <p className="text-[11px] font-semibold text-sky-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {updateMsg}
                    </p>
                  )}
                </div>

                {/* Meta details */}
                <div className="text-[11px] text-slate-400 space-y-1">
                  <p>
                    <strong>Submitted:</strong>{" "}
                    {new Date(selectedInquiry.created_at).toLocaleString("en-IN")}
                  </p>
                  <p>
                    <strong>Source:</strong> {selectedInquiry.source || "website"}
                  </p>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <a
                  href={getWhatsAppLink(selectedInquiry)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#38A8F5] text-[#0B2540] rounded-xl text-xs font-bold hover:bg-[#2094E6] transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
