"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Kripya apna admin email address likhein.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json?.error?.message || "Login request fail ho gayi.");
        return;
      }

      setSuccessMsg(json?.data?.message || "Login safal raha!");
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 700);
    } catch {
      setError("Network samasya aayi hai. Kripya dubara try karein.");
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setEmail("admin@example.com");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@example.com" }),
      });
      const json = await res.json();
      if (json.ok) {
        router.push("/admin");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B2540] via-[#0F355A] to-[#0B2540] flex items-center justify-center p-4 sm:p-6 text-slate-800">
      <div className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#38A8F5]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF6FE] text-[#1278BF] flex items-center justify-center mx-auto mb-3.5 shadow-xs">
            <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1278BF] bg-[#EBF6FE] px-3 py-1 rounded-full border border-[#D2ECFD]">
            Private Admin Area
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2540] mt-2.5">
            Balaji Admin Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Keval authorized email addresses hi login kar sakte hain.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-email"
              className="text-xs sm:text-sm font-bold text-[#0B2540] flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-[#38A8F5]" />
              <span>Admin Email</span>
            </label>
            <input
              id="admin-email"
              type="email"
              required
              placeholder="Jaise: admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm sm:text-base text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-[#38A8F5] focus:ring-4 focus:ring-[#38A8F5]/15"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 min-h-[48px] rounded-full font-bold text-sm text-white bg-[#0B2540] hover:bg-[#163A5C] active:scale-95 disabled:opacity-60 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#38A8F5]" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Email Magic Link / Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Dev Admin login button for rapid testing */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 mb-2">Development Quick Access</p>
          <button
            type="button"
            onClick={handleDevLogin}
            disabled={loading}
            className="text-xs font-semibold text-[#1278BF] hover:text-[#0B2540] transition-colors py-1 px-3 rounded-lg hover:bg-slate-50"
          >
            ⚡ Login as admin@example.com
          </button>
        </div>
      </div>
    </div>
  );
}
