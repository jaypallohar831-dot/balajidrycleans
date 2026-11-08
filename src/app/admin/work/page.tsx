"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Check,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  ExternalLink,
  Search,
  Filter,
  Star,
  Layers,
  ArrowRight,
  ImageIcon,
} from "lucide-react";

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

const CATEGORY_PRESETS = [
  "Saree & Lehenga",
  "Wedding Wear",
  "Winter Care",
  "Stain Removal",
  "Quilts & Blankets",
  "Daily Wear",
  "Shoes & Bags",
  "Curtains & Sofa",
];

export default function AdminWorkPage() {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    featured: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Saree & Lehenga");
  const [description, setDescription] = useState("");
  const [beforeImage, setBeforeImage] = useState("");
  const [afterImage, setAfterImage] = useState("");
  const [tagText, setTagText] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);

  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  const fetchWorks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/work");
      const json = await res.json();
      if (json.ok && json.data) {
        setWorks(json.data.items || []);
        if (json.data.stats) {
          setStats(json.data.stats);
        }
      }
    } catch {
      setMessage({
        text: "Failed to load work items. Please refresh.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle("");
    setCategory("Saree & Lehenga");
    setDescription("");
    setBeforeImage("");
    setAfterImage("");
    setTagText("100% Spotless Finish");
    setCustomerNote("");
    setIsFeatured(false);
    setIsActive(true);
    setDisplayOrder(works.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (item: WorkItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category || "General");
    setDescription(item.description);
    setBeforeImage(item.before_image || "");
    setAfterImage(item.after_image);
    setTagText(item.tag_text || "");
    setCustomerNote(item.customer_note || "");
    setIsFeatured(!!item.is_featured);
    setIsActive(item.is_active);
    setDisplayOrder(item.display_order || 0);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (
    file: File,
    type: "before" | "after"
  ) => {
    const isBefore = type === "before";
    if (isBefore) setUploadingBefore(true);
    else setUploadingAfter(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/work/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message || "Upload failed");
      }

      if (isBefore) {
        setBeforeImage(json.data.url);
      } else {
        setAfterImage(json.data.url);
      }
      setMessage({
        text: `${type === "before" ? "Before" : "After"} photo uploaded successfully!`,
        type: "success",
      });
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "Photo upload error";
      setMessage({ text: errMsg, type: "error" });
    } finally {
      if (isBefore) setUploadingBefore(false);
      else setUploadingAfter(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !afterImage.trim()) {
      setMessage({
        text: "Please provide both a Title and an After Photo.",
        type: "error",
      });
      return;
    }

    setActionLoading(true);
    setMessage(null);

    const payload = {
      id: editingItem ? editingItem.id : undefined,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      before_image: beforeImage.trim() || null,
      after_image: afterImage.trim(),
      tag_text: tagText.trim() || null,
      customer_note: customerNote.trim() || null,
      is_featured: isFeatured,
      is_active: isActive,
      display_order: Number(displayOrder) || 0,
    };

    try {
      const url = "/api/admin/work";
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message || "Failed to save work item.");
      }

      setMessage({
        text: editingItem
          ? "Showcase project updated successfully!"
          : "New showcase project added successfully!",
        type: "success",
      });
      setIsModalOpen(false);
      fetchWorks();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setMessage({ text: msg, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (item: WorkItem) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/work", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, is_active: !item.is_active }),
      });
      const json = await res.json();
      if (json.ok) {
        setWorks((prev) =>
          prev.map((w) => (w.id === item.id ? { ...w, is_active: !w.is_active } : w))
        );
        setMessage({
          text: `"${item.title}" is now ${!item.is_active ? "live on the website" : "hidden"}.`,
          type: "success",
        });
      }
    } catch {
      setMessage({ text: "Failed to update status. Please try again.", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (item: WorkItem) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${item.title}"?`
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/work?id=${item.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.ok) {
        setWorks((prev) => prev.filter((w) => w.id !== item.id));
        setMessage({
          text: "Work project deleted successfully.",
          type: "success",
        });
      } else {
        throw new Error(json?.error?.message || "Delete failed");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete error";
      setMessage({ text: msg, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // Filter items
  const filteredWorks = works.filter((w) => {
    const matchesSearch =
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || w.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const allCategories = Array.from(
    new Set(works.map((w) => w.category).filter(Boolean))
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1278BF]">
              Portfolio & Showcase
            </span>
            <span className="text-[11px] font-bold bg-[#EBF6FE] text-[#1278BF] px-2.5 py-0.5 rounded-full border border-[#D2ECFD]">
              {works.length} Projects
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2540] tracking-tight mt-0.5">
            Our Work (Showcase Gallery)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your Before & After dry cleaning transformation photos, descriptions, and tags.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/work"
            target="_blank"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-xs"
          >
            <ExternalLink className="w-4 h-4 text-[#1278BF]" />
            <span>View on Live Website</span>
          </Link>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1278BF] hover:bg-[#0E6099] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#1278BF]/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* ── ALERTS ── */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-medium transition-all ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── METRICS SUMMARY ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total Work Projects</p>
          <p className="text-2xl font-black text-[#0B2540] mt-1">{stats.total || works.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Active Live on Website</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {works.filter((w) => w.is_active).length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Featured On Top</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {works.filter((w) => w.is_featured).length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Categories</p>
          <p className="text-2xl font-black text-[#1278BF] mt-1">
            {allCategories.length || 5}
          </p>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#1278BF] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
              selectedCategory === "all"
                ? "bg-[#0B2540] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({works.length})
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                selectedCategory === cat
                  ? "bg-[#1278BF] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── WORK LISTING GRID ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-14 bg-white rounded-3xl border border-slate-200/80">
          <Loader2 className="w-8 h-8 text-[#1278BF] animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading showcase projects...</p>
        </div>
      ) : filteredWorks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-14 bg-white rounded-3xl border border-dashed border-slate-300 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF6FE] text-[#1278BF] flex items-center justify-center mb-3.5">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No showcase projects found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1">
            You have not added any work items yet, or no items match your search filter.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-[#1278BF] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorks.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${
                item.is_active ? "border-slate-200/90" : "border-amber-200/80 bg-amber-50/20 opacity-80"
              }`}
            >
              <div>
                {/* Image Comparison Preview Banner */}
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden flex">
                  {item.before_image ? (
                    <>
                      {/* Before Half */}
                      <div className="relative w-1/2 h-full border-r border-white/60 overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.before_image}
                          alt="Before"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                        />
                        <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          BEFORE
                        </span>
                      </div>
                      {/* After Half */}
                      <div className="relative w-1/2 h-full overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.after_image}
                          alt="After"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                        />
                        <span className="absolute bottom-2 right-2 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          AFTER
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="relative w-full h-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.after_image}
                        alt="Work"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 right-2 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        AFTER CLEAN
                      </span>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="bg-[#0B2540]/85 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                      {item.category}
                    </span>
                    {item.is_featured && (
                      <span className="bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Star className="w-3 h-3 fill-current" />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Active / Hidden Status Pill */}
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs ${
                        item.is_active
                          ? "bg-emerald-600/90 text-white"
                          : "bg-amber-600/90 text-white"
                      }`}
                    >
                      {item.is_active ? "LIVE" : "HIDDEN"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  <h3 className="font-bold text-base text-[#0B2540] line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>

                  {item.tag_text && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EBF6FE] text-[#1278BF] text-[11px] font-bold">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.tag_text}</span>
                    </div>
                  )}

                  {item.customer_note && (
                    <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 italic">
                      &ldquo;{item.customer_note}&rdquo;
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleActive(item)}
                  disabled={actionLoading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    item.is_active
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  title={item.is_active ? "Hide from website" : "Publish live on website"}
                >
                  {item.is_active ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Live</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    disabled={actionLoading}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="Edit Work"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={actionLoading}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                    title="Delete Work"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 p-5 sm:p-7 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1278BF]">
                  {editingItem ? "Edit Work" : "Add New Item"}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#0B2540]">
                  {editingItem ? "Edit Showcase Item" : "Add New Showcase Transformation"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work Title (Garment or Service Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bridal Silk Lehenga Haldi Stain Cleaning"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#1278BF]"
                />
              </div>

              {/* Category & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category (Fabric / Garment Type) *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#1278BF] bg-white"
                  >
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Order (Position on website)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#1278BF]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description (Issue addressed and cleaning technique applied)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Tough oil and turmeric stains removed using gentle eco-solvents without fabric damage, finished with Italian steam press."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#1278BF]"
                />
              </div>

              {/* Photos Grid: Before & After */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                {/* BEFORE PHOTO */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      1. Before Photo (Prior to Cleaning)
                    </label>
                    <span className="text-[10px] text-slate-400">Optional</span>
                  </div>

                  <input
                    type="file"
                    ref={beforeFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "before");
                    }}
                  />

                  {beforeImage ? (
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-white group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={beforeImage}
                        alt="Before Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setBeforeImage("")}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600 text-white shadow-xs"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => beforeFileInputRef.current?.click()}
                        disabled={uploadingBefore}
                        className="w-full py-4 px-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-[#1278BF] hover:bg-white text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {uploadingBefore ? (
                          <Loader2 className="w-5 h-5 text-[#1278BF] animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5 text-slate-400" />
                        )}
                        <span className="text-xs font-bold text-slate-700">
                          {uploadingBefore ? "Uploading..." : "Upload from Device"}
                        </span>
                        <span className="text-[10px] text-slate-400">JPG, PNG (Max 10MB)</span>
                      </button>

                      <input
                        type="url"
                        placeholder="Or paste online image URL..."
                        value={beforeImage}
                        onChange={(e) => setBeforeImage(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#1278BF]"
                      />
                    </div>
                  )}
                </div>

                {/* AFTER PHOTO */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#0B2540] flex items-center gap-1">
                      <span>2. After Photo (After Dry Cleaning)</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-600">Required</span>
                  </div>

                  <input
                    type="file"
                    ref={afterFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "after");
                    }}
                  />

                  {afterImage ? (
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-emerald-300 bg-white group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={afterImage}
                        alt="After Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setAfterImage("")}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600 text-white shadow-xs"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => afterFileInputRef.current?.click()}
                        disabled={uploadingAfter}
                        className="w-full py-4 px-3 border-2 border-dashed border-[#38A8F5] bg-sky-50/50 rounded-xl hover:border-[#1278BF] hover:bg-white text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {uploadingAfter ? (
                          <Loader2 className="w-5 h-5 text-[#1278BF] animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5 text-[#1278BF]" />
                        )}
                        <span className="text-xs font-bold text-[#0B2540]">
                          {uploadingAfter ? "Uploading..." : "Upload from Device"}
                        </span>
                        <span className="text-[10px] text-slate-500">JPG, PNG (Max 10MB)</span>
                      </button>

                      <input
                        type="url"
                        placeholder="Or paste online image URL..."
                        value={afterImage}
                        onChange={(e) => setAfterImage(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#1278BF]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Tag / Highlight Badge & Customer Quote */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Highlight Tag (Pill badge)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Zari Safe · Complete Stain Removal"
                    value={tagText}
                    onChange={(e) => setTagText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#1278BF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Customer Feedback / Review (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The stain vanished completely, looks brand new!"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#1278BF]"
                  />
                </div>
              </div>

              {/* Checkboxes: Featured & Active */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#1278BF] rounded"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    Show Live on Website (Active)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    Featured Project (Highlight on Top)
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading || uploadingBefore || uploadingAfter}
                  className="px-5 py-2.5 rounded-xl bg-[#1278BF] hover:bg-[#0E6099] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#1278BF]/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingItem ? "Update Project" : "Save Showcase Item"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

