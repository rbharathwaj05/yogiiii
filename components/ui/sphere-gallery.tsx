"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, Move3d } from "lucide-react";
import ParticleCloakCanvas from "@/components/ui/particle-cloak-canvas";
import { useImageZoom } from "@/components/ui/image-zoom-lightbox";

export interface SphereGalleryItem {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  year?: string;
  category?: string;
}

export interface SphereGalleryCaption {
  title: string;
  description: string;
  tag?: string;
}

export interface SphereGalleryProps extends React.ComponentProps<"section"> {
  items: SphereGalleryItem[];
  captions?: SphereGalleryCaption[];
  eyebrow?: string;
  heading?: string;
  rotations?: number;
  radius?: number;
  cardWidth?: number;
  cardHeight?: number;
  perspective?: number;
  heightMultiplier?: number;
}

const DEFAULT_CAPTIONS: SphereGalleryCaption[] = [
  {
    tag: "Phase 01 · Inception",
    title: "Even Distribution in 3D Space",
    description: "Fibonacci point distribution maps every photo onto the surface of an invisible sphere without clustering at the poles.",
  },
  {
    tag: "Phase 02 · Tangent Alignment",
    title: "Surface Normals & Radial Facing",
    description: "Trigonometric atan2 and asin calculations ensure each card always points directly outward from the sphere's geometric center.",
  },
  {
    tag: "Phase 03 · Single rAF Loop",
    title: "Scroll-Driven Angular Velocity",
    description: "The entire sphere orbits through a single CSS transform write per frame, keeping GPU compositing decoupled from layout calculations.",
  },
  {
    tag: "Phase 04 · Moving Focus Window",
    title: "Continuous Focal Highlighting",
    description: "As the sphere revolves, the cards facing forward enter a focal window, brightening into full saturation and scale.",
  },
];

