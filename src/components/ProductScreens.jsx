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
  Layers,
  Minus,
  Plus,
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
  mode = "auto", // "auto" | "mapbox" | "static"
  staticSrc = "/map-india-terrain.webp",
  preferStaticInAuto = false,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [failed, setFailed] = useState(false);
  const [fallbackImageReady, setFallbackImageReady] = useState(false);
  const [fallbackImageChecked, setFallbackImageChecked] = useState(false);
  const [staticZoom, setStaticZoom] = useState(1);

  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
  const fallbackImageSrc = staticSrc;
  const forceStatic = mode === "static";
  const forceMapbox = mode === "mapbox";
  const wantsStaticInAuto = mode === "auto" && preferStaticInAuto;
  const waitingForStaticCheck = wantsStaticInAuto && !fallbackImageChecked;
  const canUseStaticInAuto = wantsStaticInAuto && fallbackImageChecked && fallbackImageReady;

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
    // Optional static fallback image for marketing (user-provided asset in /public).
    // If enabled, this can also be preferred over Mapbox for a controlled "marketing basemap".
    let alive = true;
    setFallbackImageChecked(false);
    const img = new Image();
    img.onload = () => {
      if (!alive) return;
      setFallbackImageReady(true);
      setFallbackImageChecked(true);
    };
    img.onerror = () => {
      if (!alive) return;
      setFallbackImageReady(false);
      setFallbackImageChecked(true);
    };
    img.src = fallbackImageSrc;
    return () => {
      alive = false;
    };
  }, [fallbackImageSrc]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (forceStatic) return;
    // If we prefer static basemaps in "auto" mode, wait until the image check finishes.
    if (wantsStaticInAuto && !fallbackImageChecked) return;
    // If the static basemap is available, do not boot Mapbox.
    if (wantsStaticInAuto && fallbackImageReady) return;
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
          // Terrain-style basemap. If you prefer the exact app look, switch to "light-v11".
          style: "mapbox://styles/mapbox/outdoors-v12",
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
  }, [
    token,
    prefersReducedMotion,
    failed,
    route,
    notePoint,
    forceStatic,
    wantsStaticInAuto,
    fallbackImageChecked,
    fallbackImageReady,
  ]);

  if (waitingForStaticCheck) {
    return (
      <div
        className={[
          embedded ? "" : "bg-white",
          heightClass,
          roundedClass,
          "relative w-full overflow-hidden border border-[rgba(16,24,40,0.08)] bg-[#f9fafb]",
        ].join(" ")}
        role="img"
        aria-label="Loading map preview"
      >
        <svg viewBox="0 0 100 70" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <pattern id="gridWB-loading" width="10" height="10" patternUnits="userSpaceOnUse">
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
          <rect
            x="0"
            y="0"
            width="100"
            height="70"
            rx="8"
            fill="url(#gridWB-loading)"
            opacity="0.95"
          />
        </svg>
        <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-[rgba(16,24,40,0.10)] bg-white/80 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-[#4a5565] shadow-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-[#101828]/35" aria-hidden="true" />
          LOADING BASEMAP
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/35 via-transparent to-transparent" />
      </div>
    );
  }

  if (forceStatic || canUseStaticInAuto || (!token || failed) || (forceMapbox && !token)) {
    if (fallbackImageReady) {
      const minZoom = 1;
      const maxZoom = 1.55;
      const canZoomIn = staticZoom < maxZoom - 0.001;
      const canZoomOut = staticZoom > minZoom + 0.001;
      const setZoom = (next) =>
        setStaticZoom(Math.max(minZoom, Math.min(maxZoom, Math.round(next * 100) / 100)));

      return (
        <div
          className={[
            embedded ? "" : "bg-white",
            heightClass,
            roundedClass,
            "relative w-full overflow-hidden border border-[rgba(16,24,40,0.08)] bg-[#f9fafb]",
          ].join(" ")}
          role="img"
          aria-label="India terrain map preview"
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `scale(${staticZoom})`,
              transformOrigin: "50% 50%",
              transition: prefersReducedMotion ? "none" : "transform 240ms ease-out",
            }}
          >
            <img
              src={fallbackImageSrc}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />

            {/* Overlay route line + pins so the "QPort corridor" stays readable. */}
            <svg viewBox="0 0 100 70" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <path
                d="M 10 58 C 20 52, 24 44, 34 46 S 52 60, 60 48 S 78 28, 90 18"
                fill="none"
                stroke="rgba(20,71,230,0.18)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 10 58 C 20 52, 24 44, 34 46 S 52 60, 60 48 S 78 28, 90 18"
                fill="none"
                stroke="#1447e6"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Constraint markers */}
              {[
                [34, 46],
                [60, 48],
                [78, 28],
              ].map(([x, y], idx) => (
                <g key={idx}>
                  <circle cx={x} cy={y} r="4.9" fill="rgba(255,107,53,0.14)" />
                  <circle cx={x} cy={y} r="2.3" fill="#ff6b35" opacity="0.92" />
                </g>
              ))}

              {/* Vehicle live dots */}
              <g>
                <circle cx="54" cy="56" r="6.2" fill="rgba(20,71,230,0.10)" />
                <circle cx="54" cy="56" r="2.7" fill="#101828" stroke="#fff" strokeWidth="1.3" />
              </g>

              {/* Start / End / Note */}
              <circle cx="10" cy="58" r="3.2" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
              <circle cx="90" cy="18" r="3.2" fill="#22c55e" stroke="#fff" strokeWidth="1.5" />
              <circle cx="44" cy="50" r="2.8" fill="#f59e0b" stroke="#fff" strokeWidth="1.3" />
            </svg>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-white/35 via-transparent to-transparent" />

          {/* Minimal map controls (purposeful, not noisy) */}
          <div className="pointer-events-none absolute inset-0">
            <div className="pointer-events-auto absolute right-3 top-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setZoom(staticZoom + 0.12)}
                disabled={!canZoomIn}
                className={[
                  "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(16,24,40,0.12)] bg-white/90 shadow-soft transition-opacity",
                  canZoomIn ? "opacity-100" : "opacity-50",
                ].join(" ")}
                aria-label="Zoom in"
              >
                <Plus size={18} className="text-[#101828]" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(staticZoom - 0.12)}
                disabled={!canZoomOut}
                className={[
                  "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(16,24,40,0.12)] bg-white/90 shadow-soft transition-opacity",
                  canZoomOut ? "opacity-100" : "opacity-50",
                ].join(" ")}
                aria-label="Zoom out"
              >
                <Minus size={18} className="text-[#101828]" aria-hidden="true" />
              </button>
              <div className="h-px w-full bg-[rgba(16,24,40,0.10)]" aria-hidden="true" />
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(16,24,40,0.12)] bg-white/90 shadow-soft"
                aria-label="Layers"
              >
                <Layers size={18} className="text-[#101828]" aria-hidden="true" />
              </button>
            </div>

            <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-[rgba(16,24,40,0.10)] bg-white/80 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-[#4a5565] shadow-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-[#101828]/35" aria-hidden="true" />
              RAIL VIEW
            </div>
          </div>
        </div>
      );
    }

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

