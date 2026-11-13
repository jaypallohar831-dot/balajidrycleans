import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Navbar } from "@/components/Navbar";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { siteConfig } from "@/config/site";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const baseUrl = siteConfig.url.replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Balaji Dry Cleaners — Premium Dry Cleaning & Laundry in Bhilwara",
    template: "%s | Balaji Dry Cleaners Bhilwara",
  },
  description:
    "Bhilwara's trusted dry cleaning experts in RK Colony. Professional fabric care for suits, bridal lehengas, sarees, sherwanis, winter jackets, blankets & curtains with free doorstep pickup.",
  keywords: [
    "Balaji Dry Cleaners",
    "Dry Cleaner Bhilwara",
    "Dry Cleaning RK Colony Bhilwara",
    "Best Dry Cleaners in Bhilwara",
    "Laundry Service Bhilwara",
    "Doorstep Laundry Bhilwara",
    "Suit dry cleaning Bhilwara",
    "Saree dry cleaning Bhilwara",
    "Lehenga dry cleaning Bhilwara",
    "Sherwani dry cleaning Bhilwara",
    "Steam ironing Bhilwara",
    "Winter jacket dry cleaning Bhilwara",
    "Rajai Kambal dry cleaning Bhilwara",
    "Curtain dry cleaning Bhilwara",
    "Dry cleaner near me Bhilwara",
  ],
  authors: [{ name: "Balaji Dry Cleaners" }],
  creator: "Balaji Dry Cleaners",
  publisher: "Balaji Dry Cleaners",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/logo.png" }],
  },
  openGraph: {
    title: "Balaji Dry Cleaners — Premium Dry Cleaning in Bhilwara",
    description:
      "Spotless dry cleaning & fabric care in RK Colony, Bhilwara. Suits, sarees, lehengas, winter wear and doorstep pickup.",
    url: baseUrl,
    siteName: "Balaji Dry Cleaners",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Balaji Dry Cleaners — Spotless Garment Care in RK Colony, Bhilwara",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Balaji Dry Cleaners — Premium Dry Cleaning in Bhilwara",
    description:
      "Bhilwara's trusted dry cleaning experts in RK Colony. Spotless clothes, delicate garment care & doorstep pickup.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google23330603835b00c2",
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
  },
  other: {
    "geo.region": "IN-RJ",
    "geo.placename": "Bhilwara",
    "geo.position": `${siteConfig.address.coordinates.lat};${siteConfig.address.coordinates.lng}`,
    ICBM: `${siteConfig.address.coordinates.lat}, ${siteConfig.address.coordinates.lng}`,
  },
};

// Comprehensive Schema.org Graph (LocalBusiness + WebSite + FAQPage + Breadcrumbs)
const structuredDataSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "DryCleaningOrLaundry",
      "@id": `${baseUrl}/#localbusiness`,
      name: siteConfig.name,
      alternateName: [
        "Balaji Drycleaners Bhilwara",
        "Balaji Laundry Bhilwara",
        "Balaji Dry Cleaning RK Colony",
      ],
      description: siteConfig.description,
      image: `${baseUrl}/og-image.jpg`,
      logo: `${baseUrl}/logo.png`,
      telephone: `+${siteConfig.whatsapp}`,
      url: baseUrl,
      sameAs: [
        `https://www.instagram.com/${siteConfig.instagram}/`,
        siteConfig.address.mapsUrl,
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: siteConfig.address.full,
        addressLocality: "Bhilwara",
        addressRegion: "Rajasthan",
        postalCode: siteConfig.address.pincode,
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: siteConfig.address.coordinates.lat,
        longitude: siteConfig.address.coordinates.lng,
      },
      hasMap: siteConfig.address.mapsUrl,
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "09:00",
          closes: "20:30",
        },
      ],
      priceRange: "₹₹",
      paymentAccepted: "Cash, UPI, Google Pay, PhonePe, Paytm",
      currenciesAccepted: "INR",
      areaServed: [
        { "@type": "AdministrativeArea", name: "Bhilwara" },
        { "@type": "Place", name: "RK Colony, Bhilwara" },
        { "@type": "Place", name: "Patel Nagar, Bhilwara" },
        { "@type": "Place", name: "Shastri Nagar, Bhilwara" },
        { "@type": "Place", name: "Subhash Nagar, Bhilwara" },
        { "@type": "Place", name: "Azad Nagar, Bhilwara" },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Dry Cleaning & Laundry Services",
        itemListElement: siteConfig.services.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.title,
            description: service.description,
          },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: siteConfig.name,
      inLanguage: "en-IN",
      publisher: {
        "@id": `${baseUrl}/#localbusiness`,
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${baseUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Do you offer doorstep pickup and delivery in Bhilwara?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, Balaji Dry Cleaners provides convenient doorstep pickup and delivery across RK Colony, Patel Nagar, Shastri Nagar, Subhash Nagar, and surrounding Bhilwara neighborhoods.",
          },
        },
        {
          "@type": "Question",
          name: "What items can I get dry cleaned at Balaji Dry Cleaners?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We specialize in suits, blazers, sherwanis, heavy bridal lehengas, delicate silk sarees, winter jackets, quilts, blankets, and window curtains.",
          },
        },
        {
          "@type": "Question",
          name: "How much time does dry cleaning take?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Standard dry cleaning service takes 24 to 48 hours. Express urgent processing is also available upon request.",
          },
        },
        {
          "@type": "Question",
          name: "Can tough stains like oil, curry, or ink be safely removed?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, our certified fabric technicians use imported non-bleaching solvents and spot-treatment equipment to gently treat tough stains without harming delicate fibers or colors.",
          },
        },
        {
          "@type": "Question",
          name: "How do I schedule a pickup?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can book directly via our online booking form on this website or message us on WhatsApp at +91 80058 17455.",
          },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${baseUrl}/#breadcrumbs`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Work Showcase",
          item: `${baseUrl}/work`,
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jakarta.variable} h-full antialiased scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredDataSchema),
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col relative pt-20">
        <ScrollProgress />
        <Navbar />
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
