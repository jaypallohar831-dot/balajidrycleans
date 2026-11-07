import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hamara Kaam · Before & After Showcase",
  description:
    "Dekhein Balaji Dry Cleaners Bhilwara ke live results: Bridal lehengas, designer sherwanis, pure woolen coats aur heavy blankets ki dry cleaning ke Before & After results.",
  openGraph: {
    title: "Hamara Kaam (Before & After Showcase) · Balaji Dry Cleaners Bhilwara",
    description:
      "Spotless dry cleaning aur delicate fabric care ke live Before & After results. RK Colony, Bhilwara.",
    url: "https://balajidrycleaners.com/work",
  },
};

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

