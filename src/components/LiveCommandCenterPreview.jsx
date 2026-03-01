import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Check,
  Clock,
  LocateFixed,
  Minus,
  PhoneCall,
  Plus,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { loadMapboxGL } from "../lib/loadMapboxGL";

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

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function pointOnLine(coords, t) {
  if (!coords?.length) return [0, 0];
  if (coords.length === 1) return coords[0];
  const segs = coords.length - 1;
  const scaled = clamp01(t) * segs;
  const idx = Math.min(segs - 1, Math.max(0, Math.floor(scaled)));
  const local = scaled - idx;
  const a = coords[idx];
  const b = coords[idx + 1];
  return [lerp(a[0], b[0], local), lerp(a[1], b[1], local)];
}

function boundsFromCoords(coords) {
  if (!coords?.length) return null;
  let minLng = coords[0][0];
  let maxLng = coords[0][0];
  let minLat = coords[0][1];
  let maxLat = coords[0][1];
  coords.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

function statusColors() {
  return {
    planned: "#2E75B6",
    onTrack: "#27AE60",
    delayed: "#F39C12",
    deviated: "#E74C3C",
    stale: "#95A5A6",
  };
}

function formatKmH(speed) {
  const n = Math.max(0, Math.round(speed));
  return `${n} km/h`;
}

function MapboxFleetMap({
  prefersReducedMotion,
  vehicles,
  convoys,
  routes,
  tracksByConvoy,
  selectedConvoyId,
  selectedVehicleId,
  onSelectVehicle,
  fitAllSignal,
  fitConvoySignal,
  fitVehicleSignal,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const mapboxRef = useRef(null);
  const markersRef = useRef(new Map());
  const popupRef = useRef(null);

  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

  const colors = useMemo(() => statusColors(), []);

  const plannedFC = useMemo(() => {
    const features = convoys.map((c) => ({
      type: "Feature",
      properties: { convoyId: c.id, status: c.status },
      geometry: { type: "LineString", coordinates: routes[c.id] || [] },
    }));
    return { type: "FeatureCollection", features };
  }, [convoys, routes]);

  const selectedTrackFC = useMemo(() => {
    const coords = tracksByConvoy[selectedConvoyId] || [];
    return {
      type: "FeatureCollection",
      features: coords.length
        ? [
            {
              type: "Feature",
              properties: { convoyId: selectedConvoyId },
              geometry: { type: "LineString", coordinates: coords },
            },
          ]
        : [],
    };
  }, [tracksByConvoy, selectedConvoyId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!token) return;

    let alive = true;

    const boot = async () => {
      try {
        const mapboxgl = await loadMapboxGL();
        if (!alive) return;
        mapboxRef.current = mapboxgl;
        mapboxgl.accessToken = token;

        const map = new mapboxgl.Map({
          container: el,
          style: "mapbox://styles/mapbox/light-v11",
          center: [78.9629, 20.5937],
          zoom: 4.25,
          attributionControl: false,
        });

        mapRef.current = map;

        // Landing page: map should feel controlled, not like a full GIS tool.
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();

        map.on("load", () => {
          if (!alive) return;

          map.addSource("cc-planned", { type: "geojson", data: plannedFC });
          map.addSource("cc-track", { type: "geojson", data: selectedTrackFC });

          // Planned routes (fleet-wide, very subtle)
          map.addLayer({
            id: "cc-planned-faint",
            type: "line",
            source: "cc-planned",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": colors.planned,
              "line-width": 2.2,
              "line-opacity": [
                "case",
                ["==", ["get", "convoyId"], selectedConvoyId],
                0.55,
                0.18,
              ],
              "line-dasharray": [4, 6],
            },
          });

          // Actual track for selected convoy
          map.addLayer({
            id: "cc-track",
            type: "line",
            source: "cc-track",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": colors.onTrack,
              "line-width": 3.6,
              "line-opacity": 0.85,
            },
          });

          // Initial fit to fleet.
          const all = vehicles.map((v) => v.coord).filter(Boolean);
          const b = boundsFromCoords(all);
          if (b) {
            map.fitBounds(b, { padding: 110, duration: prefersReducedMotion ? 0 : 700 });
          }
        });
      } catch {
        // If Mapbox fails, parent will render static fallback.
      }
    };

    boot();

    return () => {
      alive = false;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [token]);

  // Keep route layers in sync (selected convoy + updated track)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.isStyleLoaded()) return;

    const planned = map.getSource("cc-planned");
    if (planned && planned.setData) planned.setData(plannedFC);

    const track = map.getSource("cc-track");
    if (track && track.setData) track.setData(selectedTrackFC);

    if (map.getLayer("cc-planned-faint")) {
      map.setPaintProperty("cc-planned-faint", "line-opacity", [
        "case",
        ["==", ["get", "convoyId"], selectedConvoyId],
        0.55,
        0.18,
      ]);
    }
  }, [plannedFC, selectedTrackFC, selectedConvoyId]);

  // Vehicle markers (HTML markers = smooth transitions)
  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxRef.current;
    if (!map || !mapboxgl) return;
    if (!map.isStyleLoaded()) return;

    const colors = statusColors();
    const markerMap = markersRef.current;

    const getColor = (status) => {
      if (status === "deviated") return colors.deviated;
      if (status === "delayed") return colors.delayed;
      if (status === "stale") return colors.stale;
      return colors.onTrack;
    };

    vehicles.forEach((v) => {
      const existing = markerMap.get(v.id);
      const color = getColor(v.status);
      if (!existing) {
        const el = document.createElement("button");
        el.type = "button";
        el.setAttribute("aria-label", `Vehicle ${v.label}`);
        el.style.width = v.type === "truck" ? "18px" : "14px";
        el.style.height = v.type === "truck" ? "18px" : "14px";
        el.style.borderRadius = "999px";
        el.style.border = "2px solid rgba(255,255,255,0.92)";
        el.style.background = color;
        el.style.boxShadow = "0 18px 32px -24px rgba(16,24,40,0.60)";
        el.style.transition = prefersReducedMotion ? "none" : "transform 1.8s linear";
        el.style.cursor = "pointer";

        el.addEventListener("click", (e) => {
          e.preventDefault();
          onSelectVehicle?.(v.id);
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat(v.coord)
          .addTo(map);

        markerMap.set(v.id, marker);
      } else {
        existing.getElement().style.background = color;
        existing.getElement().style.width = v.type === "truck" ? "18px" : "14px";
        existing.getElement().style.height = v.type === "truck" ? "18px" : "14px";
        existing.setLngLat(v.coord);
      }

      // Selection ring (minimal)
      const el = markerMap.get(v.id)?.getElement();
      if (el) {
        el.style.outline = v.id === selectedVehicleId ? "3px solid rgba(20,71,230,0.24)" : "none";
        el.style.outlineOffset = "3px";
      }
    });

    // Remove stale markers
    Array.from(markerMap.keys()).forEach((id) => {
      if (!vehicles.find((v) => v.id === id)) {
        markerMap.get(id)?.remove();
        markerMap.delete(id);
      }
    });
  }, [vehicles, selectedVehicleId, prefersReducedMotion, onSelectVehicle]);

  // Fit signals
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const all = vehicles.map((v) => v.coord).filter(Boolean);
    const b = boundsFromCoords(all);
    if (b) map.fitBounds(b, { padding: 110, duration: prefersReducedMotion ? 0 : 650 });
  }, [fitAllSignal]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const convoy = convoys.find((c) => c.id === selectedConvoyId);
    if (!convoy) return;
    const convoyVehicles = vehicles.filter((v) => v.convoyId === convoy.id).map((v) => v.coord);
    const b = boundsFromCoords(convoyVehicles);
    if (b) map.fitBounds(b, { padding: 120, duration: prefersReducedMotion ? 0 : 650 });
  }, [fitConvoySignal]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const v = vehicles.find((v) => v.id === selectedVehicleId);
    if (!v) return;
    map.easeTo({ center: v.coord, zoom: Math.max(map.getZoom(), 7.2), duration: prefersReducedMotion ? 0 : 650 });
  }, [fitVehicleSignal]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      aria-label="Fleet map"
      role="application"
    />
  );
}

