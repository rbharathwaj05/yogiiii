"use client";

import * as React from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight, Sparkles, ChevronDown } from "lucide-react";
import { useImageZoom } from "@/components/ui/image-zoom-lightbox";

export interface FlickCardItem {
  id: string | number;
  title: string;
  image: string;
  subtitle?: string;
}

const DEFAULT_FLICK_CARDS: FlickCardItem[] = [
  { id: 1, title: "Pure Radiance", image: "/images/gallery/artwork-1.jpeg", subtitle: "Cherished Moments" },
  { id: 2, title: "Velvet Whispers", image: "/images/gallery/artwork-2.jpeg", subtitle: "Timeless Echo" },
  { id: 3, title: "Golden Horizon", image: "/images/gallery/artwork-3.jpeg", subtitle: "Serene Light" },
  { id: 4, title: "Timeless Grace", image: "/images/gallery/artwork-4.jpeg", subtitle: "Gentle Breeze" },
  { id: 5, title: "Seraphic Dream", image: "/images/gallery/artwork-5.jpeg", subtitle: "Unspoken Joy" },
  { id: 6, title: "Everlasting Spark", image: "/images/gallery/artwork-6.jpeg", subtitle: "Endless Warmth" },
];

export interface FlickCardsSliderProps {
  items?: FlickCardItem[];
  heading?: string;
  onSelectImage?: (image: string, title: string) => void;
  onScrollToRail?: () => void;
  className?: string;
}

