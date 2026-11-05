"use client";

import * as React from "react";

interface Particle {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

export function ParticleCloakCanvas({ className = "" }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles: Particle[] = [];

    const isTouchOnly = window.matchMedia("(hover: none)").matches;
    const pointer = {
      x: -9999,
      y: -9999,
      tx: -9999,
      ty: -9999,
      active: false,
    };

    function initGrid() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = w * dpr;
      canvas.height = h * dpr;

      const step = Math.max(9, Math.min(w, h) / 22);
      particles = [];

      for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
          particles.push({
            hx: x,
            hy: y,
            x: x + (Math.random() - 0.5) * 4,
            y: y + (Math.random() - 0.5) * 4,
            vx: 0,
            vy: 0,
            r: 1 + Math.random() * 1.6, // 1 to 2.6 px
          });
        }
      }
    }

    initGrid();
    window.addEventListener("resize", initGrid);

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
      if (!pointer.active && pointer.x === -9999) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
      pointer.active = true;
    };

    const onPointerLeave = () => {
      if (!isTouchOnly) {
        pointer.active = false;
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });

    let rafId = 0;

    function loop(now: number) {
      if (!ctx || !canvas) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Lissajous autonomous drift if pointer not active or on touch device
      if (!pointer.active || isTouchOnly) {
        const t = now * 0.001;
        const driftX = w * (0.5 + 0.3 * Math.sin(t * 0.7));
        const driftY = h * (0.5 + 0.25 * Math.sin(t * 1.1 + Math.PI / 4));
        pointer.tx = driftX;
        pointer.ty = driftY;
        if (pointer.x === -9999) {
          pointer.x = driftX;
          pointer.y = driftY;
        }
      }

      // Eased pointer: lerp at 0.16
      if (pointer.tx !== -9999) {
        pointer.x += (pointer.tx - pointer.x) * 0.16;
        pointer.y += (pointer.ty - pointer.y) * 0.16;
      }

      const px = pointer.x;
      const py = pointer.y;
      const R = 0.34 * Math.min(w, h);
      const R2 = R * R;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p) continue;

        // Distance from eased pointer
        const dx = p.x - px;
        const dy = p.y - py;
        const d2 = dx * dx + dy * dy;

        if (d2 < R2 && d2 > 0) {
          const d = Math.sqrt(d2);
          const f = Math.pow(1 - d / R, 2) * 3.4;
          const nx = dx / d;
          const ny = dy / d;
          // Push directly away from pointer along normal
          p.vx += nx * f;
          p.vy += ny * f;
        }

        // Always pull home
        p.vx += (p.hx - p.x) * 0.024;
        p.vy += (p.hy - p.y) * 0.024;

        // Damp
        p.vx *= 0.86;
        p.vy *= 0.86;

        // Integrate
        p.x += p.vx;
        p.y += p.vy;

        // Fade by displacement from home
        const dhx = p.x - p.hx;
        const dhy = p.y - p.hy;
        const distanceFromHome = Math.sqrt(dhx * dhx + dhy * dhy);
        const alpha = Math.max(0, 0.72 - distanceFromHome / 70);

        if (alpha > 0.015) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          // Elegant warm champagne/rose color matching the theme
          ctx.fillStyle = `rgba(215, 185, 160, ${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      ctx.restore();
      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", initGrid);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 size-full ${className}`}
    />
  );
}

export default ParticleCloakCanvas;

