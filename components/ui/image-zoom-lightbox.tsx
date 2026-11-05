"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

export interface ZoomImageState {
  src: string;
  alt?: string;
  allImages?: string[];
  currentIndex?: number;
}

interface ImageZoomContextType {
  openZoom: (src: string, alt?: string, allImages?: string[]) => void;
  closeZoom: () => void;
}

const ImageZoomContext = React.createContext<ImageZoomContextType>({
  openZoom: () => {},
  closeZoom: () => {},
});

export function useImageZoom() {
  return React.useContext(ImageZoomContext);
}

export function ImageZoomProvider({ children }: { children: React.ReactNode }) {
  const [zoomState, setZoomState] = React.useState<ZoomImageState | null>(null);
  const [isZoomedIn, setIsZoomedIn] = React.useState(false);

  const openZoom = React.useCallback((src: string, alt = "", allImages?: string[]) => {
    let index = 0;
    if (allImages && allImages.length > 0) {
      const found = allImages.indexOf(src);
      if (found !== -1) index = found;
    }
    setZoomState({ src, alt, allImages, currentIndex: index });
    setIsZoomedIn(false);
  }, []);

  const closeZoom = React.useCallback(() => {
    setZoomState(null);
    setIsZoomedIn(false);
  }, []);

  const nextImage = React.useCallback(() => {
    if (!zoomState?.allImages || zoomState.allImages.length <= 1) return;
    const nextIdx = (zoomState.currentIndex! + 1) % zoomState.allImages.length;
    setZoomState((prev) => prev ? {
      ...prev,
      src: prev.allImages![nextIdx],
      currentIndex: nextIdx,
    } : null);
    setIsZoomedIn(false);
  }, [zoomState]);

  const prevImage = React.useCallback(() => {
    if (!zoomState?.allImages || zoomState.allImages.length <= 1) return;
    const prevIdx = (zoomState.currentIndex! - 1 + zoomState.allImages.length) % zoomState.allImages.length;
    setZoomState((prev) => prev ? {
      ...prev,
      src: prev.allImages![prevIdx],
      currentIndex: prevIdx,
    } : null);
    setIsZoomedIn(false);
  }, [zoomState]);

  React.useEffect(() => {
    if (!zoomState) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeZoom();
      else if (e.key === "ArrowRight") nextImage();
      else if (e.key === "ArrowLeft") prevImage();
    };

    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [zoomState, closeZoom, nextImage, prevImage]);

  return (
    <ImageZoomContext.Provider value={{ openZoom, closeZoom }}>
      {children}

      {zoomState && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeZoom}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/96 backdrop-blur-2xl p-2 sm:p-6 transition-all animate-in fade-in duration-200 select-none"
        >
          {/* Top Controls Bar */}
          <div
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsZoomedIn((prev) => !prev)}
              aria-label={isZoomedIn ? "Zoom out" : "Zoom in"}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white hover:text-black text-white/90 transition-all backdrop-blur-md border border-white/15"
              title={isZoomedIn ? "Zoom Out" : "Zoom In (2x)"}
            >
              {isZoomedIn ? <ZoomOut className="size-4 sm:size-5" /> : <ZoomIn className="size-4 sm:size-5" />}
            </button>

            <button
              type="button"
              onClick={closeZoom}
              aria-label="Close zoomed view"
              className="p-2.5 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white text-white/90 transition-all backdrop-blur-md border border-white/15"
              title="Close [ESC]"
            >
              <X className="size-4 sm:size-5" />
            </button>
          </div>

          {/* Navigation Arrows (if multiple images) */}
          {zoomState.allImages && zoomState.allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                aria-label="Previous photo"
                className="absolute left-3 sm:left-6 z-50 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white hover:text-black text-white transition-all backdrop-blur-md border border-white/15"
              >
                <ChevronLeft className="size-5 sm:size-6" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                aria-label="Next photo"
                className="absolute right-3 sm:right-6 z-50 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white hover:text-black text-white transition-all backdrop-blur-md border border-white/15"
              >
                <ChevronRight className="size-5 sm:size-6" />
              </button>
            </>
          )}

          {/* Zoomed Image Container */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomedIn((prev) => !prev);
            }}
            className={`relative max-w-full max-h-full flex items-center justify-center transition-all duration-300 ${
              isZoomedIn ? "cursor-zoom-out overflow-auto p-4" : "cursor-zoom-in"
            }`}
          >
            <img
              src={zoomState.src}
              alt={zoomState.alt || "Zoomed Memory"}
              className={`rounded-lg shadow-[0_25px_80px_rgba(0,0,0,0.95)] transition-all duration-300 ease-out select-none ${
                isZoomedIn
                  ? "scale-[1.8] max-w-none origin-center"
                  : "max-h-[88vh] max-w-[92vw] w-auto h-auto object-contain scale-100"
              }`}
            />
          </div>

          {/* Bottom subtle hint */}
          <div className="absolute bottom-4 inset-x-0 text-center pointer-events-none">
            <span className="font-mono text-[11px] tracking-widest text-white/40 uppercase bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
              Click photo to {isZoomedIn ? "zoom out" : "zoom 2x"} · ESC to close
            </span>
          </div>
        </div>,
        document.body
      )}
    </ImageZoomContext.Provider>
  );
}

export default ImageZoomProvider;

