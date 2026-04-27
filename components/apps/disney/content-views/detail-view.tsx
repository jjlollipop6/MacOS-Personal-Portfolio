"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Title } from "../types";
import { TITLES } from "../data/titles";
import { getBrandById } from "../data/brands";
import { ContentRow } from "../content-row";
import { Play, Plus, Check, Users, ChevronLeft } from "lucide-react";

interface DetailViewProps {
  title: Title;
  watchlist: string[];
  onBack: () => void;
  onTitleClick: (title: Title) => void;
  onWatchlistToggle: (titleId: string) => void;
  isMobileView: boolean;
}

export function DetailView({
  title,
  watchlist,
  onBack,
  onTitleClick,
  onWatchlistToggle,
  isMobileView,
}: DetailViewProps) {
  const [bgError, setBgError] = useState(false);
  const [titleImgError, setTitleImgError] = useState(true);
  const isWatchlisted = watchlist.includes(title.id);
  const brand = getBrandById(title.brand);

  const related = TITLES.filter((t) => t.id !== title.id && (t.brand === title.brand || t.type === title.type)).slice(0, 4);

  return (
    <div className="relative min-h-full">
      {/* Fixed background image */}
      <div className="fixed inset-0 -z-0 pointer-events-none">
        {!bgError ? (
          <Image
            src={title.backgroundImage}
            alt=""
            fill
            className="object-cover opacity-80"
            unoptimized
            onError={() => setBgError(true)}
            priority
          />
        ) : (
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", title.fallbackGradient)} />
        )}
        {/* Cinematic vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040714] via-[#040714]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#040714]/70 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className={cn("relative z-10 flex flex-col", isMobileView ? "px-4 pt-4 pb-8" : "px-9 pt-8 pb-12")}>
        {/* Back button */}
        <button
          onClick={onBack}
          className="self-start flex items-center gap-1 text-white/80 hover:text-white transition-colors mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Title image (logo) — falls back to text */}
        <div
          className={cn(
            "relative flex items-end mb-6",
            isMobileView ? "min-h-[100px]" : "min-h-[170px]"
          )}
        >
          {title.titleImage && !titleImgError ? (
            <div className={cn("relative", isMobileView ? "w-[70vw] h-[100px]" : "w-[35vw] h-[170px]")}>
              <Image
                src={title.titleImage}
                alt={title.title}
                fill
                className="object-contain object-left"
                unoptimized
                onError={() => setTitleImgError(true)}
              />
            </div>
          ) : (
            <h1
              className={cn(
                "font-black text-white leading-none drop-shadow-lg tracking-tighter",
                isMobileView ? "text-4xl max-w-[80vw]" : "text-7xl max-w-[35vw]"
              )}
            >
              {title.title}
            </h1>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center flex-wrap gap-3 mb-6">
          <button
            className={cn(
              "flex items-center gap-2 bg-white text-black font-bold rounded-md hover:bg-white/90 transition-colors uppercase tracking-wider",
              isMobileView ? "px-5 py-2.5 text-sm h-10" : "px-7 py-3 text-base h-14"
            )}
          >
            <Play className={cn("fill-black", isMobileView ? "w-4 h-4" : "w-5 h-5")} />
            Play
          </button>

          <button
            className={cn(
              "flex items-center gap-2 bg-black/60 text-white font-bold rounded-md border-2 border-white/60 hover:bg-black/80 transition-colors uppercase tracking-wider",
              isMobileView ? "px-5 py-2.5 text-sm h-10" : "px-7 py-3 text-base h-14"
            )}
          >
            <Play className={cn(isMobileView ? "w-4 h-4" : "w-5 h-5")} />
            Trailer
          </button>

          <button
            onClick={() => onWatchlistToggle(title.id)}
            className={cn(
              "rounded-full border-2 border-white/60 bg-black/60 hover:bg-black/80 transition-colors flex items-center justify-center text-white",
              isMobileView ? "w-10 h-10" : "w-14 h-14"
            )}
            aria-label={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
            title={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
          >
            {isWatchlisted ? (
              <Check className={cn(isMobileView ? "w-4 h-4" : "w-6 h-6")} />
            ) : (
              <Plus className={cn(isMobileView ? "w-4 h-4" : "w-6 h-6")} />
            )}
          </button>

          <button
            className={cn(
              "rounded-full bg-black/60 hover:bg-black/80 border-2 border-white/60 transition-colors flex items-center justify-center text-white",
              isMobileView ? "w-10 h-10" : "w-14 h-14"
            )}
            aria-label="Group Watch"
            title="Group Watch"
          >
            <Users className={cn(isMobileView ? "w-4 h-4" : "w-6 h-6")} />
          </button>
        </div>

        {/* Studio + type label */}
        <div className="flex items-center gap-2 mb-3">
          {brand && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest"
              style={{ backgroundColor: brand.accentColor, color: "white" }}
            >
              {brand.name}
            </span>
          )}
          <span className="text-white/50 text-[10px] uppercase tracking-widest">
            {title.type === "movie" ? "Original Film" : `Original Series · ${title.seasons ?? 1} Season${(title.seasons ?? 1) > 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Subtitle */}
        <p className={cn("text-white/80 mb-3", isMobileView ? "text-sm" : "text-[15px]")}>
          {title.subTitle}
        </p>

        {/* Description */}
        <p
          className={cn(
            "text-white/85 leading-relaxed max-w-[874px]",
            isMobileView ? "text-sm" : "text-[20px]"
          )}
        >
          {title.description}
        </p>

        {/* Cast / Studio meta */}
        {(title.cast || title.director) && (
          <div className="grid grid-cols-2 gap-6 pt-6 mt-6 text-sm border-t border-white/10 max-w-md">
            {title.director && (
              <div>
                <span className="text-white/50 text-xs uppercase tracking-widest">Studio</span>
                <p className="text-white/85 mt-1">{title.director}</p>
              </div>
            )}
            {title.cast && title.cast.length > 0 && (
              <div>
                <span className="text-white/50 text-xs uppercase tracking-widest">Cast</span>
                <p className="text-white/85 mt-1">{title.cast.join(", ")}</p>
              </div>
            )}
          </div>
        )}

        {/* Episodes */}
        {title.type === "series" && title.episodes && title.episodes.length > 0 && (
          <div className="pt-8 mt-2">
            <h2 className="text-white font-medium text-xl mb-4 tracking-wide">Episodes</h2>
            <div className="flex flex-col gap-2">
              {title.episodes.map((ep) => (
                <button
                  key={ep.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/5 hover:border-white/20 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">
                      {ep.number}. {ep.title}
                    </p>
                    <p className="text-white/60 text-xs mt-1 leading-relaxed">{ep.description}</p>
                  </div>
                  <span className="text-white/50 text-xs flex-shrink-0">{ep.duration}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="pt-10 mt-2">
            <ContentRow
              title="Recommendations"
              titles={related}
              onTitleClick={onTitleClick}
              isMobileView={isMobileView}
            />
          </div>
        )}
      </div>
    </div>
  );
}
