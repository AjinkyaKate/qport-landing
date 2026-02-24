import { useEffect, useMemo, useState } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "./lib/usePrefersReducedMotion";
import { CustomCursor } from "./components/CustomCursor";
import { Navbar } from "./components/Navbar";
import { Preloader } from "./components/Preloader";
import { Hero } from "./components/Hero";
import { SocialProofBar } from "./components/SocialProofBar";
import { Features } from "./components/Features";
import { HowItWorks } from "./components/HowItWorks";
import { Philosophy } from "./components/Philosophy";
import { FAQ } from "./components/FAQ";
import { FinalCTA } from "./components/FinalCTA";
import { Footer } from "./components/Footer";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [introReady, setIntroReady] = useState(false);

  const navLinks = useMemo(
    () => [
      { label: "Features", href: "#features" },
      { label: "Workflow", href: "#process" },
      { label: "Philosophy", href: "#philosophy" },
      { label: "FAQ", href: "#faq" },
    ],
    []
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      // Keep it simple: no smooth scroll, no scroll-linked transforms.
      gsap.to(document.body, { opacity: 1, duration: 0 });
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    const tick = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // ScrollTrigger needs to be aware of Lenis timing.
    lenis.on("scroll", ScrollTrigger.update);

    // Let layout settle before measuring.
    const refresh = () => ScrollTrigger.refresh();
    const refreshTimer = window.setTimeout(refresh, 120);

    return () => {
      window.clearTimeout(refreshTimer);
      lenis.destroy();
      gsap.ticker.remove(tick);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="min-h-screen">
      <CustomCursor />

      <Navbar
        brand="QPort"
        links={navLinks}
        cta={{ label: "Request a demo", href: "#demo" }}
      />

      {!introReady && (
        <Preloader
          brand="QPort"
          prefersReducedMotion={prefersReducedMotion}
          onDone={() => setIntroReady(true)}
        />
      )}

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

      <Footer links={navLinks} />
    </div>
  );
}