export function FlickCardsSlider({
  items = DEFAULT_FLICK_CARDS,
  heading = "Yogii",
  onSelectImage,
  onScrollToRail,
  className = "",
}: FlickCardsSliderProps) {
  const { openZoom } = useImageZoom();
  const allImages = React.useMemo(() => items.map((it) => it.image), [items]);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const deckRef = React.useRef<HTMLDivElement | null>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const shadeRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const titleRefs = React.useRef<(HTMLHeadingElement | null)[]>([]);
  const btnRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const activeIdxRef = React.useRef(0);
  activeIdxRef.current = activeIdx;

  const isAnimatingRef = React.useRef(false);
  const autoplayTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const N = items.length;

  // Signed circular distance between index and front card
  const getDistance = React.useCallback((index: number, frontIndex: number) => {
    let diff = index - frontIndex;
    if (diff > N / 2) diff -= N;
    if (diff < -N / 2) diff += N;
    return diff;
  }, [N]);

  // Deck pose math
  const getCardPose = React.useCallback((d: number, cardWidth: number) => {
    const absD = Math.abs(d);
    const signD = Math.sign(d);

    if (absD > 3) {
      return { visible: false, x: 0, y: 0, z: -800, rotateY: 0, rotateZ: 0, scale: 0.5, zIndex: 0, shadeOpacity: 0.8 };
    }

    const x = signD * Math.pow(absD, 0.7) * cardWidth * 0.52;
    const y = absD * cardWidth * 0.015;
    const z = -absD * 150;
    const rotateY = -signD * Math.min(absD, 3) * 20;
    const rotateZ = signD * absD * 2.2;
    const scale = 1 - absD * 0.035;
    const zIndex = Math.round(20 - absD * 2);
    const shadeOpacity = d === 0 ? 0 : Math.min(0.18 + absD * 0.2, 0.8);

    return {
      visible: true,
      x,
      y,
      z,
      rotateY,
      rotateZ,
      scale,
      zIndex,
      shadeOpacity,
    };
  }, []);

  // Flick transition (dir: 1 = next, -1 = prev)
  const flick = React.useCallback((dir: number) => {
    if (isAnimatingRef.current) return;
    const deck = deckRef.current;
    if (!deck) return;

    isAnimatingRef.current = true;
    const cardW = deck.offsetWidth;
    const currentFront = activeIdxRef.current;
    const nextIdx = (currentFront + dir + N) % N;

    const frontCard = cardRefs.current[currentFront];

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActiveIdx(nextIdx);
      isAnimatingRef.current = false;
      return;
    }

    // Front card arcs out
    if (frontCard) {
      const arcX = -dir * cardW * 1.05;
      const arcZRot = -dir * 14;
      const arcYRot = dir * 30;

      gsap.to(frontCard, {
        x: arcX,
        y: -cardW * 0.06,
        rotateZ: arcZRot,
        rotateY: arcYRot,
        scale: 0.96,
        duration: 0.4,
        ease: "power3.out",
        onComplete: () => {
          setActiveIdx(nextIdx);
          const targetDist = getDistance(currentFront, nextIdx);
          const backPose = getCardPose(targetDist, cardW);

          gsap.set(frontCard, { zIndex: backPose.zIndex });
          gsap.to(frontCard, {
            x: backPose.x,
            y: backPose.y,
            z: backPose.z,
            rotateY: backPose.rotateY,
            rotateZ: backPose.rotateZ,
            scale: backPose.scale,
            duration: 0.66,
            ease: "expo.out",
          });

          const shade = shadeRefs.current[currentFront];
          if (shade) {
            gsap.to(shade, { opacity: backPose.shadeOpacity, duration: 0.5 });
          }
        },
      });
    }

    // All other cards tween to their new pose concurrently
    items.forEach((_, i) => {
      if (i === currentFront) return;
      const card = cardRefs.current[i];
      if (!card) return;

      const d = getDistance(i, nextIdx);
      const pose = getCardPose(d, cardW);
      const shade = shadeRefs.current[i];
      const title = titleRefs.current[i];
      const btn = btnRefs.current[i];

      if (!pose.visible) {
        gsap.to(card, { autoAlpha: 0, duration: 0.4 });
        return;
      }

      const isNewFront = d === 0;

      gsap.to(card, {
        x: pose.x,
        y: pose.y,
        z: pose.z,
        rotateY: pose.rotateY,
        rotateZ: pose.rotateZ,
        scale: pose.scale,
        zIndex: pose.zIndex,
        autoAlpha: 1,
        duration: 0.95,
        delay: Math.abs(d) * 0.03,
        ease: "expo.out",
      });

      if (shade) {
        gsap.to(shade, { opacity: pose.shadeOpacity, duration: 0.6 });
      }

      if (isNewFront) {
        if (title) {
          gsap.fromTo(title, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.1 });
        }
        if (btn) {
          gsap.fromTo(btn, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.25 });
        }
      } else {
        if (title) gsap.to(title, { autoAlpha: 0, duration: 0.2 });
        if (btn) gsap.to(btn, { autoAlpha: 0, duration: 0.2 });
      }
    });

    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 720);
  }, [items, N, getDistance, getCardPose]);

  // Autoplay management
  const startAutoplay = React.useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    autoplayTimerRef.current = setInterval(() => {
      flick(1);
    }, 3200);
  }, [flick]);

  const stopAutoplay = React.useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  // Initial Intro Animation
  React.useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    const cardW = deck.offsetWidth;

    // Intro stagger fly-up
    const sorted = items.map((_, i) => ({ i, dist: Math.abs(getDistance(i, 0)) }))
      .sort((a, b) => b.dist - a.dist);

    sorted.forEach(({ i }, idx) => {
      const card = cardRefs.current[i];
      if (!card) return;

      const d = getDistance(i, 0);
      const pose = getCardPose(d, cardW);
      const randomTilt = (Math.random() - 0.5) * 48; // ±24° tilt

      gsap.set(card, {
        y: window.innerHeight * 0.75,
        x: pose.x * 1.3,
        z: -600,
        rotateZ: randomTilt,
        rotateY: pose.rotateY * 1.4,
        scale: 0.75,
        autoAlpha: 0,
        zIndex: pose.zIndex,
      });

      gsap.to(card, {
        x: pose.x,
        y: pose.y,
        z: pose.z,
        rotateZ: pose.rotateZ,
        rotateY: pose.rotateY,
        scale: pose.scale,
        autoAlpha: pose.visible ? 1 : 0,
        duration: 1.4,
        delay: 0.15 + idx * 0.07,
        ease: "expo.out",
      });

      const shade = shadeRefs.current[i];
      if (shade) {
        gsap.to(shade, { opacity: pose.shadeOpacity, duration: 1, delay: 0.15 + idx * 0.07 });
      }

      if (d === 0) {
        const title = titleRefs.current[i];
        const btn = btnRefs.current[i];
        if (title) gsap.fromTo(title, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.7 });
        if (btn) gsap.fromTo(btn, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.9 });
      }
    });

    startAutoplay();
    return () => stopAutoplay();
  }, [items, getDistance, getCardPose, startAutoplay, stopAutoplay]);

  // Pointer drag logic on front card
  React.useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;

    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let lastTime = 0;
    let lastPosX = 0;
    let velocity = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (isAnimatingRef.current) return;
      const frontCard = cardRefs.current[activeIdxRef.current];
      if (!frontCard || (!frontCard.contains(e.target as Node) && e.target !== frontCard)) return;

      isDragging = true;
      startX = e.clientX;
      currentX = startX;
      lastPosX = startX;
      lastTime = performance.now();
      velocity = 0;

      deck.setPointerCapture(e.pointerId);
      stopAutoplay();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      currentX = e.clientX;
      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 8) {
        velocity = (currentX - lastPosX) / dt;
        lastPosX = currentX;
        lastTime = now;
      }

      const deltaX = currentX - startX;
      const cardW = deck.offsetWidth;
      const rotZ = (deltaX / cardW) * 12;
      const frontCard = cardRefs.current[activeIdxRef.current];

      if (frontCard) {
        gsap.set(frontCard, {
          x: deltaX,
          rotateZ: rotZ,
          rotateY: -(deltaX / cardW) * 15,
        });
      }
    };

    const onPointerEnd = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      try { deck.releasePointerCapture(e.pointerId); } catch (_) {}

      const deltaX = currentX - startX;
      const cardW = deck.offsetWidth;
      const movedPercent = Math.abs(deltaX) / cardW;
      const fastFlick = Math.abs(velocity) > 0.5;

      if (movedPercent > 0.22 || fastFlick) {
        const dir = deltaX < 0 || velocity < -0.5 ? 1 : -1;
        flick(dir);
      } else {
        const frontCard = cardRefs.current[activeIdxRef.current];
        if (frontCard) {
          gsap.to(frontCard, {
            x: 0,
            y: 0,
            rotateZ: 0,
            rotateY: 0,
            duration: 0.75,
            ease: "elastic.out(1, 0.6)",
          });
        }
      }

      startAutoplay();
    };

    deck.addEventListener("pointerdown", onPointerDown);
    deck.addEventListener("pointermove", onPointerMove);
    deck.addEventListener("pointerup", onPointerEnd);
    deck.addEventListener("pointercancel", onPointerEnd);

    return () => {
      deck.removeEventListener("pointerdown", onPointerDown);
      deck.removeEventListener("pointermove", onPointerMove);
      deck.removeEventListener("pointerup", onPointerEnd);
      deck.removeEventListener("pointercancel", onPointerEnd);
    };
  }, [flick, startAutoplay, stopAutoplay]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") flick(-1);
      else if (e.key === "ArrowRight") flick(1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [flick]);

  const activeCard = items[activeIdx];

  return (
    <div
      ref={containerRef}
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
      className={`relative w-full h-screen min-h-[680px] bg-[#050505] text-[#f5f5f5] overflow-hidden select-none flex flex-col items-center justify-center ${className}`}
    >
      {/* Heavily blurred 90px, 16% opacity ambient glow copy of active image */}
      <div className="pointer-events-none absolute inset-[-15%] w-[130%] h-[130%] z-0 filter blur-[90px] opacity-[0.16] transform scale-110 overflow-hidden">
        {items.map((item, idx) => (
          <img
            key={item.id}
            src={item.image}
            alt=""
            className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ease-out ${
              idx === activeIdx ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Header: Beautiful 'Yogii' in gorgeous font */}
      <div className="absolute top-[5vh] sm:top-[7vh] inset-x-0 z-30 flex flex-col items-center text-center pointer-events-none px-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-mono tracking-[0.25em] uppercase text-white/50 backdrop-blur-md mb-2">
          <Sparkles className="size-3 text-white/70" />
          <span>Flick to Browse</span>
        </div>
        <h1
          className="font-normal italic tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-100 to-white/50 drop-shadow-[0_4px_30px_rgba(255,255,255,0.15)] text-6xl sm:text-7xl md:text-8xl"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          {heading}
        </h1>
        <p className="mt-1 font-mono text-[11px] sm:text-xs tracking-[0.2em] uppercase text-white/45">
          Curated Memories & Works
        </p>
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={() => flick(-1)}
        aria-label="Previous card"
        className="absolute left-4 sm:left-10 z-40 p-3 sm:p-4 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 text-white backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl"
      >
        <ChevronLeft className="size-5 sm:size-6" />
      </button>

      <button
        type="button"
        onClick={() => flick(1)}
        aria-label="Next card"
        className="absolute right-4 sm:right-10 z-40 p-3 sm:p-4 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 text-white backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl"
      >
        <ChevronRight className="size-5 sm:size-6" />
      </button>

      {/* 3D Deck Stage */}
      <div
        className="relative z-10 w-full flex items-center justify-center"
        style={{ perspective: "1400px" }}
      >
        <div
          ref={deckRef}
          className="relative aspect-[3/4.1] w-[clamp(160px,min(30vw,50vh),380px)] [transform-style:preserve-3d]"
        >
          {items.map((item, idx) => {
            const isFront = idx === activeIdx;

            return (
              <div
                key={item.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                className="group absolute inset-0 rounded-[14px] overflow-hidden bg-[#111113] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.95)] cursor-grab active:cursor-grabbing will-change-transform touch-none"
              >
                {/* Photo */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="size-full object-cover select-none pointer-events-none"
                  loading="lazy"
                />

                {/* Black Shade Overlay */}
                <div
                  ref={(el) => {
                    shadeRefs.current[idx] = el;
                  }}
                  className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-500"
                  style={{ opacity: isFront ? 0 : 0.4 }}
                />

                {/* Clean photo card - NO text overlay blocking faces, click to zoom */}
                <div
                  onClick={(e) => {
                    if (isFront) {
                      e.stopPropagation();
                      openZoom(item.image, item.title, allImages);
                      if (onSelectImage) onSelectImage(item.image, item.title);
                    }
                  }}
                  className={`absolute inset-0 z-10 transition-colors ${
                    isFront ? "cursor-zoom-in hover:ring-2 hover:ring-white/40" : "pointer-events-none"
                  }`}
                  title={isFront ? "Click to zoom" : undefined}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-[8vh] inset-x-0 z-30 flex justify-center items-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              const dir = (i - activeIdx + N) % N <= N / 2 ? 1 : -1;
              if (i !== activeIdx) flick(dir);
            }}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-400 ${
              i === activeIdx
                ? "w-7 h-1.5 bg-white"
                : "w-1.5 h-1.5 bg-white/25 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Scroll Down Cue to Picture Rail Section */}
      <button
        type="button"
        onClick={onScrollToRail}
        className="absolute bottom-3 z-30 flex items-center gap-1.5 text-[11px] font-mono text-white/40 hover:text-white/80 transition-colors uppercase tracking-[0.2em] group"
      >
        <span>Scroll to Wall Gallery</span>
        <ChevronDown className="size-3.5 animate-bounce group-hover:translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
}

export default FlickCardsSlider;

