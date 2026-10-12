import React from "react";
import { TiltedGridHero, type TiltedGridImage } from "@/components/ui/tilted-grid-hero";

const HERO_IMAGES: TiltedGridImage[] = [
  {
    src: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80",
    title: "Double Rider Biker",
    category: "Full-Grain Cowhide",
  },
  {
    src: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=1000&q=80",
    title: "Cafe Racer Minimalist",
    category: "Buffalo Pull-Up",
  },
  {
    src: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80",
    title: "Belted Trench Coat",
    category: "Milled Veg-Tan",
  },
  {
    src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80",
    title: "Shearling Aviator Flight",
    category: "Dense Wool Collar",
  },
  {
    src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80",
    title: "Tactical Utility Overshirt",
    category: "Nappa Sheepskin",
  },
];

export function TiltedHeroSection() {
  return (
    <section className="relative w-full border-b-2 border-[#8B0000] bg-[#050505]">
      <TiltedGridHero
        images={HERO_IMAGES}
        tileHeight={28}
        aspectRatio={16 / 9}
        gap={6}
        curve={75}
        fade={12}
        speed={4}
        className="min-h-[700px] lg:min-h-[820px]"
      >
        <div className="max-w-7xl mx-auto px-6 py-16 text-center flex flex-col items-center">
          {/* Top Live Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-red-600/40 bg-[#120808]/90 backdrop-blur-md mb-6 shadow-xl shadow-red-950/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span className="font-mono text-[11px] tracking-wider uppercase text-neutral-200 font-semibold">
              DIRECT TANNERY INTEGRATION • MOQ 50 PCS
            </span>
          </div>

          {/* Luxury Editorial Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white uppercase max-w-5xl leading-[1.06] mb-6 drop-shadow-2xl">
            FROM HIDE TO HANGER, <br />
            <span className="font-serif italic font-normal text-white">
              IN-HOUSE PRECISION.
            </span>
          </h1>

          {/* Editorial Subtext */}
          <p className="max-w-3xl text-base sm:text-lg text-neutral-300 leading-relaxed font-sans mb-10 drop-shadow">
            Curated full-grain cowhide, shearing liners, and custom CNC hardware built for private labels and global buyers. Direct OEM manufacturing from Dhaka tanneries to worldwide retailers.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-lg">
            <a
              href="https://b2b.handsandhead.com/?source=hero_cylinder"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[210px] inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#E50914] hover:bg-[#FF1E27] text-white font-mono text-xs font-bold tracking-wider uppercase rounded-none border border-red-500 shadow-xl shadow-red-950/50 transition-all duration-200 hover:-translate-y-0.5"
            >
              <span>ENTER B2B PORTAL ↗</span>
            </a>
            <a
              href="#estimator"
              className="flex-1 min-w-[190px] inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#120808]/90 hover:bg-[#1f0d0e] text-neutral-200 font-mono text-xs font-semibold tracking-wider uppercase rounded-none border border-red-900/60 backdrop-blur shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:text-white"
            >
              <span>ESTIMATE PRODUCTION</span>
            </a>
          </div>

          {/* Micro Telemetry Bar */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-4xl pt-8 border-t border-red-950/60 text-left">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Base MOQ</div>
              <div className="font-mono text-sm font-semibold text-white">50 Units / Style</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Sample Turnaround</div>
              <div className="font-mono text-sm font-semibold text-white">7–10 Working Days</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Bulk Lead Time</div>
              <div className="font-mono text-sm font-semibold text-white">14–21 Days FOB</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Raw Tannery Origin</div>
              <div className="font-mono text-sm font-semibold text-[#E50914]">Direct Dhaka Hub</div>
            </div>
          </div>
        </div>
      </TiltedGridHero>
    </section>
  );
}

export default TiltedHeroSection;
