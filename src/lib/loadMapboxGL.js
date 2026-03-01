export function loadMapboxGL() {
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

