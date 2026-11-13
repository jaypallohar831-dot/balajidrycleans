"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  Sparkles,
  LogOut,
  ExternalLink,
  ImageIcon,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { label: "Services", href: "/admin/services", icon: Sparkles },
  { label: "Our Work", href: "/admin/work", icon: ImageIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Don't render layout wrapper on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col md:flex-row">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0B2540] text-white shrink-0 border-r border-[#163A5C] min-h-screen p-5 justify-between">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 overflow-hidden shadow-sm shrink-0 border border-white/20">
              <Image
                src="/logo.png"
                alt="Balaji Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide text-white">BALAJI ADMIN</h2>
              <p className="text-[11px] text-slate-400">RK Colony, Bhilwara</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#38A8F5] text-[#0B2540] shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Website</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-red-300 hover:text-red-100 hover:bg-red-500/10 transition-colors w-full text-left cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          {/* Ampledia Developer Link */}
          <div className="pt-2 border-t border-white/10 px-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Website by</span>
            <a
              href="https://www.instagram.com/ampledia.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6EC0F8] hover:text-white font-semibold transition-colors inline-flex items-center gap-1"
            >
              <span>Ampledia</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ── */}
      <header className="md:hidden bg-[#0B2540] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-[#163A5C] shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-0.5 overflow-hidden shadow-sm shrink-0">
            <Image
              src="/logo.png"
              alt="Balaji Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <span className="font-bold text-sm tracking-wide">Balaji Admin</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="p-1.5 text-slate-300 hover:text-white"
            title="Website"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 text-red-300 hover:text-red-100"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <div className="flex-1">{children}</div>
        <footer className="mt-8 px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-200/80">
          <span>Website & Admin by </span>
          <a
            href="https://www.instagram.com/ampledia.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#1278BF] hover:underline inline-flex items-center gap-1"
          >
            <span>Ampledia</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </footer>
      </main>

      {/* ── MOBILE BOTTOM NAVIGATION BAR ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10.5px] font-bold transition-colors ${
                isActive
                  ? "text-[#1278BF]"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
