import { useEffect, useRef } from "react";
import * as THREE from "three";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const lerp = (a, b, t) => a + (b - a) * t;

function hexToRgb01(hex) {
  const c = hex.replace("#", "");
  const bigint = parseInt(c, 16);
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255,
  };
}

export function HeroThree({ prefersReducedMotion, onError }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer;
    let animationActive = true;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
      camera.position.set(0, 0.1, 6.2);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setClearColor(0x000000, 0);

      const mediaMobile = window.matchMedia("(max-width: 768px)");
      const setSize = () => {
        const { width, height } = host.getBoundingClientRect();
        const dpr = mediaMobile.matches ? 1 : clamp(window.devicePixelRatio || 1, 1, 1.6);
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      host.appendChild(renderer.domElement);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";

      const group = new THREE.Group();
      scene.add(group);

      const count = 3200;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      const blue = hexToRgb01("#1447e6");
      const orange = hexToRgb01("#ff6b35");

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // A corridor-like volume: wide in X, shallow in Y, deeper in Z.
        const x = (Math.random() - 0.5) * 10.0;
        const y = (Math.random() - 0.5) * 3.2;
        const z = (Math.random() - 0.5) * 10.0;

        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;

        const t = clamp((x + 5) / 10, 0, 1);
        colors[i3] = lerp(blue.r, orange.r, t * 0.35);
        colors[i3 + 1] = lerp(blue.g, orange.g, t * 0.35);
        colors[i3 + 2] = lerp(blue.b, orange.b, t * 0.35);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const points = new THREE.Points(geometry, material);
      group.add(points);

      const mouse = { x: 0, y: 0 };
      const target = { rx: 0, ry: 0 };

      const onMove = (e) => {
        const rect = host.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

        const maxTilt = (8 * Math.PI) / 180;
        target.ry = clamp(mouse.x * maxTilt, -maxTilt, maxTilt);
        target.rx = clamp(-mouse.y * maxTilt, -maxTilt, maxTilt);
      };

      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("resize", setSize);
      mediaMobile.addEventListener("change", setSize);
      setSize();

      if (prefersReducedMotion) {
        renderer.render(scene, camera);
      } else {
        renderer.setAnimationLoop(() => {
          if (!animationActive) return;

          group.rotation.x = lerp(group.rotation.x, target.rx, 0.06);
          group.rotation.y = lerp(group.rotation.y, target.ry, 0.06);

          // Slow drift: the motion should feel measured, not playful.
          group.rotation.z += 0.0008;
          points.rotation.y += 0.00055;

          renderer.render(scene, camera);
        });
      }

      return () => {
        animationActive = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("resize", setSize);
        mediaMobile.removeEventListener("change", setSize);

        renderer.setAnimationLoop(null);
        geometry.dispose();
        material.dispose();
        renderer.dispose();

        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      };
    } catch (e) {
      onError?.(e);
      if (renderer) {
        try {
          renderer.dispose();
        } catch {
          // ignore
        }
      }
    }
  }, [onError, prefersReducedMotion]);

  return <div ref={hostRef} className="absolute inset-0 opacity-0" data-hero-canvas />;
}

