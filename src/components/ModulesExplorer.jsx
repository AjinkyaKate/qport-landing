import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowUpRight,
  BarChart3,
  ListTodo,
  Route as RouteIcon,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import { MagneticButton } from "./MagneticButton";

gsap.registerPlugin(ScrollTrigger);

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function ModulesExplorer({ prefersReducedMotion = false }) {
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const [stackMode, setStackMode] = useState(() => {
    if (typeof window === "undefined") return false;
    if (prefersReducedMotion) return false;
    // Scrollytelling: desktop/tablet only. Mobile gets a normal vertical stack.
    return window.matchMedia("(min-width: 768px)").matches;
  });
  const [activeIdx, setActiveIdx] = useState(0);

  const modules = useMemo(
    () => [
      {
        id: "routes",
        label: "Routes",
        href: "/routes",
        kicker: "CURATE",
        meta: "SPLIT • MERGE • EXPORT",
        description:
          "Turn surveyed corridors into publishable route assets. Keep edits explicit and driver-ready.",
        now: ["Review + status workflow", "Split and merge corridors", "Export stakeholder packs"],
        next: ["Version diffs + approvals", "Connector suggestions + gap rationale"],
        Icon: RouteIcon,
      },
      {
        id: "vehicles",
        label: "Vehicles",
        href: "/vehicles",
        kicker: "FLEET",
        meta: "STATUS • DRIVER • TYPES",
        description:
          "Keep fleet reality visible. Dispatch decisions should start with constraints, not assumptions.",
        now: ["Fleet directory + details", "Operational status states", "Driver assignment workflow"],
        next: ["Constraint-ready vehicle profiles", "Route compatibility checks"],
        Icon: Truck,
      },
      {
        id: "analytics",
        label: "Analytics",
        href: "/analytics",
        kicker: "MEASURE",
        meta: "DASHBOARDS • METRICS • EXPORTS",
        description:
          "Embedded dashboards for corridors, tasks, and fleet. Measure what changes in the field and act faster.",
        now: ["Embedded Metabase dashboards", "Sidebar dashboard navigation", "Secure token embedding"],
        next: ["Scheduled exports + stakeholder packs", "Alerts for drift and exceptions"],
        Icon: BarChart3,
      },
      {
        id: "tasks",
        label: "Tasks",
        href: "/tasks",
        kicker: "EXECUTE",
        meta: "PRIORITY • APPROVALS • STATUS",
        description:
          "Make corridor work visible. Ownership, status, and approvals that keep dispatch moving.",
        now: ["Task types for corridor ops", "Statuses + priorities", "Approvals for key steps"],
        next: ["Checklists + templates", "Notifications and SLA tracking"],
        Icon: ListTodo,
      },
      {
        id: "teams",
        label: "Teams",
        href: "/teams",
        kicker: "ACCESS",
        meta: "ROLES • PERMISSIONS • AUDIT",
        description:
          "Roles for admins, surveyors, and drivers. Keep edits deliberate and field views consistent.",
        now: ["User management", "Role assignment", "Safe deletion flows"],
        next: ["Audit logs", "SSO + enterprise controls"],
        Icon: Users,
      },
      {
        id: "qport-ai",
        label: "Qport.ai",
        href: "/qport-ai",
        kicker: "QUERY",
        meta: "HISTORY • LIMITS • APPROVALS",
        description:
          "Ask operational questions in plain language. Get answers designed for the next decision.",
        now: ["Chat + history", "Markdown answers", "Approval-gated actions"],
        next: ["Sources + citations", "Actionable commands + exports"],
        Icon: Sparkles,
      },
    ],
    []
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Keep content readable (no "blank while waiting for animation").
      // Clean & Precise: a single, subtle entrance.
      const items = gsap.utils.toArray("[data-modules-reveal]", el);
      gsap.from(items, {
        opacity: 0,
        y: 16,
        duration: 0.75,
        ease: "power2.out",
        stagger: 0.06,
        immediateRender: false,
        scrollTrigger: { trigger: el, start: "top 86%" },
      });
    }, el);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setStackMode(false);
      return;
    }

    const mql = window.matchMedia("(min-width: 768px)");
    const apply = () => setStackMode(mql.matches);
    apply();

    // Safari <14
    if (mql.addEventListener) mql.addEventListener("change", apply);
    else mql.addListener(apply);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", apply);
      else mql.removeListener(apply);
    };
  }, [prefersReducedMotion]);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    const stage = stageRef.current;
    if (!el) return;
    if (!stage) return;
    if (prefersReducedMotion) return;
    if (!stackMode) return;

    // Horizontal carousel scrollytelling: one full-size module card at a time.
    // Motion direction: current exits left, next arrives from the right.
    // Clean & Precise: no blur, no bounce. One easing curve. Soft snap to rest positions.
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray("[data-module-card]", stage);
      if (cards.length < 2) return;

      const steps = cards.length;
      let lastIdx = 0;

      // Prep: stack cards off-screen right; reveal the first.
      gsap.set(cards, {
        xPercent: 115,
        opacity: 0,
        pointerEvents: "none",
        willChange: "transform,opacity",
      });
      gsap.set(cards[0], { xPercent: 0, opacity: 1, pointerEvents: "auto" });

      // Ensure later cards paint above earlier ones during the transition.
      cards.forEach((c, i) => {
        c.style.zIndex = String(20 + i);
      });

      const dur = 1;
      const tl = gsap.timeline({ paused: true });
      for (let i = 0; i < steps - 1; i++) {
        tl.to(
          cards[i],
          { xPercent: -115, opacity: 0, duration: dur, ease: "power1.inOut" },
          i * dur
        );
        tl.fromTo(
          cards[i + 1],
          { xPercent: 115, opacity: 0 },
          { xPercent: 0, opacity: 1, duration: dur, ease: "power1.inOut" },
          i * dur
        );
      }

      const distancePerStep = () => {
        const h = stage.clientHeight || 640;
        return Math.max(520, Math.round(h * 0.85));
      };

      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top+=96",
        end: () => `+=${distancePerStep() * (steps - 1)}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 0.85,
        animation: tl,
        invalidateOnRefresh: true,
        snap: {
          snapTo: 1 / (steps - 1),
          duration: 0.45,
          delay: 0.02,
          ease: "power1.inOut",
        },
        onUpdate: (self) => {
          const idx = Math.round(self.progress * (steps - 1));
          if (idx === lastIdx) return;
          lastIdx = idx;
          setActiveIdx(idx);
          for (let j = 0; j < cards.length; j++) {
            cards[j].style.pointerEvents = j === idx ? "auto" : "none";
          }
        },
      });

      // Sync initial active state in case the user lands mid-scroll.
      st.update();
      const initIdx = Math.round(st.progress * (steps - 1));
      lastIdx = initIdx;
      setActiveIdx(initIdx);
      for (let j = 0; j < cards.length; j++) {
        cards[j].style.pointerEvents = j === initIdx ? "auto" : "none";
      }

      ScrollTrigger.refresh();

      return () => {
        st.kill();
        tl.kill();
      };
    }, el);

    return () => {
      ctx.revert();
      setActiveIdx(0);
    };
  }, [prefersReducedMotion, stackMode]);

  return (
    <div ref={wrapRef} className="relative mt-10">
      <h4 className="sr-only">Modules</h4>

      <div
        ref={stageRef}
        data-modules-reveal
        className={[
          "relative",
          stackMode
            ? "h-[min(700px,calc(100dvh-220px))] overflow-hidden"
            : [
                "flex gap-4 overflow-x-auto pb-2",
                "snap-x snap-mandatory",
                "scroll-smooth",
                "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              ].join(" "),
        ].join(" ")}
      >
        {modules.map((m, i) => {
          const isActive = i === activeIdx;
          return (
            <article
              key={m.id}
              data-module-card
              aria-hidden={stackMode ? !isActive : undefined}
              className={[
                "relative overflow-hidden rounded-[2rem] border border-[rgba(16,24,40,0.08)] bg-white p-6 shadow-soft",
                "transition-[box-shadow,transform] duration-200 ease-out",
                stackMode ? "absolute inset-0" : "min-w-[min(560px,88%)] snap-center",
              ].join(" ")}
            >
              <div className="absolute inset-0" aria-hidden="true">
                <div className="absolute inset-0 bg-[radial-gradient(820px_circle_at_18%_0%,rgba(20,71,230,0.06),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(820px_circle_at_92%_110%,rgba(255,107,53,0.05),transparent_58%)]" />
              </div>

              <div className="relative">
                <div data-panel-item className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs tracking-[0.22em] text-[var(--muted)]">
                      {m.kicker}
                    </p>
                    <h5 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-[var(--text)]">
                      {m.label}
                    </h5>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(16,24,40,0.10)] bg-white">
                      <m.Icon size={18} className="text-[var(--brand-bright)]" aria-hidden="true" />
                    </div>
                    <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--muted)]">
                      {pad2(i + 1)} / {pad2(modules.length)}
                    </div>
                  </div>
                </div>

                <p
                  data-panel-item
                  className="mt-4 max-w-[62ch] text-sm leading-relaxed text-[var(--muted)]"
                  data-cursor="text"
                >
                  {m.description}
                </p>

                <div data-panel-item className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                  <MagneticButton
                    href={m.href}
                    prefersReducedMotion={prefersReducedMotion}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--brand-bright)] px-6 py-3 font-semibold tracking-[-0.01em] text-white shadow-lift transition-colors hover:bg-[#0f3bd4] sm:w-auto"
                  >
                    Open {m.label}
                  </MagneticButton>

                  <MagneticButton
                    href="/#demo"
                    prefersReducedMotion={prefersReducedMotion}
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-[rgba(16,24,40,0.10)] bg-white px-6 py-3 text-sm font-semibold tracking-[-0.01em] text-[var(--text)] shadow-soft sm:w-auto"
                  >
                    Request a demo
                    <ArrowUpRight size={16} className="ml-2" aria-hidden="true" />
                  </MagneticButton>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