export function SphereGallery({
  items,
  captions = [],
  eyebrow,
  heading,
  rotations = 2,
  radius: userRadius,
  cardWidth: userCardW,
  cardHeight: userCardH,
  perspective = 1100,
  heightMultiplier = 3.2,
  className = "",
  ...rest
}: SphereGalleryProps) {
  const { openZoom } = useImageZoom();
  const allImages = React.useMemo(() => items.map((it) => it.image), [items]);
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const sphereRef = React.useRef<HTMLDivElement | null>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [progress, setProgress] = React.useState(0);
  const [focalIndex, setFocalIndex] = React.useState(0);
  const [currentCaptionIdx, setCurrentCaptionIdx] = React.useState(0);
  const [captionOpacity, setCaptionOpacity] = React.useState(1);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState<SphereGalleryItem | null>(null);
  const [dimensions, setDimensions] = React.useState({
    radius: 360,
    cardW: 140,
    cardH: 190,
  });

  const count = items.length;

  // Media query for reduced motion
  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const handler = () => setReducedMotion(media.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // Compute responsive sphere radius and card sizes
  React.useEffect(() => {
    const calculateSizes = () => {
      const vw = window.innerWidth;
      const isMobile = vw < 640;
      const isTablet = vw >= 640 && vw < 1024;

      const r = userRadius ?? (isMobile ? 220 : isTablet ? 300 : 380);
      const w = userCardW ?? (isMobile ? 95 : isTablet ? 120 : 145);
      const h = userCardH ?? (isMobile ? 130 : isTablet ? 165 : 195);

      setDimensions({ radius: r, cardW: w, cardH: h });
    };

    calculateSizes();
    window.addEventListener("resize", calculateSizes);
    return () => window.removeEventListener("resize", calculateSizes);
  }, [userRadius, userCardW, userCardH]);

  // Precompute Fibonacci spherical point distribution
  const spherePoints = React.useMemo(() => {
    const { radius } = dimensions;
    return items.map((_, i) => {
      // Golden angle distribution
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      // Radial facing (tangent to sphere surface)
      const rotY = Math.atan2(x, z) * (180 / Math.PI);
      const rotX = Math.asin(-y / (radius || 1)) * (180 / Math.PI);

      return { x, y, z, rotX, rotY };
    });
  }, [items, count, dimensions]);

  // Scroll listener via single rAF loop
  React.useEffect(() => {
    if (reducedMotion) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) {
          ticking = false;
          return;
        }

        const rect = section.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        if (total <= 0) {
          ticking = false;
          return;
        }

        const scrolled = -rect.top;
        const p = Math.min(1, Math.max(0, scrolled / total));

        // Update single parent rotation
        const rotateY = p * 360 * rotations;
        const rotateX = p * 36 - 12;

        if (sphereRef.current) {
          sphereRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }

        // Calculate transformed depth in camera space for each card
        const radX = (rotateX * Math.PI) / 180;
        const radY = (rotateY * Math.PI) / 180;
        const cosX = Math.cos(radX), sinX = Math.sin(radX);
        const cosY = Math.cos(radY), sinY = Math.sin(radY);

        spherePoints.forEach((pt, i) => {
          const card = cardRefs.current[i];
          if (!card) return;

          // 1. Rotate point by Y axis
          const x1 = pt.x * cosY + pt.z * sinY;
          const y1 = pt.y;
          const z1 = -pt.x * sinY + pt.z * cosY;

          // 2. Rotate point by X axis
          const z2 = y1 * sinX + z1 * cosX;

          // Normalized depth from -1 (farthest back) to +1 (closest front)
          const depth = z2 / (dimensions.radius || 1);

          if (depth > 0.08) {
            // Front of sphere: fully visible, sharp, opaque
            const t = Math.min(1, (depth - 0.08) / 0.92);
            const opacity = 0.88 + 0.12 * t;
            card.style.opacity = opacity.toFixed(3);
            card.style.filter = "none";
            card.style.pointerEvents = "auto";
            card.style.zIndex = Math.round(50 + 50 * t).toString();
          } else if (depth > -0.18) {
            // Equator transition: smooth fade
            const t = (depth + 0.18) / 0.26;
            const opacity = 0.22 + 0.66 * t;
            card.style.opacity = opacity.toFixed(3);
            card.style.filter = "none";
            card.style.pointerEvents = "auto";
            card.style.zIndex = "25";
          } else {
            // Back of sphere: low opacity, non-intrusive background depth
            const t = Math.max(0, (depth + 1) / 0.82);
            const opacity = 0.06 + 0.14 * t;
            card.style.opacity = opacity.toFixed(3);
            card.style.filter = "brightness(0.7) blur(0.5px)";
            card.style.pointerEvents = "none";
            card.style.zIndex = "10";
          }
        });

        // Focal calculation
        const currentFocal = Math.round(p * (count - 1));
        setFocalIndex(currentFocal);
        setProgress(p);

        // Caption bucketing with smooth fade
        if (captions.length > 0) {
          const captionIdx = Math.min(captions.length - 1, Math.floor(p * captions.length));
          setCurrentCaptionIdx((prev) => {
            if (prev !== captionIdx) {
              setCaptionOpacity(0);
              setTimeout(() => {
                setCurrentCaptionIdx(captionIdx);
                setCaptionOpacity(1);
              }, 180);
            }
            return prev;
          });
        }

        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [reducedMotion, rotations, count, captions.length, spherePoints, dimensions]);

  return (
    <section
      ref={sectionRef}
      {...rest}
      className={`dark relative w-full bg-[#0a0a0c] text-[#f4f4f5] ${className}`}
      style={{ height: reducedMotion ? "auto" : `${heightMultiplier * 100}vh` }}
    >
      {/* Sticky 3D Stage */}
      <div className={`${reducedMotion ? "relative py-16" : "sticky top-0 h-screen"} w-full overflow-hidden flex flex-col items-center justify-center pointer-events-none`}>
        
        {/* Dark Ambient Radial Backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 bg-[#0a0a0c]"
        >
          <div
            className="absolute inset-0 opacity-55"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(35,35,55,0.45) 0%, rgba(10,10,12,0.92) 72%, #0a0a0c 100%)",
            }}
          />
        </div>

        {/* Interactive Cloth-like Particle Cloak Background */}
        <ParticleCloakCanvas />

        {/* Section Header (only rendered if eyebrow or heading provided) */}
        {(eyebrow || heading) && (
          <header className="relative z-20 pointer-events-auto flex flex-col items-center gap-2 pt-10 px-6 text-center max-w-2xl">
            {eyebrow && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-[11px] font-medium tracking-[0.2em] uppercase text-muted-foreground backdrop-blur-md">
                <Move3d className="size-3 text-chart-2" />
                <span>{eyebrow}</span>
              </div>
            )}
            {heading && (
              <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                {heading}
              </h2>
            )}
          </header>
        )}

        {/* 3D Sphere Container */}
        {!reducedMotion ? (
          <div
            className="relative flex-1 w-full flex items-center justify-center select-none"
            style={{ perspective: `${perspective}px` }}
          >
            <div
              ref={sphereRef}
              className="relative preserve-3d will-change-transform"
              style={{
                width: 0,
                height: 0,
                transformStyle: "preserve-3d",
              }}
            >
              {items.map((item, i) => {
                const pt = spherePoints[i];
                if (!pt) return null;

                const isFocal = Math.abs(i - focalIndex) <= 1;
                const isNearFocal = Math.abs(i - focalIndex) === 2;

                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    onClick={() => openZoom(item.image, item.title, allImages)}
                    role="button"
                    tabIndex={0}
                    aria-label={item.title}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openZoom(item.image, item.title, allImages);
                      }
                    }}
                    className="group absolute cursor-zoom-in rounded-xl overflow-hidden bg-[#16161b] border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.7)] transition-[transform,box-shadow] duration-300 hover:scale-110 hover:ring-2 hover:ring-white/50 will-change-transform"
                    style={{
                      width: dimensions.cardW,
                      height: dimensions.cardH,
                      left: -dimensions.cardW / 2,
                      top: -dimensions.cardH / 2,
                      transform: `translate3d(${pt.x.toFixed(2)}px, ${pt.y.toFixed(2)}px, ${pt.z.toFixed(2)}px) rotateY(${pt.rotY.toFixed(2)}deg) rotateX(${pt.rotX.toFixed(2)}deg)`,
                      transformStyle: "preserve-3d",
                      opacity: pt.z > 0 ? 0.95 : 0.12,
                    }}
                  >
                    {/* Artwork Image - Pristine photo without text overlay */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"
                      loading="lazy"
                    />

                    {/* Gloss / Specular Sheen */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/20 pointer-events-none" />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Reduced Motion Fallback: Accessible Responsive Grid without text over photos */
          <div className="w-full max-w-6xl px-6 py-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pointer-events-auto">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => openZoom(item.image, item.title, allImages)}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-border shadow cursor-zoom-in"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="size-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Focus & Caption Card */}
        {!reducedMotion && captions.length > 0 && captions[currentCaptionIdx] && (
          <footer className="relative z-20 pointer-events-auto pb-10 px-6 max-w-md w-full">
            <div className="rounded-2xl border border-border/70 bg-card/85 p-5 shadow-xl backdrop-blur-xl">
              <div
                className="transition-opacity duration-200"
                style={{ opacity: captionOpacity }}
              >
                {captions[currentCaptionIdx]?.tag && (
                  <div className="flex items-center gap-1.5 text-chart-2 text-[11px] font-semibold tracking-wider uppercase mb-1.5">
                    <Sparkles className="size-3" />
                    <span>{captions[currentCaptionIdx]?.tag}</span>
                  </div>
                )}
                <h4 className="text-base font-semibold tracking-tight text-foreground">
                  {captions[currentCaptionIdx]?.title}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {captions[currentCaptionIdx]?.description}
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-border/50 text-[11px] text-muted-foreground font-mono">
                <span>0{currentCaptionIdx + 1} / 0{captions.length}</span>
                <div className="flex-1 h-1 bg-border/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-150"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
                <span>{Math.round(progress * 100)}%</span>
              </div>
            </div>
          </footer>
        )}
      </div>

      {/* Lightbox / Card Detail Modal */}
      {activeItem && (
        <DetailModal
          item={activeItem}
          onClose={() => setActiveItem(null)}
        />
      )}
    </section>
  );
}

function DetailModal({
  item,
  onClose,
}: {
  item: SphereGalleryItem;
  onClose: () => void;
}) {
  const [isFullView, setIsFullView] = React.useState(false);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullView) setIsFullView(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, isFullView]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[92vh] bg-[#141418] border border-white/15 rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-6 flex flex-col gap-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            {item.category && (
              <span className="text-[11px] font-semibold text-rose-400 tracking-wider uppercase bg-rose-400/10 border border-rose-400/20 px-2.5 py-0.5 rounded-full">
                {item.category}
              </span>
            )}
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate max-w-md">
              {item.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullView(!isFullView)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white hover:text-black text-xs font-medium text-white/90 transition-colors"
              title="Toggle Full Image"
            >
              <span>Full View</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Full Image Display (Uncropped with natural aspect ratio) */}
        <div
          onClick={() => setIsFullView(!isFullView)}
          className="relative flex-1 min-h-[300px] max-h-[72vh] w-full rounded-xl overflow-hidden bg-black/60 flex items-center justify-center cursor-zoom-in group"
        >
          <img
            src={item.image}
            alt={item.title}
            className="size-full object-contain max-h-[72vh] select-none rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-white/80 pointer-events-none">
            Click for full screen
          </div>
        </div>

        {item.subtitle && (
          <p className="text-xs sm:text-sm text-white/70">
            {item.subtitle} {item.year ? `· ${item.year}` : ""}
          </p>
        )}
      </div>

      {/* True Fullscreen Overlay if clicked */}
      {isFullView && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsFullView(false);
          }}
          className="fixed inset-0 z-[60] bg-black/98 flex flex-col items-center justify-center p-2 sm:p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <button
            type="button"
            onClick={() => setIsFullView(false)}
            className="absolute top-4 right-4 z-10 px-4 py-2 rounded-full bg-white/15 text-white hover:bg-white hover:text-black text-xs font-mono tracking-wider transition-all"
          >
            Close Fullscreen [ESC]
          </button>
          <img
            src={item.image}
            alt={item.title}
            className="max-h-[95vh] max-w-[95vw] w-auto h-auto object-contain rounded-md shadow-2xl"
          />
        </div>
      )}
    </div>,
    document.body
  );
}

export default SphereGallery;

