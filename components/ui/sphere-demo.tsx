"use client";

import * as React from "react";
import SphereGallery from "@/components/ui/sphere-gallery";
import type { SphereGalleryItem } from "@/components/ui/sphere-gallery";

export const SPHERE_GALLERY_ITEMS: SphereGalleryItem[] = [
  {
    id: "sp-1",
    title: "Celestial Mirage",
    subtitle: "Ines Varga · Oil on Linen",
    year: "2024",
    category: "Abstract",
    image: "/images/gallery/artwork-1.jpeg",
  },
  {
    id: "sp-2",
    title: "Golden Hour Resonance",
    subtitle: "Tomas Reyhill · Photography",
    year: "2023",
    category: "Architecture",
    image: "/images/gallery/artwork-2.jpeg",
  },
  {
    id: "sp-3",
    title: "Silent Horizon",
    subtitle: "Ada Lindqvist · Archival Print",
    year: "2024",
    category: "Minimalism",
    image: "/images/gallery/artwork-3.jpeg",
  },
  {
    id: "sp-4",
    title: "Vortices in Red",
    subtitle: "Pavel Oduya · Mixed Media",
    year: "2022",
    category: "Modernism",
    image: "/images/gallery/artwork-4.jpeg",
  },
  {
    id: "sp-5",
    title: "Ethereal Solitude",
    subtitle: "Elio Brandt · Silver Gelatin",
    year: "2023",
    category: "Landscape",
    image: "/images/gallery/artwork-5.jpeg",
  },
  {
    id: "sp-6",
    title: "Prismatic Drift",
    subtitle: "Saga Morel · Acrylic",
    year: "2024",
    category: "Abstract",
    image: "/images/gallery/artwork-6.jpeg",
  },
  {
    id: "sp-7",
    title: "Monolithic Echoes",
    subtitle: "Noor Halvorsen · Charcoal",
    year: "2023",
    category: "Study",
    image: "/images/gallery/artwork-7.jpeg",
  },
  {
    id: "sp-8",
    title: "Terra Incognita",
    subtitle: "Marcus Vance · Pigment Print",
    year: "2024",
    category: "Nature",
    image: "/images/gallery/artwork-8.jpeg",
  },
  {
    id: "sp-9",
    title: "Aura of Dawn",
    subtitle: "Clara Shen · Oil & Sand",
    year: "2022",
    category: "Expressionism",
    image: "/images/gallery/artwork-9.jpeg",
  },
  {
    id: "sp-10",
    title: "Spectral Flow",
    subtitle: "Julian Thorne · Digital Collage",
    year: "2024",
    category: "Experimental",
    image: "/images/gallery/artwork-10.jpeg",
  },
  {
    id: "sp-11",
    title: "Obsidian Bloom",
    subtitle: "Zoe Althaus · Ink on Mulberry Paper",
    year: "2023",
    category: "Botanical",
    image: "/images/gallery/artwork-11.jpeg",
  },
  {
    id: "sp-12",
    title: "Dune Field No. 8",
    subtitle: "Ada Lindqvist · Photography",
    year: "2024",
    category: "Topography",
    image: "/images/gallery/artwork-12.jpeg",
  },
  {
    id: "sp-13",
    title: "Luminescence",
    subtitle: "Mira Kestler · Archival Print",
    year: "2023",
    category: "Light Study",
    image: "/images/gallery/artwork-13.jpeg",
  },
  {
    id: "sp-14",
    title: "Urban Nocturne",
    subtitle: "Luka Davies · Monotype",
    year: "2024",
    category: "Street",
    image: "/images/gallery/artwork-14.jpeg",
  },
  {
    id: "sp-15",
    title: "Tectonic Shimmer",
    subtitle: "Elena Rostova · Watercolor",
    year: "2021",
    category: "Geological",
    image: "/images/gallery/artwork-15.jpeg",
  },
  {
    id: "sp-16",
    title: "Amber Veil",
    subtitle: "Dante Rossi · Oil on Canvas",
    year: "2024",
    category: "Contemporary",
    image: "/images/gallery/artwork-16.jpeg",
  },
  {
    id: "sp-17",
    title: "Tide Line Horizon",
    subtitle: "Noor Halvorsen · Silver Print",
    year: "2023",
    category: "Seascape",
    image: "/images/gallery/artwork-17.jpeg",
  },
  {
    id: "sp-18",
    title: "Infinite Polyhedron",
    subtitle: "Kai Tanaka · Sculptural Study",
    year: "2024",
    category: "Geometric",
    image: "/images/gallery/artwork-18.jpeg",
  },
  {
    id: "sp-19",
    title: "Gilded Canopy",
    subtitle: "Sophia Benoit · Leaf & Gesso",
    year: "2023",
    category: "Organic",
    image: "/images/gallery/artwork-19.jpeg",
  },
  {
    id: "sp-20",
    title: "Resonance in Grey",
    subtitle: "Felix Meyer · Graphite",
    year: "2024",
    category: "Monochrome",
    image: "/images/gallery/artwork-20.jpeg",
  },
];

export default function SphereGalleryDemo() {
  return (
    <div className="w-full bg-background text-foreground">
      <SphereGallery
        items={SPHERE_GALLERY_ITEMS}
        rotations={2.2}
        heightMultiplier={3.5}
      />
    </div>
  );
}

