import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MagneticButton } from "./MagneticButton";

gsap.registerPlugin(ScrollTrigger);

export function FinalCTA() {
  const sectionRef = useRef(null);
  const [form, setForm] = useState({ name: "", company: "", role: "", email: "" });
  const [submitted, setSubmitted] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelector("[data-cta-panel]"),
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 75%" },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      created_at: new Date().toISOString(),
      intent: "Request a demo",
    };
    setSubmitted(payload);
  };

  const copy = async () => {
    if (!submitted) return;
    const text =
      `QPort Demo Request\n\n` +
      `Name: ${submitted.name}\n` +
      `Company: ${submitted.company}\n` +
      `Role: ${submitted.role}\n` +
      `Email: ${submitted.email}\n\n` +
      `Created: ${submitted.created_at}\n`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Ignore clipboard failures; the content is still visible to copy manually.
    }
  };

  return (
    <section
      id="demo"
      ref={sectionRef}
      className="bg-[linear-gradient(135deg,#1447e6,rgba(0,57,131,1))] py-16 md:py-24"
    >
      <div className="mx-auto w-[min(1100px,100%)] px-6 md:px-16">
        <div
          data-cta-panel
          className="relative overflow-hidden rounded-[2.5rem] bg-[#0b1220] p-8 shadow-lift md:p-12"
        >
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(255,107,53,0.18),transparent_55%)]" aria-hidden="true" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_80%_80%,rgba(20,71,230,0.20),transparent_60%)]" aria-hidden="true" />

          <div className="relative grid gap-10 md:grid-cols-2 md:items-start">
            <div>
              <h3 className="font-serif italic text-[clamp(2.6rem,4.2vw,4.6rem)] leading-[0.95] tracking-[-0.03em] text-white">
                Make the next run repeatable.
              </h3>
              <p className="mt-5 max-w-[520px] text-sm leading-relaxed text-white/70 md:text-base" data-cursor="text">
                A demo should feel like a dispatch rehearsal. Bring one real corridor. We’ll walk
                the workflow end to end: survey, curate, export, and driver view.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold tracking-[0.18em] uppercase text-white/55">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Wind ODC</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Survey + driver</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Exports</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Lineage</span>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              {!submitted ? (
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-white/60">
                      Name
                    </label>
                    <input
                      value={form.name}
                      onChange={set("name")}
                      required
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,53,0.65)]"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-white/60">
                      Company
                    </label>
                    <input
                      value={form.company}
                      onChange={set("company")}
                      required
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,53,0.65)]"
                      placeholder="Carrier / EPC / logistics"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-white/60">
                        Role
                      </label>
                      <input
                        value={form.role}
                        onChange={set("role")}
                        required
                        className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,53,0.65)]"
                        placeholder="Ops / survey / admin"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-white/60">
                        Email
                      </label>
                      <input
                        value={form.email}
                        onChange={set("email")}
                        required
                        type="email"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,53,0.65)]"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  <MagneticButton
                    prefersReducedMotion={false}
                    className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-white px-6 py-3 font-semibold tracking-[-0.01em] text-[#0b1220] shadow-lift transition-colors hover:bg-white/95"
                    type="submit"
                  >
                    Generate demo request
                  </MagneticButton>

                  <p className="text-xs leading-relaxed text-white/55" data-cursor="text">
                    This form doesn’t send anything. It generates a clean request you can copy into
                    your workflow.
                  </p>
                </form>
              ) : (
                <div>
                  <p className="font-display text-lg font-semibold tracking-[-0.02em] text-white">
                    Demo request generated.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/65" data-cursor="text">
                    Copy this into email or your ticketing system.
                  </p>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-[#0b1220] p-4">
                    <div className="space-y-1 font-mono text-xs text-white/80">
                      <div>Name: {submitted.name}</div>
                      <div>Company: {submitted.company}</div>
                      <div>Role: {submitted.role}</div>
                      <div>Email: {submitted.email}</div>
                      <div className="pt-2 text-white/45">Created: {submitted.created_at}</div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 md:flex-row">
                    <MagneticButton
                      prefersReducedMotion={false}
                      onClick={copy}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-6 py-3 font-semibold tracking-[-0.01em] text-[#0b1220] shadow-lift transition-colors hover:bg-white/95 md:w-auto"
                    >
                      {copied ? "Copied" : "Copy request"}
                    </MagneticButton>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(null);
                        setForm({ name: "", company: "", role: "", email: "" });
                      }}
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-white/14 bg-white/5 px-6 py-3 font-semibold tracking-[-0.01em] text-white/90 transition-colors hover:bg-white/10 md:w-auto"
                      data-cursor="button"
                    >
                      Reset
                    </button>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-white/55" data-cursor="text">
                    Next: bring one corridor and one recent survey report. We’ll map the workflow to your standards.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

