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

export const metadata: Metadata = {
  metadataBase: new URL("https://balajidrycleaners.com"),
  title: {
    default: "Balaji Dry Cleaners — Premium Dry Cleaning & Laundry in Bhilwara",
    template: "%s | Balaji Dry Cleaners",
  },
  description:
    "Bhilwara's trusted dry cleaning experts in RK Colony. Professional dry cleaning for suits, sarees, sherwanis, winter jackets, blankets & curtains with free doorstep pickup.",
  keywords: [
    "Balaji Dry Cleaners",
    "Dry Cleaner Bhilwara",
    "Dry Cleaning RK Colony Bhilwara",
    "Best Dry Cleaners in Bhilwara",
    "Laundry Service Bhilwara",
    "Suit dry cleaning Bhilwara",
    "Saree dry cleaning Bhilwara",
    "Steam ironing Bhilwara",
    "Sherwani dry cleaning",
    "Rajai Kambal dry cleaning Bhilwara",
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
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon.svg" }],
  },
  openGraph: {
    title: "Balaji Dry Cleaners — Premium Dry Cleaning in Bhilwara",
    description:
      "Spotless dry cleaning & fabric care in RK Colony, Bhilwara. Suits, sarees, lehengas, winter wear and doorstep pickup.",
    url: "https://balajidrycleaners.com",
    siteName: "Balaji Dry Cleaners",
    locale: "hi_IN",
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
    canonical: "https://balajidrycleaners.com",
  },
};

// LocalBusiness JSON-LD Schema
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "DryCleaningOrLaundry",
  name: siteConfig.name,
  description: siteConfig.description,
  image: "https://balajidrycleaners.com/og-image.jpg",
  telephone: `+${siteConfig.whatsapp}`,
  url: "https://balajidrycleaners.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "RK Colony",
    addressLocality: "Bhilwara",
    addressRegion: "Rajasthan",
    postalCode: "311001",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: siteConfig.address.coordinates.lat,
    longitude: siteConfig.address.coordinates.lng,
  },
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
  paymentAccepted: "Cash, UPI, Online",
  currenciesAccepted: "INR",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" suppressHydrationWarning className={`${jakarta.variable} h-full antialiased scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
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
