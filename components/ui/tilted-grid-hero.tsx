import React, { useId, useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface TiltedGridImage {
  src: string;
  alt?: string;
  title?: string;
  category?: string;
}

export interface TiltedGridHeroProps {
  images: TiltedGridImage[];
  speed?: number;
  tileHeight?: number;
  aspectRatio?: number;
  gap?: number;
  axis?: "x" | "y";
  curve?: number;
  fade?: number;
  className?: string;
  children?: React.ReactNode;
}

const SLICES = 16;
const CAMERA = 1.6;
const MAX_WIDTH = 55;

export function TiltedGridHero({
  images,
  speed = 3.2,
  tileHeight = 28,
  aspectRatio = 16 / 9,
  axis = "x",
  curve = 75,
  className,
  children,
}: TiltedGridHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  const [layout, setLayout] = useState({
    radius: 1200,
    sweep: 360,
    unit: 100,
    limit: 600,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    let rafId: number | null = null;

    const observer = new ResizeObserver((entries) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (!width || !height) continue;
          const radius = (width / 2) * (100 / Math.max(1, curve));
          const sweep = (360 / SLICES) * (curve / 100);
          const unit = Math.min(width, height) / 8;
          const limit = Math.min(width, (height * MAX_WIDTH) / 100);
          setLayout({ radius, sweep, unit, limit });
        }
      });
    });

    observer.observe(containerRef.current);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [curve]);

  // 3.2s per tile advance across 16 slices = 51.2s smooth full cycle
  const duration = SLICES * Math.max(1.5, speed);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden bg-[#090909] text-[#EDEDED] select-none",
        className
      )}
      style={{
        containerType: "size",
        perspective: `${CAMERA * 1000}px`,
        WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
        maskImage: "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
      }}
    >
      {/* 3D Cylindrical Orbit Viewport with Pure GPU Compositing */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
        style={{
          transformStyle: "preserve-3d",
          perspectiveOrigin: "50% 50%",
          willChange: "transform",
          backfaceVisibility: "hidden",
        }}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transformStyle: "preserve-3d",
            willChange: "transform",
            backfaceVisibility: "hidden",
            animation: `tiltedGridOrbit_${uid} ${duration}s linear infinite`,
          }}
        >
          {Array.from({ length: SLICES }).map((_, index) => {
            const img = images[index % images.length];
            const angle = (index * 360) / SLICES;
            const rad = (angle * Math.PI) / 180;
            const x = Math.sin(rad) * layout.radius;
            const z = Math.cos(rad) * layout.radius - layout.radius;

            return (
              <div
                key={index}
                className="absolute overflow-hidden rounded-sm border border-white/10 bg-[#121212] shadow-2xl transition-all duration-300"
                style={{
                  width: `${tileHeight * aspectRatio * 2.8}px`,
                  height: `${tileHeight * 2.8 * 3.5}px`,
                  transform: `translate3d(${x}px, 0px, ${z}px) rotateY(${angle}deg)`,
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                  willChange: "transform",
                  contain: "paint layout",
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt || `Outerwear Spec ${index + 1}`}
                  className="w-full h-full object-cover grayscale contrast-125 opacity-80 hover:opacity-100 transition-opacity duration-300 scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                {img.title && (
                  <div className="absolute bottom-2 left-2 right-2 text-left pointer-events-none">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-neutral-400 bg-black/70 px-1.5 py-0.5 inline-block border border-white/10 rounded-xs">
                      {img.category || "SPEC"}
                    </span>
                    <span className="text-[11px] font-medium text-white/90 truncate block mt-0.5">
                      {img.title}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle Ambient Radial Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: "radial-gradient(ellipse at center, rgba(9,9,9,0.55) 0%, rgba(9,9,9,0.92) 80%, #090909 100%)",
        }}
      />

      {/* Hero Overlay Content */}
      <div className="relative z-20 w-full h-full flex flex-col justify-center items-center pointer-events-auto">
        {children}
      </div>

      {/* Orbit Keyframe Injection */}
      <style>{`
        @keyframes tiltedGridOrbit_${uid} {
          from {
            transform: rotateY(0deg) translateZ(-160px) rotateX(${axis === "x" ? 7 : 0}deg);
          }
          to {
            transform: rotateY(360deg) translateZ(-160px) rotateX(${axis === "x" ? 7 : 0}deg);
          }
        }
      `}</style>
    </div>
  );
}

export default TiltedGridHero;
