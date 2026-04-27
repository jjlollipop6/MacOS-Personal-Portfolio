"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Title } from "../types";
import { TITLES, searchTitles, getTitlesByType } from "../data/titles";
import { BRANDS } from "../data/brands";
import { Tile } from "../tile";
import { Search, X } from "lucide-react";

interface SearchViewProps {
  watchlist: string[];
  onTitleClick: (title: Title) => void;
  onWatchlistToggle: (titleId: string) => void;
  isMobileView: boolean;
}

export function SearchView({ onTitleClick, isMobileView }: SearchViewProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Title[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!val.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    timeoutRef.current = setTimeout(() => {
      setResults(searchTitles(val));
      setHasSearched(true);
    }, 300);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handleBrandFilter = useCallback((brandId: string) => {
    const brandTitles = TITLES.filter((t) => t.brand === brandId);
    const brand = BRANDS.find((b) => b.id === brandId);
    setQuery(brand?.name ?? brandId);
    setResults(brandTitles);
    setHasSearched(true);
  }, []);

  return (
    <div className={cn("flex flex-col", isMobileView ? "px-3 py-3" : "px-9 pt-6 pb-10")}>
      {/* Search input */}
      <div className="mb-6">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search by title, genre, or studio..."
            autoFocus
            className="w-full h-11 bg-white/5 backdrop-blur-sm rounded-md pl-9 pr-9 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/30 border border-white/10"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {hasSearched ? (
        results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-white font-semibold text-base mb-1">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-white/50 text-sm">Try a different title, genre, or studio.</p>
          </div>
        ) : (
          <>
            <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-4">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            <div className={cn("grid gap-4", isMobileView ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4")}>
              {results.map((title) => (
                <Tile key={title.id} title={title} onClick={onTitleClick} />
              ))}
            </div>
          </>
        )
      ) : (
        <>
          <h2 className={cn("text-white font-medium tracking-wide mb-4", isMobileView ? "text-base" : "text-xl")}>
            Browse by Studio
          </h2>
          <div className={cn("grid gap-4 mb-8", isMobileView ? "grid-cols-2" : "grid-cols-3 lg:grid-cols-6")}>
            {BRANDS.map((brand) => (
              <button
                key={brand.id}
                onClick={() => handleBrandFilter(brand.id)}
                className="aspect-video rounded-[10px] overflow-hidden flex items-center justify-center transition-all hover:scale-[1.05] border border-white/10 hover:border-white/80"
                style={{
                  background: `linear-gradient(135deg, ${brand.tileColor} 0%, ${brand.accentColor} 100%)`,
                }}
              >
                <span className="text-white font-bold text-sm drop-shadow tracking-wide">{brand.name}</span>
              </button>
            ))}
          </div>

          <h2 className={cn("text-white font-medium tracking-wide mb-4", isMobileView ? "text-base" : "text-xl")}>
            Movies
          </h2>
          <div className={cn("grid gap-4 mb-8", isMobileView ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4")}>
            {getTitlesByType("movie").map((title) => (
              <Tile key={title.id} title={title} onClick={onTitleClick} />
            ))}
          </div>

          <h2 className={cn("text-white font-medium tracking-wide mb-4", isMobileView ? "text-base" : "text-xl")}>
            Series
          </h2>
          <div className={cn("grid gap-4", isMobileView ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4")}>
            {getTitlesByType("series").map((title) => (
              <Tile key={title.id} title={title} onClick={onTitleClick} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
