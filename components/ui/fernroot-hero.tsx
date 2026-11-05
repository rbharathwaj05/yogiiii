"use client";

import * as React from "react";

export interface FernrootHeroProps {
  onExplore?: () => void;
  className?: string;
}

export function FernrootHero({ onExplore, className = "" }: FernrootHeroProps) {
  const heroRef = React.useRef<HTMLElement | null>(null);
  const stageRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    if (!hero || !stage) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touchOnly = window.matchMedia("(hover: none)").matches;

    /* ---- tunables ---- */
    const AXIS = (-16.6 * Math.PI) / 180; /* same angle the log is rotated by: parallax runs along the log */
    const AX = Math.cos(AXIS);
    const AY = Math.sin(AXIS);
    const PAR = 0.075; /* parallax travel each way, as a share of viewport width */
    const PAR_LERP = 0.07;
    const REV_LERP = 0.1; /* cursor reveal follow speed */
    const WIPE_MS = 2300;
    const SLIDE_MS = 3000; /* brush wipe / slide-in durations */
    const SLIDE = 0.11; /* how far the log slides in along its axis (share of width) */

    const BRUSH = "https://thinkingods.com/demos/fernroot-hero/assets/brush-wipe.webp";
    let maskOK = true;
    let W = 0;
    let H = 0;

    function measure() {
      if (!hero) return;
      W = hero.clientWidth;
      H = hero.clientHeight;
    }
    measure();
    window.addEventListener("resize", measure);

    const m = { x: -9999, y: -9999, tx: -9999, ty: -9999, seen: false };
    const par = { d: 0, target: 0 };
    const intro = { on: false, t0: 0, doneAt: 0 };
    const last: Record<string, string> = {};
    let rafId = 0;

    function setVar(k: string, v: string) {
      if (last[k] !== v && hero) {
        last[k] = v;
        hero.style.setProperty(k, v);
      }
    }
    function clamp(v: number, a: number, b: number) {
      return Math.max(a, Math.min(b, v));
    }
    function easeOut(t: number, p: number) {
      return 1 - Math.pow(1 - t, p);
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!m.seen && m.tx === -9999) {
        m.x = e.clientX;
        m.y = e.clientY;
      }
      m.seen = true;
      m.tx = e.clientX;
      m.ty = e.clientY;
      par.target = -clamp((e.clientX - W / 2) / (W / 2 || 1), -1, 1);

      // Proximity bloom: intensity rises when hovering/moving across the viewport
      const normX = e.clientX / (W || 1);
      const bloomL = clamp(0.35 + (1 - normX) * 0.55, 0.35, 0.95);
      const bloomR = clamp(0.35 + normX * 0.55, 0.35, 0.95);
      setVar("--side-bloom-left", bloomL.toFixed(3));
      setVar("--side-bloom-right", bloomR.toFixed(3));
    };

    const onPointerLeave = () => {
      setVar("--side-bloom-left", "0.3");
      setVar("--side-bloom-right", "0.3");
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });

    /* hover-less devices: a gentle self-playing sweep along the log until the first touch */
    function demo(now: number) {
      const s = Math.sin(now / 1500);
      const x = W * (0.5 + 0.3 * s);
      const y = H * 0.49 + (x - W * 0.4362) * Math.tan(AXIS);
      m.tx = x;
      m.ty = y;
      if (m.x === -9999) {
        m.x = x;
        m.y = y;
      }
      const normX = x / (W || 1);
      const bloomL = clamp(0.35 + (1 - normX) * 0.55, 0.35, 0.95);
      const bloomR = clamp(0.35 + normX * 0.55, 0.35, 0.95);
      setVar("--side-bloom-left", bloomL.toFixed(3));
      setVar("--side-bloom-right", bloomR.toFixed(3));
    }

    function frame(now: number) {
      let slide = 0;
      if (intro.on) {
        const t = now - intro.t0;
        const pw = easeOut(clamp(t / WIPE_MS, 0, 1), 1.75);
        const ps = easeOut(clamp(t / SLIDE_MS, 0, 1), 4);
        const ew = 0.818 * H;
        setVar("--ew", ew + "px");
        setVar("--ix", W - pw * (W + ew) + "px");
        slide = (1 - ps) * SLIDE * W;
        if (t >= Math.max(WIPE_MS, SLIDE_MS)) {
          intro.on = false;
          intro.doneAt = now;
          if (stage) stage.classList.add("done");
        }
      }

      if (touchOnly && !m.seen && !intro.on && intro.doneAt && now - intro.doneAt > 600) {
        demo(now);
      }

      /* cursor reveal */
      if (m.tx !== -9999) {
        m.x += (m.tx - m.x) * REV_LERP;
        m.y += (m.ty - m.y) * REV_LERP;
        setVar("--mx", m.x.toFixed(1) + "px");
        setVar("--my", m.y.toFixed(1) + "px");
      }

      /* diagonal parallax along the log's own axis */
      par.d += (par.target - par.d) * PAR_LERP;
      const dist = (reduce ? 0 : par.d * PAR * W) + slide;
      setVar("--tx", (dist * AX).toFixed(2) + "px");
      setVar("--ty", (dist * AY).toFixed(2) + "px");

      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (reduce || !maskOK) {
        if (stage) stage.classList.add("done");
        if (hero) hero.classList.add("is-in");
        rafId = requestAnimationFrame(frame);
        return;
      }
      if (hero) hero.classList.add("is-in");
      intro.on = true;
      intro.t0 = performance.now();
      rafId = requestAnimationFrame(frame);
    }

    // Preload image decoding
    const imgElements = hero.querySelectorAll("img");
    const pre: Promise<unknown>[] = Array.from(imgElements).map((img) =>
      img.decode ? img.decode().catch(() => {}) : Promise.resolve()
    );

    pre.push(
      fetch(BRUSH, { mode: "cors" })
        .then((r) => {
          if (!r.ok) throw 0;
        })
        .catch(() => {
          maskOK = false;
        })
    );

    Promise.all(pre)
      .then(() =>
        Promise.race([
          document.fonts ? document.fonts.ready : null,
          new Promise((r) => setTimeout(r, 900)),
        ])
      )
      .then(() => {
        rafId = requestAnimationFrame(start);
      });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div className={`relative w-full overflow-hidden bg-[#efefee] text-[#161616] ${className}`}>
      <style>{`
        .fernroot-hero {
          position: relative;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
          background: #efefee;
          container-type: size;
          touch-action: none;
          --log-w: max(163.45cqw, 118cqh);
          --log-x: 43.62cqw;
          --log-y: 49cqh;
          --log-rot: -16.6deg;
          --r: clamp(160px, 24cqw, 480px);
          --mx: -9999px;
          --my: -9999px;
          --tx: 0px;
          --ty: 0px;
          --ix: 110vw;
          --ew: 60vw;
          --side-bloom-left: 0.35;
          --side-bloom-right: 0.35;
          --out: cubic-bezier(.16, 1, .3, 1);
        }

        .fernroot-headline {
          position: absolute;
          top: 14%;
          left: 0;
          right: 0;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 20px;
          pointer-events: none;
        }

        .fernroot-headline h1 {
          line-height: .98;
          font-weight: 400;
          font-size: clamp(2.4rem, 24px + 3.2cqw, 6.5rem);
        }

        .fernroot-headline .l1 {
          display: block;
          font-family: 'Instrument Serif', Georgia, serif;
          font-style: italic;
          letter-spacing: -.025em;
        }

        .fernroot-headline .l2 {
          display: block;
          letter-spacing: -.07em;
          margin-top: .08em;
          font-size: 0.85em;
        }

        .fernroot-stage {
          position: absolute;
          inset: 0;
          z-index: 10;
          pointer-events: none;
          -webkit-mask-image: url(https://thinkingods.com/demos/fernroot-hero/assets/brush-wipe.webp), linear-gradient(#000,#000);
          mask-image: url(https://thinkingods.com/demos/fernroot-hero/assets/brush-wipe.webp), linear-gradient(#000,#000);
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-size: var(--ew) 100%, 300% 100%;
          mask-size: var(--ew) 100%, 300% 100%;
          -webkit-mask-position: var(--ix) 0, calc(var(--ix) + var(--ew) - 2px) 0;
          mask-position: var(--ix) 0, calc(var(--ix) + var(--ew) - 2px) 0;
        }

        .fernroot-stage.done {
          -webkit-mask-image: none;
          mask-image: none;
        }

        .fernroot-layer {
          position: absolute;
          inset: 0;
        }

        .fernroot-pose {
          position: absolute;
          left: var(--log-x);
          top: var(--log-y);
          width: var(--log-w);
          aspect-ratio: 2752 / 700;
          transform: translate3d(var(--tx), var(--ty), 0) translate(-50%, -50%) rotate(var(--log-rot));
          transform-origin: 50% 50%;
          will-change: transform;
        }

        .fernroot-pose img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          user-select: none;
          -webkit-user-drag: none;
        }

        /* The colored layer reveals at the cursor position AND blooms along the sides on hover */
        .fernroot-reveal {
          -webkit-mask-image:
            radial-gradient(circle var(--r) at var(--mx) var(--my), #000 0, #000 42%, rgba(0,0,0,.75) 65%, rgba(0,0,0,.25) 85%, transparent 100%),
            radial-gradient(ellipse 55% 75% at 0% 50%, rgba(0,0,0,var(--side-bloom-left)) 0%, rgba(0,0,0,calc(var(--side-bloom-left) * 0.45)) 48%, transparent 78%),
            radial-gradient(ellipse 55% 75% at 100% 50%, rgba(0,0,0,var(--side-bloom-right)) 0%, rgba(0,0,0,calc(var(--side-bloom-right) * 0.45)) 48%, transparent 78%);
          mask-image:
            radial-gradient(circle var(--r) at var(--mx) var(--my), #000 0, #000 42%, rgba(0,0,0,.75) 65%, rgba(0,0,0,.25) 85%, transparent 100%),
            radial-gradient(ellipse 55% 75% at 0% 50%, rgba(0,0,0,var(--side-bloom-left)) 0%, rgba(0,0,0,calc(var(--side-bloom-left) * 0.45)) 48%, transparent 78%),
            radial-gradient(ellipse 55% 75% at 100% 50%, rgba(0,0,0,var(--side-bloom-right)) 0%, rgba(0,0,0,calc(var(--side-bloom-right) * 0.45)) 48%, transparent 78%);
        }

        .fernroot-cta-block {
          position: absolute;
          z-index: 20;
          bottom: 2.5rem;
          right: 2rem;
          display: flex;
          align-items: center;
        }

        @media (min-width: 640px) {
          .fernroot-cta-block {
            bottom: 4rem;
            right: 4rem;
          }
        }

        .fernroot-cta {
          background: #3f7d4e;
          color: #fff;
          font-size: .875rem;
          font-weight: 500;
          padding: .75rem 1.75rem;
          border-radius: 999px;
          transition: transform .2s, background .2s, box-shadow .2s;
          cursor: pointer;
          border: none;
        }

        .fernroot-cta:hover {
          background: #336640;
          transform: scale(1.04);
          box-shadow: 0 10px 24px -10px rgba(63,125,78,.55);
        }

        .fernroot-cta:active {
          transform: scale(.96);
        }

        .fernroot-anim { opacity: 0; }
        .is-in .fernroot-anim {
          animation-fill-mode: forwards;
          animation-timing-function: cubic-bezier(.16, 1, .3, 1);
        }
        .is-in .fernroot-rv { animation-name: fernrootReveal; animation-duration: 1.1s; }
        .is-in .fernroot-fu { animation-name: fernrootFadeUp; animation-duration: 1s; }

        @keyframes fernrootReveal {
          0% { opacity: 0; transform: translateY(28px); filter: blur(12px); }
          to { opacity: 1; transform: none; filter: blur(0); }
        }

        @keyframes fernrootFadeUp {
          0% { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .fernroot-anim { opacity: 1; }
          .is-in .fernroot-anim { animation: none; }
        }
      `}</style>

      <section ref={heroRef} className="fernroot-hero">
        {/* Main Headline */}
        <div className="fernroot-headline">
          <h1>
            <span className="l1 fernroot-anim fernroot-rv" style={{ animationDelay: ".25s" }}>
              Even without Wi-Fi,
            </span>
            <span className="l2 fernroot-anim fernroot-rv" style={{ animationDelay: ".42s" }}>
              my heart stays connected to you
            </span>
          </h1>
        </div>

        {/* Ambient Side Light Blooms on Hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-2/5 transition-opacity duration-700 [background:radial-gradient(ellipse_75%_65%_at_0%_50%,rgba(63,125,78,0.22),rgba(235,190,120,0.1)_45%,transparent_75%)]"
          style={{ opacity: "var(--side-bloom-left, 0.35)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-2/5 transition-opacity duration-700 [background:radial-gradient(ellipse_75%_65%_at_100%_50%,rgba(63,125,78,0.22),rgba(235,190,120,0.1)_45%,transparent_75%)]"
          style={{ opacity: "var(--side-bloom-right, 0.35)" }}
        />

        {/* Interactive Log Stage */}
        <div ref={stageRef} className="fernroot-stage">
          <div className="fernroot-layer">
            <div className="fernroot-pose">
              <img
                src="https://thinkingods.com/demos/fernroot-hero/assets/base.webp"
                alt="Weathered fallen timber"
                decoding="async"
              />
            </div>
          </div>
          <div className="fernroot-layer fernroot-reveal">
            <div className="fernroot-pose">
              <img
                src="https://thinkingods.com/demos/fernroot-hero/assets/reveal.webp"
                alt=""
                decoding="async"
              />
            </div>
          </div>
        </div>

        {/* Explore Button */}
        <div className="fernroot-cta-block fernroot-anim fernroot-fu" style={{ animationDelay: ".85s" }}>
          <button
            type="button"
            onClick={onExplore}
            className="fernroot-cta"
          >
            Enter Gallery
          </button>
        </div>
      </section>
    </div>
  );
}

export default FernrootHero;
