import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BarChart3,
  ChevronDown,
  Download,
  Pencil,
  Scissors,
  GitMerge,
  ListTodo,
  Route as RouteIcon,
  Sparkles,
  Truck,
  Users,
  Plus,
  Pause,
  Navigation,
  LocateFixed,
  X,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

function loadMapboxGL() {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.mapboxgl) return Promise.resolve(window.mapboxgl);
  if (window.__qportMapboxPromise) return window.__qportMapboxPromise;

  window.__qportMapboxPromise = new Promise((resolve, reject) => {
    // CSS (once)
    const cssId = "qport-mapboxgl-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
      document.head.appendChild(link);
    }

    // Script (once)
    const scriptId = "qport-mapboxgl-js";
    if (document.getElementById(scriptId)) {
      const check = () => {
        if (window.mapboxgl) resolve(window.mapboxgl);
        else window.setTimeout(check, 50);
      };
      check();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js";
    script.onload = () => resolve(window.mapboxgl);
    script.onerror = () => reject(new Error("Failed to load Mapbox GL JS"));
    document.head.appendChild(script);
  });

  return window.__qportMapboxPromise;
}

function RouteMap({
  prefersReducedMotion = false,
  embedded = false,
  heightClass = "h-[420px] md:h-[560px]",
  roundedClass = "rounded-xl",
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [failed, setFailed] = useState(false);

  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

  const route = useMemo(
    () => [
      // Pune, India (Viman Nagar → Dhanori-ish) — representative corridor geometry.
      [73.9152, 18.5676],
      [73.9138, 18.5696],
      [73.9112, 18.5712],
      [73.9082, 18.5724],
      [73.9056, 18.5748],
      [73.9039, 18.5784],
      [73.9048, 18.5822],
      [73.9061, 18.5862],
      [73.9074, 18.5902],
      [73.9084, 18.5946],
      [73.9093, 18.5984],
    ],
    []
  );

  const notePoint = useMemo(() => route[5], [route]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!token) return;
    if (failed) return;

    let alive = true;

    const boot = async () => {
      try {
        const mapboxgl = await loadMapboxGL();
        if (!alive) return;

        mapboxgl.accessToken = token;

        const map = new mapboxgl.Map({
          container: el,
          // Close to the real app feel: light basemap, low contrast.
          style: "mapbox://styles/mapbox/light-v11",
          center: route[0],
          zoom: 11.5,
          preserveDrawingBuffer: true,
          attributionControl: true,
        });

        mapRef.current = map;

        // Keep scroll behavior clean on a landing page.
        map.scrollZoom.disable();
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

        map.on("load", () => {
          if (!alive) return;

          // Fit route nicely with padding to mimic the real app framing.
          const bounds = route.reduce(
            (b, c) => b.extend(c),
            new mapboxgl.LngLatBounds(route[0], route[0])
          );
          map.fitBounds(bounds, { padding: 70, duration: prefersReducedMotion ? 0 : 650 });

          // Route line (glow + core)
          map.addSource("qport-demo-route", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: { type: "LineString", coordinates: route },
              properties: {},
            },
          });

          map.addLayer({
            id: "qport-demo-route-glow",
            type: "line",
            source: "qport-demo-route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#1447e6",
              "line-width": 10,
              "line-opacity": 0.16,
            },
          });

          map.addLayer({
            id: "qport-demo-route-core",
            type: "line",
            source: "qport-demo-route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#1447e6",
              "line-width": 4,
              "line-opacity": 0.92,
            },
          });

          // Start / End markers (Mapbox default teardrop markers, matches the real app feel).
          const start = new mapboxgl.Marker({ color: "#ef4444" }).setLngLat(route[0]).addTo(map);
          const end = new mapboxgl.Marker({ color: "#22c55e" })
            .setLngLat(route[route.length - 1])
            .addTo(map);

          // Note marker (small amber dot)
          const noteEl = document.createElement("div");
          noteEl.style.width = "16px";
          noteEl.style.height = "16px";
          noteEl.style.borderRadius = "999px";
          noteEl.style.background = "#f59e0b";
          noteEl.style.border = "3px solid #ffffff";
          noteEl.style.boxShadow = "0 10px 22px -16px rgba(16,24,40,0.6)";
          const note = new mapboxgl.Marker({ element: noteEl }).setLngLat(notePoint).addTo(map);

          markersRef.current = [start, end, note];

          // Ensure correct sizing after first paint.
          window.setTimeout(() => map.resize(), 60);
        });
      } catch (e) {
        if (!alive) return;
        setFailed(true);
      }
    };

    boot();

    return () => {
      alive = false;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [token, prefersReducedMotion, failed, route, notePoint]);

  if (!token || failed) {
    return (
      <div
        className={[
          embedded ? "" : "bg-white",
          heightClass,
          roundedClass,
          "w-full overflow-hidden border border-[rgba(16,24,40,0.08)] bg-[#f9fafb]",
        ].join(" ")}
        role="img"
        aria-label="Map preview"
      >
        {/* Minimal fallback: keeps layout consistent if token/script is missing. */}
        <svg viewBox="0 0 100 70" className="h-full w-full">
          <defs>
            <pattern id="gridWB" width="10" height="10" patternUnits="userSpaceOnUse">
              <path
                d="M 10 0 H 0 V 10"
                fill="none"
                stroke="#101828"
                strokeOpacity="0.06"
                strokeWidth="0.4"
              />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100" height="70" rx="8" fill="#ffffff" />
          <rect x="0" y="0" width="100" height="70" rx="8" fill="url(#gridWB)" opacity="0.95" />
          <path
            d="M 10 58 C 20 52, 24 44, 34 46 S 52 60, 60 48 S 78 28, 90 18"
            fill="none"
            stroke="rgba(20,71,230,0.16)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 10 58 C 20 52, 24 44, 34 46 S 52 60, 60 48 S 78 28, 90 18"
            fill="none"
            stroke="#1447e6"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <circle cx="10" cy="58" r="3" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
          <circle cx="90" cy="18" r="3" fill="#22c55e" stroke="#fff" strokeWidth="1.5" />
          <circle cx="44" cy="50" r="2.6" fill="#f59e0b" stroke="#fff" strokeWidth="1.3" />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={[
        heightClass,
        roundedClass,
        "w-full overflow-hidden border border-[rgba(16,24,40,0.06)] bg-[#f9fafb]",
      ].join(" ")}
    />
  );
}

