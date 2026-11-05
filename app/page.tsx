"use client";

import * as React from "react";
import FernrootHero from "@/components/ui/fernroot-hero";
import PictureRailGalleryDemo from "@/components/ui/demo";
import SphereGalleryDemo from "@/components/ui/sphere-demo";
import { Sparkles, Move3d, Compass } from "lucide-react";
import { ImageZoomProvider } from "@/components/ui/image-zoom-lightbox";

export default function Home() {
  const [view, setView] = React.useState<"intro" | "sphere" | "rail">("intro");
  const isDark = view === "sphere" || view === "rail";

  return (
    <ImageZoomProvider>
      <main
        className={`min-h-screen w-full transition-colors duration-500 ${
          isDark
            ? "bg-[#050505] text-[#f4f4f5] selection:bg-white/20 selection:text-white"
            : "bg-[#efefee] text-[#161616] selection:bg-[#3f7d4e] selection:text-white"
        }`}
      >
      {/* Universal Top Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 sm:p-5 pointer-events-none">
        {/* Brand / Heart icon */}
        <div
          onClick={() => setView("intro")}
          role="button"
          tabIndex={0}
          className="pointer-events-auto flex items-center gap-2 cursor-pointer select-none"
        >
          <svg
            viewBox="0 0 24 24"
            className={`size-6 transition-colors duration-300 ${
              isDark ? "text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]" : "text-[#3f7d4e]"
            }`}
            aria-hidden="true"
            fill="currentColor"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>

        {/* Floating Centered Pill Switcher */}
        <nav
          aria-label="Experience switcher"
          className={`pointer-events-auto absolute left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full p-1.5 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
            isDark
              ? "border border-white/10 bg-black/60 shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
              : "border border-black/10 bg-white/60 shadow-xl"
          }`}
        >
          <button
            type="button"
            onClick={() => setView("intro")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 ${
              view === "intro"
                ? isDark
                  ? "bg-white text-black shadow"
                  : "bg-[#161616] text-white shadow"
                : isDark
                ? "text-white/65 hover:text-white hover:bg-white/10"
                : "text-[#161616]/65 hover:text-[#161616] hover:bg-black/5"
            }`}
          >
            <Compass className="size-3.5" />
            <span>Intro</span>
          </button>

          <button
            type="button"
            onClick={() => setView("sphere")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 ${
              view === "sphere"
                ? isDark
                  ? "bg-white text-black shadow"
                  : "bg-[#161616] text-white shadow"
                : isDark
                ? "text-white/65 hover:text-white hover:bg-white/10"
                : "text-[#161616]/65 hover:text-[#161616] hover:bg-black/5"
            }`}
          >
            <Move3d className="size-3.5" />
            <span>Fibonacci Sphere</span>
          </button>

          <button
            type="button"
            onClick={() => setView("rail")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 ${
              view === "rail"
                ? isDark
                  ? "bg-white text-black shadow"
                  : "bg-[#161616] text-white shadow"
                : isDark
                ? "text-white/65 hover:text-white hover:bg-white/10"
                : "text-[#161616]/65 hover:text-[#161616] hover:bg-black/5"
            }`}
          >
            <Sparkles className="size-3.5" />
            <span>Photo Rail</span>
          </button>
        </nav>

        {/* Right CTA */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (view === "intro") setView("rail");
              else if (view === "rail") setView("sphere");
              else setView("intro");
            }}
            className={`rounded-full text-xs font-semibold px-4 py-2 transition-all duration-300 ${
              isDark
                ? "bg-white text-black hover:bg-neutral-200 shadow-md"
                : "bg-[#161616] text-white hover:bg-[#333]"
            }`}
          >
            {view === "intro" ? "Explore Rail" : view === "rail" ? "Explore Sphere" : "Back to Intro"}
          </button>
        </div>
      </header>

      {/* Views */}
      {view === "intro" && (
        <FernrootHero onExplore={() => setView("rail")} />
      )}

      {view === "sphere" && (
        <div>
          <SphereGalleryDemo />
        </div>
      )}

      {view === "rail" && (
        <div className="w-full">
          <PictureRailGalleryDemo autoplay={true} />
        </div>
      )}
    </main>
  </ImageZoomProvider>
);
}
