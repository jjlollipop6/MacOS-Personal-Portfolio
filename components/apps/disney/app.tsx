"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useWindowFocus } from "@/lib/window-focus-context";
import { DisneyView, Title } from "./types";
import { BRANDS } from "./data/brands";
import { getTitleById } from "./data/titles";
import { Nav } from "./nav";
import { Header } from "./header";
import { HomeView, SearchView, WatchlistView, LibraryView, DetailView } from "./content-views";
import {
  loadDisneyState,
  saveDisneyState,
  loadDisneyWatchlist,
  saveDisneyWatchlist,
} from "@/lib/sidebar-persistence";

interface NavEntry {
  view: DisneyView;
  titleId: string | null;
  brandFilter?: string;
}

interface AppProps {
  isDesktop?: boolean;
}

export default function App({ isDesktop = false }: AppProps) {
  const windowFocus = useWindowFocus();
  void windowFocus;

  const [isMobileView, setIsMobileView] = useState(false);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [bgError, setBgError] = useState(false);

  const [navHistory, setNavHistory] = useState<NavEntry[]>(() => {
    const saved = loadDisneyState();
    return [{ view: saved.view, titleId: saved.titleId, brandFilter: saved.brandFilter }];
  });
  const [historyIndex, setHistoryIndex] = useState(0);

  const [watchlist, setWatchlist] = useState<string[]>(() => loadDisneyWatchlist());

  const current = navHistory[historyIndex];
  const activeView = current.view;
  const selectedTitleId = current.titleId;
  const brandFilter = current.brandFilter;

  useEffect(() => {
    setIsMobileView(!isDesktop);
    setIsLayoutReady(true);
  }, [isDesktop]);

  useEffect(() => {
    saveDisneyState(activeView, selectedTitleId, brandFilter);
  }, [activeView, selectedTitleId, brandFilter]);

  useEffect(() => {
    saveDisneyWatchlist(watchlist);
  }, [watchlist]);

  const pushEntry = useCallback(
    (entry: NavEntry) => {
      setNavHistory((prev) => [...prev.slice(0, historyIndex + 1), entry]);
      setHistoryIndex((i) => i + 1);
    },
    [historyIndex]
  );

  const handleViewSelect = useCallback(
    (view: DisneyView) => {
      if (view === activeView && !selectedTitleId && !brandFilter) return;
      pushEntry({ view, titleId: null });
    },
    [activeView, selectedTitleId, brandFilter, pushEntry]
  );

  const handleTitleClick = useCallback(
    (title: Title) => {
      pushEntry({ view: "detail", titleId: title.id });
    },
    [pushEntry]
  );

  const handleBrandClick = useCallback(
    (brandId: string) => {
      pushEntry({ view: "movies", titleId: null, brandFilter: brandId });
    },
    [pushEntry]
  );

  const handleBack = useCallback(() => {
    if (historyIndex <= 0) return;
    setHistoryIndex((i) => i - 1);
  }, [historyIndex]);

  const handleWatchlistToggle = useCallback((titleId: string) => {
    setWatchlist((prev) =>
      prev.includes(titleId) ? prev.filter((id) => id !== titleId) : [...prev, titleId]
    );
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [historyIndex]);

  const selectedTitle = selectedTitleId ? getTitleById(selectedTitleId) : null;
  const isDetailView = activeView === "detail" && !!selectedTitle;

  if (!isLayoutReady) return <div className="h-full w-full bg-[#040714]" />;

  const renderContent = () => {
    if (activeView === "detail" && selectedTitle) {
      return (
        <DetailView
          title={selectedTitle}
          watchlist={watchlist}
          onBack={handleBack}
          onTitleClick={handleTitleClick}
          onWatchlistToggle={handleWatchlistToggle}
          isMobileView={isMobileView}
        />
      );
    }
    if (activeView === "search") {
      return (
        <SearchView
          watchlist={watchlist}
          onTitleClick={handleTitleClick}
          onWatchlistToggle={handleWatchlistToggle}
          isMobileView={isMobileView}
        />
      );
    }
    if (activeView === "watchlist") {
      return (
        <WatchlistView
          watchlist={watchlist}
          onTitleClick={handleTitleClick}
          onWatchlistToggle={handleWatchlistToggle}
          isMobileView={isMobileView}
        />
      );
    }
    if (activeView === "movies" || activeView === "series" || activeView === "originals") {
      return (
        <LibraryView
          view={activeView}
          brandFilter={brandFilter}
          onTitleClick={handleTitleClick}
          isMobileView={isMobileView}
        />
      );
    }
    return (
      <HomeView
        brands={BRANDS}
        onTitleClick={handleTitleClick}
        onBrandClick={handleBrandClick}
        isMobileView={isMobileView}
      />
    );
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#040714] text-white overflow-hidden relative">
      {/* Background — absolute so it's clipped by the window's rounded corners */}
      {!isDetailView && (
        <div className="absolute inset-0 -z-10 pointer-events-none">
          {!bgError ? (
            <Image
              src="/disney/home-background.png"
              alt=""
              fill
              className="object-cover"
              unoptimized
              onError={() => setBgError(true)}
              priority
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 110% 70% at 50% 0%, #1a1f3a 0%, #0a1024 45%, #040714 100%)",
              }}
            />
          )}
          {/* Vignette / cinematic veil */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#040714]/30 to-[#040714]/80 pointer-events-none" />
        </div>
      )}

      {/* macOS window controls + drag handle */}
      <Nav isMobileView={isMobileView} isDesktop={isDesktop} transparent={isDetailView} />

      {/* Disney+ nav header — lives in the flex column so it is always flush at the top */}
      <Header
        activeView={activeView}
        onViewSelect={handleViewSelect}
        isMobileView={isMobileView}
        isDetailView={isDetailView}
      />

      {/* Scroll container */}
      <div ref={scrollContainerRef} className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {/* View body */}
        <main className={cn("relative z-10", !isDetailView && (isMobileView ? "py-4" : "py-6"))}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