function DesktopFrame({ prefersReducedMotion, className = "" }) {
  const [rightTab, setRightTab] = useState("annotations");

  const menu = useMemo(
    () => [
      { id: "routes", label: "Routes", Icon: RouteIcon, active: true },
      { id: "vehicles", label: "Vehicles", Icon: Truck },
      { id: "analytics", label: "Analytics", Icon: BarChart3, expandable: true },
      { id: "tasks", label: "Tasks", Icon: ListTodo },
      { id: "teams", label: "Teams", Icon: Users },
      { id: "qport-ai", label: "Qport.ai", Icon: Sparkles },
    ],
    []
  );

  const route = useMemo(
    () => ({
      program: "Wind Corridor Program",
      capacity: "320 MW",
      name: "Mission Impossible",
      status: "completed",
      note: "test note from web app",
      progress: 68,
      kpis: [
        ["Components moved", "142 / 210"],
        ["Routes published", "23"],
        ["Tasks open", "7"],
        ["Vehicles live", "12"],
      ],
      meta: [
        ["Route", "Mission Impossible"],
        ["Survey", "1 pass"],
        ["Segments", "3"],
        ["Exports", "Ready"],
      ],
    }),
    []
  );

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[2rem] border border-[rgba(16,24,40,0.10)] bg-white shadow-lift",
        className,
      ].join(" ")}
    >
      <div className="grid md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="flex flex-col border-b border-[rgba(16,24,40,0.10)] bg-[#f2f4f7] p-4 md:border-b-0 md:border-r">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#101828] text-white shadow-soft">
              <span className="font-display text-base font-semibold tracking-[-0.02em]">QP</span>
            </div>
            <div>
              <div className="font-display text-lg font-semibold tracking-[-0.02em] text-[var(--text)]">
                QPort
              </div>
              <div className="mt-0.5 font-mono text-[10px] tracking-[0.22em] text-[var(--muted)]">
                PRECISION IN MOTION
              </div>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {menu.map((it) => {
              const Icon = it.Icon;
              const activeItem = Boolean(it.active);
              const expandable = Boolean(it.expandable);

              return (
                <div key={it.id}>
                  <div
                    className={[
                      "flex items-center justify-between rounded-xl px-3 py-2",
                      activeItem
                        ? "bg-white text-[var(--text)] shadow-soft"
                        : "text-[#4a5565] hover:bg-white/70",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={[
                          "flex h-8 w-8 items-center justify-center rounded-lg border",
                          activeItem
                            ? "border-[rgba(16,24,40,0.10)] bg-[#fbfbfc]"
                            : "border-transparent bg-transparent",
                        ].join(" ")}
                        aria-hidden="true"
                      >
                        <Icon
                          size={16}
                          className={activeItem ? "text-[#101828]" : "text-[#667085]"}
                        />
                      </span>
                      <span className="text-sm font-semibold tracking-[-0.01em]">{it.label}</span>
                    </div>

                    {expandable && (
                      <ChevronDown size={16} className="text-[#667085]" aria-hidden="true" />
                    )}
                  </div>

                  {it.id === "analytics" && (
                    <div className="ml-11 mt-1 space-y-1">
                      {["Overview", "Routes Insights"].map((s) => (
                        <div
                          key={s}
                          className="rounded-lg px-3 py-2 text-sm text-[#667085] hover:bg-white/60"
                          aria-hidden="true"
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="mt-6 grow" aria-hidden="true" />

          <button
            type="button"
            className="mt-6 flex w-full items-center justify-between rounded-2xl border border-[rgba(16,24,40,0.10)] bg-white px-3 py-3 text-left shadow-soft"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#101828] text-white">
                <span className="font-mono text-xs tracking-[0.18em]">VK</span>
              </div>
              <div>
                <div className="text-sm font-semibold tracking-[-0.01em] text-[#101828]">
                  Vikrant Khedkar
                </div>
                <div className="mt-0.5 text-xs text-[#667085]">Admin</div>
              </div>
            </div>
            <ChevronDown size={18} className="text-[#667085]" aria-hidden="true" />
          </button>
        </aside>

        {/* Main */}
        <div className="bg-white">
          {/* Top route bar */}
          <div className="flex flex-col gap-3 border-b border-[rgba(16,24,40,0.10)] bg-white px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">
                  {route.program} · {route.capacity}
                </div>
                <div className="mt-1 text-base font-semibold tracking-[-0.02em] text-[#101828]">
                  {route.name}
                </div>
              </div>
              <span className="rounded-full bg-[#FEF0C7] px-3 py-1 text-xs font-semibold tracking-tight text-[#B54708]">
                {route.status}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0" aria-label="Route actions">
              <button
                type="button"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-[rgba(16,24,40,0.12)] bg-white px-3 py-2 text-sm font-semibold text-[#101828] shadow-soft"
              >
                <Pencil size={16} className="text-[#667085]" aria-hidden="true" />
                Edit
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-[rgba(16,24,40,0.12)] bg-white px-3 py-2 text-sm font-semibold text-[#101828] shadow-soft"
              >
                <Scissors size={16} className="text-[#667085]" aria-hidden="true" />
                Split
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-[rgba(16,24,40,0.12)] bg-white px-3 py-2 text-sm font-semibold text-[#101828] shadow-soft"
              >
                <GitMerge size={16} className="text-[#667085]" aria-hidden="true" />
                Merge
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-[rgba(16,24,40,0.12)] bg-white px-3 py-2 text-sm font-semibold text-[#101828] shadow-soft"
              >
                <Download size={16} className="text-[#667085]" aria-hidden="true" />
                Export
                <ChevronDown size={16} className="text-[#667085]" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#101828] px-4 py-2 text-sm font-semibold text-white shadow-soft"
              >
                Publish
              </button>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1fr_380px]">
            {/* Map */}
            <div className="p-4">
              <RouteMap
                embedded
                prefersReducedMotion={prefersReducedMotion}
                preferStaticInAuto
                heightClass="h-[420px] md:h-[700px]"
                roundedClass="rounded-2xl"
              />
            </div>

            {/* Right panel */}
            <div className="border-t border-[rgba(16,24,40,0.10)] bg-white p-4 lg:border-l lg:border-t-0">
              <div className="flex items-end justify-between border-b border-[rgba(16,24,40,0.10)] pb-3">
                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={() => setRightTab("annotations")}
                    className={[
                      "text-sm font-semibold tracking-tight transition-colors",
                      rightTab === "annotations"
                        ? "text-[#101828]"
                        : "text-[#667085] hover:text-[#101828]",
                    ].join(" ")}
                  >
                    Annotations <span className="ml-1 text-[#667085]">1</span>
                    {rightTab === "annotations" && (
                      <span
                        className="mt-2 block h-0.5 w-full rounded-full bg-[var(--brand-bright)]"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightTab("details")}
                    className={[
                      "text-sm font-semibold tracking-tight transition-colors",
                      rightTab === "details"
                        ? "text-[#101828]"
                        : "text-[#667085] hover:text-[#101828]",
                    ].join(" ")}
                  >
                    Details
                    {rightTab === "details" && (
                      <span
                        className="mt-2 block h-0.5 w-full rounded-full bg-[var(--brand-bright)]"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4">
                {rightTab === "annotations" ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[#fbfbfc] px-4 py-3">
                      <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">NOTE</div>
                      <div className="mt-2 rounded-xl border border-[rgba(16,24,40,0.10)] bg-white px-3 py-2 text-sm text-[#101828]">
                        {route.note}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-[#667085]">
                        <span>Type: clearance</span>
                        <span>Pin: 18.5784, 73.9039</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[rgba(16,24,40,0.10)] bg-white px-4 py-3">
                      <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">ATTACHED MEDIA</div>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {["Photo", "Video", "Voice"].map((t) => (
                          <div
                            key={t}
                            className="rounded-xl border border-[rgba(16,24,40,0.10)] bg-[#fbfbfc] px-3 py-3 text-center text-xs font-semibold text-[#101828]"
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[rgba(16,24,40,0.10)] bg-white px-4 py-4">
                    <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">ROUTE DETAILS</div>
                    <div className="mt-3 space-y-2">
                      {route.meta.map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-4">
                          <span className="text-xs text-[#667085]">{k}</span>
                          <span className="text-xs font-semibold text-[#101828]">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress stays visible in both tabs: command-center context without noise. */}
              <div className="mt-4 rounded-2xl border border-[rgba(16,24,40,0.10)] bg-white px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">PROGRESS</div>
                  <div className="text-xs font-semibold tracking-tight text-[#101828]">
                    {route.progress}%
                  </div>
                </div>

                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#f2f4f7]">
                  <div
                    className="h-full rounded-full bg-[var(--brand-bright)]"
                    style={{ width: `${route.progress}%` }}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {route.kpis.map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-[rgba(16,24,40,0.08)] bg-[#fbfbfc] px-3 py-2">
                      <div className="text-[11px] text-[#667085]" data-cursor="text">
                        {k}
                      </div>
                      <div className="mt-1 text-xs font-semibold tracking-tight text-[#101828]">
                        {v}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">
                      SIGNAL
                    </div>
                    <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">
                      LAST 14 DAYS
                    </div>
                  </div>
                  <div className="mt-2 overflow-hidden rounded-xl border border-[rgba(16,24,40,0.08)] bg-[#fbfbfc] px-3 py-3">
                    <svg viewBox="0 0 100 28" className="h-10 w-full" role="img" aria-label="Progress signal">
                      <path
                        d="M 2 22 C 12 20, 20 18, 28 19 S 44 22, 52 17 S 66 8, 78 9 S 92 8, 98 6"
                        fill="none"
                        stroke="rgba(20,71,230,0.18)"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 2 22 C 12 20, 20 18, 28 19 S 44 22, 52 17 S 66 8, 78 9 S 92 8, 98 6"
                        fill="none"
                        stroke="#1447e6"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      />
                      <circle cx="52" cy="17" r="3.2" fill="#ff6b35" opacity="0.95" />
                      <circle cx="98" cy="6" r="3.2" fill="#22c55e" opacity="0.95" />
                    </svg>
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


export function ProductScreens({ prefersReducedMotion = false }) {
  const sectionRef = useRef(null);

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
    }, el);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section id="product" ref={sectionRef} className="bg-[var(--bg)] py-16 md:py-24">
      <div className="mx-auto w-[min(1240px,100%)] px-6 md:px-16">
        <div
          className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
          data-screens-reveal
        >
          <div>
            <p className="font-mono text-xs tracking-[0.22em] text-[var(--muted)]">PRODUCT</p>
            <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] md:text-4xl">
              A route dashboard built for ODC.
            </h3>
          </div>
          <p
            className="max-w-[540px] text-sm leading-relaxed text-[var(--muted)] md:text-base"
            data-cursor="text"
          >
            Map-first editing with operational guardrails. Split, merge, export, and publish without losing field evidence.
          </p>
        </div>

        <div className="mt-10" data-screens-reveal>
          <DesktopFrame prefersReducedMotion={prefersReducedMotion} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3" data-screens-reveal>
          {[
            "Split + merge without re-survey",
            "Annotations stay attached to geometry",
            "Exports that match the field",
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
