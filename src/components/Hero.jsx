import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { MagneticButton } from "./MagneticButton";
import { HeroThree } from "./HeroThree";
import { UNSPLASH } from "../lib/unsplash";

export function Hero({ introReady, prefersReducedMotion, ctaHref }) {
  const sectionRef = useRef(null);
  const [fallback, setFallback] = useState(false);

  const headline = useMemo(
    () => ({
      line1: "QPort",
      line2: {
        before: "Make ODC routes",
        accent: "repeatable",
        after: ".",
      },
      line3:
        "Survey once. Curate precisely. Dispatch wind components with the same route truth everyone trusts.",
    }),
    []
  );

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Keep content invisible until the intro sequence hands off.
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

      if (canvas) {
        gsap.to(canvas, { opacity: 1, duration: 1.5, ease: "power2.out", delay: 0.3 });
      }
    }, el);

    return () => ctx.revert();
  }, [introReady, prefersReducedMotion]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-[100dvh] overflow-hidden"
    >
      {/* Background fallback if WebGL fails */}
      {fallback && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${UNSPLASH.heroFallback})` }}
          aria-hidden="true"
        />
      )}

      {/* Three.js canvas */}
      {!fallback && (
        <HeroThree
          prefersReducedMotion={prefersReducedMotion}
          onError={() => setFallback(true)}
        />
      )}

      {/* Gradient readability overlay */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,57,131,0.92)] via-[rgba(0,57,131,0.55)] to-[rgba(0,57,131,0.06)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_20%,rgba(255,107,53,0.12),transparent_55%)]" />
      </div>

      <div className="relative z-10 flex min-h-[100dvh] items-end px-6 pb-16 md:px-0 md:pb-20">
        <div className="mx-auto w-[min(1100px,100%)] md:pl-16">
          <div className="max-w-[680px] text-white text-center md:text-left">
            <h1
              data-hero-item
              className="font-display text-[clamp(3rem,5vw,6rem)] font-semibold tracking-[-0.05em] leading-[0.95]"
            >
              {headline.line1}
            </h1>

            <h2
              data-hero-item
              className="mt-3 font-serif italic text-[clamp(3.2rem,6.8vw,8.2rem)] tracking-[-0.03em] leading-[0.95]"
            >
              {headline.line2.before}{" "}
              <span className="text-[var(--accent)] font-semibold">
                {headline.line2.accent}
              </span>
              {headline.line2.after}
            </h2>

            <p
              data-hero-item
              className="mt-6 max-w-[520px] text-base leading-relaxed text-white/78 md:text-lg md:mx-0 mx-auto"
              data-cursor="text"
            >
              {headline.line3}
            </p>

            <div
              data-hero-item
              className="mt-8 flex flex-col items-center gap-3 md:flex-row md:items-center md:justify-start"
            >
              <MagneticButton
                href={ctaHref}
                prefersReducedMotion={prefersReducedMotion}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-6 py-3 font-semibold tracking-[-0.01em] text-[#0b1220] shadow-lift transition-colors hover:bg-white/95 md:w-auto"
              >
                Request a demo
              </MagneticButton>

              <a
                href="#process"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-white/16 bg-white/5 px-6 py-3 font-semibold tracking-[-0.01em] text-white/90 transition-colors hover:bg-white/10 md:w-auto"
              >
                See the workflow
              </a>
            </div>

            <div
              data-hero-item
              className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium tracking-[0.14em] text-white/55 md:justify-start"
            >
              <span className="font-mono">GPS + media annotations</span>
              <span className="hidden h-3 w-px bg-white/20 md:inline-block" />
              <span className="font-mono">Split + merge with lineage</span>
              <span className="hidden h-3 w-px bg-white/20 md:inline-block" />
              <span className="font-mono">Reports built for wind ODC</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
