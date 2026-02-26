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
    <div
      className={[
        "h-full rounded-2xl border border-[rgba(16,24,40,0.08)] bg-white p-4 shadow-soft",
        "flex flex-col",
        "transition-transform duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
      ].join(" ")}
      style={{
        transform: `perspective(800px) rotateX(${flip ? 20 : 0}deg)`,
      }}
    >
      <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-[var(--muted)]">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
          GPS LOCK
        </span>
        <span>SYNCED</span>
      </div>

      <div className="mt-3 space-y-2">
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

      <div className="mt-3 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-[var(--muted)]">
        <span>NOTES 12</span>
        <span className="text-[var(--brand-bright)]">READY</span>
      </div>
    </div>
  );
}

function TelemetryTypewriter({ prefersReducedMotion }) {
  const messages = useMemo(
    () => [
      "Split: ROUTE-102\nA–B • B–C • C–D",
      "Gap check: 38m\nConnector suggested",
      "Lineage: reuse confirmed\nEdits stay explainable",
      "Publish: driver pack\nNotes stay attached",
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
            .map((ch) =>
              ch === " " || ch === "\n" ? ch : alphabet[(Math.random() * alphabet.length) | 0]
            )
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
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--muted)]">
          <span className={["h-2 w-2 rounded-full bg-[var(--accent)]", live ? "animate-pulseSoft" : ""].join(" ")} />
          <span className="tracking-[0.22em]">LIVE</span>
        </div>
        <span className="font-mono text-[11px] text-[var(--muted)]">STREAM</span>
      </div>

      <div className="mt-3 flex flex-1 items-center rounded-2xl border border-[rgba(16,24,40,0.08)] bg-[#0b1220] p-4 shadow-soft">
        <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-white/90">
          {text}
          <span className="ml-1 inline-block w-[10px] text-[var(--accent)] animate-cursorBlink">
            |
          </span>
        </div>
      </div>
    </div>
  );
}

