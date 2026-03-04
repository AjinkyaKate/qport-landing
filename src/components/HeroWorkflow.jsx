import {
  BadgeCheck,
  FileText,
  Monitor,
  Navigation,
  Satellite,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

function FlowLine({ d, color, dur = "4.6s", begin = "0s", prefersReducedMotion }) {
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeOpacity="0.72"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="5 11"
      >
        {!prefersReducedMotion && (
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-32"
            dur={dur}
            begin={begin}
            repeatCount="indefinite"
          />
        )}
      </path>

      {!prefersReducedMotion && (
        <circle r="2.2" fill={color} opacity="0.92">
          <animateMotion
            dur={dur}
            begin={begin}
            repeatCount="indefinite"
            path={d}
          />
        </circle>
      )}
    </g>
  );
}

function Node({ Icon, title, subtitle, x, y }) {
  return (
    <div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-white/14 bg-white/8 px-3 py-2.5 shadow-soft backdrop-blur-xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
          <Icon size={18} className="text-white/92" aria-hidden="true" />
        </div>
        <div>
          <div className="text-xs font-semibold tracking-[-0.01em] text-white/95">
            {title}
          </div>
          <div className="mt-0.5 text-[11px] leading-tight text-white/62">
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroWorkflow({ prefersReducedMotion = false }) {
  // Diagram coordinates in a 0–100 SVG space. Nodes match these positions.
  const P = {
    field: [16, 54],
    stream: [50, 14],
    core: [50, 54],
    hq: [86, 24],
    driver: [86, 74],
    dispatch: [50, 90],
  };

  const lineColorBlue = "rgba(20,71,230,0.78)"; // --brand-bright
  const lineColorOrange = "rgba(255,107,53,0.78)"; // --accent

  const dField = `M ${P.field[0]} ${P.field[1]} C 28 54, 34 54, 44 54`;
  const dStream = `M ${P.stream[0]} ${P.stream[1]} C 50 26, 50 36, 50 46`;
  const dHQ = `M 56 50 C 66 42, 74 34, ${P.hq[0]} ${P.hq[1]}`;
  const dDriver = `M 56 58 C 66 64, 74 70, ${P.driver[0]} ${P.driver[1]}`;
  const dDispatch = `M 50 60 C 50 70, 50 78, 50 86`;

  return (
    <div className="relative w-full max-w-[460px]">
      <div className="rounded-[2.5rem] border border-white/12 bg-white/6 p-6 shadow-lift backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.22em] text-white/60">
              WORKFLOW
            </div>
            <div className="mt-2 text-sm font-semibold tracking-[-0.02em] text-white/92">
              One route truth. Five roles stay aligned.
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-white/70">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
              aria-hidden="true"
              style={{
                animation: prefersReducedMotion ? "none" : "pulseSoft 1.8s ease-in-out infinite",
              }}
            />
            REAL-TIME
          </div>
        </div>

        <div className="relative mt-5 h-[330px]">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                <stop offset="62%" stopColor="rgba(255,255,255,0.06)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>

            {/* Subtle core glow to anchor the composition */}
            <circle cx={P.core[0]} cy={P.core[1]} r="24" fill="url(#coreGlow)" />

            <FlowLine
              d={dField}
              color={lineColorBlue}
              dur="4.6s"
              begin="0s"
              prefersReducedMotion={prefersReducedMotion}
            />
            <FlowLine
              d={dStream}
              color={lineColorBlue}
              dur="5.2s"
              begin="0.4s"
              prefersReducedMotion={prefersReducedMotion}
            />
            <FlowLine
              d={dHQ}
              color={lineColorOrange}
              dur="4.8s"
              begin="0.2s"
              prefersReducedMotion={prefersReducedMotion}
            />
            <FlowLine
              d={dDispatch}
              color={lineColorOrange}
              dur="5.4s"
              begin="0.6s"
              prefersReducedMotion={prefersReducedMotion}
            />
            <FlowLine
              d={dDriver}
              color={lineColorBlue}
              dur="5.0s"
              begin="0.9s"
              prefersReducedMotion={prefersReducedMotion}
            />
          </svg>

          <Node
            Icon={Smartphone}
            title="Field Survey"
            subtitle="GPS + photos + voice"
            x={P.field[0]}
            y={P.field[1]}
          />

          <Node
            Icon={Satellite}
            title="Live Stream"
            subtitle="Updates in seconds"
            x={P.stream[0]}
            y={P.stream[1]}
          />

          <div
            className="absolute"
            style={{
              left: `${P.core[0]}%`,
              top: `${P.core[1]}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="w-[220px] rounded-[2rem] border border-white/14 bg-white/10 px-5 py-5 text-center shadow-lift backdrop-blur-2xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/8">
                <ShieldCheck size={20} className="text-white/92" aria-hidden="true" />
              </div>
              <div className="mt-3 text-sm font-semibold tracking-[-0.02em] text-white/95">
                QPort Platform
              </div>
              <div className="mt-1 text-xs text-white/62">
                Route truth with lineage.
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/45" aria-hidden="true" />
                  SYNCED
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-white/70">
                  <BadgeCheck size={14} className="text-white/75" aria-hidden="true" />
                  APPROVABLE
                </span>
              </div>
            </div>
          </div>

          <Node
            Icon={Monitor}
            title="HQ Review"
            subtitle="Approve + publish"
            x={P.hq[0]}
            y={P.hq[1]}
          />

          <Node
            Icon={Navigation}
            title="Driver View"
            subtitle="Navigate + log"
            x={P.driver[0]}
            y={P.driver[1]}
          />

          <Node
            Icon={FileText}
            title="Dispatch Pack"
            subtitle="PDF/PPT exports"
            x={P.dispatch[0]}
            y={P.dispatch[1]}
          />
        </div>

        <div className="mt-5 flex items-center justify-between text-xs text-white/55">
          <span className="font-mono tracking-[0.18em]">SURVEY → CURATE → DISPATCH</span>
          <span className="font-mono tracking-[0.18em]">NO TAB-SWITCHING</span>
        </div>
      </div>
    </div>
  );
}

