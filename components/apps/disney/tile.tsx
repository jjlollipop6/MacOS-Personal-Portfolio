"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Title } from "./types";

interface TileProps {
  title: Title;
  onClick: (title: Title) => void;
  className?: string;
}

export function Tile({ title, onClick, className }: TileProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={() => onClick(title)}
      className={cn(
        "group relative block w-full aspect-video overflow-hidden rounded-[10px]",
        "border border-white/10 hover:border-white/80",
        "shadow-[0_3px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.7),0_0_24px_rgba(0,0,0,0.4)]",
        "transition-all duration-[250ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-[1.05]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        className
      )}
    >
      {!imgError ? (
        <Image
          src={title.cardImage}
          alt={title.title}
          fill
          className="object-cover"
          unoptimized
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={cn("absolute inset-0 bg-gradient-to-br", title.fallbackGradient)} />
      )}

      {/* Title overlay (always shown when no image) */}
      {imgError && (
        <div className="absolute inset-0 flex flex-col items-start justify-end p-3">
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/60 mb-1">
            {title.type === "movie" ? "Film" : "Series"}
          </span>
          <span className="text-white font-extrabold text-sm sm:text-base leading-tight line-clamp-2 drop-shadow">
            {title.title}
          </span>
        </div>
      )}

      {/* Always-on subtle bottom gradient for any text overlay legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
    </button>
  );
}
