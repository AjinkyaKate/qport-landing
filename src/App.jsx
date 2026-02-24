import { useEffect, useMemo, useRef, useState } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Route, Routes, useLocation } from "react-router-dom";
import { usePrefersReducedMotion } from "./lib/usePrefersReducedMotion";
import { CustomCursor } from "./components/CustomCursor";
import { Navbar } from "./components/Navbar";
import { Preloader } from "./components/Preloader";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { ModulePage } from "./pages/ModulePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { MODULE_PAGES } from "./lib/modulePages";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [introReady, setIntroReady] = useState(false);
  const lenisRef = useRef(null);
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isModuleRoute = useMemo(
    () => MODULE_PAGES.some((m) => m.path === location.pathname),
    [location.pathname]
  );

  const navLinks = useMemo(
    () =>
      isHome
        ? [
            { label: "Features", href: "#features" },
            { label: "Workflow", href: "#process" },
            { label: "Philosophy", href: "#philosophy" },
            { label: "FAQ", href: "#faq" },
          ]
        : isModuleRoute
          ? [
            { label: "Overview", href: "#overview" },
            { label: "Capabilities", href: "#capabilities" },
            { label: "Roadmap", href: "#roadmap" },
            { label: "FAQ", href: "#faq" },
          ]
          : [
            { label: "Features", href: "/#features" },
            { label: "Workflow", href: "/#process" },
            { label: "Philosophy", href: "/#philosophy" },
            { label: "FAQ", href: "/#faq" },
          ],
    [isHome, isModuleRoute]
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      // Keep it simple: no smooth scroll, no scroll-linked transforms.
      gsap.to(document.body, { opacity: 1, duration: 0 });
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;

    const tick = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // ScrollTrigger needs to be aware of Lenis timing.
    lenis.on("scroll", ScrollTrigger.update);

    // Let layout settle before measuring.
    const refresh = () => ScrollTrigger.refresh();
    const refreshTimer = window.setTimeout(refresh, 120);

    return () => {
      window.clearTimeout(refreshTimer);
      lenis.destroy();
      if (lenisRef.current === lenis) lenisRef.current = null;
      gsap.ticker.remove(tick);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    // Route transitions: scroll to hash target or top, then refresh ScrollTrigger.
    const { hash, pathname } = location;

    const run = () => {
      const offset = -96; // navbar + breathing room

      if (hash) {
        const el = document.querySelector(hash);
        if (el) {
          if (lenisRef.current) {
            lenisRef.current.scrollTo(el, { offset, immediate: false });
          } else {
            // Native fallback; respect reduced motion via browser setting.
            el.scrollIntoView({
              behavior: prefersReducedMotion ? "auto" : "smooth",
              block: "start",
            });
          }
        }
      } else {
        if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
        else window.scrollTo({ top: 0, left: 0 });
      }

      // Layout changes between routes can invalidate trigger positions.
      window.setTimeout(() => ScrollTrigger.refresh(), 120);
    };

    // Let the next route paint before attempting to scroll.
    const t = window.setTimeout(() => {
      requestAnimationFrame(() => requestAnimationFrame(run));
    }, pathname === "/" ? 0 : 10);

    return () => window.clearTimeout(t);
  }, [location, prefersReducedMotion]);

  return (
    <div className="min-h-screen">
      <CustomCursor />

      <Navbar
        brand="QPort"
        links={navLinks}
        cta={{ label: "Request a demo", href: "#demo" }}
      />

      {!introReady && (
        <Preloader
          brand="QPort"
          prefersReducedMotion={prefersReducedMotion}
          onDone={() => setIntroReady(true)}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={<HomePage introReady={introReady} prefersReducedMotion={prefersReducedMotion} />}
        />

        {MODULE_PAGES.map((m) => (
          <Route
            key={m.path}
            path={m.path}
            element={
              <ModulePage
                module={m}
                introReady={introReady}
                prefersReducedMotion={prefersReducedMotion}
              />
            }
          />
        ))}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Footer links={navLinks} />
    </div>
  );
}
