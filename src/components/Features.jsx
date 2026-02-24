import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const sleep = (ms) => new Promise((r) => window.setTimeout(r, ms));

function DiagnosticShuffler({ prefersReducedMotion }) {
  const [rows, setRows] = useState([
    { label: "GPS stream", value: "LOCKED", tone: "ok" },
    { label: "Media notes", value: "TAGGED", tone: "info" },
    { label: "Constraints", value: "CAPTURED", tone: "warn" },
  ]);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = window.setInterval(() => {
      setFlip(true);
      setRows((prev) => [...prev.slice(1), prev[0]]);
      window.setTimeout(() => setFlip(false), 480);
    }, 3000);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion]);

  return (
    <div className="mt-5">
      <div
        className={[
          "rounded-2xl border border-[rgba(16,24,40,0.08)] bg-white p-4 shadow-soft",
          "transition-transform duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
        ].join(" ")}
        style={{
          transform: `perspective(800px) rotateX(${flip ? 20 : 0}deg)`,
        }}
      >
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div
              key={`${r.label}-${i}`}
              className="flex items-center justify-between rounded-xl bg-[#f9fafb] px-3 py-2"
            >
              <span className="text-xs font-semibold tracking-[-0.01em] text-[var(--text)]">
                {r.label}
              </span>
              <span className="flex items-center gap-2 font-mono text-[11px] text-[var(--muted)]">
                <span
                  className={[
                    "h-2 w-2 rounded-full",
                    r.tone === "ok"
                      ? "bg-emerald-500"
                      : r.tone === "warn"
                        ? "bg-amber-500"
                        : "bg-blue-500",
                  ].join(" ")}
                />
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]" data-cursor="text">
        Capture the corridor as a dataset, not a memory.
      </p>
    </div>
  );
}

function TelemetryTypewriter({ prefersReducedMotion }) {
  const messages = useMemo(
    () => [
      "Split: ROUTE-102 -> (A–B, B–C, C–D)",
      "Gap check: 38m -> connector suggested",
      "Lineage: segment reuse confirmed",
      "Dispatch: driver view aligned with survey notes",
    ],
    []
  );

  const [text, setText] = useState("");
  const [live, setLive] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion) {
      setText(messages[0]);
      setLive(false);
      return;
    }
    let alive = true;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    const run = async () => {
      let idx = 0;
      while (alive) {
        const next = messages[idx];

        setText("");
        for (let i = 0; i < next.length; i++) {
          if (!alive) return;
          setText(next.slice(0, i + 1));
          await sleep(15);
        }

        await sleep(900);

        // Scramble phase
        const start = performance.now();
        while (performance.now() - start < 400) {
          if (!alive) return;
          const scrambled = next
            .split("")
            .map((ch) => (ch === " " ? " " : alphabet[(Math.random() * alphabet.length) | 0]))
            .join("");
          setText(scrambled);
          await sleep(40);
        }

        idx = (idx + 1) % messages.length;
      }
    };

    run();
    const pulse = window.setInterval(() => setLive((v) => !v), 1600);

    return () => {
      alive = false;
      window.clearInterval(pulse);
    };
  }, [messages, prefersReducedMotion]);

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--muted)]">
          <span className={["h-2 w-2 rounded-full bg-[var(--accent)]", live ? "animate-pulseSoft" : ""].join(" ")} />
          <span className="tracking-[0.22em]">LIVE</span>
        </div>
        <span className="font-mono text-[11px] text-[var(--muted)]">STREAM</span>
      </div>

      <div className="mt-3 rounded-2xl border border-[rgba(16,24,40,0.08)] bg-[#0b1220] p-4 shadow-soft">
        <div className="font-mono text-sm text-white/90">
          {text}
          <span className="ml-1 inline-block w-[10px] text-[var(--accent)] animate-cursorBlink">
            |
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]" data-cursor="text">
        Compose routes like code: explicit, versioned, explainable.
      </p>
    </div>
  );
}

