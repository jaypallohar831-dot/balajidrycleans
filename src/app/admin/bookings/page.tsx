"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Phone,
  MessageCircle,
  Clock,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Sparkles,
  Download,
  History,
  CalendarCheck,
  Navigation,
  ExternalLink,
} from "lucide-react";

interface Booking {
  id: string;
  booking_code: string;
  name: string;
  phone: string;
  service: string;
  pickup_slot: string;
  pickup_date: string;
  address: string;
  status: string;
  notes: string | null;
  created_at: string;
}

interface StatusHistoryItem {
  id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  changed_by: string;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "picked_up", label: "Picked Up" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_BADGES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-sky-100 text-sky-800 border-sky-200",
  picked_up: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // Drawer state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingHistory, setBookingHistory] = useState<StatusHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });
      if (searchTerm) params.set("q", searchTerm);
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      if (dateFilter) params.set("dateFrom", dateFilter);

      const res = await fetch(`/api/admin/bookings?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setBookings(json.data.bookings);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  const openDrawer = async (booking: Booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setAdminNote(booking.notes || "");
    setUpdateMsg(null);
    setHistoryLoading(true);

    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`);
      const json = await res.json();
      if (json.ok && json.data.history) {
        setBookingHistory(json.data.history);
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeDrawer = () => {
    setSelectedBooking(null);
    setBookingHistory([]);
    setUpdateMsg(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedBooking) return;
    setIsUpdating(true);
    setUpdateMsg(null);

    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: adminNote,
          adminNote: adminNote ? `Note: ${adminNote}` : undefined,
        }),
      });

      const json = await res.json();
      if (json.ok) {
        setUpdateMsg("Status updated successfully!");
        setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus, notes: adminNote } : null));
        // refresh list
        fetchBookings();
        // re-fetch history
        const hRes = await fetch(`/api/admin/bookings/${selectedBooking.id}`);
        const hJson = await hRes.json();
        if (hJson.ok) setBookingHistory(hJson.data.history || []);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const getWhatsAppMessage = (booking: Booking) => {
    if (booking.status === "picked_up") {
      return `Hello ${booking.name}! Your garments have been picked up for dry cleaning (Booking Code: ${booking.booking_code}). - Balaji Dry Cleaners`;
    }
    if (booking.status === "delivered") {
      return `Hello ${booking.name}! Your freshly dry cleaned garments have been delivered (Booking Code: ${booking.booking_code}). Thank you for choosing Balaji Dry Cleaners!`;
    }
    return `Hello ${booking.name}! This is an update regarding your pickup booking ${booking.booking_code} from Balaji Dry Cleaners.`;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1278BF]">
            Manage Orders
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2540] tracking-tight mt-0.5">
            Pickup Bookings ({total})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Search orders, update statuses, and connect with customers via Call or WhatsApp.
          </p>
        </div>

        <a
          href="/api/admin/export?type=bookings"
          target="_blank"
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#0B2540] bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-2xs"
        >
          <Download className="w-4 h-4 text-[#1278BF]" />
          <span>Export CSV</span>
        </a>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, phone, or booking code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#38A8F5]"
          />
        </form>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-slate-200 px-3 text-xs sm:text-sm text-slate-700 bg-white outline-none focus:border-[#38A8F5] cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-slate-200 px-3 text-xs sm:text-sm text-slate-700 bg-white outline-none focus:border-[#38A8F5] cursor-pointer"
          />

          {(searchTerm || statusFilter !== "all" || dateFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setDateFilter("");
                setPage(1);
              }}
              className="text-xs text-red-500 font-bold hover:underline px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── BOOKINGS LIST / TABLE ── */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-[#38A8F5] mb-2" />
          <p className="text-sm">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-6">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#0B2540]">No bookings found</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            No records match your selected filters, or no new bookings have been submitted yet.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Pickup Date & Slot</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => openDrawer(b)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0B2540]">
                      {b.booking_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#0B2540]">{b.name}</div>
                      <div className="text-xs text-slate-500">{b.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 capitalize">
                      {b.service.replace(/-/g, " ")}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{b.pickup_date}</div>
                      <div className="text-xs text-slate-500 capitalize">{b.pickup_slot}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                          STATUS_BADGES[b.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {b.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`tel:${b.phone}`}
                          className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:text-[#0B2540] hover:bg-slate-100"
                          title="Call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/${b.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            getWhatsAppMessage(b)
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openDrawer(b)}
                          className="px-2.5 py-1 text-xs font-bold text-[#1278BF] hover:bg-sky-50 rounded-lg"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="lg:hidden divide-y divide-slate-100">
            {bookings.map((b) => (
              <div
                key={b.id}
                onClick={() => openDrawer(b)}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#1278BF] bg-sky-50 px-2 py-0.5 rounded-md">
                    {b.booking_code}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                      STATUS_BADGES[b.status] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {b.status.replace("_", " ")}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#0B2540]">{b.name}</h4>
                    <p className="text-xs text-slate-500">{b.phone}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-medium text-slate-700">{b.pickup_date}</p>
                    <p className="text-slate-400 capitalize">{b.pickup_slot}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 truncate mt-0.5">
                  📍 {b.address}
                </p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50 mt-1" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={`tel:${b.phone}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700"
                  >
                    <Phone className="w-3 h-3 text-[#38A8F5]" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${b.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      getWhatsAppMessage(b)
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-xs font-semibold text-emerald-700"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {totalPages} ({total} total)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAIL DRAWER (SLIDE-OVER) ── */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={closeDrawer}
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 border-l border-slate-200">
            {/* Drawer Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Booking Details
                </span>
                <h3 className="text-xl font-black text-[#0B2540] flex items-center gap-2 mt-0.5">
                  <span>{selectedBooking.booking_code}</span>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                      STATUS_BADGES[selectedBooking.status] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {selectedBooking.status.replace("_", " ")}
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 sm:p-6 flex flex-col gap-6 flex-1">
              {updateMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{updateMsg}</span>
                </div>
              )}

              {/* Customer Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${selectedBooking.phone}`}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B2540] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#38A8F5]" />
                  <span>Call Customer</span>
                </a>

                <a
                  href={`https://wa.me/${selectedBooking.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    getWhatsAppMessage(selectedBooking)
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp Message</span>
                </a>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    selectedBooking.address + ", Bhilwara, Rajasthan"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-2 py-2.5 px-3 rounded-xl bg-[#EBF6FE] hover:bg-[#D2ECFD] text-[#1278BF] text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-[#D2ECFD]"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#38A8F5]" />
                  <span>Live Pickup Route (Google Maps Navigation)</span>
                  <ExternalLink className="w-3 h-3 text-[#1278BF]" />
                </a>
              </div>

              {/* Customer Details Table */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 text-xs sm:text-sm flex flex-col gap-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-[#0B2540]">{selectedBooking.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold text-slate-800">{selectedBooking.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-[#1278BF] capitalize">
                    {selectedBooking.service.replace(/-/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pickup Date:</span>
                  <span className="font-semibold text-slate-800">{selectedBooking.pickup_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Slot:</span>
                  <span className="font-semibold text-slate-800 capitalize">{selectedBooking.pickup_slot}</span>
                </div>
                <div className="pt-2 border-t border-slate-200/70">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-slate-500">Address:</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        selectedBooking.address + ", Bhilwara, Rajasthan"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1278BF] hover:underline"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Live Map</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <span className="text-slate-800 font-medium leading-relaxed">
                    📍 {selectedBooking.address}
                  </span>
                </div>
                {selectedBooking.notes && (
                  <div className="pt-2 border-t border-slate-200/70">
                    <span className="text-slate-500 block mb-0.5">Customer Note:</span>
                    <span className="text-slate-700 italic">&ldquo;{selectedBooking.notes}&rdquo;</span>
                  </div>
                )}
              </div>

              {/* Change Status & Notes Form */}
              <div className="flex flex-col gap-3 pt-2">
                <label className="text-xs font-bold text-[#0B2540] uppercase tracking-wider">
                  Update Status & Admin Note
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#38A8F5]"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <textarea
                  rows={2}
                  placeholder="Enter admin note (e.g., Rider Rahul assigned)..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#38A8F5] resize-none"
                />

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleUpdateStatus}
                  className="py-2.5 px-4 rounded-xl bg-[#0B2540] hover:bg-[#163A5C] text-white text-xs font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38A8F5]" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Status</span>
                  )}
                </button>
              </div>

              {/* Status Transition History */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B2540] mb-3">
                  <History className="w-3.5 h-3.5 text-[#1278BF]" />
                  <span>Status History Timeline</span>
                </div>

                {historyLoading ? (
                  <div className="py-4 text-center text-xs text-slate-400">Loading history...</div>
                ) : bookingHistory.length === 0 ? (
                  <p className="text-xs text-slate-400">No status changes recorded yet.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {bookingHistory.map((h) => (
                      <div key={h.id} className="text-xs border-l-2 border-[#38A8F5] pl-3 py-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 capitalize">
                            {h.to_status.replace("_", " ")}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            by {h.changed_by} · {new Date(h.created_at).toLocaleString()}
                          </span>
                        </div>
                        {h.note && <p className="text-slate-600 mt-0.5 italic">{h.note}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
