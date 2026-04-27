"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Title } from "../types";
import { TITLES, getTitlesByType, getTitlesByBrand } from "../data/titles";
import { getBrandById } from "../data/brands";
import { Tile } from "../tile";

interface LibraryViewProps {
  view: "movies" | "series" | "originals";
  brandFilter?: string;
  onTitleClick: (title: Title) => void;
  isMobileView: boolean;
}

const VIEW_LABELS: Record<string, string> = {
  movies: "Movies",
  series: "Series",
  originals: "Originals",
};

export function LibraryView({ view, brandFilter, onTitleClick, isMobileView }: LibraryViewProps) {
  const titles = useMemo(() => {
    if (brandFilter) return getTitlesByBrand(brandFilter);
    if (view === "movies") return getTitlesByType("movie");
    if (view === "series") return getTitlesByType("series");
    return TITLES.filter((t) => t.featured);
  }, [view, brandFilter]);

  const label = brandFilter ? getBrandById(brandFilter)?.name ?? brandFilter : VIEW_LABELS[view];

  return (
    <div className={cn("flex flex-col", isMobileView ? "px-3 py-4" : "px-9 pt-8 pb-10")}>
      <h1 className={cn("text-white font-black tracking-tight mb-1 capitalize", isMobileView ? "text-2xl" : "text-3xl")}>
        {label}
      </h1>
      <p className="text-white/50 text-sm mb-6">
        {titles.length} title{titles.length !== 1 ? "s" : ""}
      </p>

      <div className={cn("grid gap-4", isMobileView ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4")}>
        {titles.map((title) => (
          <Tile key={title.id} title={title} onClick={onTitleClick} />
        ))}
      </div>
    </div>
  );
}
