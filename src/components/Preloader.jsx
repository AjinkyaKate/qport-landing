import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

export function Preloader({ brand, prefersReducedMotion, onDone }) {
  const wrapRef = useRef(null);
  const lettersRef = useRef(null);
  const letters = useMemo(() => brand.split(""), [brand]);

  useEffect(() => {
    // Make the page paintable immediately; the overlay controls what’s visible.
    gsap.to(document.body, { opacity: 1, duration: 0.01, ease: "none" });

    if (prefersReducedMotion) {
      gsap.set(wrapRef.current, { yPercent: -100 });
      onDone?.();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => onDone?.(),
      });

      tl.fromTo(
        lettersRef.current?.querySelectorAll("[data-letter]") || [],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.07 }
      )
        .to({}, { duration: 0.3 })
        .to(wrapRef.current, { yPercent: -100, duration: 0.85, ease: "power2.inOut" });
    }, wrapRef);

    return () => ctx.revert();
  }, [onDone, prefersReducedMotion]);

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0b1220]"
      aria-hidden="true"
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(20,71,230,0.18)] via-transparent to-transparent" />
        <div className="absolute -left-24 -top-24 h-[460px] w-[460px] rounded-full bg-[rgba(255,107,53,0.10)] blur-3xl" />
        <div className="absolute -right-24 -bottom-24 h-[520px] w-[520px] rounded-full bg-[rgba(20,71,230,0.12)] blur-3xl" />
      </div>

      <div
        ref={lettersRef}
        className="relative flex items-baseline gap-1 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold tracking-[-0.04em] text-white"
      >
        {letters.map((ch, i) => (
          <span key={`${ch}-${i}`} data-letter className="inline-block">
            {ch}
          </span>
        ))}
        <span className="ml-2 font-mono text-sm font-medium tracking-[0.2em] text-white/60">
          SYSTEM READY
        </span>
      </div>
    </div>
  );
}

