import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

const baseUrl = siteConfig.url.replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Our Work · Before & After Showcase",
  description:
    "Explore actual Before & After dry cleaning results from Balaji Dry Cleaners Bhilwara: bridal lehengas, designer sherwanis, woolen coats, and heavy quilts.",
  alternates: {
    canonical: `${baseUrl}/work`,
  },
  openGraph: {
    title: "Our Work (Before & After Showcase) · Balaji Dry Cleaners Bhilwara",
    description:
      "Spotless dry cleaning and delicate fabric care: view actual Before & After transformations. RK Colony, Bhilwara.",
    url: `${baseUrl}/work`,
  },
};

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
