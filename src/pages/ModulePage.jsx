import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ModuleHero } from "../components/ModuleHero";
import { SocialProofBar } from "../components/SocialProofBar";
import { FinalCTA } from "../components/FinalCTA";
import { Plus } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

function Pill({ children, tone = "muted" }) {
  const cls =
    tone === "now"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
      : tone === "roadmap"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-700"
        : "border-[rgba(16,24,40,0.10)] bg-[#f9fafb] text-[var(--muted)]";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] tracking-[0.14em]",
        cls,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function SectionHeading({ eyebrow, title, body }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono text-xs tracking-[0.22em] text-[var(--muted)]">
          {eyebrow}
        </p>
        <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] md:text-4xl">
          {title}
        </h3>
      </div>
      {body ? (
        <p
          className="max-w-[520px] text-sm leading-relaxed text-[var(--muted)] md:text-base"
          data-cursor="text"
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}

function FaqItem({ q, a, open, onToggle }) {
  const bodyRef = useRef(null);
  const maxH = open ? `${bodyRef.current?.scrollHeight || 0}px` : "0px";

  return (
    <div className="rounded-2xl border border-[rgba(16,24,40,0.08)] bg-white shadow-soft">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-base font-semibold tracking-[-0.02em] text-[var(--text)]">
          {q}
        </span>
        <span
          className={[
            "flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(16,24,40,0.10)] bg-[#f9fafb] transition-transform duration-200 ease-out",
            open ? "rotate-45" : "rotate-0",
          ].join(" ")}
          aria-hidden="true"
        >
          <Plus size={18} className="text-[var(--muted)]" />
        </span>
      </button>

      <div
        className="overflow-hidden px-5 transition-[max-height] duration-300 ease-out"
        style={{ maxHeight: maxH }}
      >
        <div
          ref={bodyRef}
          className="pb-5 text-sm leading-relaxed text-[var(--muted)]"
          data-cursor="text"
        >
          {a}
        </div>
      </div>
    </div>
  );
}

export function ModulePage({ module, introReady, prefersReducedMotion }) {
  const overviewRef = useRef(null);
  const capsRef = useRef(null);
  const workflowRef = useRef(null);
  const roadmapRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(-1);

  const caps = useMemo(() => module?.capabilities?.items || [], [module]);
  const steps = useMemo(() => module?.workflow?.steps || [], [module]);
  const lanes = useMemo(() => module?.roadmap?.lanes || [], [module]);
  const faqs = useMemo(() => module?.faq || [], [module]);

  useEffect(() => {
    if (!module?.seo) return;
    document.title = module.seo.title;

    const meta = document.querySelector('meta[name="description"]');
    if (meta && module.seo.description) meta.setAttribute("content", module.seo.description);
  }, [module]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const groups = [
      { ref: overviewRef, selector: "[data-reveal]" },
      { ref: capsRef, selector: "[data-reveal]" },
      { ref: workflowRef, selector: "[data-reveal]" },
      { ref: roadmapRef, selector: "[data-reveal]" },
    ];

    const cleanups = groups.map(({ ref, selector }) => {
      const el = ref.current;
      if (!el) return null;

      const ctx = gsap.context(() => {
        gsap.fromTo(
          el.querySelectorAll(selector),
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            stagger: 0.08,
            scrollTrigger: { trigger: el, start: "top 76%" },
          }
        );
      }, el);

      return () => ctx.revert();
    });

    return () => cleanups.forEach((fn) => fn?.());
  }, [prefersReducedMotion, module?.id]);

  if (!module) return null;

  return (
    <main>
      <ModuleHero
        module={module}
        introReady={introReady}
        prefersReducedMotion={prefersReducedMotion}
      />

      <SocialProofBar />

      <section
        id="overview"
        ref={overviewRef}
        className="bg-[var(--bg)] py-16 md:py-24"
      >
        <div className="mx-auto w-[min(1100px,100%)] px-6 md:px-16">
          <SectionHeading
            eyebrow="OVERVIEW"
            title={module.overview?.title}
            body={module.overview?.body}
          />

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {(module.overview?.bullets || []).map((b) => (
              <div
                key={b}
                data-reveal
                className="rounded-[2rem] border border-[rgba(16,24,40,0.08)] bg-white p-6 shadow-lift"
              >
                <div className="h-10 w-10 rounded-2xl bg-[rgba(20,71,230,0.08)]" aria-hidden="true" />
                <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]" data-cursor="text">
                  {b}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="capabilities"
        ref={capsRef}
        className="bg-[var(--bg)] py-16 md:py-24"
      >
        <div className="mx-auto w-[min(1100px,100%)] px-6 md:px-16">
          <SectionHeading
            eyebrow={module.capabilities?.eyebrow || "CAPABILITIES"}
            title={module.capabilities?.title}
            body="Clear capability boundaries. Anything not shipping today is marked as roadmap."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {caps.map((c) => (
              <div
                key={c.title}
                data-reveal
                className="group rounded-[2rem] border border-[rgba(16,24,40,0.08)] bg-white p-6 shadow-lift"
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-display text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--text)]">
                    {c.title}
                  </h4>
                  <Pill tone={c.tag === "Now" ? "now" : c.tag === "Roadmap" ? "roadmap" : "muted"}>
                    {(c.tag || "Now").toUpperCase()}
                  </Pill>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]" data-cursor="text">
                  {c.body}
                </p>
                <div className="mt-6 h-px w-full bg-[rgba(16,24,40,0.06)]" aria-hidden="true" />
                <div className="mt-4 flex items-center justify-between text-[11px] font-mono tracking-[0.18em] text-[var(--muted)]">
                  <span>QPORT</span>
                  <span className="text-[var(--brand-bright)] group-hover:text-[var(--accent)] transition-colors">
                    {module.label?.toUpperCase?.()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="workflow"
        ref={workflowRef}
        className="bg-[var(--bg)] py-16 md:py-24"
      >
        <div className="mx-auto w-[min(1100px,100%)] px-6 md:px-16">
          <SectionHeading
            eyebrow={module.workflow?.eyebrow || "WORKFLOW"}
            title={module.workflow?.title}
            body="Three steps. Each step produces an artifact you can hand to someone else."
          />

          <div className="relative mt-10">
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
              </svg>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((s) => (
                <div
                  key={s.n}
                  data-reveal
                  className="relative rounded-[2rem] border border-[rgba(16,24,40,0.08)] bg-white p-6 shadow-lift"
                >
                  <div className="flex items-start justify-between">
                    <div className="font-mono text-[2.1rem] leading-none tracking-[-0.02em] text-[var(--brand-bright)]">
                      {s.n}
                    </div>
                    <div className="h-9 w-9 rounded-full bg-[rgba(20,71,230,0.08)]" />
                  </div>
                  <h4 className="mt-4 font-display text-lg font-semibold tracking-[-0.02em] text-[var(--text)]">
                    {s.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]" data-cursor="text">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="roadmap"
        ref={roadmapRef}
        className="bg-[var(--bg)] py-16 md:py-24"
      >
        <div className="mx-auto w-[min(1100px,100%)] px-6 md:px-16">
          <SectionHeading
            eyebrow={module.roadmap?.eyebrow || "ROADMAP"}
            title={module.roadmap?.title}
            body={module.roadmap?.disclaimer}
          />

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {lanes.map((lane) => (
              <div
                key={lane.title}
                data-reveal
                className="rounded-[2rem] border border-[rgba(16,24,40,0.08)] bg-white p-6 shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-lg font-semibold tracking-[-0.02em] text-[var(--text)]">
                    {lane.title}
                  </h4>
                  <Pill tone={lane.title === "Now" ? "now" : lane.title === "Next" ? "roadmap" : "muted"}>
                    {lane.title.toUpperCase()}
                  </Pill>
                </div>

                <ul className="mt-4 space-y-3">
                  {lane.items.map((it) => (
                    <li key={it} className="flex gap-3 text-sm leading-relaxed text-[var(--muted)]" data-cursor="text">
                      <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(20,71,230,0.45)]" aria-hidden="true" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[var(--bg)] py-16 md:py-24">
        <div className="mx-auto w-[min(1100px,100%)] px-6 md:px-16">
          <SectionHeading
            eyebrow="FAQ"
            title={`Questions about ${module.label}.`}
            body="Short answers. If you want the edge cases, we’ll handle them in the demo."
          />

          <div className="mt-10 grid gap-4">
            {faqs.map((it, idx) => (
              <FaqItem
                key={it.q}
                q={it.q}
                a={it.a}
                open={openFaq === idx}
                onToggle={() => setOpenFaq((cur) => (cur === idx ? -1 : idx))}
              />
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </main>
  );
}
