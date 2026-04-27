"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Title } from "../types";
import { TITLES } from "../data/titles";
import { Tile } from "../tile";
import { Plus } from "lucide-react";

interface WatchlistViewProps {
  watchlist: string[];
  onTitleClick: (title: Title) => void;
  onWatchlistToggle: (titleId: string) => void;
  isMobileView: boolean;
}

export function WatchlistView({ watchlist, onTitleClick, isMobileView }: WatchlistViewProps) {
  const saved = useMemo(
    () => watchlist.map((id) => TITLES.find((t) => t.id === id)).filter(Boolean) as Title[],
    [watchlist]
  );

  return (
    <div className={cn("flex flex-col", isMobileView ? "px-3 py-4" : "px-9 pt-8 pb-10")}>
      <h1 className={cn("text-white font-black tracking-tight mb-1", isMobileView ? "text-2xl" : "text-3xl")}>
        Watchlist
      </h1>
      <p className="text-white/50 text-sm mb-6">
        {saved.length === 0 ? "Nothing saved yet." : `${saved.length} title${saved.length !== 1 ? "s" : ""} saved`}
      </p>

      {saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
            <Plus className="w-7 h-7 text-white/40" />
          </div>
          <p className="text-white font-semibold text-base mb-1">Your watchlist is empty</p>
          <p className="text-white/50 text-sm">Tap the + button on any title to save it here.</p>
        </div>
      ) : (
        <div className={cn("grid gap-4", isMobileView ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4")}>
          {saved.map((title) => (
            <Tile key={title.id} title={title} onClick={onTitleClick} />
          ))}
        </div>
      )}
    </div>
  );
}
