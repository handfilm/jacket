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
  speed = 4,
  tileHeight = 28,
  aspectRatio = 16 / 9,
  gap = 6,
  axis = "x",
  curve = 75,
  fade = 12,
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
    const observer = new ResizeObserver((entries) => {
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

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [curve]);

  const duration = Math.max(8, 60 / Math.max(0.1, speed));

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden bg-[#0B0B0B] text-[#EDEDED] select-none",
        className
      )}
      style={{
        containerType: "size",
        perspective: `${CAMERA * 1000}px`,
      }}
    >
      {/* 3D Cylindrical Orbit Viewport */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          transformStyle: "preserve-3d",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transformStyle: "preserve-3d",
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
                className="absolute overflow-hidden rounded border border-red-900/40 bg-[#0D0D0D] shadow-2xl transition-all duration-300"
                style={{
                  width: `${tileHeight * aspectRatio * 2.8}px`,
                  height: `${tileHeight * 2.8 * 3.5}px`,
                  transform: `translate3d(${x}px, 0px, ${z}px) rotateY(${angle}deg)`,
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt || `Outerwear Spec ${index + 1}`}
                  className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500 scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                {img.title && (
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#E50914] block">
                      {img.category || "SPEC RECORD"}
                    </span>
                    <span className="text-xs font-semibold text-white truncate block">
                      {img.title}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gradient Mask Edge Faders */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: `
            linear-gradient(to right, #0B0B0B 0%, transparent ${fade}%, transparent ${100 - fade}%, #0B0B0B 100%),
            linear-gradient(to bottom, #0B0B0B 0%, transparent 20%, transparent 80%, #0B0B0B 100%)
          `,
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
            transform: rotateY(0deg) translateZ(-150px) rotateX(${axis === "x" ? 8 : 0}deg);
          }
          to {
            transform: rotateY(360deg) translateZ(-150px) rotateX(${axis === "x" ? 8 : 0}deg);
          }
        }
      `}</style>
    </div>
  );
}

export default TiltedGridHero;
