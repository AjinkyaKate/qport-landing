import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MagneticButton } from "./MagneticButton";

gsap.registerPlugin(ScrollTrigger);

export function FinalCTA() {
  const sectionRef = useRef(null);
  const [form, setForm] = useState({ name: "", company: "", role: "", email: "" });
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");
  const [honeypot, setHoneypot] = useState("");

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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setError("");

    const url = new URL(window.location.href);
    const payload = {
      ...form,
      website: honeypot, // spam trap
      created_at: new Date().toISOString(),
      intent: "Request a demo",
      page_url: url.toString(),
      referrer: document.referrer || "",
      utm_source: url.searchParams.get("utm_source") || "",
      utm_medium: url.searchParams.get("utm_medium") || "",
      utm_campaign: url.searchParams.get("utm_campaign") || "",
      utm_term: url.searchParams.get("utm_term") || "",
      utm_content: url.searchParams.get("utm_content") || "",
    };

    try {
      const r = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await r.json().catch(() => null);
      if (!r.ok || !data?.ok) {
        throw new Error(data?.error || "Could not send your request. Try again in a moment.");
      }

      setSubmittedEmail(form.email);
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err?.message || "Could not send your request.");
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

              <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-xs tracking-[0.18em] text-white/55">
                <a className="text-white/70 hover:text-white" href="mailto:demo@qportai.com">
                  demo@qportai.com
                </a>
                <span className="text-white/25" aria-hidden="true">
                  •
                </span>
                <a
                  className="text-white/70 hover:text-white"
                  href="https://qportai.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  qportai.com
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              {status !== "sent" ? (
                <form onSubmit={onSubmit} className="space-y-4">
                  {/* Honeypot: humans won't fill this. */}
                  <div className="hidden" aria-hidden="true">
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-white/60">
                      Website
                    </label>
                    <input
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white placeholder:text-white/40"
                      placeholder="Leave this blank"
                    />
                  </div>

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
                    className={[
                      "mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-white px-6 py-3 font-semibold tracking-[-0.01em] text-[#0b1220] shadow-lift transition-colors hover:bg-white/95",
                      status === "sending" ? "opacity-70" : "",
                    ].join(" ")}
                    type="submit"
                  >
                    {status === "sending" ? "Sending…" : "Request a demo"}
                  </MagneticButton>

                  <p className="text-xs leading-relaxed text-white/55" data-cursor="text">
                    We’ll follow up from <span className="text-white/75">demo@qportai.com</span>.
                  </p>

                  {status === "error" && (
                    <p className="text-xs leading-relaxed text-[rgba(255,107,53,0.92)]" data-cursor="text">
                      {error || "Could not send your request."} If it keeps failing, email{" "}
                      <a className="underline underline-offset-4" href="mailto:demo@qportai.com">
                        demo@qportai.com
                      </a>
                      .
                    </p>
                  )}
                </form>
              ) : (
                <div>
                  <p className="font-display text-lg font-semibold tracking-[-0.02em] text-white">
                    Request received.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/65" data-cursor="text">
                    We’ll reach out{submittedEmail ? ` at ${submittedEmail}` : ""}. Typical response: within 1 business
                    day.
                  </p>
                  <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <a className="text-xs text-white/70 hover:text-white" href="mailto:demo@qportai.com">
                      Need to add context? demo@qportai.com
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedEmail("");
                        setForm({ name: "", company: "", role: "", email: "" });
                        setStatus("idle");
                        setError("");
                        setHoneypot("");
                      }}
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-white/14 bg-white/5 px-6 py-3 font-semibold tracking-[-0.01em] text-white/90 transition-colors hover:bg-white/10 md:w-auto"
                      data-cursor="button"
                    >
                      New request
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