function SignalGraph({ prefersReducedMotion }) {
  const wrapRef = useRef(null);
  const pathRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [tip, setTip] = useState(null);

  const points = useMemo(
    () => [
      { x: 6, y: 66, label: "Baseline", value: "42s" },
      { x: 30, y: 54, label: "Filters", value: "19s" },
      { x: 56, y: 38, label: "Reuse", value: "11s" },
      { x: 86, y: 22, label: "QPort AI", value: "7s" },
    ],
    []
  );

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;

    if (prefersReducedMotion) {
      path.style.strokeDashoffset = "0";
      setReady(true);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to(path, { strokeDashoffset: 0, duration: 1.1, ease: "power2.out", onComplete: () => setReady(true) });
    }, wrapRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const d = useMemo(() => {
    const toPx = (p) => `${p.x}% ${p.y}%`;
    return `M ${toPx(points[0])} C ${toPx({ x: 18, y: 70 })}, ${toPx({ x: 26, y: 56 })}, ${toPx(points[1])}
            S ${toPx({ x: 46, y: 40 })}, ${toPx(points[2])}
            S ${toPx({ x: 74, y: 26 })}, ${toPx(points[3])}`;
  }, [points]);

  return (
    <div ref={wrapRef} className="mt-5">
      <div className="flex items-center justify-between">
        <div className="font-mono text-xs tracking-[0.18em] text-[var(--muted)]">QUERY TURNAROUND</div>
        <div className="font-mono text-[11px] text-[var(--muted)]">seconds</div>
      </div>

      <div className="relative mt-3 rounded-2xl border border-[rgba(16,24,40,0.08)] bg-white p-4 shadow-soft">
        <svg viewBox="0 0 100 80" className="h-[160px] w-full">
          <defs>
            <linearGradient id="qportLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1447e6" />
              <stop offset="65%" stopColor="#1447e6" />
              <stop offset="100%" stopColor="#ff6b35" />
            </linearGradient>
          </defs>

          <path
            ref={pathRef}
            d={d}
            fill="none"
            stroke="url(#qportLine)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {points.map((p) => (
            <circle
              key={p.label}
              cx={`${p.x}%`}
              cy={`${p.y}%`}
              r="2.6"
              fill="#1447e6"
              className={ready ? "animate-pulseSoft" : ""}
              onMouseEnter={() => setTip(p)}
              onMouseLeave={() => setTip(null)}
            />
          ))}
        </svg>

        {tip && (
          <div
            className="pointer-events-none absolute rounded-xl border border-[rgba(16,24,40,0.10)] bg-white px-3 py-2 shadow-soft"
            style={{
              left: `${tip.x}%`,
              top: `${tip.y}%`,
              transform: "translate(-50%, -120%)",
            }}
          >
            <div className="text-xs font-semibold text-[var(--text)]">{tip.label}</div>
            <div className="font-mono text-xs text-[var(--muted)]">{tip.value}</div>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]" data-cursor="text">
        Ask the system. Get an answer. Stay in flow.
      </p>
    </div>
  );
}

export function Features({ prefersReducedMotion }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("[data-feature-card]"),
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          stagger: 0.15,
          scrollTrigger: { trigger: el, start: "top 72%" },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section id="features" ref={sectionRef} className="bg-[var(--bg)] py-16 md:py-24">
      <div className="mx-auto w-[min(1100px,100%)] px-6 md:px-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs tracking-[0.22em] text-[var(--muted)]">FEATURES</p>
            <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] md:text-4xl">
              Three instruments. One workflow.
            </h3>
          </div>
          <p className="max-w-[520px] text-sm leading-relaxed text-[var(--muted)] md:text-base" data-cursor="text">
            Built for operators who need the route to be explicit: surveyed, curated, and dispatchable.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div
            data-feature-card
            className="rounded-[2rem] border border-[rgba(16,24,40,0.08)] bg-[var(--card)] p-6 shadow-lift"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-display text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--text)]">
                Survey Capture
              </h4>
              <span className="font-mono text-[11px] tracking-[0.18em] text-[var(--muted)]">
                DIAGNOSTIC
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]" data-cursor="text">
              GPS tracking plus annotations that stay attached to the road.
            </p>
            <DiagnosticShuffler prefersReducedMotion={prefersReducedMotion} />
          </div>

          <div
            data-feature-card
            className="rounded-[2rem] border border-[rgba(16,24,40,0.08)] bg-[var(--card)] p-6 shadow-lift"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-display text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--text)]">
                Route Composition
              </h4>
              <span className="font-mono text-[11px] tracking-[0.18em] text-[var(--muted)]">
                TELEMETRY
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]" data-cursor="text">
              Split, merge, and reuse segments without losing lineage.
            </p>
            <TelemetryTypewriter prefersReducedMotion={prefersReducedMotion} />
          </div>

          <div
            data-feature-card
            className="rounded-[2rem] border border-[rgba(16,24,40,0.08)] bg-[var(--card)] p-6 shadow-lift"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-display text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--text)]">
                Analytics + QPort AI
              </h4>
              <span className="font-mono text-[11px] tracking-[0.18em] text-[var(--muted)]">
                SIGNAL
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]" data-cursor="text">
              Dashboards for trends. Conversational queries for the next decision.
            </p>
            <SignalGraph prefersReducedMotion={prefersReducedMotion} />
          </div>
        </div>
      </div>
    </section>
  );
}
