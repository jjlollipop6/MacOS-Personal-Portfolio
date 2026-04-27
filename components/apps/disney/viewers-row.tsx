"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Brand } from "./types";

interface ViewersRowProps {
  brands: Brand[];
  onBrandClick: (brandId: string) => void;
  isMobileView: boolean;
}

interface BrandTileProps {
  brand: Brand;
  onClick: (brandId: string) => void;
}

function BrandTile({ brand, onClick }: BrandTileProps) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleMouseEnter = () => {
    setHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };
  const handleMouseLeave = () => {
    setHovered(false);
    if (videoRef.current) videoRef.current.pause();
  };

  return (
    <button
      onClick={() => onClick(brand.id)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative block w-full aspect-video overflow-hidden rounded-[10px]",
        "border border-white/10 hover:border-white/80",
        "shadow-[0_3px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.7),0_0_24px_rgba(0,0,0,0.4)]",
        "transition-all duration-[250ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-[1.05]"
      )}
    >
      {/* Static image or gradient fallback */}
      {!imgError && brand.tileImage ? (
        <Image
          src={brand.tileImage}
          alt={brand.name}
          fill
          className="object-cover"
          unoptimized
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${brand.tileColor} 0%, ${brand.accentColor} 100%)` }}
        >
          <span className="text-white font-black text-sm sm:text-base text-center px-2 leading-tight drop-shadow tracking-wide">
            {brand.name}
          </span>
        </div>
      )}

      {/* Hover video */}
      {brand.hoverVideo && (
        <video
          ref={videoRef}
          src={brand.hoverVideo}
          muted
          loop
          playsInline
          preload="metadata"
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            hovered ? "opacity-100" : "opacity-0"
          )}
          onError={() => { /* swallow — gracefully degrade to static */ }}
        />
      )}

      {/* Subtle dark gradient bottom for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
    </button>
  );
}

export function ViewersRow({ brands, onBrandClick, isMobileView }: ViewersRowProps) {
  return (
    <div className={cn("mb-8", isMobileView ? "px-3" : "px-9")}>
      <div
        className={cn(
          "grid gap-4",
          isMobileView ? "grid-cols-2" : "grid-cols-3 lg:grid-cols-6"
        )}
      >
        {brands.map((brand) => (
          <BrandTile key={brand.id} brand={brand} onClick={onBrandClick} />
        ))}
      </div>
    </div>
  );
}
