"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Droplet, MapPin, MessageCircle } from "lucide-react";
import { siteConfig, getWhatsAppLink } from "@/config/site";

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const FOOTER_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Our Work", href: "/work" },
  { label: "Process", href: "#process" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState<number>(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleScrollTo = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    if (href === "/work") {
      router.push("/work");
      return;
    }

    if (pathname !== "/") {
      router.push("/" + href);
      return;
    }

    const id = href.replace("#", "");
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 85;
      window.scrollTo({
        top: Math.max(0, offsetTop),
        behavior: "smooth",
      });
      window.history.pushState(null, "", href);
    } else if (href === "#home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full bg-[#0B2540] text-white rounded-t-[28px] sm:rounded-t-[44px] mt-8 sm:mt-12 pt-10 sm:pt-16 pb-24 sm:pb-14 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#38A8F5]/10 blur-3xl pointer-events-none" />

      <div className="container-site">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 pb-8 sm:pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col items-start">
            <a
              href="#home"
              onClick={(e) => handleScrollTo(e, "#home")}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-full bg-[#EBF6FE] flex items-center justify-center text-[#38A8F5] group-hover:scale-105 transition-transform duration-200 shadow-sm">
                <Droplet className="w-4.5 h-4.5 fill-[#38A8F5]/30 stroke-[2.2]" />
              </div>
              <span className="font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-[#6EC0F8] transition-colors">
                {siteConfig.name}
              </span>
            </a>

            <p className="mt-3.5 text-sm sm:text-base text-slate-300 max-w-sm leading-relaxed">
              Bhilwara&apos;s trusted dry cleaning specialists in RK Colony. Premium care for every garment, completely hassle-free.
            </p>

            <div className="mt-5 flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
              <MapPin className="w-4 h-4 text-[#38A8F5] shrink-0" />
              <span>{siteConfig.address.full}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 flex flex-col items-start">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A5D8FB] mb-4">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-1">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleScrollTo(e, link.href)}
                    className="text-sm text-slate-300 hover:text-white hover:translate-x-1 inline-flex items-center py-2 min-h-[44px] transition-all duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect & Timings */}
          <div className="md:col-span-4 flex flex-col items-start">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A5D8FB] mb-4">
              Contact & Store Hours
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Store Timings:
              <br />
              <strong className="text-white font-semibold">
                Monday to Sunday: 9:00 AM - 8:30 PM
              </strong>
            </p>

            <div className="mt-5 flex items-center gap-3">
              <a
                href={getWhatsAppLink("Hello Balaji Dry Cleaners!")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-[#25D366] text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <MessageCircle className="w-5 h-5 fill-white/20 stroke-[2.2]" />
              </a>

              <a
                href={`https://instagram.com/${siteConfig.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-[#E1306C] text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <InstagramIcon className="w-5 h-5 stroke-[2.2]" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center sm:text-left">
          <p>© {currentYear} {siteConfig.name}. All rights reserved.</p>

          <p className="flex items-center gap-1.5 justify-center">
            <span>Website by</span>
            <a
              href="https://www.instagram.com/ampledia.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#6EC0F8] hover:text-white transition-colors hover:underline"
            >
              Ampledia
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