function SignalGraph({ prefersReducedMotion }) {
  const wrapRef = useRef(null);
  const pathRef = useRef(null);
  const fillRef = useRef(null);
  const [tip, setTip] = useState(null);
  const hideTipRef = useRef(null);

  const points = useMemo(
    () => [
      { x: 6, y: 66, label: "Baseline", value: "42s" },
      { x: 30, y: 54, label: "Filters", value: "19s" },
      { x: 56, y: 38, label: "Reuse", value: "11s" },
      { x: 86, y: 22, label: "QPort AI", value: "7s" },
    ],
    []
  );

  const showTip = (p, { autoHide = false } = {}) => {
    setTip(p);
    if (hideTipRef.current) window.clearTimeout(hideTipRef.current);
    if (autoHide) {
      hideTipRef.current = window.setTimeout(() => setTip(null), 2200);
    }
  };

  useEffect(() => {
    return () => {
      if (hideTipRef.current) window.clearTimeout(hideTipRef.current);
    };
  }, []);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const fill = fillRef.current;

    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    if (fill) fill.style.opacity = "0";

    if (prefersReducedMotion) {
      path.style.strokeDashoffset = "0";
      if (fill) fill.style.opacity = "1";
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: wrapRef.current, start: "top 78%", once: true },
      });

      const endRing = wrapRef.current?.querySelector("[data-signal-end='1']");

      tl.to(path, { strokeDashoffset: 0, duration: 1.0, ease: "power2.out" }, 0);

      if (fill) tl.to(fill, { opacity: 1, duration: 0.6, ease: "power1.out" }, 0.18);

      // Minimal emphasis: one quiet pulse on the final point (no looping, no scan).
      if (endRing) {
        tl.fromTo(
          endRing,
          { strokeOpacity: 0.12 },
          {
            strokeOpacity: 0.32,
            duration: 1.05,
            ease: "power1.inOut",
            yoyo: true,
            repeat: 1,
          },
          0.35
        );
      }
    }, wrapRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // Note: SVG path `d` does not support percentage coordinates reliably across browsers.
  // We keep everything in viewBox units (0..100 / 0..80).
  const d = useMemo(() => {
    const pt = (p) => `${p.x} ${p.y}`;
    return [
      `M ${pt(points[0])}`,
      `C 18 70, 26 56, ${pt(points[1])}`,
      `S 46 40, ${pt(points[2])}`,
      `S 74 26, ${pt(points[3])}`,
    ].join(" ");
  }, [points]);

  const areaD = useMemo(() => {
    const baseline = 78;
    const first = points[0];
    const last = points[points.length - 1];
    return `${d} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
  }, [d, points]);

  const tipPos = useMemo(() => {
    if (!tip) return null;
    // Prevent tooltips from falling off the card edges on mobile.
    return {
      x: Math.max(14, Math.min(86, tip.x)),
      y: Math.max(12, Math.min(76, tip.y)),
    };
  }, [tip]);

  return (
    <div ref={wrapRef} className="h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="font-mono text-xs tracking-[0.18em] text-[var(--muted)]">QUERY TURNAROUND</div>
        <div className="font-mono text-[11px] text-[var(--muted)]">seconds</div>
      </div>

      <div
        className="relative mt-3 flex flex-1 flex-col rounded-2xl border border-[rgba(16,24,40,0.08)] bg-white p-4 shadow-soft"
        onPointerDown={() => setTip(null)}
      >
        <svg
          viewBox="0 0 100 80"
          className="h-full w-full"
          role="img"
          aria-label="Query turnaround trend"
        >
          <defs>
            <linearGradient id="qportBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1447e6" stopOpacity="0.06" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#ff6b35" stopOpacity="0.05" />
            </linearGradient>

            <pattern id="qportGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 H 0 V 10" fill="none" stroke="#101828" strokeOpacity="0.08" strokeWidth="0.35" />
            </pattern>

            <linearGradient id="qportLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1447e6" />
              <stop offset="65%" stopColor="#1447e6" />
              <stop offset="100%" stopColor="#ff6b35" />
            </linearGradient>

            <linearGradient id="qportFill" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1447e6" stopOpacity="0.10" />
              <stop offset="65%" stopColor="#1447e6" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#ff6b35" stopOpacity="0.06" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="100" height="80" rx="6" fill="url(#qportBg)" />
          <rect x="0" y="0" width="100" height="80" rx="6" fill="url(#qportGrid)" opacity="0.55" />

          <line
            x1="6"
            y1="78"
            x2="94"
            y2="78"
            stroke="#101828"
            strokeOpacity="0.10"
            strokeWidth="0.6"
            strokeDasharray="2.2 3.2"
          />

          <path ref={fillRef} d={areaD} fill="url(#qportFill)" opacity="0" />

          <path
            ref={pathRef}
            d={d}
            fill="none"
            stroke="url(#qportLine)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {points.map((p) => {
            const active = tip?.label === p.label;
            const isEnd = p.label === "QPort AI";
            return (
              <g
                key={p.label}
                onPointerEnter={() => showTip(p)}
                onPointerLeave={() => setTip((t) => (t?.label === p.label ? null : t))}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  showTip(p, { autoHide: true });
                }}
              >
                {/* Larger hit target for touch */}
                <circle cx={p.x} cy={p.y} r="8" fill="transparent" />

                {/* Ring */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={active ? "5.6" : "5.0"}
                  fill="none"
                  stroke={active ? "#ff6b35" : "#1447e6"}
                  strokeOpacity={active ? "0.28" : "0.12"}
                  strokeWidth="0.9"
                  data-signal-end={isEnd ? "1" : undefined}
                />

                {/* Core point */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={active ? "3.0" : "2.6"}
                  fill={active ? "#ff6b35" : "#1447e6"}
                  stroke="#ffffff"
                  strokeOpacity="0.9"
                  strokeWidth="1.2"
                />
              </g>
            );
          })}
        </svg>

        {tip && tipPos && (
          <div
            className="pointer-events-none absolute rounded-xl border border-[rgba(16,24,40,0.10)] bg-white px-3 py-2 shadow-soft"
            style={{
              left: `${tipPos.x}%`,
              top: `${tipPos.y}%`,
              transform: "translate(-50%, -120%)",
            }}
          >
            <div className="text-xs font-semibold text-[var(--text)]">{tip.label}</div>
            <div className="font-mono text-xs text-[var(--muted)]">{tip.value}</div>
          </div>
        )}
      </div>
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
              Survey. Compose. Dispatch.
            </h3>
          </div>
          <p className="max-w-[520px] text-sm leading-relaxed text-[var(--muted)] md:text-base" data-cursor="text">
            Capture the corridor in the field, compose it in the dashboard, and dispatch from one source of truth.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div
            data-feature-card
            className="flex h-full flex-col rounded-[2rem] border border-[rgba(16,24,40,0.08)] bg-[var(--card)] p-6 shadow-lift"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-display text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--text)]">
                Survey Capture
              </h4>
              <span className="font-mono text-[11px] tracking-[0.18em] text-[var(--muted)]">
                01 DIAGNOSTIC
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]" data-cursor="text">
              GPS tracking plus annotations that stay attached to the road.
            </p>
            <div className="mt-5 flex-1">
              <DiagnosticShuffler prefersReducedMotion={prefersReducedMotion} />
            </div>
            <div className="mt-6 border-t border-[rgba(16,24,40,0.06)] pt-5">
              <p className="text-xs leading-relaxed text-[var(--muted)]" data-cursor="text">
                Capture the corridor as a dataset, not a memory.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["GPS TRACE", "MEDIA NOTES", "CONSTRAINT FLAGS"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[rgba(16,24,40,0.08)] bg-[#f9fafb] px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-[var(--muted)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div
            data-feature-card
            className="flex h-full flex-col rounded-[2rem] border border-[rgba(16,24,40,0.08)] bg-[var(--card)] p-6 shadow-lift"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-display text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--text)]">
                Route Composition
              </h4>
              <span className="font-mono text-[11px] tracking-[0.18em] text-[var(--muted)]">
                02 TELEMETRY
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]" data-cursor="text">
              Split, merge, and reuse segments without losing lineage.
            </p>
            <div className="mt-5 flex-1">
              <TelemetryTypewriter prefersReducedMotion={prefersReducedMotion} />
            </div>
            <div className="mt-6 border-t border-[rgba(16,24,40,0.06)] pt-5">
              <p className="text-xs leading-relaxed text-[var(--muted)]" data-cursor="text">
                Compose routes like code: explicit, versioned, explainable.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["SPLIT / MERGE", "LINEAGE", "PUBLISH PACKS"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[rgba(16,24,40,0.08)] bg-[#f9fafb] px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-[var(--muted)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div
            data-feature-card
            className="flex h-full flex-col rounded-[2rem] border border-[rgba(16,24,40,0.08)] bg-[var(--card)] p-6 shadow-lift"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-display text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--text)]">
                Analytics + QPort AI
              </h4>
              <span className="font-mono text-[11px] tracking-[0.18em] text-[var(--muted)]">
                03 SIGNAL
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]" data-cursor="text">
              Dashboards for trends. Conversational queries for the next decision.
            </p>
            <div className="mt-5 flex-1">
              <SignalGraph prefersReducedMotion={prefersReducedMotion} />
            </div>
            <div className="mt-6 border-t border-[rgba(16,24,40,0.06)] pt-5">
              <p className="text-xs leading-relaxed text-[var(--muted)]" data-cursor="text">
                Ask the system. Get an answer. Stay in flow.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["METABASE", "EXCEPTIONS", "ASK QPORT AI"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[rgba(16,24,40,0.08)] bg-[#f9fafb] px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-[var(--muted)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