function StaticFleetMap({
  prefersReducedMotion,
  basemapSrc,
  basemapReady,
  vehicles,
  plannedPaths,
  selectedVehicleId,
  onSelectVehicle,
  staticZoom,
}) {
  const colors = useMemo(() => statusColors(), []);
  const getColor = (status) => {
    if (status === "deviated") return colors.deviated;
    if (status === "delayed") return colors.delayed;
    if (status === "stale") return colors.stale;
    return colors.onTrack;
  };

  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${staticZoom})`,
          transformOrigin: "50% 50%",
          transition: prefersReducedMotion ? "none" : "transform 240ms ease-out",
        }}
      >
        {basemapReady ? (
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
              <pattern id="ccGridStatic" width="10" height="10" patternUnits="userSpaceOnUse">
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
            <rect x="0" y="0" width="100" height="70" fill="url(#ccGridStatic)" opacity="0.95" />
          </svg>
        )}

        {/* Planned routes (conceptual) */}
        <svg viewBox="0 0 100 70" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {plannedPaths.map((p) => (
            <path
              key={p.id}
              d={p.d}
              fill="none"
              stroke={colors.planned}
              strokeOpacity="0.22"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeDasharray="4 6"
            />
          ))}
        </svg>

        {/* Vehicles */}
        {vehicles.map((v) => {
          const size = v.type === "truck" ? 18 : 14;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelectVehicle?.(v.id)}
              className="absolute"
              style={{
                left: `${v.pos.x}%`,
                top: `${v.pos.y}%`,
                transform: "translate(-50%,-50%)",
              }}
              aria-label={`Vehicle ${v.label}`}
            >
              <span
                className={[
                  "inline-flex items-center justify-center rounded-full border-2 border-white/90 shadow-soft",
                  v.id === selectedVehicleId ? "ring-2 ring-[rgba(20,71,230,0.24)]" : "",
                ].join(" ")}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  background: getColor(v.status),
                  transition: prefersReducedMotion ? "none" : "transform 1.8s linear",
                }}
              />
            </button>
          );
        })}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-white/35 via-transparent to-transparent" />
    </div>
  );
}

export function LiveCommandCenterPreview({ prefersReducedMotion = false, className = "" }) {
  const basemapSrc = "/map-india-terrain.webp";
  const { ready: basemapReady, checked: basemapChecked } = useImageReady(basemapSrc);

  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
  const canUseMapbox = Boolean(token);

  const colors = useMemo(() => statusColors(), []);

  const convoys = useMemo(
    () => [
      { id: "XPL-MUM-DEL-003", status: "deviated", label: "XPL-MUM-DEL-003", next: "RJ Border", eta: "18:40" },
      { id: "WIND-PUN-SAT-012", status: "on-track", label: "WIND-PUN-SAT-012", next: "Bridge clearance", eta: "19:05" },
      { id: "TURB-GJ-VAD-007", status: "delayed", label: "TURB-GJ-VAD-007", next: "Toll plaza", eta: "20:10" },
      { id: "EPC-MP-IND-004", status: "on-track", label: "EPC-MP-IND-004", next: "Escort swap", eta: "19:30" },
      { id: "BLADE-KA-HUB-002", status: "stale", label: "BLADE-KA-HUB-002", next: "City limits", eta: "—" },
    ],
    []
  );

  const routes = useMemo(
    () => ({
      // Mumbai → Delhi-ish (conceptual corridor)
      "XPL-MUM-DEL-003": [
        [72.8777, 19.076],
        [73.2, 20.2],
        [74.2, 21.2],
        [74.6, 22.3],
        [75.2, 23.3],
        [75.8, 24.1],
        [76.5, 25.0],
        [77.2, 26.1],
        [77.1025, 28.7041],
      ],
      // Pune region
      "WIND-PUN-SAT-012": [
        [73.858, 18.5204],
        [73.89, 18.55],
        [73.9152, 18.5676],
        [73.9093, 18.5984],
      ],
      // Gujarat region
      "TURB-GJ-VAD-007": [
        [72.5714, 23.0225],
        [72.73, 22.9],
        [72.85, 22.6],
        [72.95, 22.3],
        [73.165, 22.3072],
      ],
      // MP region
      "EPC-MP-IND-004": [
        [75.8577, 22.7196],
        [76.1, 22.4],
        [76.3, 22.1],
        [76.6, 21.8],
        [77.1, 21.5],
      ],
      // Karnataka region
      "BLADE-KA-HUB-002": [
        [74.856, 15.3647],
        [75.05, 15.3],
        [75.2, 15.18],
        [75.35, 15.12],
      ],
    }),
    []
  );

  // Static-mode routes (conceptual positioning)
  const plannedPathsStatic = useMemo(
    () => [
      { id: "p1", d: "M 18 52 C 26 44, 36 40, 46 42 S 64 46, 78 40 S 90 30, 94 22" },
      { id: "p2", d: "M 52 62 C 56 58, 58 54, 60 50 S 64 44, 70 40" },
      { id: "p3", d: "M 22 28 C 28 32, 36 32, 46 30 S 64 26, 78 22" },
    ],
    []
  );

  const simRef = useRef(
    new Map([
      ["XPL-MUM-DEL-003", { t: 0.62, speed: 26, status: "deviated" }],
      ["WIND-PUN-SAT-012", { t: 0.74, speed: 34, status: "on-track" }],
      ["TURB-GJ-VAD-007", { t: 0.38, speed: 18, status: "delayed" }],
      ["EPC-MP-IND-004", { t: 0.51, speed: 31, status: "on-track" }],
      ["BLADE-KA-HUB-002", { t: 0.19, speed: 0, status: "stale" }],
    ])
  );

  const [simClock, setSimClock] = useState(() => Date.now());
  const [selectedConvoyId, setSelectedConvoyId] = useState("XPL-MUM-DEL-003");
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [muted, setMuted] = useState(true);

  const [staticZoom, setStaticZoom] = useState(1);
  const [fitAllSignal, setFitAllSignal] = useState(0);
  const [fitConvoySignal, setFitConvoySignal] = useState(0);
  const [fitVehicleSignal, setFitVehicleSignal] = useState(0);

  const [tracksByConvoy, setTracksByConvoy] = useState(() => {
    const init = {};
    simRef.current.forEach((v, convoyId) => {
      const coord = pointOnLine(routes[convoyId] || [], v.t);
      init[convoyId] = coord ? [coord] : [];
    });
    return init;
  });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const tickMs = 2000;
    const id = window.setInterval(() => {
      // Update each convoy once per "SSE" tick (PRD: ~2s updates).
      const m = simRef.current;
      m.forEach((v, convoyId) => {
        if (v.status === "stale") return;
        const baseDelta = v.speed >= 30 ? 0.018 : v.speed >= 20 ? 0.014 : 0.01;
        const jitter = (Math.random() - 0.5) * 0.004;
        v.t = (v.t + baseDelta + jitter) % 0.98;
        v.speed = Math.max(0, v.speed + (Math.random() - 0.5) * 4);
      });

      // Append tracks for trucks (kept short to stay readable).
      setTracksByConvoy((prev) => {
        const next = { ...prev };
        m.forEach((v, convoyId) => {
          const planned = routes[convoyId] || [];
          if (!planned.length) return;
          let coord = pointOnLine(planned, v.t);
          if (v.status === "deviated") coord = [coord[0] + 0.12, coord[1] + 0.06];
          const list = Array.isArray(next[convoyId]) ? [...next[convoyId]] : [];
          list.push(coord);
          next[convoyId] = list.slice(-26);
        });
        return next;
      });

      setSimClock(Date.now());
    }, tickMs);

    return () => window.clearInterval(id);
  }, [prefersReducedMotion, routes]);

  const vehicles = useMemo(() => {
    // Derived vehicle list from convoy simulation state.
    const v = [];
    const m = simRef.current;
    const offsets = {
      truck: 0,
      pilotAhead: 0.02,
      pilotTail: -0.02,
      crane: -0.04,
    };

    const staticPositions = {
      "XPL-MUM-DEL-003": { x: 78, y: 44 },
      "WIND-PUN-SAT-012": { x: 62, y: 56 },
      "TURB-GJ-VAD-007": { x: 26, y: 34 },
      "EPC-MP-IND-004": { x: 54, y: 38 },
      "BLADE-KA-HUB-002": { x: 58, y: 64 },
    };

    const makeStatic = (convoyId, dx, dy) => {
      const base = staticPositions[convoyId] || { x: 50, y: 50 };
      return { x: base.x + dx, y: base.y + dy };
    };

    const make = (convoyId, type, label, driverName, driverPhone, cargo, roleKey) => {
      const sim = m.get(convoyId);
      const planned = routes[convoyId] || [];
      const baseT = sim?.t ?? 0.2;
      const t = clamp01(baseT + offsets[roleKey] || 0);
      let coord = planned.length ? pointOnLine(planned, t) : [78.9629, 20.5937];
      if (sim?.status === "deviated") coord = [coord[0] + 0.12, coord[1] + 0.06];
      const speed = roleKey === "truck" ? sim?.speed ?? 0 : Math.max(0, (sim?.speed ?? 0) + 2);
      return {
        id: `${convoyId}-${type}-${label}`.replace(/\s+/g, ""),
        convoyId,
        type,
        label,
        driver: { name: driverName, phone: driverPhone },
        cargo,
        status: sim?.status ?? "on-track",
        speed,
        lastUpdate: sim?.status === "stale" ? "6m ago" : "12s ago",
        progress: Math.round((sim?.t ?? 0) * 100),
        coord,
        pos:
          type === "truck"
            ? makeStatic(convoyId, 0, 0)
            : type === "pilot"
            ? makeStatic(convoyId, roleKey === "pilotAhead" ? -2.6 : 2.6, roleKey === "pilotAhead" ? -1.2 : 1.2)
            : makeStatic(convoyId, 0.8, 2.2),
      };
    };

    v.push(
      make("XPL-MUM-DEL-003", "truck", "MH-14-ODC-7731", "S. Yadav", "+91 91XXXXXX07", "Nacelle · 14m · 74t", "truck"),
      make("XPL-MUM-DEL-003", "pilot", "PILOT-1", "K. Singh", "+91 93XXXXXX56", "Escort", "pilotAhead"),
      make("XPL-MUM-DEL-003", "pilot", "PILOT-2", "M. Joshi", "+91 90XXXXXX31", "Escort", "pilotTail"),

      make("WIND-PUN-SAT-012", "truck", "MH-12-ODC-2201", "V. Jadhav", "+91 88XXXXXX90", "Blade set · 64m · 52t", "truck"),
      make("WIND-PUN-SAT-012", "pilot", "PILOT", "P. More", "+91 86XXXXXX11", "Escort", "pilotAhead"),

      make("TURB-GJ-VAD-007", "truck", "GJ-04-KT-8812", "R. Patel", "+91 98XXXXXX12", "Tower section · 32m · 48t", "truck"),
      make("TURB-GJ-VAD-007", "pilot", "PILOT-1", "S. Khan", "+91 97XXXXXX44", "Escort", "pilotAhead"),
      make("TURB-GJ-VAD-007", "pilot", "PILOT-2", "A. Mehta", "+91 99XXXXXX18", "Escort", "pilotTail"),
      make("TURB-GJ-VAD-007", "crane", "CRANE", "J. Solanki", "+91 96XXXXXX63", "Support", "crane"),

      make("EPC-MP-IND-004", "truck", "MP-09-ODC-1140", "N. Verma", "+91 89XXXXXX20", "Tower set · 28m · 46t", "truck"),
      make("EPC-MP-IND-004", "pilot", "PILOT-1", "R. Sharma", "+91 87XXXXXX02", "Escort", "pilotAhead"),
      make("EPC-MP-IND-004", "pilot", "PILOT-2", "A. Das", "+91 85XXXXXX77", "Escort", "pilotTail"),

      make("BLADE-KA-HUB-002", "truck", "KA-05-ODC-9052", "S. Gowda", "+91 84XXXXXX63", "Blade set · 62m · 50t", "truck"),
      make("BLADE-KA-HUB-002", "pilot", "PILOT", "K. Rao", "+91 82XXXXXX09", "Escort", "pilotAhead")
    );

    return v;
  }, [routes, simClock]);

  useEffect(() => {
    // Pick a sensible default detail card.
    if (selectedVehicleId) return;
    const firstTruck = vehicles.find((v) => v.convoyId === selectedConvoyId && v.type === "truck");
    if (firstTruck) setSelectedVehicleId(firstTruck.id);
  }, [vehicles, selectedVehicleId, selectedConvoyId]);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId) || null,
    [vehicles, selectedVehicleId]
  );

  const alerts = useMemo(
    () => [
      {
        id: "A-9001",
        convoyId: "XPL-MUM-DEL-003",
        vehicleLabel: "MH-14-ODC-7731",
        severity: "critical",
        since: "43s",
        message: "Route deviation · 180m outside corridor.",
      },
      {
        id: "A-9002",
        convoyId: "BLADE-KA-HUB-002",
        vehicleLabel: "KA-05-ODC-9052",
        severity: "critical",
        since: "6m",
        message: "GPS stale · last ping 6 minutes ago.",
      },
      {
        id: "A-9003",
        convoyId: "TURB-GJ-VAD-007",
        vehicleLabel: "CRANE",
        severity: "warning",
        since: "18m",
        message: "Vehicle stopped · no movement for 18 minutes.",
      },
    ],
    []
  );

  const stats = useMemo(() => {
    const moving = vehicles.filter((v) => v.speed > 0).length;
    const openAlerts = alerts.length;
    const critical = alerts.filter((a) => a.severity === "critical").length;
    const warning = openAlerts - critical;
    return {
      activeConvoys: convoys.length,
      vehiclesMoving: moving,
      openAlerts,
      split: { critical, warning },
      avgDelayMin: 23,
      onTimeRate: 78,
    };
  }, [alerts, convoys.length, vehicles]);

  const panelMotion = prefersReducedMotion ? "transition-none" : "transition-[transform,opacity] duration-300 ease-out";

  const minZoom = 1;
  const maxZoom = 1.55;
  const canZoomIn = staticZoom < maxZoom - 0.001;
  const canZoomOut = staticZoom > minZoom + 0.001;
  const setZoom = (next) =>
    setStaticZoom(Math.max(minZoom, Math.min(maxZoom, Math.round(next * 100) / 100)));

  const mapViewport = (
    <div className="relative h-[520px] overflow-hidden rounded-[2rem] border border-[rgba(16,24,40,0.10)] bg-white md:h-[620px]">
      {canUseMapbox ? (
        <MapboxFleetMap
          prefersReducedMotion={prefersReducedMotion}
          vehicles={vehicles}
          convoys={convoys}
          routes={routes}
          tracksByConvoy={tracksByConvoy}
          selectedConvoyId={selectedConvoyId}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={(id) => {
            setSelectedVehicleId(id);
            setFitVehicleSignal((s) => s + 1);
          }}
          fitAllSignal={fitAllSignal}
          fitConvoySignal={fitConvoySignal}
          fitVehicleSignal={fitVehicleSignal}
        />
      ) : (
        <StaticFleetMap
          prefersReducedMotion={prefersReducedMotion}
          basemapSrc={basemapSrc}
          basemapReady={basemapChecked && basemapReady}
          vehicles={vehicles}
          plannedPaths={plannedPathsStatic}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={(id) => setSelectedVehicleId(id)}
          staticZoom={staticZoom}
        />
      )}

      {/* Minimal overlay controls */}
      <div className="pointer-events-none absolute inset-0">
        <div className="pointer-events-auto absolute right-3 top-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setFitAllSignal((s) => s + 1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-[rgba(16,24,40,0.12)] bg-white/90 px-3 py-2 text-sm font-semibold text-[#101828] shadow-soft backdrop-blur"
          >
            <LocateFixed size={16} className="text-[#667085]" aria-hidden="true" />
            Fit
          </button>

          {!canUseMapbox && (
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
          )}
        </div>

        <div className="pointer-events-auto absolute bottom-3 left-3 flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(16,24,40,0.12)] bg-white/90 px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-[#4a5565] shadow-soft backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#27AE60]" aria-hidden="true" />
            LIVE
          </div>
          <button
            type="button"
            onClick={() => setLeftOpen((s) => !s)}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(16,24,40,0.12)] bg-white/90 px-3 py-2 text-xs font-semibold text-[#101828] shadow-soft backdrop-blur"
          >
            Convoys
            <span className="rounded-full bg-[rgba(16,24,40,0.06)] px-2 py-0.5 text-xs font-semibold text-[#101828]">
              {convoys.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setRightOpen((s) => !s)}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(16,24,40,0.12)] bg-white/90 px-3 py-2 text-xs font-semibold text-[#101828] shadow-soft backdrop-blur"
          >
            Alerts
            <span className="rounded-full bg-[rgba(231,76,60,0.10)] px-2 py-0.5 text-xs font-semibold text-[#b42318]">
              {alerts.length}
            </span>
          </button>
        </div>
      </div>

      {/* Left convoy drawer */}
      <div
        className={[
          "absolute inset-y-3 left-3 w-[320px] max-w-[78%] rounded-[2rem] border border-[rgba(16,24,40,0.12)] bg-white/92 shadow-lift backdrop-blur",
          panelMotion,
          leftOpen ? "translate-x-0 opacity-100" : "-translate-x-[108%] opacity-0",
        ].join(" ")}
        aria-hidden={!leftOpen}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[rgba(16,24,40,0.10)] px-4 py-3">
          <div>
            <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">CONVOYS</div>
            <div className="mt-1 text-sm font-semibold tracking-[-0.01em] text-[#101828]">
              Active movements
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLeftOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(16,24,40,0.12)] bg-white shadow-soft"
            aria-label="Close convoys"
          >
            <X size={18} className="text-[#667085]" aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[520px] overflow-auto px-3 py-3 md:max-h-[560px]">
          <div className="space-y-2">
            {convoys.map((c) => {
              const active = c.id === selectedConvoyId;
              const dot =
                c.status === "deviated"
                  ? colors.deviated
                  : c.status === "delayed"
                  ? colors.delayed
                  : c.status === "stale"
                  ? colors.stale
                  : colors.onTrack;
              const progress = Math.round((simRef.current.get(c.id)?.t ?? 0.2) * 100);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedConvoyId(c.id);
                    setFitConvoySignal((s) => s + 1);
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
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: dot }} aria-hidden="true" />
                        <div className="text-sm font-semibold tracking-[-0.01em] text-[#101828]">
                          {c.label}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-[#667085]">
                        Next: <span className="font-semibold text-[#101828]">{c.next}</span> ·{" "}
                        <span className="font-mono text-[10px] tracking-[0.18em]">{c.eta}</span>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-[#101828]">{progress}%</div>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#f2f4f7]">
                    <div className="h-full rounded-full" style={{ width: `${progress}%`, background: dot }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right alerts drawer */}
      <div
        className={[
          "absolute inset-y-3 right-3 w-[340px] max-w-[82%] rounded-[2rem] border border-[rgba(16,24,40,0.12)] bg-white/92 shadow-lift backdrop-blur",
          panelMotion,
          rightOpen ? "translate-x-0 opacity-100" : "translate-x-[108%] opacity-0",
        ].join(" ")}
        aria-hidden={!rightOpen}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[rgba(16,24,40,0.10)] px-4 py-3">
          <div>
            <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">ALERTS</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="text-sm font-semibold tracking-[-0.01em] text-[#101828]">Unresolved</div>
              <span className="rounded-full bg-[rgba(231,76,60,0.12)] px-2 py-0.5 text-xs font-semibold text-[#b42318]">
                {alerts.length}
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
              onClick={() => setRightOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(16,24,40,0.12)] bg-white shadow-soft"
              aria-label="Close alerts"
            >
              <X size={18} className="text-[#667085]" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="max-h-[520px] overflow-auto px-3 py-3 md:max-h-[560px]">
          <div className="space-y-2">
            {alerts.map((a) => {
              const critical = a.severity === "critical";
              const iconColor = critical ? colors.deviated : colors.delayed;
              const bg = critical ? "rgba(231,76,60,0.10)" : "rgba(243,156,18,0.14)";
              return (
                <div
                  key={a.id}
                  className="rounded-2xl border border-[rgba(16,24,40,0.10)] bg-white px-4 py-4 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl" style={{ background: bg }}>
                        <AlertTriangle size={18} style={{ color: iconColor }} aria-hidden="true" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold tracking-[-0.01em] text-[#101828]">
                          {a.vehicleLabel}
                        </div>
                        <div className="mt-1 text-xs text-[#667085]">{a.message}</div>
                      </div>
                    </div>
                    <div className="font-mono text-[10px] tracking-[0.18em] text-[#667085]">{a.since}</div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-[#667085]">
                      Convoy: <span className="font-semibold text-[#101828]">{a.convoyId}</span>
                    </div>
                    <button
                      type="button"
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

            {alerts.length === 0 && (
              <div className="rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[#fbfbfc] px-4 py-5 text-center shadow-soft">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(39,174,96,0.12)]">
                  <Check size={22} className="text-[#27AE60]" aria-hidden="true" />
                </div>
                <div className="mt-3 text-sm font-semibold text-[#101828]">All clear</div>
                <div className="mt-1 text-xs text-[#667085]">No active alerts.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle detail (anchored bottom, minimal) */}
      {selectedVehicle && (
        <div className="absolute bottom-3 left-1/2 w-[min(560px,calc(100%-24px))] -translate-x-1/2 rounded-[2rem] border border-[rgba(16,24,40,0.12)] bg-white/92 px-4 py-4 shadow-lift backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold tracking-[-0.01em] text-[#101828]">
                  {selectedVehicle.label}
                </div>
                {selectedVehicle.status === "deviated" && (
                  <span className="rounded-full bg-[rgba(231,76,60,0.10)] px-2 py-1 text-[10px] font-semibold tracking-[0.18em] text-[#b42318]">
                    DEVIATED
                  </span>
                )}
                {selectedVehicle.status === "delayed" && (
                  <span className="rounded-full bg-[rgba(243,156,18,0.14)] px-2 py-1 text-[10px] font-semibold tracking-[0.18em] text-[#b54708]">
                    DELAYED
                  </span>
                )}
                {selectedVehicle.status === "stale" && (
                  <span className="rounded-full bg-[rgba(149,165,166,0.16)] px-2 py-1 text-[10px] font-semibold tracking-[0.18em] text-[#4a5565]">
                    STALE
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-[#667085]">{selectedVehicle.cargo}</div>
            </div>

            <a
              href={`tel:${selectedVehicle.driver.phone}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-[rgba(16,24,40,0.12)] bg-white px-4 py-2 text-sm font-semibold text-[#101828] shadow-soft hover:bg-[#fbfbfc]"
            >
              <PhoneCall size={16} className="text-[#667085]" aria-hidden="true" />
              Call
            </a>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-[rgba(16,24,40,0.08)] bg-[#fbfbfc] px-3 py-2">
              <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">SPEED</div>
              <div className="mt-1 text-xs font-semibold text-[#101828]">{formatKmH(selectedVehicle.speed)}</div>
            </div>
            <div className="rounded-2xl border border-[rgba(16,24,40,0.08)] bg-[#fbfbfc] px-3 py-2">
              <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">LAST GPS</div>
              <div className="mt-1 text-xs font-semibold text-[#101828]">{selectedVehicle.lastUpdate}</div>
            </div>
            <div className="rounded-2xl border border-[rgba(16,24,40,0.08)] bg-[#fbfbfc] px-3 py-2">
              <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">PROGRESS</div>
              <div className="mt-1 text-xs font-semibold text-[#101828]">{selectedVehicle.progress}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[2rem] border border-[rgba(16,24,40,0.10)] bg-white shadow-lift",
        className,
      ].join(" ")}
    >
      {/* Minimal app header */}
      <div className="flex items-center justify-between gap-4 border-b border-[rgba(16,24,40,0.10)] bg-white px-4 py-3">
        <div>
          <div className="text-sm font-semibold tracking-[-0.02em] text-[#101828]">Live Command Center</div>
          <div className="mt-0.5 font-mono text-[10px] tracking-[0.22em] text-[#667085]">
            FLEET MAP · ALERTS · HANDOVER NOTES
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-[rgba(16,24,40,0.10)] bg-white px-3 py-2 text-xs text-[#667085] shadow-soft md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#27AE60]" aria-hidden="true" />
          Connected
          <span className="text-[#98A2B3]" aria-hidden="true">
            ·
          </span>
          <Clock size={14} className="text-[#98A2B3]" aria-hidden="true" />
          <span>12s</span>
        </div>
      </div>

      {/* Stats bar (PRD: 5 KPI cards) */}
      <div className="border-b border-[rgba(16,24,40,0.10)] bg-white px-4 py-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["ACTIVE CONVOYS", stats.activeConvoys, "+2 vs yesterday"],
            ["VEHICLES MOVING", stats.vehiclesMoving, `of ${vehicles.length}`],
            ["OPEN ALERTS", stats.openAlerts, `${stats.split.critical} critical · ${stats.split.warning} warning`, true],
            ["AVG DELAY", `${stats.avgDelayMin}m`, "rolling 24h"],
            ["ON-TIME RATE", `${stats.onTimeRate}%`, "fleet health"],
          ].map(([label, value, sub, danger]) => (
            <div
              key={label}
              className="rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[#fbfbfc] px-4 py-3 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] tracking-[0.22em] text-[#667085]">{label}</div>
                {label === "OPEN ALERTS" && Number(stats.openAlerts) > 0 && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(231,76,60,0.10)] px-3 py-1 text-xs font-semibold text-[#b42318]">
                    <Bell size={14} aria-hidden="true" />
                    Attention
                  </span>
                )}
              </div>
              <div
                className={[
                  "mt-2 text-2xl font-semibold tracking-[-0.03em]",
                  danger && Number(stats.openAlerts) > 0 ? "text-[#b42318]" : "text-[#101828]",
                ].join(" ")}
              >
                {value}
              </div>
              <div className="mt-1 text-xs text-[#667085]">{sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">{mapViewport}</div>
    </div>
  );
}