function DesktopFrame({
  active = "routes",
  onChange,
  routePathRef,
  vehiclePathRef,
  prefersReducedMotion,
  className = "",
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
    <div
      className={[
        "relative overflow-hidden rounded-[2rem] border border-[rgba(16,24,40,0.10)] bg-white shadow-lift",
        "flex flex-col",
        className,
      ].join(" ")}
    >
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

      <div className="grid flex-1 grid-cols-12">
        {/* Sidebar (matches real app labels) */}
        <div className="col-span-4 border-r border-[rgba(16,24,40,0.10)] bg-[#101828] p-4 text-white md:col-span-3 overflow-hidden">
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
        <div className="col-span-8 bg-[#fbfbfc] p-4 md:col-span-9 overflow-hidden">
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
            <div className="md:col-span-8">
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

                <div className="mt-3">
                  <RouteMap
                    embedded
                    prefersReducedMotion={prefersReducedMotion}
                    heightClass="h-[420px] md:h-[620px]"
                    roundedClass="rounded-xl"
                  />
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

            <div className="md:col-span-4">
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
      <div className="relative h-[420px] overflow-hidden rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[#f9fafb]">
        <svg viewBox="0 0 100 140" className="absolute inset-0 h-full w-full" role="img" aria-label="Survey map">
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
            <linearGradient id="routeM1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1447e6" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#003983" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="140" rx="10" fill="#ffffff" />
          <rect x="0" y="0" width="100" height="140" rx="10" fill="url(#gridM1)" opacity="0.95" />
          <path
            d="M 18 122 C 22 108, 34 104, 40 92 S 52 68, 62 72 S 72 86, 82 62 S 88 26, 88 26"
            fill="none"
            stroke="rgba(20,71,230,0.12)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            ref={pathRef}
            d="M 18 122 C 22 108, 34 104, 40 92 S 52 68, 62 72 S 72 86, 82 62 S 88 26, 88 26"
            fill="none"
            stroke="url(#routeM1)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle cx="18" cy="122" r="3.2" fill="#4CAF50" stroke="#fff" strokeWidth="1.6" />
          <circle cx="88" cy="26" r="3.2" fill="#FF6B35" stroke="#fff" strokeWidth="1.6" />
          <circle cx="40" cy="92" r="2.8" fill="#FF6B35" opacity="0.95" />
          <circle cx="62" cy="72" r="2.8" fill="#FF6B35" opacity="0.95" />
          <circle cx="82" cy="62" r="2.8" fill="#FF6B35" opacity="0.95" />
        </svg>

        {/* Gradient scrim (matches real app behavior) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/50 to-transparent" aria-hidden="true" />

        {/* GPS Connected pill (top center) */}
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(16,24,40,0.10)] bg-white/95 px-4 py-2 shadow-soft">
            <span className="h-2.5 w-2.5 rounded-full bg-[#4CAF50]" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-[-0.01em] text-[#1F2937]">
              GPS Connected
            </span>
          </div>
        </div>

        {/* Recording status (top right) */}
        <div className="absolute right-4 top-4 z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(16,24,40,0.10)] bg-white/90 px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-[var(--muted)] shadow-soft">
            <span
              className={["h-1.5 w-1.5 rounded-full bg-[var(--accent)]", prefersReducedMotion ? "" : "animate-pulseSoft"].join(" ")}
              aria-hidden="true"
            />
            REC
          </div>
        </div>

        {/* Re-center button (right, above controls) */}
        <div className="absolute bottom-[170px] right-4 z-10">
          <div className="inline-flex items-center gap-2 rounded-xl border border-[rgba(16,24,40,0.10)] bg-white px-3 py-2 shadow-soft">
            <LocateFixed size={16} className="text-[var(--brand-bright)]" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-tight text-[#1447e6]">Re-center</span>
          </div>
        </div>

        {/* Bottom recording controls (enhanced, but aligned to app layout) */}
        <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-[1.75rem] bg-[#1E2530] px-4 pb-4 pt-4">
          <div className="text-center">
            <div className="text-sm font-semibold tracking-[-0.02em] text-white">Tracking Active</div>
            <div className="mt-1 text-xs text-white/60" data-cursor="text">
              Recording your route...
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#2563EB] px-3 text-sm font-semibold text-white shadow-soft"
            >
              <Plus size={18} aria-hidden="true" />
              Note
            </button>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#E07B38] px-3 text-sm font-semibold text-white shadow-soft"
            >
              <Pause size={18} aria-hidden="true" />
              Pause
            </button>
          </div>

          <button
            type="button"
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-3 rounded-2xl bg-[#D44B4B] px-4 text-sm font-semibold text-white shadow-soft"
          >
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-[4px] bg-white/90" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-[2px] bg-[#D44B4B]" />
            </span>
            Stop &amp; Save
          </button>

          <div className="mt-4 h-px w-full bg-white/10" aria-hidden="true" />

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold tracking-tight text-[#60A5FA]">1284</div>
              <div className="font-mono text-[10px] tracking-[0.18em] text-white/60">POINTS</div>
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white">12</div>
              <div className="font-mono text-[10px] tracking-[0.18em] text-white/60">NOTES</div>
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-[#FBBF24]">6</div>
              <div className="font-mono text-[10px] tracking-[0.18em] text-white/60">PHOTOS</div>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

function MobileDriverPreview({ pathRef, prefersReducedMotion }) {
  return (
    <PhoneFrame title="Navigation" subtitle="DRIVER">
      <div className="relative h-[420px] overflow-hidden rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[#f9fafb]">
        <svg viewBox="0 0 100 140" className="absolute inset-0 h-full w-full" role="img" aria-label="Navigation map">
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
          <rect x="0" y="0" width="100" height="140" rx="10" fill="#ffffff" />
          <rect x="0" y="0" width="100" height="140" rx="10" fill="url(#gridM2)" opacity="0.95" />
          <path
            d="M 14 116 C 20 100, 32 92, 40 80 S 54 58, 64 64 S 74 78, 84 58 S 90 30, 90 30"
            fill="none"
            stroke="rgba(20,71,230,0.12)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            ref={pathRef}
            d="M 14 116 C 20 100, 32 92, 40 80 S 54 58, 64 64 S 74 78, 84 58 S 90 30, 90 30"
            fill="none"
            stroke="#1447e6"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Truck position */}
          <circle cx="64" cy="64" r="7.8" fill="rgba(20,71,230,0.10)" />
          <circle cx="64" cy="64" r="3.2" fill="#101828" stroke="#fff" strokeWidth="1.6" />
        </svg>

        {/* Maneuver (top) */}
        <div className="absolute left-4 right-4 top-4 z-10 rounded-2xl border border-[rgba(16,24,40,0.10)] bg-white/92 px-4 py-3 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--muted)]">NEXT</div>
              <div className="mt-1 text-sm font-semibold tracking-tight text-[#101828]">
                Turn left in 250 m
              </div>
              <div className="mt-1 text-xs text-[#4a5565]" data-cursor="text">
                Stay on NH-48.
              </div>
            </div>
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(16,24,40,0.10)] bg-[#f9fafb]">
              <Navigation size={16} className="text-[var(--brand-bright)]" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Proximity note (during navigation) */}
        <div className="absolute left-4 bottom-[96px] z-10 rounded-2xl border border-[rgba(255,107,53,0.20)] bg-[rgba(255,107,53,0.10)] px-4 py-3">
          <div className="font-mono text-[10px] tracking-[0.22em] text-[#c84c21]">NOTE</div>
          <div className="mt-1 text-xs font-semibold tracking-tight text-[#101828]">
            Bridge clearance ahead
          </div>
          <div className="mt-1 text-xs text-[#4a5565]" data-cursor="text">
            14.8 ft max. Escort required.
          </div>
        </div>

        {/* Navigation bottom banner (matches app) */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4">
          <div className="flex items-center gap-3 rounded-2xl bg-[#1C1C1E] px-3 py-3 shadow-lift">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2C2C2E]">
              <LocateFixed size={22} className="text-white" aria-hidden="true" />
            </div>
            <div className="flex-1 text-center">
              <div className="text-xl font-bold tracking-tight text-white">6:40 PM</div>
              <div className="text-sm text-white/55" data-cursor="text">
                2h 18min • 42.0 km
              </div>
            </div>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2C2C2E]"
              aria-label="Stop navigation"
            >
              <X size={22} className="text-[#FF453A]" aria-hidden="true" />
            </button>
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

        <div className="mt-10 grid gap-6">
          {/* 1) Web app (full width) */}
          <div data-screens-reveal>
            <DesktopFrame
              active={tab}
              onChange={(next) => setTab(next === "vehicles" ? "vehicles" : "routes")}
              routePathRef={routePathRef}
              vehiclePathRef={vehiclePathRef}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>

          {/* 2) Mobile apps (below) */}
          <div className="grid gap-6 md:grid-cols-2" data-screens-reveal>
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
