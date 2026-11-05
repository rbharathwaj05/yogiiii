"use client";

import * as React from "react";
import PictureRailGallery from "@/components/ui/picture-rail-gallery";
import type { PictureRailItem } from "@/components/ui/picture-rail-gallery";
import FlickCardsSlider from "@/components/ui/flick-cards-slider";
import { Heart, Sparkles } from "lucide-react";
import { useImageZoom } from "@/components/ui/image-zoom-lightbox";

/**
 * Local prints directly from the WhatsApp folder (public/images/gallery/artwork-*.jpeg)
 */
export const WHATSAPP_GALLERY_PRINTS: PictureRailItem[] = [
  {
    id: "wa-1",
    title: "Timeless Moments I",
    artist: "Captured Memories",
    year: "2024",
    image: "/images/gallery/artwork-1.jpeg",
    aspect: 0.75,
    frame: "black",
    mat: true,
    drop: 0.04,
    tag: "Original",
    details: ["Archival Matte Print", "30 × 40 cm", "Personal Memory Collection"],
  },
  {
    id: "wa-2",
    title: "Golden Smiles",
    artist: "Captured Memories",
    year: "2024",
    image: "/images/gallery/artwork-2.jpeg",
    aspect: 1.33,
    frame: "oak",
    mat: true,
    drop: 0.1,
    tag: "Special",
    details: ["Archival Matte Print", "40 × 30 cm", "Custom Oak Frame"],
  },
  {
    id: "wa-3",
    title: "Serene Reflections",
    artist: "Captured Memories",
    year: "2024",
    image: "/images/gallery/artwork-3.jpeg",
    aspect: 0.8,
    frame: "white",
    mat: true,
    drop: -0.02,
    tag: "Cherished",
    details: ["Archival Matte Print", "40 × 50 cm", "Museum Glass"],
  },
  {
    id: "wa-4",
    title: "Laughter in Bloom",
    artist: "Captured Memories",
    year: "2024",
    image: "/images/gallery/artwork-4.jpeg",
    aspect: 1,
    frame: "black",
    drop: 0.15,
    tag: "Favorite",
    details: ["Archival Matte Print", "30 × 30 cm", "Studio Edition"],
  },
  {
    id: "wa-5",
    title: "Sunlit Path",
    artist: "Captured Memories",
    year: "2024",
    image: "/images/gallery/artwork-5.jpeg",
    aspect: 1.5,
    frame: "oak",
    mat: true,
    drop: 0.05,
    tag: "Journey",
    details: ["Archival Matte Print", "60 × 40 cm", "Signed on the back"],
  },
  {
    id: "wa-6",
    title: "Starlit Radiance",
    artist: "Captured Memories",
    year: "2024",
    image: "/images/gallery/artwork-6.jpeg",
    aspect: 0.75,
    frame: "white",
    drop: 0.08,
    tag: "Unforgettable",
    details: ["Archival Matte Print", "30 × 40 cm", "White Moulding"],
  },
  {
    id: "wa-7",
    title: "Candid Joy",
    artist: "Captured Memories",
    year: "2024",
    image: "/images/gallery/artwork-7.jpeg",
    aspect: 1.25,
    frame: "oak",
    mat: true,
    drop: 0.02,
    tag: "Timeless",
    details: ["Archival Matte Print", "50 × 40 cm", "Oak Frame"],
  },
  {
    id: "wa-8",
    title: "Whispering Waters",
    artist: "Captured Memories",
    year: "2024",
    image: "/images/gallery/artwork-8.jpeg",
    aspect: 0.75,
    frame: "black",
    mat: true,
    drop: 0.12,
    tag: "Moments",
    details: ["Archival Matte Print", "30 × 40 cm", "Bevel-cut Mat"],
  },
  {
    id: "wa-9",
    title: "Gentle Morning",
    artist: "Captured Memories",
    year: "2024",
    image: "/images/gallery/artwork-9.jpeg",
    aspect: 1.33,
    frame: "white",
    drop: -0.01,
    tag: "Heartfelt",
    details: ["Archival Matte Print", "40 × 30 cm", "Custom Matting"],
  },
  {
    id: "wa-10",
    title: "Sweet Serenade",
    artist: "Captured Memories",
    year: "2024",
    image: "/images/gallery/artwork-10.jpeg",
    aspect: 0.75,
    frame: "oak",
    mat: true,
    drop: 0.06,
    tag: "Forever",
    details: ["Archival Matte Print", "30 × 40 cm", "Museum Quality"],
  },
];

