import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  ChevronDown,
  Check,
  Clock,
  Download,
  LocateFixed,
  Pencil,
  PhoneCall,
  Search,
  Scissors,
  GitMerge,
  ListTodo,
  Route as RouteIcon,
  Sparkles,
  Truck,
  Users,
  Volume2,
  VolumeX,
  Wifi,
  X,
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

function useImageReady(src) {
  const [ready, setReady] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let alive = true;
    setChecked(false);
    setReady(false);

    const img = new Image();
    img.onload = () => {
      if (!alive) return;
      setReady(true);
      setChecked(true);
    };
    img.onerror = () => {
      if (!alive) return;
      setReady(false);
      setChecked(true);
    };
    img.src = src;

    return () => {
      alive = false;
    };
  }, [src]);

  return { ready, checked };
}

function LiveCommandCenterFrame({ prefersReducedMotion, className = "" }) {
  const basemapSrc = "/map-india-terrain.webp";
  const { ready: basemapReady, checked: basemapChecked } = useImageReady(basemapSrc);

  const [staticZoom, setStaticZoom] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all"); // all | on-track | delayed | deviated | stale
  const [layers, setLayers] = useState(() => ({
    planned: true,
    actual: true,
    checkpoints: false, // P1
    geofences: false, // P1
  }));

  const [selectedConvoyId, setSelectedConvoyId] = useState("XPL-MUM-DEL-003");
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  const [muted, setMuted] = useState(false);
  const [alertFilter, setAlertFilter] = useState("all"); // all | deviation | stop | gps | checkpoint
  const [ack, setAck] = useState(null); // { alertId, note, action }

  const palette = useMemo(
    () => ({
      planned: "#2E75B6",
      onTrack: "#27AE60",
      delayed: "#F39C12",
      deviated: "#E74C3C",
      stale: "#95A5A6",
    }),
    []
  );

  const fleet = useMemo(
    () => ({
      convoys: [
        {
          id: "XPL-MUM-DEL-003",
          name: "XPL-MUM-DEL-003",
          status: "deviated",
          progress: 62,
          types: { truck: 1, pilot: 2, crane: 0 },
          lastUpdate: "12s ago",
          nextCheckpoint: { name: "State Border (RJ)", eta: "18:40" },
          vehicleIds: ["V-301", "V-302", "V-303"],
        },
        {
          id: "WIND-PUN-SAT-012",
          name: "WIND-PUN-SAT-012",
          status: "on-track",
          progress: 74,
          types: { truck: 1, pilot: 1, crane: 0 },
          lastUpdate: "28s ago",
          nextCheckpoint: { name: "Bridge Clearance", eta: "19:05" },
          vehicleIds: ["V-201", "V-202"],
        },
        {
          id: "TURB-GJ-VAD-007",
          name: "TURB-GJ-VAD-007",
          status: "delayed",
          progress: 38,
          types: { truck: 1, pilot: 2, crane: 1 },
          lastUpdate: "1m ago",
          nextCheckpoint: { name: "Toll Plaza", eta: "20:10" },
          vehicleIds: ["V-101", "V-102", "V-103", "V-104"],
        },
        {
          id: "EPC-MP-IND-004",
          name: "EPC-MP-IND-004",
          status: "on-track",
          progress: 51,
          types: { truck: 1, pilot: 2, crane: 0 },
          lastUpdate: "44s ago",
          nextCheckpoint: { name: "Escort Swap", eta: "19:30" },
          vehicleIds: ["V-401", "V-402", "V-403"],
        },
        {
          id: "BLADE-KA-HUB-002",
          name: "BLADE-KA-HUB-002",
          status: "stale",
          progress: 19,
          types: { truck: 1, pilot: 1, crane: 0 },
          lastUpdate: "6m ago",
          nextCheckpoint: { name: "City Limits", eta: "—" },
          vehicleIds: ["V-501", "V-502"],
        },
      ],
      vehicles: [
        // Gujarat corridor (delayed)
        {
          id: "V-101",
          convoyId: "TURB-GJ-VAD-007",
          label: "GJ-04-KT-8812",
          driver: { name: "R. Patel", phone: "+91 98XXXXXX12" },
          cargo: "Tower section · 32m · 48t",
          type: "truck",
          status: "delayed",
          speed: 18,
          lastUpdate: "1m ago",
          progress: 38,
          pos: { x: 18, y: 36 },
          heading: 32,
        },
        { id: "V-102", convoyId: "TURB-GJ-VAD-007", label: "PILOT-1", driver: { name: "S. Khan", phone: "+91 97XXXXXX44" }, cargo: "Escort", type: "pilot", status: "delayed", speed: 22, lastUpdate: "1m ago", progress: 38, pos: { x: 22, y: 34 }, heading: 22 },
        { id: "V-103", convoyId: "TURB-GJ-VAD-007", label: "PILOT-2", driver: { name: "A. Mehta", phone: "+91 99XXXXXX18" }, cargo: "Escort", type: "pilot", status: "delayed", speed: 21, lastUpdate: "1m ago", progress: 38, pos: { x: 15, y: 39 }, heading: 18 },
        { id: "V-104", convoyId: "TURB-GJ-VAD-007", label: "CRANE", driver: { name: "J. Solanki", phone: "+91 96XXXXXX63" }, cargo: "Support", type: "crane", status: "delayed", speed: 0, lastUpdate: "2m ago", progress: 38, pos: { x: 20, y: 40 }, heading: 0 },

        // Pune corridor (on-track)
        { id: "V-201", convoyId: "WIND-PUN-SAT-012", label: "MH-12-ODC-2201", driver: { name: "V. Jadhav", phone: "+91 88XXXXXX90" }, cargo: "Blade set · 64m · 52t", type: "truck", status: "on-track", speed: 34, lastUpdate: "28s ago", progress: 74, pos: { x: 56, y: 50 }, heading: 12 },
        { id: "V-202", convoyId: "WIND-PUN-SAT-012", label: "PILOT", driver: { name: "P. More", phone: "+91 86XXXXXX11" }, cargo: "Escort", type: "pilot", status: "on-track", speed: 36, lastUpdate: "28s ago", progress: 74, pos: { x: 52, y: 52 }, heading: 12 },

        // Mumbai → Delhi corridor (deviated)
        { id: "V-301", convoyId: "XPL-MUM-DEL-003", label: "MH-14-ODC-7731", driver: { name: "S. Yadav", phone: "+91 91XXXXXX07" }, cargo: "Nacelle · 14m · 74t", type: "truck", status: "deviated", speed: 26, lastUpdate: "12s ago", progress: 62, pos: { x: 74, y: 44 }, heading: 68 },
        { id: "V-302", convoyId: "XPL-MUM-DEL-003", label: "PILOT-1", driver: { name: "K. Singh", phone: "+91 93XXXXXX56" }, cargo: "Escort", type: "pilot", status: "deviated", speed: 28, lastUpdate: "12s ago", progress: 62, pos: { x: 70, y: 42 }, heading: 68 },
        { id: "V-303", convoyId: "XPL-MUM-DEL-003", label: "PILOT-2", driver: { name: "M. Joshi", phone: "+91 90XXXXXX31" }, cargo: "Escort", type: "pilot", status: "deviated", speed: 27, lastUpdate: "12s ago", progress: 62, pos: { x: 78, y: 46 }, heading: 68 },

        // MP corridor (on-track)
        { id: "V-401", convoyId: "EPC-MP-IND-004", label: "MP-09-ODC-1140", driver: { name: "N. Verma", phone: "+91 89XXXXXX20" }, cargo: "Tower set · 28m · 46t", type: "truck", status: "on-track", speed: 31, lastUpdate: "44s ago", progress: 51, pos: { x: 48, y: 30 }, heading: 18 },
        { id: "V-402", convoyId: "EPC-MP-IND-004", label: "PILOT-1", driver: { name: "R. Sharma", phone: "+91 87XXXXXX02" }, cargo: "Escort", type: "pilot", status: "on-track", speed: 33, lastUpdate: "44s ago", progress: 51, pos: { x: 44, y: 32 }, heading: 18 },
        { id: "V-403", convoyId: "EPC-MP-IND-004", label: "PILOT-2", driver: { name: "A. Das", phone: "+91 85XXXXXX77" }, cargo: "Escort", type: "pilot", status: "on-track", speed: 30, lastUpdate: "44s ago", progress: 51, pos: { x: 52, y: 28 }, heading: 18 },

        // Karnataka corridor (GPS stale)
        { id: "V-501", convoyId: "BLADE-KA-HUB-002", label: "KA-05-ODC-9052", driver: { name: "S. Gowda", phone: "+91 84XXXXXX63" }, cargo: "Blade set · 62m · 50t", type: "truck", status: "stale", speed: 0, lastUpdate: "6m ago", progress: 19, pos: { x: 54, y: 64 }, heading: 0 },
        { id: "V-502", convoyId: "BLADE-KA-HUB-002", label: "PILOT", driver: { name: "K. Rao", phone: "+91 82XXXXXX09" }, cargo: "Escort", type: "pilot", status: "stale", speed: 0, lastUpdate: "6m ago", progress: 19, pos: { x: 50, y: 66 }, heading: 0 },
      ],
      plannedPaths: [
        // West → North
        { id: "r-1", d: "M 14 40 C 20 36, 28 30, 36 26 S 52 22, 64 26 S 78 32, 86 30" },
        // Central
        { id: "r-2", d: "M 42 54 C 48 50, 54 44, 60 40 S 70 34, 82 34" },
        // Deviation example
        { id: "r-3", d: "M 36 34 C 44 32, 52 30, 60 32 S 72 38, 86 44" },
      ],
      actualPaths: [
        { id: "a-1", d: "M 14 40 C 20 36, 28 30, 36 26 S 52 22, 64 26" },
        { id: "a-2", d: "M 42 54 C 48 50, 54 44, 60 40" },
        { id: "a-3", d: "M 36 34 C 44 32, 52 30, 60 32 S 70 40, 78 48" },
      ],
      deviationPath: "M 60 32 S 70 40, 78 48",
    }),
    []
  );

  const [alerts, setAlerts] = useState(() => [
    {
      id: "A-9001",
      convoyId: "XPL-MUM-DEL-003",
      vehicleId: "V-301",
      type: "deviation",
      severity: "critical",
      since: "43s",
      message: "Route deviation detected · 180m outside corridor.",
      acknowledged: false,
    },
    {
      id: "A-9002",
      convoyId: "BLADE-KA-HUB-002",
      vehicleId: "V-501",
      type: "gps",
      severity: "critical",
      since: "6m",
      message: "GPS signal lost · last ping 6 minutes ago.",
      acknowledged: false,
    },
    {
      id: "A-9003",
      convoyId: "TURB-GJ-VAD-007",
      vehicleId: "V-104",
      type: "stop",
      severity: "warning",
      since: "18m",
      message: "Vehicle stopped · no movement for 18 minutes.",
      acknowledged: false,
    },
  ]);

  const vehiclesById = useMemo(() => {
    const m = new Map();
    fleet.vehicles.forEach((v) => m.set(v.id, v));
    return m;
  }, [fleet.vehicles]);

  const selectedConvoy = useMemo(
    () => fleet.convoys.find((c) => c.id === selectedConvoyId) || fleet.convoys[0],
    [fleet.convoys, selectedConvoyId]
  );

  const visibleVehicles = useMemo(() => {
    const byStatus = (v) => {
      if (statusFilter === "all") return true;
      return v.status === statusFilter;
    };

    // If a convoy is selected, bias visibility to that convoy while still keeping fleet context.
    const selectedSet = new Set(selectedConvoy?.vehicleIds || []);
    const list = fleet.vehicles.filter(byStatus);
    const primary = list.filter((v) => selectedSet.has(v.id));
    const secondary = list.filter((v) => !selectedSet.has(v.id)).slice(0, 9);
    return [...primary, ...secondary];
  }, [fleet.vehicles, selectedConvoy, statusFilter]);

  const activeAlerts = useMemo(() => {
    const byType = (a) => {
      if (alertFilter === "all") return true;
      return a.type === alertFilter;
    };
    return alerts.filter((a) => !a.acknowledged).filter(byType);
  }, [alerts, alertFilter]);

  const resolvedAlerts = useMemo(() => alerts.filter((a) => a.acknowledged).slice(0, 6), [alerts]);

  const stats = useMemo(() => {
    const vehiclesMoving = fleet.vehicles.filter((v) => v.speed > 0).length;
    const openAlerts = activeAlerts.length;
    const critical = activeAlerts.filter((a) => a.severity === "critical").length;
    const warning = openAlerts - critical;
    return {
      activeConvoys: fleet.convoys.length,
      vehiclesMoving,
      openAlerts,
      split: { critical, warning },
      avgDelayMin: 23,
      onTimeRate: 78,
    };
  }, [fleet.convoys.length, fleet.vehicles, activeAlerts]);

  useEffect(() => {
    // Keep a useful default selection.
    if (selectedVehicleId) return;
    const first = selectedConvoy?.vehicleIds?.[0];
    if (first) setSelectedVehicleId(first);
  }, [selectedVehicleId, selectedConvoy]);

  const selectedVehicle = selectedVehicleId ? vehiclesById.get(selectedVehicleId) : null;

  const statusBadge = (status) => {
    const map = {
      "on-track": { label: "ON-TRACK", color: palette.onTrack, bg: "rgba(39,174,96,0.12)" },
      delayed: { label: "DELAYED", color: palette.delayed, bg: "rgba(243,156,18,0.14)" },
      deviated: { label: "DEVIATED", color: palette.deviated, bg: "rgba(231,76,60,0.12)" },
      stale: { label: "STALE", color: palette.stale, bg: "rgba(149,165,166,0.14)" },
    };
    return map[status] || map["on-track"];
  };

  const minZoom = 1;
  const maxZoom = 1.55;
  const canZoomIn = staticZoom < maxZoom - 0.001;
  const canZoomOut = staticZoom > minZoom + 0.001;
  const setZoom = (next) => {
    const clamped = Math.max(minZoom, Math.min(maxZoom, Math.round(next * 100) / 100));
    setStaticZoom(clamped);
  };

  const toggleLayer = (k) =>
    setLayers((s) => ({
      ...s,
      [k]: !s[k],
    }));

  const acknowledgeAlert = (alertId) => {
    setAck({ alertId, note: "", action: "Contacted driver" });
  };

  const submitAck = () => {
    if (!ack) return;
    if (!ack.note.trim()) return;
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === ack.alertId
          ? { ...a, acknowledged: true, acknowledgedBy: "Ops", note: ack.note, action: ack.action }
          : a
      )
    );
    setAck(null);
  };

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[2rem] border border-[rgba(16,24,40,0.10)] bg-white shadow-lift",
        className,
      ].join(" ")}
    >
      {/* App navbar (minimal) */}
      <div className="flex items-center justify-between gap-4 border-b border-[rgba(16,24,40,0.10)] bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#101828] text-white shadow-soft">
            <span className="font-display text-sm font-semibold tracking-[-0.02em]">QP</span>
          </div>
          <div>
            <div className="text-sm font-semibold tracking-[-0.02em] text-[#101828]">Command Center</div>
            <div className="mt-0.5 font-mono text-[10px] tracking-[0.22em] text-[#667085]">
              LIVE FLEET VIEW
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-[rgba(16,24,40,0.10)] bg-white px-3 py-2 text-xs text-[#667085] shadow-soft md:flex">
            <Wifi size={16} className="text-[#27AE60]" aria-hidden="true" />
            Connected
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[rgba(16,24,40,0.12)] bg-white px-3 py-2 text-sm font-semibold text-[#101828] shadow-soft"
          >
            <Clock size={16} className="text-[#667085]" aria-hidden="true" />
            Shift summary
          </button>
        </div>
      </div>

      {/* Stats bar (72px spec) */}
      <div className="border-b border-[rgba(16,24,40,0.10)] bg-white px-4 py-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className="rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[#fbfbfc] px-4 py-3 text-left shadow-soft"
          >
            <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">ACTIVE CONVOYS</div>
            <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#101828]">
              {stats.activeConvoys}
            </div>
            <div className="mt-1 text-xs text-[#667085]">+2 vs yesterday</div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("on-track")}
            className="rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[#fbfbfc] px-4 py-3 text-left shadow-soft"
          >
            <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">VEHICLES MOVING</div>
            <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#101828]">
              {stats.vehiclesMoving}
            </div>
            <div className="mt-1 text-xs text-[#667085]">of {fleet.vehicles.length} tracked</div>
          </button>

          <button
            type="button"
            onClick={() => {
              // A marketing preview: "scroll" is represented as a subtle panel highlight.
              const el = document.getElementById("cc-alerts-panel");
              if (el) el.classList.add("ring-2", "ring-[rgba(231,76,60,0.22)]");
              window.setTimeout(() => el && el.classList.remove("ring-2", "ring-[rgba(231,76,60,0.22)]"), 750);
            }}
            className="rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[#fbfbfc] px-4 py-3 text-left shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">OPEN ALERTS</div>
              {stats.openAlerts > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(231,76,60,0.10)] px-3 py-1 text-xs font-semibold text-[#b42318]">
                  <Bell size={14} aria-hidden="true" />
                  Attention
                </span>
              )}
            </div>
            <div
              className={[
                "mt-2 text-2xl font-semibold tracking-[-0.03em]",
                stats.openAlerts > 0 ? "text-[#b42318]" : "text-[#101828]",
              ].join(" ")}
            >
              {stats.openAlerts}
            </div>
            <div className="mt-1 text-xs text-[#667085]">
              {stats.split.critical} critical · {stats.split.warning} warning
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("delayed")}
            className="rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[#fbfbfc] px-4 py-3 text-left shadow-soft"
          >
            <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">AVG DELAY</div>
            <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#101828]">
              {stats.avgDelayMin}m
            </div>
            <div className="mt-1 text-xs text-[#667085]">trend ↑ this week</div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("on-track")}
            className="rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[#fbfbfc] px-4 py-3 text-left shadow-soft"
          >
            <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">ON-TIME RATE</div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-2xl font-semibold tracking-[-0.03em] text-[#101828]">
                {stats.onTimeRate}%
              </div>
              <svg viewBox="0 0 44 44" className="h-10 w-10" aria-hidden="true">
                <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(16,24,40,0.10)" strokeWidth="5" />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke={palette.onTrack}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${(stats.onTimeRate / 100) * 113} 999`}
                  transform="rotate(-90 22 22)"
                />
              </svg>
            </div>
            <div className="mt-1 text-xs text-[#667085]">filters on-track</div>
          </button>
        </div>
      </div>

      {/* Main layout (PRD zones) */}
      <div className="grid lg:grid-cols-[48px_300px_1fr] xl:grid-cols-[48px_300px_1fr_360px]">
        {/* Left icon strip (matches app sidebar labels, icons-only at this breakpoint) */}
        <aside className="hidden border-r border-[rgba(16,24,40,0.10)] bg-[#f2f4f7] lg:block">
          <div className="flex h-full flex-col items-center gap-2 px-2 py-3">
            {[
              { id: "routes", label: "Routes", Icon: RouteIcon },
              { id: "vehicles", label: "Vehicles", Icon: Truck },
              { id: "analytics", label: "Analytics", Icon: BarChart3, active: true },
              { id: "tasks", label: "Tasks", Icon: ListTodo },
              { id: "teams", label: "Teams", Icon: Users },
              { id: "qportai", label: "Qport.ai", Icon: Sparkles },
            ].map((it) => {
              const Icon = it.Icon;
              const active = Boolean(it.active);
              return (
                <button
                  key={it.id}
                  type="button"
                  className={[
                    "group relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors",
                    active
                      ? "border-[rgba(16,24,40,0.12)] bg-white text-[#101828] shadow-soft"
                      : "border-transparent bg-transparent text-[#667085] hover:bg-white/70",
                  ].join(" ")}
                  aria-label={it.label}
                >
                  <Icon size={18} aria-hidden="true" />
                  {active && (
                    <span
                      className={[
                        "absolute -right-1.5 top-1.5 h-2 w-2 rounded-full",
                        activeAlerts.length > 0 ? "bg-[#E74C3C]" : "bg-[#27AE60]",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Convoy list panel */}
        <aside className="hidden border-r border-[rgba(16,24,40,0.10)] bg-white lg:block">
          <div className="flex items-center justify-between gap-3 border-b border-[rgba(16,24,40,0.10)] px-4 py-3">
            <div>
              <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">CONVOYS</div>
              <div className="mt-1 text-sm font-semibold tracking-[-0.01em] text-[#101828]">
                Active movements
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(16,24,40,0.12)] bg-white shadow-soft"
                aria-label="Search convoys"
              >
                <Search size={18} className="text-[#667085]" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(16,24,40,0.12)] bg-white shadow-soft"
                aria-label="Fit all"
              >
                <LocateFixed size={18} className="text-[#667085]" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="max-h-[560px] overflow-auto px-3 py-3">
            <div className="space-y-2">
              {fleet.convoys.map((c) => {
                const badge = statusBadge(c.status);
                const active = c.id === selectedConvoyId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedConvoyId(c.id);
                      const first = c.vehicleIds?.[0];
                      if (first) setSelectedVehicleId(first);
                    }}
                    className={[
                      "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
                      active
                        ? "border-[rgba(20,71,230,0.22)] bg-[rgba(20,71,230,0.04)]"
                        : "border-[rgba(16,24,40,0.10)] bg-white hover:bg-[#fbfbfc]",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold tracking-[-0.01em] text-[#101828]">
                          {c.name}
                        </div>
                        <div className="mt-1 text-xs text-[#667085]">
                          {c.types.truck} truck · {c.types.pilot} pilot{c.types.pilot === 1 ? "" : "s"}
                          {c.types.crane ? ` · ${c.types.crane} crane` : ""}
                        </div>
                      </div>
                      <span
                        className="rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em]"
                        style={{ background: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#f2f4f7]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${c.progress}%`, background: badge.color }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-[#667085]">
                      <span>
                        Next:{" "}
                        <span className="font-semibold text-[#101828]">{c.nextCheckpoint.name}</span>
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.18em]">{c.lastUpdate}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Fleet map */}
        <div className="bg-white p-4">
          <div className="rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[#f9fafb] p-3">
            <div className="relative h-[420px] overflow-hidden rounded-2xl border border-[rgba(16,24,40,0.08)] bg-white md:h-[560px]">
              {/* Scaled map content (for a minimal "zoom" control) */}
              <div
                className="absolute inset-0"
                style={{
                  transform: `scale(${staticZoom})`,
                  transformOrigin: "50% 50%",
                  transition: prefersReducedMotion ? "none" : "transform 240ms ease-out",
                }}
              >
                {basemapChecked && basemapReady ? (
                  <img
                    src={basemapSrc}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <svg viewBox="0 0 100 70" className="absolute inset-0 h-full w-full" aria-hidden="true">
                    <defs>
                      <pattern id="ccGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path
                          d="M 10 0 H 0 V 10"
                          fill="none"
                          stroke="#101828"
                          strokeOpacity="0.06"
                          strokeWidth="0.4"
                        />
                      </pattern>
                    </defs>
                    <rect x="0" y="0" width="100" height="70" fill="#ffffff" />
                    <rect x="0" y="0" width="100" height="70" fill="url(#ccGrid)" opacity="0.95" />
                  </svg>
                )}

                {/* Route layers */}
                <svg viewBox="0 0 100 70" className="absolute inset-0 h-full w-full" aria-hidden="true">
                  {layers.planned &&
                    fleet.plannedPaths.map((p) => (
                      <path
                        key={p.id}
                        d={p.d}
                        fill="none"
                        stroke={palette.planned}
                        strokeOpacity="0.55"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeDasharray="5 6"
                      />
                    ))}

                  {layers.actual &&
                    fleet.actualPaths.map((p) => (
                      <path
                        key={p.id}
                        d={p.d}
                        fill="none"
                        stroke={palette.onTrack}
                        strokeOpacity="0.72"
                        strokeWidth="3.4"
                        strokeLinecap="round"
                      />
                    ))}

                  {/* Deviation highlight */}
                  <path
                    d={fleet.deviationPath}
                    fill="none"
                    stroke={palette.deviated}
                    strokeOpacity={prefersReducedMotion ? 0.65 : 0.88}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Vehicle markers (absolute) */}
                {visibleVehicles.map((v) => {
                  const badge = statusBadge(v.status);
                  const active = v.id === selectedVehicleId;
                  const hasCriticalAlert = activeAlerts.some(
                    (a) => a.vehicleId === v.id && a.severity === "critical"
                  );
                  const left = `${v.pos.x}%`;
                  const top = `${(v.pos.y / 70) * 100}%`;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVehicleId(v.id)}
                      className="absolute"
                      style={{ left, top, transform: "translate(-50%, -50%)" }}
                      aria-label={`Vehicle ${v.label}`}
                    >
                      <span
                        className={[
                          "relative inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-soft",
                          active ? "ring-2 ring-[rgba(20,71,230,0.24)]" : "",
                        ].join(" ")}
                        style={{ borderColor: "rgba(16,24,40,0.12)" }}
                      >
                        {/* Status dot */}
                        <span
                          className="absolute inset-1 rounded-full"
                          style={{ background: badge.color, opacity: 0.92 }}
                          aria-hidden="true"
                        />

                        {/* Minimal heading arrow */}
                        <span
                          className="absolute -top-1 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[6px] border-b-[10px] border-x-transparent"
                          style={{
                            borderBottomColor: "rgba(255,255,255,0.92)",
                            transform: `translateX(-50%) rotate(${v.heading}deg)`,
                            transformOrigin: "50% 120%",
                            opacity: v.heading ? 0.95 : 0,
                          }}
                          aria-hidden="true"
                        />

                        {/* Critical pulse */}
                        {!prefersReducedMotion && hasCriticalAlert && (
                          <span
                            className="absolute -inset-3 rounded-full border border-[rgba(231,76,60,0.30)] animate-pulseSoft"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                    </button>
                  );
                })}

                {/* Vehicle detail popup (anchored to selected vehicle) */}
                {selectedVehicle && (
                  <div
                    className="absolute hidden max-w-[340px] -translate-x-1/2 -translate-y-[calc(100%+18px)] rounded-2xl border border-[rgba(16,24,40,0.12)] bg-white px-4 py-4 shadow-lift md:block"
                    style={{
                      left: `${selectedVehicle.pos.x}%`,
                      top: `${(selectedVehicle.pos.y / 70) * 100}%`,
                    }}
                    role="dialog"
                    aria-label="Vehicle detail"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold tracking-[-0.01em] text-[#101828]">
                          {selectedVehicle.label}
                        </div>
                        <div className="mt-1 text-xs text-[#667085]">{selectedVehicle.cargo}</div>
                      </div>
                      <span
                        className="rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em]"
                        style={(() => {
                          const b = statusBadge(selectedVehicle.status);
                          return { background: b.bg, color: b.color };
                        })()}
                      >
                        {statusBadge(selectedVehicle.status).label}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-[rgba(16,24,40,0.10)] bg-[#fbfbfc] px-3 py-2">
                        <div className="text-[11px] text-[#667085]">Driver</div>
                        <div className="mt-1 text-xs font-semibold text-[#101828]">
                          {selectedVehicle.driver.name}
                        </div>
                      </div>
                      <div className="rounded-xl border border-[rgba(16,24,40,0.10)] bg-[#fbfbfc] px-3 py-2">
                        <div className="text-[11px] text-[#667085]">Speed</div>
                        <div className="mt-1 text-xs font-semibold text-[#101828]">
                          {selectedVehicle.speed} km/h
                        </div>
                      </div>
                      <div className="rounded-xl border border-[rgba(16,24,40,0.10)] bg-[#fbfbfc] px-3 py-2">
                        <div className="text-[11px] text-[#667085]">Last update</div>
                        <div className="mt-1 text-xs font-semibold text-[#101828]">
                          {selectedVehicle.lastUpdate}
                        </div>
                      </div>
                      <div className="rounded-xl border border-[rgba(16,24,40,0.10)] bg-[#fbfbfc] px-3 py-2">
                        <div className="text-[11px] text-[#667085]">Progress</div>
                        <div className="mt-1 text-xs font-semibold text-[#101828]">
                          {selectedVehicle.progress}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#f2f4f7]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${selectedVehicle.progress}%`, background: "var(--brand-bright)" }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <a
                        href={`tel:${selectedVehicle.driver.phone}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-[rgba(16,24,40,0.12)] bg-white px-3 py-2 text-xs font-semibold text-[#101828] shadow-soft"
                      >
                        <PhoneCall size={14} className="text-[#667085]" aria-hidden="true" />
                        Call driver
                      </a>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#101828] px-3 py-2 text-xs font-semibold text-white shadow-soft"
                      >
                        Log incident
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />

              {/* Filter bar + search */}
              <div className="absolute left-3 top-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-2xl border border-[rgba(16,24,40,0.12)] bg-white/90 px-3 py-2 shadow-soft backdrop-blur">
                    <Search size={16} className="text-[#667085]" aria-hidden="true" />
                    <input
                      type="text"
                      placeholder="Search vehicle, driver, project"
                      className="w-[240px] bg-transparent text-sm text-[#101828] placeholder:text-[#98A2B3] outline-none"
                      aria-label="Search"
                    />
                  </div>

                  <button
                    type="button"
                    className="hidden items-center gap-2 rounded-2xl border border-[rgba(16,24,40,0.12)] bg-white/90 px-3 py-2 text-sm font-semibold text-[#101828] shadow-soft backdrop-blur md:inline-flex"
                  >
                    Project
                    <ChevronDown size={16} className="text-[#667085]" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="hidden items-center gap-2 rounded-2xl border border-[rgba(16,24,40,0.12)] bg-white/90 px-3 py-2 text-sm font-semibold text-[#101828] shadow-soft backdrop-blur md:inline-flex"
                  >
                    Client
                    <ChevronDown size={16} className="text-[#667085]" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    ["all", "All"],
                    ["on-track", "On-track"],
                    ["delayed", "Delayed"],
                    ["deviated", "Deviated"],
                    ["stale", "GPS stale"],
                  ].map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setStatusFilter(v)}
                      className={[
                        "rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] shadow-soft transition-colors",
                        statusFilter === v
                          ? "border-[rgba(20,71,230,0.28)] bg-white text-[#101828]"
                          : "border-[rgba(16,24,40,0.10)] bg-white/85 text-[#667085] hover:bg-white",
                      ].join(" ")}
                    >
                      {label.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map controls */}
              <div className="absolute right-3 top-3 flex flex-col gap-2">
                <div className="flex flex-col gap-2 rounded-2xl border border-[rgba(16,24,40,0.12)] bg-white/90 p-2 shadow-soft backdrop-blur">
                  <button
                    type="button"
                    onClick={() => toggleLayer("planned")}
                    className="inline-flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-[#101828] hover:bg-[#fbfbfc]"
                  >
                    Planned
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: layers.planned ? palette.planned : "rgba(16,24,40,0.18)" }}
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleLayer("actual")}
                    className="inline-flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-[#101828] hover:bg-[#fbfbfc]"
                  >
                    Actual
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: layers.actual ? palette.onTrack : "rgba(16,24,40,0.18)" }}
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleLayer("checkpoints")}
                    className="inline-flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-[#101828] hover:bg-[#fbfbfc]"
                  >
                    Checkpoints
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: layers.checkpoints ? "var(--brand-bright)" : "rgba(16,24,40,0.18)" }}
                      aria-hidden="true"
                    />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
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
                </div>
              </div>

              {/* Fit all */}
              <div className="absolute bottom-3 right-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVehicleId(null);
                    setSelectedConvoyId(fleet.convoys[0].id);
                    setStatusFilter("all");
                    setStaticZoom(1);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[rgba(16,24,40,0.12)] bg-white/90 px-3 py-2 text-sm font-semibold text-[#101828] shadow-soft backdrop-blur"
                >
                  <LocateFixed size={16} className="text-[#667085]" aria-hidden="true" />
                  Fit all
                </button>
              </div>

              {/* Connection state */}
              <div className="absolute left-3 bottom-3 inline-flex items-center gap-2 rounded-full border border-[rgba(16,24,40,0.12)] bg-white/90 px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-[#4a5565] shadow-soft backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#27AE60]" aria-hidden="true" />
                LIVE
              </div>
            </div>

            {/* Mobile detail (keeps story readable without hover/popups) */}
            {selectedVehicle && (
              <div className="mt-3 rounded-2xl border border-[rgba(16,24,40,0.10)] bg-white px-4 py-3 shadow-soft md:hidden">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold tracking-[-0.01em] text-[#101828]">
                      {selectedVehicle.label}
                    </div>
                    <div className="mt-1 text-xs text-[#667085]">{selectedVehicle.cargo}</div>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em]"
                    style={(() => {
                      const b = statusBadge(selectedVehicle.status);
                      return { background: b.bg, color: b.color };
                    })()}
                  >
                    {statusBadge(selectedVehicle.status).label}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-[#667085]">
                  <span>
                    Driver:{" "}
                    <span className="font-semibold text-[#101828]">{selectedVehicle.driver.name}</span>
                  </span>
                  <span>
                    Speed:{" "}
                    <span className="font-semibold text-[#101828]">{selectedVehicle.speed} km/h</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alerts panel */}
        <aside
          id="cc-alerts-panel"
          className="hidden border-l border-[rgba(16,24,40,0.10)] bg-white xl:block"
        >
          <div className="flex items-start justify-between gap-3 border-b border-[rgba(16,24,40,0.10)] px-4 py-3">
            <div>
              <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">ALERTS</div>
              <div className="mt-1 flex items-center gap-2">
                <div className="text-sm font-semibold tracking-[-0.01em] text-[#101828]">Unresolved</div>
                <span className="rounded-full bg-[rgba(231,76,60,0.12)] px-2 py-0.5 text-xs font-semibold text-[#b42318]">
                  {activeAlerts.length}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMuted((s) => !s)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(16,24,40,0.12)] bg-white shadow-soft"
                aria-label={muted ? "Unmute alerts" : "Mute alerts"}
              >
                {muted ? (
                  <VolumeX size={18} className="text-[#667085]" aria-hidden="true" />
                ) : (
                  <Volume2 size={18} className="text-[#667085]" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-[rgba(16,24,40,0.12)] bg-white px-3 py-2 text-sm font-semibold text-[#101828] shadow-soft"
              >
                {alertFilter === "all" ? "All" : alertFilter}
                <ChevronDown size={16} className="text-[#667085]" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="max-h-[640px] overflow-auto px-3 py-3">
            {activeAlerts.length === 0 ? (
              <div className="rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[#fbfbfc] px-4 py-5 text-center shadow-soft">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(39,174,96,0.12)]">
                  <Check size={22} className="text-[#27AE60]" aria-hidden="true" />
                </div>
                <div className="mt-3 text-sm font-semibold text-[#101828]">All clear</div>
                <div className="mt-1 text-xs text-[#667085]">No active alerts.</div>
              </div>
            ) : (
              <div className="space-y-2">
                {activeAlerts.map((a) => {
                  const critical = a.severity === "critical";
                  const iconColor = critical ? "#E74C3C" : "#F39C12";
                  const vehicle = vehiclesById.get(a.vehicleId);
                  return (
                    <div
                      key={a.id}
                      className="rounded-2xl border border-[rgba(16,24,40,0.10)] bg-white px-4 py-4 shadow-soft"
                    >
                      <button
                        type="button"
                        onClick={() => vehicle && setSelectedVehicleId(vehicle.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl"
                              style={{ background: critical ? "rgba(231,76,60,0.12)" : "rgba(243,156,18,0.14)" }}
                            >
                              <AlertTriangle size={18} style={{ color: iconColor }} aria-hidden="true" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold tracking-[-0.01em] text-[#101828]">
                                {vehicle ? vehicle.label : a.convoyId}
                              </div>
                              <div className="mt-1 text-xs text-[#667085]">
                                {a.message}
                              </div>
                            </div>
                          </div>
                          <div className="font-mono text-[10px] tracking-[0.18em] text-[#667085]">
                            {a.since}
                          </div>
                        </div>
                      </button>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-[#667085]">
                          Convoy: <span className="font-semibold text-[#101828]">{a.convoyId}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => acknowledgeAlert(a.id)}
                          className={[
                            "rounded-xl px-3 py-2 text-xs font-semibold shadow-soft transition-colors",
                            critical
                              ? "bg-[#101828] text-white hover:bg-[#0b1220]"
                              : "border border-[rgba(16,24,40,0.12)] bg-white text-[#101828] hover:bg-[#fbfbfc]",
                          ].join(" ")}
                        >
                          Acknowledge
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Resolved today (collapsible feel, minimal) */}
            {resolvedAlerts.length > 0 && (
              <div className="mt-4 rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[#fbfbfc] px-4 py-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">
                    RESOLVED TODAY
                  </div>
                  <span className="text-xs font-semibold text-[#101828]">{resolvedAlerts.length}</span>
                </div>
                <div className="mt-3 space-y-2">
                  {resolvedAlerts.map((a) => (
                    <div key={a.id} className="rounded-xl border border-[rgba(16,24,40,0.10)] bg-white px-3 py-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs font-semibold text-[#101828]">{a.type}</div>
                        <div className="font-mono text-[10px] tracking-[0.18em] text-[#667085]">
                          ACK
                        </div>
                      </div>
                      <div className="mt-1 truncate text-xs text-[#667085]">{a.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Acknowledge modal (required note per PRD) */}
      {ack && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0b1220]/35 p-4">
          <div className="w-full max-w-[520px] rounded-[2rem] border border-[rgba(16,24,40,0.12)] bg-white p-6 shadow-lift">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold tracking-[-0.01em] text-[#101828]">Acknowledge alert</div>
                <div className="mt-1 text-xs text-[#667085]">
                  A note is required so the next shift inherits context.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAck(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(16,24,40,0.12)] bg-white shadow-soft"
                aria-label="Close modal"
              >
                <X size={18} className="text-[#667085]" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-2">
                <span className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">ACTION</span>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl border border-[rgba(16,24,40,0.12)] bg-white px-4 py-3 text-left text-sm font-semibold text-[#101828] shadow-soft"
                >
                  {ack.action}
                  <ChevronDown size={16} className="text-[#667085]" aria-hidden="true" />
                </button>
              </label>

              <label className="grid gap-2">
                <span className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">NOTE</span>
                <textarea
                  value={ack.note}
                  onChange={(e) => setAck((s) => ({ ...s, note: e.target.value }))}
                  rows={4}
                  placeholder="Example: Driver confirmed fuel stop. Escort holding at checkpoint."
                  className="w-full rounded-2xl border border-[rgba(16,24,40,0.12)] bg-white px-4 py-3 text-sm text-[#101828] shadow-soft outline-none placeholder:text-[#98A2B3] focus:border-[rgba(20,71,230,0.35)]"
                />
                {!ack.note.trim() && (
                  <div className="text-xs text-[#b42318]">Note is required.</div>
                )}
              </label>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAck(null)}
                className="rounded-2xl border border-[rgba(16,24,40,0.12)] bg-white px-4 py-2.5 text-sm font-semibold text-[#101828] shadow-soft hover:bg-[#fbfbfc]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitAck}
                disabled={!ack.note.trim()}
                className={[
                  "rounded-2xl bg-[#101828] px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-opacity",
                  ack.note.trim() ? "opacity-100 hover:bg-[#0b1220]" : "opacity-60",
                ].join(" ")}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export function ProductScreens({ prefersReducedMotion = false }) {
  const sectionRef = useRef(null);
  const [view, setView] = useState("routes"); // routes | command-center

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
              Route editor. Live command center.
            </h3>
          </div>
          <p
            className="max-w-[540px] text-sm leading-relaxed text-[var(--muted)] md:text-base"
            data-cursor="text"
          >
            Curate corridors before dispatch. Then run movements from one screen: fleet map, alerts, and handover-ready context.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2" data-screens-reveal>
          {[
            { id: "routes", label: "Route Editor" },
            { id: "command-center", label: "Live Command Center" },
          ].map((t) => {
            const active = view === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setView(t.id)}
                className={[
                  "rounded-full border px-4 py-2 text-sm font-semibold tracking-[-0.01em] shadow-soft transition-colors",
                  active
                    ? "border-[rgba(20,71,230,0.28)] bg-white text-[var(--text)]"
                    : "border-[rgba(16,24,40,0.10)] bg-white/70 text-[var(--muted)] hover:bg-white",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6" data-screens-reveal>
          {view === "routes" ? (
            <DesktopFrame prefersReducedMotion={prefersReducedMotion} />
          ) : (
            <LiveCommandCenterFrame prefersReducedMotion={prefersReducedMotion} />
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3" data-screens-reveal>
          {(view === "routes"
            ? ["Split + merge without re-survey", "Annotations stay attached to geometry", "Exports that match the field"]
            : ["Fleet view for 5–30 convoys", "Deviation awareness in <60s", "Alerts acknowledged with notes"]
          ).map((t) => (
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
