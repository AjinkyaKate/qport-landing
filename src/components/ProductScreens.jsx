import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BarChart3,
  ListTodo,
  Route as RouteIcon,
  Sparkles,
  Truck,
  Users,
  Camera,
  Mic,
  Plus,
  Pause,
  Square,
  Navigation,
  LocateFixed,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

function SegmentTabs({ value, onChange, items = [] }) {
  return (
    <div className="inline-flex rounded-full border border-[rgba(16,24,40,0.10)] bg-white p-1">
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            onClick={() => onChange(it.value)}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-semibold tracking-[-0.01em] transition-colors",
              active ? "bg-[#101828] text-white" : "text-[var(--muted)] hover:text-[var(--text)]",
            ].join(" ")}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function DesktopFrame({
  active = "routes",
  onChange,
  routePathRef,
  vehiclePathRef,
  prefersReducedMotion,
}) {
  const menu = useMemo(
    () => [
      { id: "routes", label: "Routes", Icon: RouteIcon },
      { id: "vehicles", label: "Vehicles", Icon: Truck },
      { id: "analytics", label: "Analytics", Icon: BarChart3 },
      { id: "tasks", label: "Tasks", Icon: ListTodo },
      { id: "teams", label: "Teams", Icon: Users },
      { id: "qport-ai", label: "Qport.ai", Icon: Sparkles },
    ],
    []
  );

  const route = useMemo(
    () => ({
      name: "Corridor R-1021",
      source: "Wind Plant Gate A",
      destination: "Port Yard 3",
      distance: "128.4 km",
      status: "Published",
      notes: [
        { title: "Bridge clearance", body: "14.8 ft max. Escort required." },
        { title: "U-turn constraint", body: "Turn radius tight. Keep swing wide." },
        { title: "Village entry", body: "Speed restriction. Night movement only." },
      ],
    }),
    []
  );

  const vehicle = useMemo(
    () => ({
      number: "TRUCK-014",
      driver: "Driver assigned",
      lastSeen: "12s ago",
      status: "In motion",
      speed: "38 km/h",
    }),
    []
  );

  const isRoutes = active === "routes";

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(16,24,40,0.10)] bg-white shadow-lift">
      {/* Window bar */}
      <div className="flex items-center justify-between border-b border-[rgba(16,24,40,0.08)] bg-[#fbfbfc] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" aria-hidden="true" />
        </div>
        <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--muted)]">
          QPORT DASHBOARD
        </div>
        <div className="h-5 w-16" aria-hidden="true" />
      </div>

      <div className="grid min-h-[420px] grid-cols-12">
        {/* Sidebar (matches real app labels) */}
        <div className="col-span-4 border-r border-[rgba(16,24,40,0.10)] bg-[#101828] p-4 text-white md:col-span-3">
          <div className="flex items-center justify-between">
            <div className="font-display text-base font-semibold tracking-[-0.02em]">QPort</div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] tracking-[0.18em] text-white/70">
              OPS
            </span>
          </div>

          <div className="mt-4 space-y-1">
            {menu.map((it) => {
              const activeItem = it.id === active;
              const Icon = it.Icon;
              const clickable = it.id === "routes" || it.id === "vehicles";
              const Tag = clickable ? "button" : "div";
              const tagProps = clickable
                ? {
                    type: "button",
                    onClick: () => onChange(it.id),
                  }
                : {};
              return (
                <Tag
                  key={it.id}
                  {...tagProps}
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                    activeItem ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/8 hover:text-white",
                    clickable ? "" : "cursor-default",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-7 w-7 items-center justify-center rounded-lg border",
                      activeItem ? "border-white/10 bg-white/10" : "border-white/10 bg-transparent",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    <Icon size={14} />
                  </span>
                  <span className="text-sm font-medium tracking-[-0.01em]">{it.label}</span>
                </Tag>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.22em] text-white/60">SYNC</span>
              <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-white/75">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                ONLINE
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/65" data-cursor="text">
              Survey evidence stays attached to the corridor. Dispatch reads the same truth.
            </p>
          </div>
        </div>

        {/* Main */}
        <div className="col-span-8 bg-[#fbfbfc] p-4 md:col-span-9">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--muted)]">
                {isRoutes ? "ROUTES" : "VEHICLES"}
              </div>
              <div className="mt-1 text-sm font-semibold tracking-[-0.01em] text-[var(--text)]">
                {isRoutes ? route.name : vehicle.number}
              </div>
            </div>

            <SegmentTabs
              value={active}
              onChange={onChange}
              items={[
                { value: "routes", label: "Routes" },
                { value: "vehicles", label: "Vehicles live" },
              ]}
            />
          </div>

          <div className="relative mt-4 grid gap-4 md:grid-cols-12">
            {/* Views stack; we keep both mounted so SVG lengths are measurable for animation. */}
            <div className="md:col-span-7">
              {/* Map panel */}
              <div className="relative overflow-hidden rounded-[1.25rem] border border-[rgba(16,24,40,0.10)] bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.22em] text-[var(--muted)]">
                    MAP
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.22em] text-[var(--muted)]">
                    {isRoutes ? "ANNOTATIONS" : "LOCATION"}
                  </span>
                </div>

                <div className="mt-3 aspect-[16/10] w-full overflow-hidden rounded-xl border border-[rgba(16,24,40,0.06)] bg-[#f9fafb]">
                  <svg viewBox="0 0 100 62" className="h-full w-full" role="img" aria-label="Map preview">
                    <defs>
                      <pattern id="gridD" width="8" height="8" patternUnits="userSpaceOnUse">
                        <path
                          d="M 8 0 H 0 V 8"
                          fill="none"
                          stroke="#101828"
                          strokeOpacity="0.06"
                          strokeWidth="0.45"
                        />
                      </pattern>
                      <linearGradient id="routeGlow" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#1447e6" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#1447e6" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>

                    <rect x="0" y="0" width="100" height="62" rx="8" fill="#ffffff" />
                    <rect x="0" y="0" width="100" height="62" rx="8" fill="url(#gridD)" opacity="0.85" />
                    <path
                      d="M 12 50 C 22 44, 26 32, 36 34 S 52 48, 61 40 S 78 22, 88 18"
                      fill="none"
                      stroke="url(#routeGlow)"
                      strokeWidth="8.2"
                      strokeLinecap="round"
                    />

                    {/* Routes view line */}
                    <g style={{ opacity: isRoutes ? 1 : 0, transition: "opacity 220ms ease-out" }}>
                      <path
                        ref={routePathRef}
                        d="M 12 50 C 22 44, 26 32, 36 34 S 52 48, 61 40 S 78 22, 88 18"
                        fill="none"
                        stroke="#1447e6"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                      />
                      <circle cx="12" cy="50" r="2.8" fill="#008236" stroke="#fff" strokeWidth="1.5" />
                      <circle cx="88" cy="18" r="2.8" fill="#ff6b35" stroke="#fff" strokeWidth="1.5" />
                      <circle cx="34" cy="35" r="2.5" fill="#ff6b35" opacity="0.9" />
                      <circle cx="56" cy="46" r="2.5" fill="#ff6b35" opacity="0.9" />
                      <circle cx="74" cy="28" r="2.5" fill="#ff6b35" opacity="0.9" />
                    </g>

                    {/* Vehicles view line + truck marker */}
                    <g style={{ opacity: isRoutes ? 0 : 1, transition: "opacity 220ms ease-out" }}>
                      <path
                        ref={vehiclePathRef}
                        d="M 14 46 C 22 42, 28 30, 40 32 S 60 46, 70 38 S 82 26, 92 22"
                        fill="none"
                        stroke="#1447e6"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                      />
                      <circle cx="70" cy="38" r="5.2" fill="rgba(20,71,230,0.10)" />
                      <circle cx="70" cy="38" r="2.8" fill="#101828" stroke="#fff" strokeWidth="1.4" />
                      <path
                        d="M 68.7 37.6 h 2.6 v 1.6 h -2.6 Z"
                        fill="#fff"
                        opacity="0.95"
                      />
                    </g>
                  </svg>
                </div>

                {!prefersReducedMotion && (
                  <div
                    className={[
                      "pointer-events-none absolute right-5 top-[68px] hidden items-center gap-2 rounded-full border border-[rgba(16,24,40,0.10)] bg-white/80 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-[var(--muted)] shadow-soft md:inline-flex",
                      isRoutes ? "" : "text-[rgba(16,24,40,0.70)]",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    <span className={["h-1.5 w-1.5 rounded-full", isRoutes ? "bg-emerald-500" : "bg-[var(--brand-bright)] animate-pulseSoft"].join(" ")} />
                    {isRoutes ? "PUBLISHED" : "LIVE"}
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-5">
              {/* Side panels */}
              <div
                className={[
                  "relative grid gap-3",
                  isRoutes ? "" : "",
                ].join(" ")}
              >
                <div className="rounded-[1.25rem] border border-[rgba(16,24,40,0.10)] bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.22em] text-[var(--muted)]">
                      {isRoutes ? "ROUTE DETAILS" : "VEHICLE"}
                    </span>
                    <span className="rounded-full border border-[rgba(16,24,40,0.10)] bg-[#f9fafb] px-2 py-1 font-mono text-[10px] tracking-[0.18em] text-[var(--muted)]">
                      {isRoutes ? route.status.toUpperCase() : vehicle.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-sm">
                    {isRoutes ? (
                      <>
                        {[
                          ["Name", route.name],
                          ["Source", route.source],
                          ["Destination", route.destination],
                          ["Distance", route.distance],
                        ].map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between gap-4">
                            <span className="text-xs text-[#4a5565] tracking-tight">{k}</span>
                            <span className="text-xs font-semibold text-[#101828] tracking-tight text-right">
                              {v}
                            </span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        {[
                          ["Vehicle", vehicle.number],
                          ["Status", vehicle.status],
                          ["Speed", vehicle.speed],
                          ["Last seen", vehicle.lastSeen],
                        ].map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between gap-4">
                            <span className="text-xs text-[#4a5565] tracking-tight">{k}</span>
                            <span className="text-xs font-semibold text-[#101828] tracking-tight text-right">
                              {v}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-[rgba(16,24,40,0.10)] bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.22em] text-[var(--muted)]">
                      {isRoutes ? "ANNOTATIONS" : "FIELD SIGNALS"}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.22em] text-[var(--muted)]">
                      {isRoutes ? "3" : "2"}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {isRoutes ? (
                      route.notes.map((n) => (
                        <div
                          key={n.title}
                          className="rounded-xl border border-[rgba(16,24,40,0.08)] bg-[#fbfbfc] px-3 py-2"
                        >
                          <div className="text-xs font-semibold tracking-tight text-[#101828]">
                            {n.title}
                          </div>
                          <div className="mt-0.5 text-xs leading-relaxed text-[#4a5565]" data-cursor="text">
                            {n.body}
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="rounded-xl border border-[rgba(16,24,40,0.08)] bg-[#fbfbfc] px-3 py-2">
                          <div className="text-xs font-semibold tracking-tight text-[#101828]">Driver login</div>
                          <div className="mt-0.5 text-xs leading-relaxed text-[#4a5565]" data-cursor="text">
                            Location updates when the assigned driver is active.
                          </div>
                        </div>
                        <div className="rounded-xl border border-[rgba(16,24,40,0.08)] bg-[#fbfbfc] px-3 py-2">
                          <div className="text-xs font-semibold tracking-tight text-[#101828]">Deviation</div>
                          <div className="mt-0.5 text-xs leading-relaxed text-[#4a5565]" data-cursor="text">
                            Flag drift early. Fix it before it becomes a re-survey.
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneFrame({ title, subtitle, children }) {
  return (
    <div className="relative overflow-hidden rounded-[2.25rem] border border-[rgba(16,24,40,0.12)] bg-white shadow-lift">
      <div className="absolute left-1/2 top-2 h-6 w-28 -translate-x-1/2 rounded-full bg-[#101828]/10" aria-hidden="true" />
      <div className="border-b border-[rgba(16,24,40,0.08)] bg-[#fbfbfc] px-5 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--muted)]">{subtitle}</div>
          <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--muted)]">QPORT</div>
        </div>
        <div className="mt-1 text-sm font-semibold tracking-[-0.01em] text-[var(--text)]">{title}</div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function MobileSurveyPreview({ pathRef, prefersReducedMotion }) {
  return (
    <PhoneFrame title="Recording" subtitle="SURVEY">
      <div className="relative overflow-hidden rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[#f9fafb]">
        <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-[rgba(16,24,40,0.10)] bg-white/85 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-[var(--muted)] shadow-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          GPS LOCK
        </div>

        <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-[rgba(16,24,40,0.10)] bg-white/85 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-[var(--muted)] shadow-soft">
          <span className={["h-1.5 w-1.5 rounded-full bg-[var(--accent)]", prefersReducedMotion ? "" : "animate-pulseSoft"].join(" ")} aria-hidden="true" />
          REC
        </div>

        <svg viewBox="0 0 100 120" className="h-[260px] w-full" role="img" aria-label="Survey map">
          <defs>
            <pattern id="gridM1" width="10" height="10" patternUnits="userSpaceOnUse">
              <path
                d="M 10 0 H 0 V 10"
                fill="none"
                stroke="#101828"
                strokeOpacity="0.06"
                strokeWidth="0.4"
              />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100" height="120" rx="10" fill="#ffffff" />
          <rect x="0" y="0" width="100" height="120" rx="10" fill="url(#gridM1)" opacity="0.9" />
          <path
            d="M 18 104 C 22 88, 36 88, 42 74 S 54 52, 62 54 S 74 66, 84 46 S 88 18, 88 18"
            fill="none"
            stroke="rgba(20,71,230,0.12)"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            ref={pathRef}
            d="M 18 104 C 22 88, 36 88, 42 74 S 54 52, 62 54 S 74 66, 84 46 S 88 18, 88 18"
            fill="none"
            stroke="#1447e6"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="18" cy="104" r="3" fill="#008236" stroke="#fff" strokeWidth="1.4" />
          <circle cx="88" cy="18" r="3" fill="#ff6b35" stroke="#fff" strokeWidth="1.4" />
          <circle cx="42" cy="74" r="2.6" fill="#ff6b35" opacity="0.95" />
          <circle cx="62" cy="54" r="2.6" fill="#ff6b35" opacity="0.95" />
          <circle cx="84" cy="46" r="2.6" fill="#ff6b35" opacity="0.95" />
        </svg>

        <div className="border-t border-[rgba(16,24,40,0.08)] bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--muted)]">DISTANCE</div>
            <div className="text-xs font-semibold tracking-tight text-[#101828]">12.6 km</div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[#fbfbfc] px-3 py-2 text-xs font-semibold text-[#101828]"
            >
              <Pause size={14} aria-hidden="true" />
              Pause
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgba(20,71,230,0.20)] bg-[rgba(20,71,230,0.06)] px-3 py-2 text-xs font-semibold text-[#1447e6]"
            >
              <Plus size={14} aria-hidden="true" />
              Note
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgba(255,107,53,0.20)] bg-[rgba(255,107,53,0.06)] px-3 py-2 text-xs font-semibold text-[#c84c21]"
            >
              <Square size={14} aria-hidden="true" />
              Finish
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { Icon: Camera, label: "Photo" },
              { Icon: Mic, label: "Voice" },
              { Icon: Navigation, label: "Point" },
            ].map((it) => {
              const Icon = it.Icon;
              return (
                <span
                  key={it.label}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(16,24,40,0.10)] bg-[#f9fafb] px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-[var(--muted)]"
                >
                  <Icon size={12} aria-hidden="true" />
                  {it.label.toUpperCase()}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

function MobileDriverPreview({ pathRef, prefersReducedMotion }) {
  return (
    <PhoneFrame title="Navigation" subtitle="DRIVER">
      <div className="relative overflow-hidden rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[#f9fafb]">
        <div className="absolute left-4 top-4 z-10 rounded-2xl border border-[rgba(16,24,40,0.10)] bg-white/92 px-3 py-2 shadow-soft">
          <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--muted)]">NEXT</div>
          <div className="mt-1 text-xs font-semibold tracking-tight text-[#101828]">
            Turn left in 250 m
          </div>
          <div className="mt-1 text-[11px] text-[#4a5565]" data-cursor="text">
            NH-48, stay in lane.
          </div>
        </div>

        <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-[rgba(16,24,40,0.10)] bg-white/85 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-[var(--muted)] shadow-soft">
          <span className={["h-1.5 w-1.5 rounded-full bg-[var(--brand-bright)]", prefersReducedMotion ? "" : "animate-pulseSoft"].join(" ")} aria-hidden="true" />
          LIVE
        </div>

        <svg viewBox="0 0 100 120" className="h-[260px] w-full" role="img" aria-label="Navigation map">
          <defs>
            <pattern id="gridM2" width="10" height="10" patternUnits="userSpaceOnUse">
              <path
                d="M 10 0 H 0 V 10"
                fill="none"
                stroke="#101828"
                strokeOpacity="0.06"
                strokeWidth="0.4"
              />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100" height="120" rx="10" fill="#ffffff" />
          <rect x="0" y="0" width="100" height="120" rx="10" fill="url(#gridM2)" opacity="0.9" />
          <path
            d="M 14 98 C 20 82, 32 78, 40 66 S 54 46, 64 50 S 74 62, 84 44 S 90 22, 90 22"
            fill="none"
            stroke="rgba(20,71,230,0.12)"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            ref={pathRef}
            d="M 14 98 C 20 82, 32 78, 40 66 S 54 46, 64 50 S 74 62, 84 44 S 90 22, 90 22"
            fill="none"
            stroke="#1447e6"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="64" cy="50" r="6.2" fill="rgba(20,71,230,0.10)" />
          <circle cx="64" cy="50" r="3" fill="#101828" stroke="#fff" strokeWidth="1.4" />
        </svg>

        <div className="border-t border-[rgba(16,24,40,0.08)] bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold tracking-tight text-[#101828]">ETA 18:40</div>
            <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--muted)]">42 KM LEFT</div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[#fbfbfc] px-3 py-2">
            <span className="text-xs font-semibold tracking-tight text-[#101828]">Recenter</span>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(16,24,40,0.10)] bg-white">
              <LocateFixed size={16} className="text-[var(--brand-bright)]" aria-hidden="true" />
            </span>
          </div>

          <div className="mt-3 rounded-2xl border border-[rgba(255,107,53,0.18)] bg-[rgba(255,107,53,0.06)] px-3 py-2">
            <div className="font-mono text-[10px] tracking-[0.22em] text-[#c84c21]">ALERT</div>
            <div className="mt-1 text-xs leading-relaxed text-[#4a5565]" data-cursor="text">
              Deviation detected. Return to corridor within 200 m.
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

export function ProductScreens({ prefersReducedMotion = false }) {
  const sectionRef = useRef(null);
  const routePathRef = useRef(null);
  const vehiclePathRef = useRef(null);
  const mobileSurveyPathRef = useRef(null);
  const mobileNavPathRef = useRef(null);
  const [tab, setTab] = useState("routes");

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const items = el.querySelectorAll("[data-screens-reveal]");
      gsap.fromTo(
        items,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 74%" },
        }
      );

      const paths = [routePathRef.current, vehiclePathRef.current, mobileSurveyPathRef.current, mobileNavPathRef.current].filter(Boolean);
      paths.forEach((p) => {
        const len = p.getTotalLength?.() || 0;
        if (!len) return;
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(p, {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 72%", once: true },
        });
      });
    }, el);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // Keep tab valid and constrained.
  useEffect(() => {
    setTab((t) => (t === "vehicles" ? "vehicles" : "routes"));
  }, []);

  return (
    <section id="product" ref={sectionRef} className="bg-[var(--bg)] py-16 md:py-24">
      <div className="mx-auto w-[min(1100px,100%)] px-6 md:px-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between" data-screens-reveal>
          <div>
            <p className="font-mono text-xs tracking-[0.22em] text-[var(--muted)]">PRODUCT</p>
            <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] md:text-4xl">
              One corridor. Three viewpoints.
            </h3>
          </div>
          <p className="max-w-[540px] text-sm leading-relaxed text-[var(--muted)] md:text-base" data-cursor="text">
            Surveyors capture constraints in motion. Drivers see them at the right moment. Ops curates and dispatches from one route truth.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7" data-screens-reveal>
            <DesktopFrame
              active={tab}
              onChange={(next) => setTab(next === "vehicles" ? "vehicles" : "routes")}
              routePathRef={routePathRef}
              vehiclePathRef={vehiclePathRef}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>

          <div className="grid gap-6 lg:col-span-5" data-screens-reveal>
            <MobileSurveyPreview
              pathRef={mobileSurveyPathRef}
              prefersReducedMotion={prefersReducedMotion}
            />
            <MobileDriverPreview
              pathRef={mobileNavPathRef}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3" data-screens-reveal>
          {[
            "Routes + Vehicles share the same truth",
            "Notes pinned to GPS, not buried in reports",
            "Deviation alerts before the corridor drifts",
          ].map((t) => (
            <span
              key={t}
              className="rounded-full border border-[rgba(16,24,40,0.10)] bg-white px-4 py-2 font-mono text-[10px] tracking-[0.18em] text-[var(--muted)]"
            >
              {t.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
