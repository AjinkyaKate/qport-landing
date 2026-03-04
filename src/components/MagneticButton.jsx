import { forwardRef, useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

export const MagneticButton = forwardRef(function MagneticButton(
  {
    href,
    onClick,
    className = "",
    children,
    prefersReducedMotion = false,
    type = "button",
    ...rest
  },
  ref
) {
  const innerRef = useRef(null);
  const elRef = ref || innerRef;

  const Tag = useMemo(() => (href ? "a" : "button"), [href]);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (prefersReducedMotion) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * 0.25, y: y * 0.25, duration: 0.4, ease: "power2.out" });
    };

    const onLeave = () => {
      // Clean & Precise: no bounce. Return to rest with a quiet ease.
      gsap.to(el, { x: 0, y: 0, duration: 0.55, ease: "power2.out" });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [elRef, prefersReducedMotion]);

  const sharedProps = {
    ref: elRef,
    onClick,
    className,
    "data-cursor": "button",
    ...rest,
  };

  if (href) {
    return (
      <a href={href} {...sharedProps}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} {...sharedProps}>
      {children}
    </button>
  );
});
