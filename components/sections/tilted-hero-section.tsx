import React from "react";
import { TiltedGridHero, type TiltedGridImage } from "@/components/ui/tilted-grid-hero";

const HERO_IMAGES: TiltedGridImage[] = [
  {
    src: "assets/62550.jpg",
    title: "Double Rider Biker",
    category: "Full-Grain Cowhide",
  },
  {
    src: "assets/62552.jpg",
    title: "Cafe Racer Minimalist",
    category: "Buffalo Pull-Up",
  },
  {
    src: "assets/62557.jpg",
    title: "Belted Trench Coat",
    category: "Milled Veg-Tan",
  },
  {
    src: "assets/62564.jpg",
    title: "Shearling Aviator Flight",
    category: "Dense Wool Collar",
  },
  {
    src: "assets/62558.jpg",
    title: "Tactical Utility Overshirt",
    category: "Nappa Sheepskin",
  },
  {
    src: "assets/62555.jpg",
    title: "MA-1 Industrial Flight",
    category: "Oil-Tanned Hide",
  },
  {
    src: "assets/62560.jpg",
    title: "Diamond Quilted Moto",
    category: "Articulated Seams",
  },
  {
    src: "assets/62640.jpg",
    title: "Trail Harness Vest",
    category: "316L CNC Hardware",
  },
];

export function TiltedHeroSection() {
  return (
    <section className="relative w-full h-screen min-h-[720px] lg:min-h-[860px] bg-[#090909] overflow-hidden border-b border-white/10 flex flex-col justify-between">
      <TiltedGridHero
        images={HERO_IMAGES}
        tileHeight={26}
        aspectRatio={16 / 9}
        speed={3.2}
        curve={70}
        className="absolute inset-0 w-full h-full"
      >
        <div className="relative z-30 w-full h-full max-w-7xl mx-auto px-6 sm:px-10 py-8 flex flex-col justify-between pointer-events-none">
          {/* Top Floating Telemetry Pill (Nordic utility badge) */}
          <div className="pt-6 sm:pt-8 flex justify-center pointer-events-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 backdrop-blur-md px-4 py-1.5 text-[11px] font-mono tracking-widest text-neutral-300 uppercase shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>DIRECT TANNERY INTEGRATION • MOQ 50 UNITS • DHAKA ATELIER</span>
            </div>
          </div>

          {/* Bottom-Left Editorial Text Lockup (Peak Performance Alpine signature) */}
          <div className="pb-10 sm:pb-16 max-w-2xl text-left pointer-events-auto">
            {/* Category Tag */}
            <div className="font-mono text-xs tracking-widest uppercase text-amber-400/90 font-medium mb-3 flex items-center gap-2.5">
              <span className="w-4 h-[1px] bg-amber-400/80"></span>
              <span>ARCHIVAL GRADE // 1.2MM COWHIDE &amp; SHEARLING</span>
            </div>

            {/* Massive Crisp Header */}
            <h1 className="font-sans text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] text-white uppercase leading-[0.96] mb-5 drop-shadow-2xl">
              ENGINEERED FOR THE ELEMENTS.
            </h1>

            {/* Editorial Sub-line */}
            <p className="font-sans text-sm sm:text-base text-neutral-300/90 leading-relaxed max-w-xl mb-8 font-normal drop-shadow">
              Direct atelier-to-brand manufacturing. Uncompromised benchwork tolerances, custom CNC hardware, and zero intermediate markups.
            </p>

            {/* Peak Performance Signature Rounded-Glass Action Pill Triggers */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#shop-archival"
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider border border-white/25 backdrop-blur-md transition-all duration-200 hover:border-white/50 hover:scale-[1.02] flex items-center gap-1.5"
              >
                <span>→</span> EXPLORE ARCHIVE
              </a>
              <a
                href="https://b2b.handsandhead.com/?source=hero_peak"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-full bg-white text-black hover:bg-neutral-200 font-mono text-xs font-bold uppercase tracking-wider shadow-xl transition-all duration-200 hover:scale-[1.02] flex items-center gap-1.5"
              >
                <span>→</span> ENTER B2B PORTAL ↗
              </a>
              <a
                href="#estimator"
                className="px-6 py-3.5 rounded-full bg-black/40 hover:bg-black/60 text-neutral-300 hover:text-white font-mono text-xs uppercase tracking-wider border border-white/15 backdrop-blur-md transition-all duration-200 hover:border-white/35 flex items-center gap-1.5"
              >
                <span>→</span> SPECIFY PROTOTYPE
              </a>
            </div>
          </div>
        </div>
      </TiltedGridHero>
    </section>
  );
}

export default TiltedHeroSection;
