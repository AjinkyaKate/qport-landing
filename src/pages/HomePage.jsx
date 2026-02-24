import { useEffect } from "react";
import { Hero } from "../components/Hero";
import { SocialProofBar } from "../components/SocialProofBar";
import { Features } from "../components/Features";
import { HowItWorks } from "../components/HowItWorks";
import { Philosophy } from "../components/Philosophy";
import { FAQ } from "../components/FAQ";
import { FinalCTA } from "../components/FinalCTA";

export function HomePage({ introReady, prefersReducedMotion }) {
  useEffect(() => {
    document.title = "QPort | Route Intelligence for ODC Logistics";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "QPort is a route management platform for wind ODC transport: survey once, curate precisely, dispatch with confidence."
      );
    }
  }, []);

  return (
    <main>
      <Hero
        introReady={introReady}
        prefersReducedMotion={prefersReducedMotion}
        ctaHref="#demo"
      />

      <SocialProofBar />

      <Features prefersReducedMotion={prefersReducedMotion} />

      <HowItWorks prefersReducedMotion={prefersReducedMotion} />

      <Philosophy prefersReducedMotion={prefersReducedMotion} />

      <FAQ />

      <FinalCTA />
    </main>
  );
}
