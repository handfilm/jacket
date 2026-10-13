import React, { useEffect } from "react";
import { cn } from "@/lib/utils";

export interface TechPackItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  leatherGrade: string;
  hardware: string;
  construction: string;
  lining: string;
  moq?: string;
  sampleTurnaround?: string;
  tolerance?: string;
  aql?: string;
  bom?: Array<{
    item: string;
    spec: string;
    yield: string;
    origin: string;
  }>;
}

export interface TechPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: TechPackItem | null;
  onLaunchRfq?: (item: TechPackItem) => void;
}

export function TechPackModal({
  isOpen,
  onClose,
  item,
  onLaunchRfq,
}: TechPackModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  const handlePreOrder = () => {
    const styleParam = encodeURIComponent(item.id || item.title.toLowerCase().replace(/\s+/g, "-"));
    window.open(`https://b2b.handsandhead.com/checkout?item=sample&style=${styleParam}`, "_blank");
  };

  const handleRfq = () => {
    if (onLaunchRfq) {
      onLaunchRfq(item);
    } else {
      onClose();
      const el = document.getElementById("estimator");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-black/85 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="techpack-drawer-title"
    >
      {/* Slide-over Drawer Container */}
      <div
        className={cn(
          "relative w-full max-w-2xl h-full bg-[#090909] text-[#EDEDED] border-l border-[#8B0000] shadow-2xl flex flex-col overflow-hidden transition-transform duration-300",
          "animate-in slide-in-from-right duration-300"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0C0C0C]">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest text-[#E50914] uppercase font-semibold">
                FACTORY SPECIFICATION ARCHIVE // {item.id}
              </span>
            </div>
            <h2 id="techpack-drawer-title" className="font-serif text-2xl font-bold tracking-tight text-white uppercase">
              {item.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/60 rounded transition-colors font-mono text-sm"
            aria-label="Close tech pack drawer"
          >
            [ESC ✕]
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Specimen Media & CAD Telemetry Blueprint Banner */}
          <div className="relative rounded border border-white/10 overflow-hidden bg-black aspect-video flex items-center justify-center">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover grayscale contrast-125 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-black/40" />
            <div className="absolute top-3 left-3 bg-[#0A0A0A]/90 border border-white/15 px-2.5 py-1 text-[10px] font-mono tracking-wider text-neutral-300">
              CAD BENCH REF: {item.id}
            </div>
            <div className="absolute top-3 right-3 bg-[#180808]/90 border border-[#E50914]/50 px-2.5 py-1 text-[10px] font-mono tracking-wider text-[#E50914]">
              DHAKA BENCH VERIFIED
            </div>
            <div className="absolute bottom-3 left-3 right-3 text-xs font-mono text-neutral-300 line-clamp-1">
              {item.category.toUpperCase()} • IN-HOUSE SAMPLE RECORD
            </div>
          </div>

          {/* Core Manufacturing Specs Matrix */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#E50914] mb-3 flex items-center gap-2">
              <span className="w-3 h-[1px] bg-[#E50914]" />
              Industrial Manufacturing Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Leather Grade */}
              <div className="p-3.5 bg-[#121212] border border-white/10 rounded-sm">
                <div className="font-mono text-[10px] uppercase text-neutral-400 tracking-wider">
                  Leather Grade &amp; Thickness
                </div>
                <div className="font-sans text-sm font-semibold text-white mt-1">
                  {item.leatherGrade}
                </div>
                <div className="font-mono text-[10px] text-neutral-500 mt-0.5">
                  Drum-dyed, tensile strength &gt; 180N
                </div>
              </div>

              {/* Hardware Spec */}
              <div className="p-3.5 bg-[#121212] border border-white/10 rounded-sm">
                <div className="font-mono text-[10px] uppercase text-neutral-400 tracking-wider">
                  Hardware &amp; Zipper Spec
                </div>
                <div className="font-sans text-sm font-semibold text-white mt-1">
                  {item.hardware}
                </div>
                <div className="font-mono text-[10px] text-neutral-500 mt-0.5">
                  Salt-spray tested 72h anti-tarnish
                </div>
              </div>

              {/* Construction */}
              <div className="p-3.5 bg-[#121212] border border-white/10 rounded-sm">
                <div className="font-mono text-[10px] uppercase text-neutral-400 tracking-wider">
                  Construction &amp; Stitch Tolerance
                </div>
                <div className="font-sans text-sm font-semibold text-white mt-1">
                  {item.construction}
                </div>
                <div className="font-mono text-[10px] text-neutral-500 mt-0.5">
                  Heavy walking-foot industrial feed
                </div>
              </div>

              {/* Lining Spec */}
              <div className="p-3.5 bg-[#121212] border border-white/10 rounded-sm">
                <div className="font-mono text-[10px] uppercase text-neutral-400 tracking-wider">
                  Interior Lining &amp; Insulation
                </div>
                <div className="font-sans text-sm font-semibold text-white mt-1">
                  {item.lining}
                </div>
                <div className="font-mono text-[10px] text-neutral-500 mt-0.5">
                  Breathable, anti-static glide
                </div>
              </div>
            </div>
          </div>

          {/* Bill of Materials (BOM) Breakdown */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#E50914] mb-3 flex items-center gap-2">
              <span className="w-3 h-[1px] bg-[#E50914]" />
              Engineering Bill of Materials (BOM)
            </h3>
            <div className="border border-white/10 bg-[#0E0E0E] text-xs font-mono">
              <div className="grid grid-cols-4 px-3 py-2 bg-[#141414] text-[10px] text-neutral-400 uppercase tracking-wider border-b border-white/10">
                <div>Component</div>
                <div>Specification</div>
                <div>Avg Yield</div>
                <div className="text-right">Origin</div>
              </div>
              {(item.bom && item.bom.length > 0 ? item.bom : [
                { item: "Shell Hide", spec: item.leatherGrade, yield: "38–42 sq ft", origin: "Dhaka Hub" },
                { item: "Fasteners", spec: item.hardware, yield: "1 set / pc", origin: "YKK BD/JP" },
                { item: "Structural Thread", spec: "Tex-90 Bonded Nylon 7-8 SPI", yield: "180m / pc", origin: "A&E Thread" },
                { item: "Lining / Core", spec: item.lining, yield: "2.1m / pc", origin: "Tier 1 Mill" },
              ]).map((bomRow, i) => (
                <div key={i} className="grid grid-cols-4 px-3 py-2.5 border-b border-white/5 items-center text-neutral-300">
                  <div className="font-semibold text-white truncate pr-1">{bomRow.item}</div>
                  <div className="text-neutral-400 truncate pr-1">{bomRow.spec}</div>
                  <div className="text-neutral-400">{bomRow.yield}</div>
                  <div className="text-right text-[#E50914]">{bomRow.origin}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quality & Factory Benchwork Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-[#120808] border border-[#8B0000]/40 font-mono text-[11px]">
            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">Seam Variance</span>
              <strong className="text-white">{item.tolerance || "±1.0 mm"}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">QC Standard</span>
              <strong className="text-white">{item.aql || "AQL 2.5 Major"}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">Prototype Turn</span>
              <strong className="text-[#E50914]">{item.sampleTurnaround || "7–10 Days"}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">Base MOQ</span>
              <strong className="text-white">{item.moq || "50 Pcs / Style"}</strong>
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#0C0C0C] flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-3 border border-white/20 hover:border-white/50 text-neutral-200 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
          >
            <span>⎙</span> Print Tech-Sheet
          </button>
          <button
            type="button"
            onClick={handlePreOrder}
            className="w-full sm:flex-1 px-5 py-3 bg-[#E50914] hover:bg-[#FF1E27] text-white font-mono text-xs font-bold uppercase tracking-wider border border-red-500 shadow-lg shadow-red-950/50 transition-all flex items-center justify-center gap-1"
          >
            Pre-Order Prototype ($180 Flat) ↗
          </button>
          <button
            type="button"
            onClick={handleRfq}
            className="w-full sm:w-auto px-4 py-3 bg-[#1A1212] hover:bg-[#2A1616] border border-[#8B0000] text-neutral-200 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
          >
            Launch Bulk RFQ ↓
          </button>
        </div>
      </div>
    </div>
  );
}

export default TechPackModal;
