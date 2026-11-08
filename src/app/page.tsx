import { Hero } from "@/components/Hero";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Services } from "@/components/Services";
import { WorkTeaser } from "@/components/WorkTeaser";
import { WinterBanner } from "@/components/WinterBanner";
import { Process } from "@/components/Process";
import { PickupBooking } from "@/components/PickupBooking";
import { FAQ } from "@/components/FAQ";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex flex-col flex-1">
      {/* 1. Hero Section (#home) */}
      <Hero />

      {/* 2. Why Choose Us Section (#about) */}
      <WhyChooseUs />

      {/* 3. Services Section (#services) */}
      <Services />

      {/* 4. Live Work Showcase Teaser ("Before & After") */}
      <WorkTeaser />

      {/* 5. Winter Care Banner */}
      <WinterBanner />

      {/* 6. Process Section (#process) */}
      <Process />

      {/* 7. Pickup Booking Section (#pickup) */}
      <PickupBooking />

      {/* 8. Frequently Asked Questions Section (#faq for Google Rich Snippets) */}
      <FAQ />

      {/* 9. Contact Section (#contact: 3 info blocks + Google Maps) */}
      <Contact />

      {/* 10. Footer */}
      <Footer />
    </main>
  );
}
