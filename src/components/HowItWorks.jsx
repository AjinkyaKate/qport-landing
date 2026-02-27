import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Layers, Route as RouteIcon, Send } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function HowItWorks({ prefersReducedMotion }) {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);
  const stepIcons = useMemo(() => [RouteIcon, Layers, Send], []);

  const steps = useMemo(
    () => [
      {
        n: "01",
        title: "Survey the corridor",
        body: "Record GPS in motion. Pin photos, video, voice, and text exactly where the constraint exists.",
      },
      {
        n: "02",
        title: "Curate in the dashboard",
        body: "Remove noise, clarify instructions, and version every change without touching route geometry.",
      },
      {
        n: "03",
        title: "Dispatch with confidence",
        body: "Deliver driver-ready navigation plus exportable reports that match what’s on the road.",
      },
    ],
    []
  );

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const cards = el.querySelectorAll("[data-step]");

      gsap.fromTo(
        cards,
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          stagger: 0.14,
          scrollTrigger: { trigger: el, start: "top 72%" },
        }
      );

      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { strokeDashoffset: 240 },
          {
            strokeDashoffset: 0,
            duration: 1.25,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 70%" },
          }
        );
      }
    }, el);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section id="process" ref={sectionRef} className="bg-[var(--bg)] py-16 md:py-24">
      <div className="mx-auto w-[min(1100px,100%)] px-6 md:px-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs tracking-[0.22em] text-[var(--muted)]">HOW IT WORKS</p>
            <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] md:text-4xl">
              Survey to dispatch, without ambiguity.
            </h3>
          </div>
          <p className="max-w-[520px] text-sm leading-relaxed text-[var(--muted)] md:text-base" data-cursor="text">
            The workflow is short on purpose. Each step produces an artifact you can trust.
          </p>
        </div>

        <div className="relative mt-10">
          {/* Connecting line (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-8 hidden md:block" aria-hidden="true">
            <svg viewBox="0 0 100 10" className="h-10 w-full">
              <path
                d="M 2 5 L 98 5"
                fill="none"
                stroke="rgba(20,71,230,0.18)"
                strokeWidth="1.5"
                strokeDasharray="6 10"
                strokeLinecap="round"
              />
              <path
                ref={lineRef}
                d="M 2 5 L 98 5"
                fill="none"
                stroke="rgba(20,71,230,0.55)"
                strokeWidth="2.2"
                strokeDasharray="6 10"
                strokeDashoffset="240"
                strokeLinecap="round"
              />
            </svg>
          </div>

            <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s, idx) => {
              const Icon = stepIcons[idx] || RouteIcon;
              return (
              <div
                key={s.n}
                data-step
                className="relative rounded-[2rem] border border-[rgba(16,24,40,0.08)] bg-white p-6 shadow-lift"
              >
                <div className="flex items-start justify-between">
                  <div className="font-mono text-[2.1rem] leading-none tracking-[-0.02em] text-[var(--brand-bright)]">
                    {s.n}
                  </div>
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(16,24,40,0.10)] bg-[#f9fafb]"
                    aria-hidden="true"
                  >
                    <Icon size={16} className="text-[var(--brand-bright)]" />
                  </div>
                </div>
                <h4 className="mt-4 font-display text-lg font-semibold tracking-[-0.02em] text-[var(--text)]">
                  {s.title}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]" data-cursor="text">
                  {s.body}
                </p>
              </div>
            );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
