import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { UNSPLASH } from "../lib/unsplash";

gsap.registerPlugin(ScrollTrigger);

export function Philosophy({ prefersReducedMotion }) {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);

  const copy = useMemo(
    () => ({
      lead: "Most ODC transport still runs on: paper reports, tribal knowledge, and last-minute calls.",
      big: ["We", "focus", "on:", "repeatability."],
      accent: "repeatability.",
      sub:
        "A route is not a file. It’s an operational truth that must survive edits, handoffs, and time.",
    }),
    []
  );

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Parallax texture (subtle, restrained)
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          yPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      const words = el.querySelectorAll("[data-word]");
      gsap.fromTo(
        words,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          stagger: 0.04,
          scrollTrigger: {
            trigger: el,
            start: "top 72%",
            toggleActions: "play none none none",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      id="philosophy"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0b1220] py-20 md:py-28"
    >
      <div
        ref={bgRef}
        className="absolute inset-0 opacity-[0.08]"
        aria-hidden="true"
        style={{
          backgroundImage: `url(${UNSPLASH.philosophyTexture})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_35%_25%,rgba(255,107,53,0.14),transparent_55%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_80%_80%,rgba(20,71,230,0.14),transparent_60%)]" aria-hidden="true" />

      <div className="relative mx-auto w-[min(1100px,100%)] px-6 md:px-16">
        <p className="max-w-[820px] text-sm leading-relaxed text-white/65 md:text-base" data-cursor="text">
          {copy.lead}
        </p>

        <div className="mt-8 max-w-[980px] font-serif italic text-[clamp(2.6rem,5.6vw,5.6rem)] tracking-[-0.03em] leading-[0.95] text-white">
          {copy.big.map((w, i) => {
            const isAccent = w === copy.accent;
            const word = w;
            return (
              <span
                key={`${word}-${i}`}
                data-word
                className={[
                  "inline-block pr-3",
                  isAccent ? "text-[var(--accent)] font-semibold" : "",
                ].join(" ")}
              >
                {word}
              </span>
            );
          })}
        </div>

        <p className="mt-8 max-w-[720px] text-sm leading-relaxed text-white/70 md:text-base" data-cursor="text">
          {copy.sub}
        </p>
      </div>
    </section>
  );
}
