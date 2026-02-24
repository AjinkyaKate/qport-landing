import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { HeroThree } from "./HeroThree";
import { MagneticButton } from "./MagneticButton";
import { SmartLink } from "./SmartLink";
import { UNSPLASH } from "../lib/unsplash";

export function ModuleHero({ module, introReady, prefersReducedMotion }) {
  const sectionRef = useRef(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const items = el.querySelectorAll("[data-hero-item]");
    const canvas = el.querySelector("[data-hero-canvas]");

    if (!introReady) {
      gsap.set(items, { opacity: 0, y: 50 });
      if (canvas) gsap.set(canvas, { opacity: 0 });
      return;
    }

    if (prefersReducedMotion) {
      gsap.set(items, { opacity: 1, y: 0 });
      if (canvas) gsap.set(canvas, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.05 }
      );
      if (canvas) gsap.to(canvas, { opacity: 1, duration: 1.5, ease: "power2.out", delay: 0.25 });
    }, el);

    return () => ctx.revert();
  }, [introReady, prefersReducedMotion]);

  if (!module) return null;

  return (
    <section id="hero" ref={sectionRef} className="relative min-h-[92dvh] overflow-hidden">
      {fallback && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${UNSPLASH.heroFallback})` }}
          aria-hidden="true"
        />
      )}

      {!fallback && (
        <HeroThree
          prefersReducedMotion={prefersReducedMotion}
          onError={() => setFallback(true)}
        />
      )}

      {/* Readability overlays (keeps module pages consistent with homepage tone) */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,18,32,0.92)] via-[rgba(0,57,131,0.35)] to-[rgba(0,57,131,0.10)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_25%_15%,rgba(255,107,53,0.10),transparent_55%)]" />
      </div>

      <div className="relative z-10 flex min-h-[92dvh] items-end px-6 pb-16 md:px-0 md:pb-20">
        <div className="mx-auto w-[min(1100px,100%)] md:pl-16">
          <div className="max-w-[720px] text-white text-center md:text-left">
            <div data-hero-item className="flex items-center justify-center gap-3 md:justify-start">
              <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 font-mono text-[11px] tracking-[0.22em] text-white/78">
                {module.hero?.overline || "MODULE"}
              </span>
              <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 font-mono text-[11px] tracking-[0.22em] text-white/78">
                {module.label?.toUpperCase?.() || module.label}
              </span>
            </div>

            <h1
              data-hero-item
              className="mt-6 font-display text-[clamp(2.6rem,5vw,5.6rem)] font-semibold tracking-[-0.05em] leading-[0.95]"
            >
              {module.hero?.line1 || module.label}
            </h1>

            <h2
              data-hero-item
              className="mt-3 font-serif italic text-[clamp(3rem,6.6vw,7.2rem)] tracking-[-0.03em] leading-[0.95]"
            >
              {module.hero?.line2?.before}{" "}
              <span className="text-[var(--accent)] font-semibold">
                {module.hero?.line2?.accent}
              </span>{" "}
              {module.hero?.line2?.after}
            </h2>

            <p
              data-hero-item
              className="mt-6 max-w-[560px] text-base leading-relaxed text-white/78 md:text-lg md:mx-0 mx-auto"
              data-cursor="text"
            >
              {module.hero?.line3}
            </p>

            <div
              data-hero-item
              className="mt-8 flex flex-col items-center gap-3 md:flex-row md:items-center md:justify-start"
            >
              <MagneticButton
                href="#demo"
                prefersReducedMotion={prefersReducedMotion}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-6 py-3 font-semibold tracking-[-0.01em] text-[#0b1220] shadow-lift transition-colors hover:bg-white/95 md:w-auto"
              >
                Request a demo
              </MagneticButton>

              <a
                href="#capabilities"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-white/16 bg-white/5 px-6 py-3 font-semibold tracking-[-0.01em] text-white/90 transition-colors hover:bg-white/10 md:w-auto"
              >
                Explore capabilities
              </a>
            </div>

            <div data-hero-item className="mt-8">
              <SmartLink
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"
              >
                <span className="font-mono text-xs tracking-[0.18em] text-white/55">
                  ←
                </span>
                Back to landing page
              </SmartLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