const MORE_MEMORIES = [
  { id: "m-11", title: "Shared Smiles", image: "/images/gallery/artwork-11.jpeg", caption: "A moment etched in time" },
  { id: "m-12", title: "Starlit Walk", image: "/images/gallery/artwork-12.jpeg", caption: "Quiet conversations" },
  { id: "m-13", title: "Endless Laughter", image: "/images/gallery/artwork-13.jpeg", caption: "Joy in every frame" },
  { id: "m-14", title: "Soft Light", image: "/images/gallery/artwork-14.jpeg", caption: "Warm sunlit afternoons" },
  { id: "m-15", title: "Together", image: "/images/gallery/artwork-15.jpeg", caption: "Every heartbeat aligned" },
  { id: "m-16", title: "Glow of Youth", image: "/images/gallery/artwork-16.jpeg", caption: "Unforgettable memories" },
];

export default function PictureRailGalleryDemo({
  autoplay = true,
}: {
  autoplay?: boolean;
}) {
  const { openZoom } = useImageZoom();
  const railRef = React.useRef<HTMLDivElement | null>(null);
  const nextSectionRef = React.useRef<HTMLDivElement | null>(null);
  const allMosaicImages = React.useMemo(() => MORE_MEMORIES.map((m) => m.image), []);

  const scrollToRail = () => {
    railRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToNextSection = () => {
    nextSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full flex flex-col bg-[#050505] text-foreground">
      {/* 1. TOP SECTION: Flick Cards Slideshow in Black & Grey Theme with Heading 'Yogii' */}
      <section className="relative w-full">
        <FlickCardsSlider
          heading="Yogii"
          onScrollToRail={scrollToRail}
        />
      </section>

      {/* 2. MIDDLE SECTION: Wall Picture Rail Gallery */}
      <section ref={railRef} className="relative w-full pt-16 pb-24 bg-[#f4f0e6] dark:bg-[#151518] border-t border-white/10 transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-6 mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 px-3 py-1 text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground backdrop-blur-md mb-2">
            <Sparkles className="size-3 text-amber-600 dark:text-amber-400" />
            <span>Exhibition Wall</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-[#161616] dark:text-white">
            Picture Rail Gallery
          </h2>
          <p className="mt-2 text-sm text-[#161616]/70 dark:text-white/60 max-w-lg mx-auto">
            Drag the frames along the brass rail or click any picture to lift it from the wall and zoom into its details.
          </p>
        </div>

        <PictureRailGallery
          items={WHATSAPP_GALLERY_PRINTS}
          eyebrow="Memory Wall · Captured Moments"
          heading="Every frame tells a story of us."
          caption="Brush along the rail to illuminate a memory, drag to slide, or lift to view the details on the back."
          autoplay={autoplay}
          action={
            <button
              type="button"
              onClick={scrollToNextSection}
              className="rounded-full bg-[#161616] dark:bg-white text-white dark:text-black px-6 py-2.5 text-xs font-semibold tracking-wide shadow-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all"
            >
              Continue to Memories Mosaic ↓
            </button>
          }
        />
      </section>

      {/* 3. NEXT SECTION: Curated Memories Mosaic (No text on photos, click to zoom) */}
      <section ref={nextSectionRef} className="relative w-full py-24 px-6 sm:px-12 bg-[#09090b] text-white border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 mb-12 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-mono uppercase tracking-widest mb-1">
                <Heart className="size-3.5 fill-rose-400" />
                <span>Treasured Archive</span>
              </div>
              <h3
                className="text-3xl sm:text-5xl font-normal italic tracking-tight"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              >
                Moments Etched in Time
              </h3>
            </div>
            <p className="text-sm text-neutral-400 max-w-md">
              A continuous collection of our spontaneous laughs, quiet glances, and cherished days. Click any image to zoom.
            </p>
          </div>

          {/* Responsive Mosaic Grid without text overlays blocking photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {MORE_MEMORIES.map((mem) => (
              <div
                key={mem.id}
                onClick={() => openZoom(mem.image, mem.title, allMosaicImages)}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#141418] border border-white/10 shadow-xl cursor-zoom-in transition-all duration-300 hover:border-white/30 hover:scale-[1.02]"
              >
                <img
                  src={mem.image}
                  alt={mem.title}
                  className="size-full object-cover select-none transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
