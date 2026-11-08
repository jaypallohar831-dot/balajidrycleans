"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Droplet, Menu, X, MessageCircle } from "lucide-react";
import { siteConfig, getWhatsAppLink } from "@/config/site";

const NAV_ITEMS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Our Work", href: "/work" },
  { label: "Process", href: "#process" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Scroll detection (20px threshold)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Section observer to highlight active link
  useEffect(() => {
    if (pathname === "/work") {
      setActiveSection("work");
      return;
    }

    const sectionIds = ["home", "about", "services", "process", "faq", "contact"];

    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 120; // Offset for top floating bar

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(id);
            return;
          }
        }
      }
      setActiveSection("home");
    };

    handleScrollSpy();
    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, [pathname]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Navigation handler
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (href === "/work") {
      router.push("/work");
      setActiveSection("work");
      return;
    }

    if (pathname !== "/") {
      router.push("/" + href);
      return;
    }

    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);

    if (element) {
      const offsetTop = element.offsetTop - 85;
      window.scrollTo({
        top: Math.max(0, offsetTop),
        behavior: "smooth",
      });
      setActiveSection(targetId);
      window.history.pushState(null, "", href);
    } else if (href === "#home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveSection("home");
    }
  };

  const whatsappUrl = getWhatsAppLink(
    `Hello ${siteConfig.name}, I would like to inquire about your dry cleaning services.`
  );

  return (
    <motion.header
      initial={prefersReducedMotion ? false : { y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 inset-x-0 z-50 flex flex-col items-center px-3 sm:px-6 pointer-events-none"
    >
      {/* Floating Bar */}
      <nav
        aria-label="Main Navigation"
        className={`pointer-events-auto w-full max-w-[1100px] h-14 sm:h-16 px-4 sm:px-6 rounded-full flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-md border border-slate-200/80"
            : "bg-white/95 backdrop-blur-sm shadow-soft border border-slate-200/50"
        }`}
      >
        {/* Logo at Left */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          className="group flex items-center gap-2 sm:gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38A8F5] rounded-full px-1 py-1 min-h-[44px]"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EBF6FE] flex items-center justify-center text-[#38A8F5] group-hover:scale-105 transition-transform duration-200 shadow-sm shrink-0">
            <Droplet className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-[#38A8F5]/30 stroke-[2.2]" />
          </div>
          <span className="font-bold text-sm sm:text-base tracking-tight text-[#0B2540] group-hover:text-[#38A8F5] transition-colors whitespace-nowrap">
            {siteConfig.name}
          </span>
        </a>

        {/* Desktop Links in Center */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.href.replace("#", "");
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`relative px-3.5 py-2 text-sm font-medium transition-colors group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38A8F5] min-h-[44px] inline-flex items-center ${
                  isActive ? "text-[#0B2540] font-semibold" : "text-slate-600 hover:text-[#0B2540]"
                }`}
              >
                <span>{item.label}</span>

                {/* Active indicator / Hover underline */}
                {isActive ? (
                  <motion.span
                    layoutId="navbar-active-pill"
                    className="absolute inset-x-3 bottom-1 h-0.5 bg-[#38A8F5] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : (
                  <span className="absolute inset-x-3 bottom-1 h-0.5 bg-[#38A8F5] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center" />
                )}
              </a>
            );
          })}
        </div>

        {/* Right CTA / Mobile Toggle */}
        <div className="flex items-center gap-2">
          {/* Desktop "Contact now" dark pill button (hidden on mobile/tablet < md) */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 px-4 sm:px-5 py-2 min-h-[44px] text-xs sm:text-sm font-semibold text-white bg-[#0B2540] hover:bg-[#163A5C] active:scale-95 rounded-full transition-all duration-200 shadow-sm hover:shadow"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white/20 stroke-[2]" />
            <span>Contact now</span>
          </a>

          {/* Mobile Hamburger Button - Minimum 44x44px touch target */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-full text-slate-700 hover:text-[#0B2540] hover:bg-slate-100/80 active:bg-slate-200/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38A8F5]"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 stroke-[2.2]" />
            ) : (
              <Menu className="w-5 h-5 stroke-[2.2]" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto md:hidden w-full max-w-[1100px] mt-2 p-4 bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-card flex flex-col gap-1"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.href.replace("#", "");
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`flex items-center justify-between px-4 py-3.5 min-h-[48px] rounded-2xl text-base font-medium transition-all ${
                    isActive
                      ? "bg-[#EBF6FE] text-[#1278BF] font-semibold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-[#0B2540]"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-[#38A8F5]" />
                  )}
                </a>
              );
            })}

            <div className="pt-2 mt-1 border-t border-slate-100">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 min-h-[48px] py-3.5 px-5 text-sm font-semibold text-white bg-[#0B2540] hover:bg-[#163A5C] active:scale-98 rounded-full transition-all duration-200 shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-white/20 stroke-[2]" />
                <span>Contact now via WhatsApp</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
