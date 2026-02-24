const LOGOS = [
  "Skeiron",
  "Sangreen",
  "SE Freight",
  "Wind EPC Ops",
  "ODC Survey Teams",
  "Dispatch Control",
  "Fleet Admin",
];

const STATS = [
  "70% faster driver-ready reports",
  "GPS + photo/video/voice annotations",
  "Split + merge with lineage tracking",
  "Turn-by-turn + proximity alerts",
  "PPTX/PDF exports built for clients",
  "Analytics-ready route library",
];

function TickerRow({ items, variant = "logo" }) {
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="flex w-max animate-ticker">
        <div className="flex items-center gap-4 pr-8">
          {items.map((t) => (
            <div
              key={`${variant}-${t}`}
              className={[
                "flex items-center justify-center rounded-full border px-4 py-2",
                variant === "logo"
                  ? "border-[rgba(16,24,40,0.10)] bg-white text-[var(--text)] shadow-soft"
                  : "border-[rgba(20,71,230,0.14)] bg-[rgba(20,71,230,0.06)] text-[var(--text)]",
              ].join(" ")}
            >
              <span
                className={[
                  "whitespace-nowrap text-xs font-semibold tracking-[0.18em] uppercase",
                  variant === "logo" ? "text-[var(--muted)]" : "text-[var(--text)]",
                ].join(" ")}
              >
                {t}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 pr-8" aria-hidden="true">
          {items.map((t) => (
            <div
              key={`${variant}-${t}-dup`}
              className={[
                "flex items-center justify-center rounded-full border px-4 py-2",
                variant === "logo"
                  ? "border-[rgba(16,24,40,0.10)] bg-white text-[var(--text)] shadow-soft"
                  : "border-[rgba(20,71,230,0.14)] bg-[rgba(20,71,230,0.06)] text-[var(--text)]",
              ].join(" ")}
            >
              <span
                className={[
                  "whitespace-nowrap text-xs font-semibold tracking-[0.18em] uppercase",
                  variant === "logo" ? "text-[var(--muted)]" : "text-[var(--text)]",
                ].join(" ")}
              >
                {t}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SocialProofBar() {
  return (
    <section className="relative border-b border-[var(--border)] bg-[var(--bg)] py-10">
      <div className="mx-auto w-[min(1100px,100%)] px-6 md:px-16">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <p className="font-display text-lg font-semibold tracking-[-0.02em] text-[var(--text)]">
            Credibility looks like precision.
          </p>
          <p className="max-w-[560px] text-sm leading-relaxed text-[var(--muted)]" data-cursor="text">
            If you move wind components, you don’t get to be vague. The page stays clean.
            The system stays strict.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <TickerRow items={LOGOS} variant="logo" />
        <TickerRow items={STATS} variant="stats" />
      </div>
    </section>
  );
}

