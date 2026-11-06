export const siteConfig = {
  name: "Balaji Dry Cleaners",
  tagline: "Premium Dry Cleaning & Laundry Services",
  description:
    "Bhilwara's trusted dry cleaning experts — delivering spotless garments with care since day one.",

  // Contact
  whatsapp: "918005817455",
  instagram: "balajidryclean",

  // Developer / Agency
  developer: {
    name: "Ampledia",
    instagram: "https://www.instagram.com/ampledia.in/",
  },

  // Address & Location
  address: {
    line1: "RK Colony",
    line2: "Bhilwara, Rajasthan",
    pincode: "311001",
    full: "RK Colony, Bhilwara, Rajasthan 311001",
    landmark: "Near Main Road, RK Colony",
    coordinates: {
      lat: 25.3601006,
      lng: 74.6346617,
    },
    directUrl: "https://maps.app.goo.gl/QJjveVxXsVUa8yF78",
    mapsUrl: "https://maps.app.goo.gl/QJjveVxXsVUa8yF78",
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=25.3601006,74.6346617",
    embedUrl:
      "https://maps.google.com/maps?q=25.3601006,74.6346617&hl=en&z=17&output=embed",
  },

  // Stats displayed on the landing page
  stats: [
    { label: "Happy Customers", value: "5,000+" },
    { label: "Garments Cleaned", value: "50,000+" },
    { label: "Years of Trust", value: "10+" },
  ],

  // Services offered
  services: [
    {
      id: "suit-blazer-sherwani",
      title: "Suit / Blazer / Sherwani",
      description:
        "Formal aur wedding wear ki delicate solvent cleaning aur crisp steam finish.",
      icon: "Shirt" as const,
      inquiry: "Namaste Balaji Dry Cleaners! Mujhe Suit / Blazer / Sherwani dry clean karwana hai.",
    },
    {
      id: "saree-lehenga-ghagra",
      title: "Saree / Lehenga / Ghagra Choli",
      description:
        "Silk, zari aur gota-patti wale designer kapdo ki gentle, safe dry cleaning.",
      icon: "Crown" as const,
      inquiry: "Namaste Balaji Dry Cleaners! Mujhe Saree / Lehenga dry clean karwana hai.",
    },
    {
      id: "sweater-jacket-shawl",
      title: "Sweater / Jacket / Shawl",
      description:
        "Woolen aur leather garments ki bina shrink hue soft lint-free restoration.",
      icon: "Layers" as const,
      inquiry: "Namaste Balaji Dry Cleaners! Mujhe Winter wear (Sweater/Jacket/Shawl) clean karwana hai.",
    },
    {
      id: "rajai-kambal-parde",
      title: "Rajai / Kambal / Parde",
      description:
        "Heavy blankets, quilts aur curtains ki deep germ-free hygiene wash aur packaging.",
      icon: "Home" as const,
      inquiry: "Namaste Balaji Dry Cleaners! Mujhe Rajai / Kambal / Parde wash karwane hain.",
    },
    {
      id: "daily-wash-iron",
      title: "Daily Wash and Iron",
      description:
        "Rojana ke shirts, kurtas aur trousers ki fresh laundry aur wrinkle-free press.",
      icon: "WashingMachine" as const,
      inquiry: "Namaste Balaji Dry Cleaners! Mujhe Daily Wash and Iron service chahiye.",
    },
    {
      id: "stain-removal",
      title: "Stain Removal (Haldi, Tel, Chai, Ink)",
      description:
        "Ziddi se ziddi daag-dhabbo par specialised treatment, kapde ke rang ko bachate hue.",
      icon: "Sparkles" as const,
      inquiry: "Namaste Balaji Dry Cleaners! Mujhe ziddi daag (Haldi/Chai/Tel/Ink) hatwane hain.",
    },
  ],

  // How-it-works process steps
  process: [
    {
      step: 1,
      title: "Pickup ya Drop",
      description:
        "Shop par drop karein ya WhatsApp par message bhejkar convenient home pickup book karein.",
      icon: "Truck" as const,
    },
    {
      step: 2,
      title: "Tag aur Inspect",
      description:
        "Har kapde ki fabric, buttons aur ziddi daag ko detail se inspect aur tag kiya jata hai.",
      icon: "Search" as const,
    },
    {
      step: 3,
      title: "Clean aur Press",
      description:
        "Eco-friendly solvent se deep clean aur industrial steam press se wrinkle-free crisp finish.",
      icon: "Sparkles" as const,
    },
    {
      step: 4,
      title: "Ghar tak Delivery",
      description:
        "Dust-free protective cover aur hanger packaging ke sath timely handover ya delivery.",
      icon: "PackageCheck" as const,
    },
  ],
} as const;

// ── Types ──────────────────────────────────────────────
export type SiteConfig = typeof siteConfig;
export type Service = (typeof siteConfig.services)[number];
export type ProcessStep = (typeof siteConfig.process)[number];
export type Stat = (typeof siteConfig.stats)[number];

// ── Helpers ────────────────────────────────────────────
/**
 * Returns a fully-qualified wa.me URL with an optional pre-filled message.
 */
export function getWhatsAppLink(message?: string): string {
  const base = `https://wa.me/${siteConfig.whatsapp}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
