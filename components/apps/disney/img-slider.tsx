"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Title } from "./types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImgSliderProps {
  titles: Title[];
  onSlideClick: (title: Title) => void;
  isMobileView: boolean;
}

const ADVANCE_MS = 5000;

export function ImgSlider({ titles, onSlideClick, isMobileView }: ImgSliderProps) {
  const [index, setIndex] = useState(0);
  const [errored, setErrored] = useState<Record<string, boolean>>({});
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (paused || titles.length <= 1) return;
    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % titles.length);
    }, ADVANCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, paused, titles.length]);

  const goPrev = () => setIndex((i) => (i - 1 + titles.length) % titles.length);
  const goNext = () => setIndex((i) => (i + 1) % titles.length);

  if (titles.length === 0) return null;

  return (
    <div
      className={cn("group/slider relative w-full mb-6", isMobileView ? "px-3" : "")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Track */}
      <div className="relative w-full overflow-hidden rounded-md">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {titles.map((title) => {
            const src = title.sliderImage ?? title.backgroundImage;
            const hasImg = !errored[title.id];
            return (
              <button
                key={title.id}
                onClick={() => onSlideClick(title)}
                className={cn(
                  "relative flex-shrink-0 w-full overflow-hidden cursor-pointer",
                  "border-[3px] border-transparent hover:border-white/80 rounded-md transition-all duration-300",
                  isMobileView ? "aspect-[16/9]" : "aspect-[1280/520]"
                )}
              >
                {hasImg ? (
                  <Image
                    src={src}
                    alt={title.title}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={() => setErrored((p) => ({ ...p, [title.id]: true }))}
                    priority
                  />
                ) : (
                  <div className={cn("absolute inset-0 bg-gradient-to-br", title.fallbackGradient)} />
                )}
                {/* Gradient for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                {/* Text overlay — always visible */}
                <div className="absolute inset-0 flex flex-col items-start justify-end p-8">
                  <span className="text-xs uppercase tracking-[0.3em] text-white/60 mb-2">
                    {title.type === "movie" ? "Original Film" : "Original Series"}
                  </span>
                  <h2 className={cn("font-black text-white leading-none drop-shadow-lg", isMobileView ? "text-3xl" : "text-6xl")}>
                    {title.title}
                  </h2>
                  <p className={cn("text-white/80 mt-3 max-w-md drop-shadow", isMobileView ? "text-xs" : "text-sm")}>
                    {title.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Arrows */}
        {!isMobileView && titles.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover/slider:opacity-100 transition-opacity"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover/slider:opacity-100 transition-opacity"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {titles.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          {titles.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                i === index ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
