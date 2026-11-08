export const siteConfig = {
  name: "Balaji Dry Cleaners",
  tagline: "Premium Dry Cleaning & Laundry Services",
  description:
    "Bhilwara's trusted dry cleaning experts — delivering spotless garments with care since day one.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://balajidrycleans.vercel.app",

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
        "Delicate solvent dry cleaning and crisp Italian steam press for formal and wedding wear.",
      icon: "Shirt" as const,
      inquiry: "Hello Balaji Dry Cleaners! I would like to inquire about dry cleaning for Suit / Blazer / Sherwani.",
    },
    {
      id: "saree-lehenga-ghagra",
      title: "Saree / Lehenga / Designer Wear",
      description:
        "Gentle, color-safe dry cleaning specialized for pure silk, zari, and gota-patti designer outfits.",
      icon: "Crown" as const,
      inquiry: "Hello Balaji Dry Cleaners! I would like to inquire about dry cleaning for Saree / Lehenga.",
    },
    {
      id: "sweater-jacket-shawl",
      title: "Sweater / Jacket / Shawl",
      description:
        "Zero-shrinkage restoration, lint removal, and soft conditioning for woolens and leather jackets.",
      icon: "Layers" as const,
      inquiry: "Hello Balaji Dry Cleaners! I would like to inquire about winter garment care (Sweater/Jacket/Shawl).",
    },
    {
      id: "rajai-kambal-parde",
      title: "Blankets / Quilts / Curtains",
      description:
        "Deep anti-bacterial hygiene wash, steam sanitization, and vacuum packaging for heavy bedding and drapery.",
      icon: "Home" as const,
      inquiry: "Hello Balaji Dry Cleaners! I would like to schedule a wash for Blankets / Quilts / Curtains.",
    },
    {
      id: "daily-wash-iron",
      title: "Daily Wash & Steam Iron",
      description:
        "Premium everyday laundry wash with crisp, wrinkle-free steam ironing for shirts and trousers.",
      icon: "WashingMachine" as const,
      inquiry: "Hello Balaji Dry Cleaners! I need information about your Daily Wash & Steam Iron service.",
    },
    {
      id: "stain-removal",
      title: "Targeted Stain Removal",
      description:
        "Advanced spotting treatment for tough stains (oil, turmeric, coffee, ink) while preserving fabric colors.",
      icon: "Sparkles" as const,
      inquiry: "Hello Balaji Dry Cleaners! I need expert stain removal assistance for my garment.",
    },
  ],

  // How-it-works process steps
  process: [
    {
      step: 1,
      title: "Doorstep Pickup or Drop-off",
      description:
        "Drop your clothes at our store in RK Colony or schedule a convenient doorstep pickup.",
      icon: "Truck" as const,
    },
    {
      step: 2,
      title: "Inspection & Fabric Tagging",
      description:
        "Each garment is carefully inspected for delicate fabrics, embroidery, and specific stain treatment.",
      icon: "Search" as const,
    },
    {
      step: 3,
      title: "Eco-Clean & Industrial Steam Press",
      description:
        "Cleaned with gentle eco-friendly solvents and pressed on Italian steam mannequins for a showroom finish.",
      icon: "Sparkles" as const,
    },
    {
      step: 4,
      title: "Hanger Packaging & Delivery",
      description:
        "Delivered directly to your doorstep in breathable, dust-free protective covers ready to wear.",
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
