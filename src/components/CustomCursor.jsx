import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const lerp = (a, b, t) => a + (b - a) * t;

export function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const rafRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const ringPosRef = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState("default"); // default | button | text

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    const update = () => setEnabled(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e) => {
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }

      const target = e.target;
      const isButton = !!target?.closest?.(
        "button, a, [role='button'], [data-cursor='button']"
      );
      if (isButton) {
        setMode("button");
        return;
      }

      const isText = !!target?.closest?.(
        "[data-cursor='text'], p, span, li, h1, h2, h3, blockquote"
      );
      setMode(isText ? "text" : "default");
    };

    const onDown = () => {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, { scale: 0.6, duration: 0.08, ease: "power2.out" });
    };

    const onUp = () => {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, { scale: 1, duration: 0.18, ease: "power2.out" });
    };

    const loop = () => {
      const { x, y } = pointerRef.current;
      ringPosRef.current.x = lerp(ringPosRef.current.x, x, 0.12);
      ringPosRef.current.y = lerp(ringPosRef.current.y, y, 0.12);

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPosRef.current.x}px, ${ringPosRef.current.y}px) translate(-50%, -50%)`;
      }

      rafRef.current = window.requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    rafRef.current = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  const ringClass =
    mode === "button"
      ? "h-[60px] w-[60px] mix-blend-exclusion"
      : mode === "text"
        ? "h-[4px] w-[56px]"
        : "h-[32px] w-[32px]";

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-2 w-2 rounded-full bg-[var(--brand-bright)]"
      />
      <div
        ref={ringRef}
        className={[
          "pointer-events-none fixed left-0 top-0 z-[9998] rounded-full border border-[rgba(20,71,230,0.35)] bg-[rgba(20,71,230,0.06)] backdrop-blur-sm transition-[width,height,background-color,border-color] duration-200 ease-out",
          ringClass,
        ].join(" ")}
        style={{
          borderRadius: mode === "text" ? 9999 : undefined,
        }}
      />
    </>
  );
}
