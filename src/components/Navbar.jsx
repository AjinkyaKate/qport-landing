import { useEffect, useMemo, useState } from "react";
import { MagneticButton } from "./MagneticButton";

export function Navbar({ brand, links, cta }) {
  const [inHero, setInHero] = useState(true);

  const linkItems = useMemo(() => links || [], [links]);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const obs = new IntersectionObserver(
      ([entry]) => setInHero(entry.isIntersecting),
      { threshold: 0.2 }
    );

    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="fixed left-1/2 top-5 z-[900] w-[min(980px,calc(100vw-2rem))] -translate-x-1/2">
      <nav
        className={[
          "flex items-center justify-between gap-4 rounded-full border px-5 py-3 transition-all duration-[400ms] ease-out",
          inHero
            ? "border-white/10 bg-transparent text-white"
            : "border-[rgba(16,24,40,0.08)] bg-[var(--panel)] text-[var(--text)] shadow-soft backdrop-blur-xl",
        ].join(" ")}
        aria-label="Primary"
      >
        <a
          href="#hero"
          className="flex items-baseline gap-2 font-display text-sm font-semibold tracking-[-0.02em]"
        >
          <span className="text-[1.05rem]">{brand}</span>
          <span
            className={[
              "hidden sm:inline",
              inHero ? "text-white/60" : "text-[var(--muted)]",
            ].join(" ")}
          >
            Route Intelligence
          </span>
        </a>

        <div className="hidden items-center gap-4 md:flex">
          {linkItems.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={[
                "text-sm font-medium transition-colors",
                inHero ? "text-white/80 hover:text-white" : "text-[var(--muted)] hover:text-[var(--text)]",
              ].join(" ")}
            >
              {l.label}
            </a>
          ))}
        </div>

        <MagneticButton
          href={cta?.href}
          className={[
            "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold tracking-[-0.01em] transition-colors sm:px-4",
            inHero
              ? "bg-white/10 text-white hover:bg-white/16"
              : "bg-[var(--brand-bright)] text-white hover:bg-[#0f3bd4]",
          ].join(" ")}
        >
          {cta?.label || "Request a demo"}
        </MagneticButton>
      </nav>
    </div>
  );
}
