"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit3,
  Check,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Shirt,
  Flame,
  ShieldCheck,
  Layers,
  Clock,
  Droplet,
  Zap,
} from "lucide-react";

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  inquiry: string;
  display_order: number;
  is_active: boolean;
}

const AVAILABLE_ICONS = [
  { name: "Sparkles", icon: Sparkles },
  { name: "Shirt", icon: Shirt },
  { name: "Flame", icon: Flame },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "Layers", icon: Layers },
  { name: "Clock", icon: Clock },
  { name: "Droplet", icon: Droplet },
  { name: "Zap", icon: Zap },
];

function getIconComponent(iconName: string) {
  const match = AVAILABLE_ICONS.find((i) => i.name.toLowerCase() === iconName?.toLowerCase());
  return match ? match.icon : Sparkles;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Sparkles");
  const [inquiry, setInquiry] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      const json = await res.json();
      if (json.ok) {
        setServices(json.data || []);
      }
    } catch {
      setMessage({ text: "Services load karne mein samasya aayi.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setTitle("");
    setDescription("");
    setIcon("Sparkles");
    setInquiry("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (service: ServiceItem) => {
    setEditingService(service);
    setTitle(service.title);
    setDescription(service.description);
    setIcon(service.icon || "Sparkles");
    setInquiry(service.inquiry || "");
    setIsActive(service.is_active);
    setIsModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setMessage({ text: "Title aur Description bharo.", type: "error" });
      return;
    }

    setActionLoading(true);
    setMessage(null);

    try {
      if (editingService) {
        // Edit existing
        const res = await fetch("/api/admin/services", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingService.id,
            title,
            description,
            icon,
            inquiry: inquiry || `Namaste Balaji Dry Cleaners! Mujhe ${title} dry clean karwana hai.`,
            is_active: isActive,
          }),
        });
        const json = await res.json();
        if (json.ok) {
          setMessage({ text: "Service safaltapoorvak update ho gayi!", type: "success" });
          setIsModalOpen(false);
          fetchServices();
        } else {
          setMessage({ text: json?.error?.message || "Error updating service", type: "error" });
        }
      } else {
        // Create new
        const res = await fetch("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            icon,
            inquiry: inquiry || `Namaste Balaji Dry Cleaners! Mujhe ${title} dry clean karwana hai.`,
            display_order: services.length + 1,
            is_active: isActive,
          }),
        });
        const json = await res.json();
        if (json.ok) {
          setMessage({ text: "Nayi service add ho gayi!", type: "success" });
          setIsModalOpen(false);
          fetchServices();
        } else {
          setMessage({ text: json?.error?.message || "Error adding service", type: "error" });
        }
      }
    } catch {
      setMessage({ text: "Network samasya aayi.", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleHide = async (service: ServiceItem) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: service.id,
          is_active: !service.is_active,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, is_active: !s.is_active } : s))
        );
        setMessage({
          text: `Service '${service.title}' ab ${!service.is_active ? "Dikhayi degi (Active)" : "Chhupi hui (Hidden)"} hai.`,
          type: "success",
        });
      }
    } catch {
      setMessage({ text: "Toggle karne mein samasya.", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const newOrder = [...services];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    // Recalculate display_order indices
    const updatedWithOrder = newOrder.map((s, idx) => ({
      ...s,
      display_order: idx + 1,
    }));

    setServices(updatedWithOrder);
    setActionLoading(true);

    try {
      const reorderPayload = updatedWithOrder.map((s) => ({
        id: s.id,
        display_order: s.display_order,
      }));

      await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorder: reorderPayload }),
      });
      setMessage({ text: "Services ka kram (order) update ho gaya!", type: "success" });
    } catch {
      setMessage({ text: "Reorder save karne mein samasya.", type: "error" });
      fetchServices();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1278BF]">
            Catalog & Offerings
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2540] tracking-tight mt-0.5">
            Services Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Website par dikhne wali dry cleaning aur laundry services ko jodein, badlein ya chhupayein.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 bg-[#38A8F5] text-[#0B2540] rounded-xl text-xs sm:text-sm font-bold hover:bg-[#2094E6] transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nayi Service Jodein</span>
        </button>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-3.5 mb-6 rounded-xl flex items-center justify-between text-xs sm:text-sm font-semibold border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── SERVICES LIST ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#38A8F5] animate-spin mb-3" />
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Services load ho rahi hain...
            </p>
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#1278BF] flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-[#0B2540]">Koi service uplabdh nahi hai</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              &quot;Nayi Service Jodein&quot; button par click karke shuru karein.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {services.map((svc, index) => {
              const IconComp = getIconComponent(svc.icon);
              return (
                <div
                  key={svc.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                    !svc.is_active ? "bg-slate-50/70 opacity-60" : "hover:bg-slate-50/50"
                  }`}
                >
                  {/* Left: Reorder controls + Icon + Title/Desc */}
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-1 shrink-0 pt-0.5 sm:pt-0">
                      <button
                        type="button"
                        disabled={index === 0 || actionLoading}
                        onClick={() => handleMoveOrder(index, "up")}
                        title="Move Up"
                        className="p-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100 transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === services.length - 1 || actionLoading}
                        onClick={() => handleMoveOrder(index, "down")}
                        title="Move Down"
                        className="p-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100 transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Icon Box */}
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#1278BF] flex items-center justify-center shrink-0 border border-sky-100">
                      <IconComp className="w-5 h-5" />
                    </div>

                    {/* Title & Description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-[#0B2540]">{svc.title}</h3>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          #{svc.display_order}
                        </span>
                        {!svc.is_active && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                            Hidden / Chhupi Hui
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {svc.description}
                      </p>
                      {svc.inquiry && (
                        <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-1">
                          WhatsApp prompt: &quot;{svc.inquiry}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Hide / Show Toggle */}
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleToggleHide(svc)}
                      title={svc.is_active ? "Hide Service" : "Show Service"}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                        svc.is_active
                          ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      {svc.is_active ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                          <span>Chhupayein</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Dikhayein</span>
                        </>
                      )}
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => openEditModal(svc)}
                      className="px-3 py-1.5 bg-[#0B2540] text-white rounded-xl text-xs font-bold hover:bg-[#163A5C] transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#38A8F5]" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            />

            {/* Modal Dialog */}
            <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 z-10 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#1278BF] flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-black text-[#0B2540] text-base">
                      {editingService ? "Service Edit Karein" : "Nayi Service Jodein"}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Catalog mein services customer ke samne dikhayi dengi.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Service Ka Naam (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Designer Wear Care"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38A8F5] focus:bg-white text-slate-800"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Description (Vivaran) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Zari, resham aur embroidery ke liye gentle organic chemical wash."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38A8F5] focus:bg-white text-slate-800"
                  />
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Icon Chuniye
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {AVAILABLE_ICONS.map((item) => {
                      const IconC = item.icon;
                      const isSelected = icon === item.name;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setIcon(item.name)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                            isSelected
                              ? "bg-[#38A8F5]/10 border-[#38A8F5] text-[#1278BF] font-bold"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <IconC className="w-4 h-4" />
                          <span className="text-[10px] truncate max-w-full">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* WhatsApp Inquiry Text */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    WhatsApp Inquiry Prompt Text
                  </label>
                  <input
                    type="text"
                    placeholder="Namaste Balaji Dry Cleaners! Mujhe service chahiye."
                    value={inquiry}
                    onChange={(e) => setInquiry(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38A8F5] focus:bg-white text-slate-800 placeholder-slate-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Jab customer is service par click karega toh WhatsApp par yeh prefilled text aayega.
                  </p>
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveCheckbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#38A8F5] rounded border-slate-300 focus:ring-[#38A8F5]"
                  />
                  <label htmlFor="isActiveCheckbox" className="text-xs font-bold text-slate-700">
                    Website par dikhayein (Active on site)
                  </label>
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-[#38A8F5] text-[#0B2540] rounded-xl text-xs sm:text-sm font-bold hover:bg-[#2094E6] transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingService ? "Changes Save Karein" : "Service Add Karein"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
