"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useWindowNavBehavior } from "@/lib/use-window-nav-behavior";
import { WindowControls } from "@/components/window-controls";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  Share,
  BookOpen,
  ExternalLink,
} from "lucide-react";

const DEFAULT_URL = "https://www.linkedin.com/in/james-b-mcfadden/";

interface SafariAppProps {
  isMobileView?: boolean;
  inShell?: boolean;
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return DEFAULT_URL;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed) && !trimmed.includes(" ")) {
    return `https://${trimmed}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}

function displayUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "") + u.pathname.replace(/\/$/, "") + (u.search || "");
  } catch {
    return url;
  }
}

function isLinkedInUrl(url: string) {
  return url.includes("linkedin.com");
}

export function SafariApp({ isMobileView = false, inShell = false }: SafariAppProps) {
  const nav = useWindowNavBehavior({ isDesktop: inShell, isMobile: isMobileView });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [currentUrl, setCurrentUrl] = useState(DEFAULT_URL);
  const [addressInput, setAddressInput] = useState(DEFAULT_URL);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([DEFAULT_URL]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  const navigate = useCallback((url: string, pushHistory = true) => {
    setIsLoading(!isLinkedInUrl(url));
    setCurrentUrl(url);
    setAddressInput(url);
    if (pushHistory) {
      setHistory((prev) => {
        const trimmed = prev.slice(0, historyIndex + 1);
        return [...trimmed, url];
      });
      setHistoryIndex((i) => i + 1);
    }
  }, [historyIndex]);

  const handleAddressSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const url = normalizeUrl(addressInput);
    navigate(url);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddressSubmit();
    if (e.key === "Escape") {
      setAddressInput(currentUrl);
      setIsEditing(false);
    }
  };

  const handleBack = () => {
    if (!canGoBack) return;
    const newIndex = historyIndex - 1;
    const url = history[newIndex];
    setHistoryIndex(newIndex);
    navigate(url, false);
  };

  const handleForward = () => {
    if (!canGoForward) return;
    const newIndex = historyIndex + 1;
    const url = history[newIndex];
    setHistoryIndex(newIndex);
    navigate(url, false);
  };

  const handleReload = () => {
    if (isLinkedInUrl(currentUrl)) return;
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
  };

  const showLinkedIn = isLinkedInUrl(currentUrl);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#F6F6F6] dark:bg-[#1E1E1E] select-none">
      {/* Title bar / toolbar — outer div is the drag zone */}
      <div
        className="flex-shrink-0 bg-[#ECECEC] dark:bg-[#2C2C2E] border-b border-[#C8C8C8] dark:border-[#3A3A3C]"
        style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.08)" }}
        onMouseDown={nav.inShell ? nav.onDragStart : undefined}
      >
        {/* Traffic lights row — no stopPropagation here so empty space in this row is draggable.
            handleDragStart already guards against .window-controls clicks internally. */}
        <div
          className={cn("flex items-center px-3", isMobileView ? "h-10" : "h-8")}
        >
          <WindowControls
            inShell={nav.inShell}
            showWhenNotInShell={true}
            onClose={nav.onClose}
            onMinimize={nav.onMinimize}
            onToggleMaximize={nav.onToggleMaximize}
          />
        </div>

        {/* Nav row — each interactive element stops propagation individually */}
        {!isMobileView && (
          <div className="flex items-center gap-1 px-3 pb-2">
            <button
              onClick={handleBack}
              disabled={!canGoBack}
              onMouseDown={(e) => e.stopPropagation()}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
                canGoBack ? "text-[#1C1C1E] dark:text-[#F2F2F7] can-hover:hover:bg-black/10 dark:can-hover:hover:bg-white/10" : "text-[#C7C7CC] dark:text-[#48484A]"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleForward}
              disabled={!canGoForward}
              onMouseDown={(e) => e.stopPropagation()}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
                canGoForward ? "text-[#1C1C1E] dark:text-[#F2F2F7] can-hover:hover:bg-black/10 dark:can-hover:hover:bg-white/10" : "text-[#C7C7CC] dark:text-[#48484A]"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <form
              onSubmit={handleAddressSubmit}
              className="flex-1 mx-2"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div
                className={cn(
                  "flex items-center h-7 rounded-md px-3 transition-all cursor-text",
                  isEditing
                    ? "bg-white dark:bg-[#3A3A3C] ring-2 ring-[#007AFF]/60 shadow-sm"
                    : "bg-white/70 dark:bg-white/10 can-hover:hover:bg-white/90 dark:can-hover:hover:bg-white/15 shadow-inner"
                )}
              >
                {isLoading ? (
                  <div className="w-3 h-3 rounded-full border-2 border-[#007AFF] border-t-transparent animate-spin mr-2 flex-shrink-0" />
                ) : (
                  <svg className="w-3 h-3 text-[#8E8E93] dark:text-[#636366] mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" strokeLinecap="round" />
                  </svg>
                )}
                <input
                  type="text"
                  value={isEditing ? addressInput : displayUrl(currentUrl)}
                  onChange={(e) => setAddressInput(e.target.value)}
                  onFocus={() => { setIsEditing(true); setAddressInput(currentUrl); }}
                  onBlur={() => { setIsEditing(false); setAddressInput(currentUrl); }}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-[13px] text-[#1C1C1E] dark:text-[#F2F2F7] text-center outline-none placeholder:text-[#8E8E93] dark:placeholder:text-[#636366] min-w-0"
                  placeholder="Search or enter website name"
                  spellCheck={false}
                  autoComplete="off"
                />
                {isEditing && addressInput && (
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); setAddressInput(""); }}
                    className="text-[#8E8E93] dark:text-[#636366] can-hover:hover:text-[#1C1C1E] dark:can-hover:hover:text-[#F2F2F7] transition-colors ml-1 flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            <button
              onClick={handleReload}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-7 h-7 flex items-center justify-center rounded-md text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors can-hover:hover:bg-black/10 dark:can-hover:hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => { try { navigator.clipboard.writeText(currentUrl); } catch {} }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-7 h-7 flex items-center justify-center rounded-md text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors can-hover:hover:bg-black/10 dark:can-hover:hover:bg-white/10"
              title="Copy link"
            >
              <Share className="w-4 h-4" />
            </button>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              className="w-7 h-7 flex items-center justify-center rounded-md text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors can-hover:hover:bg-black/10 dark:can-hover:hover:bg-white/10"
              title="Bookmarks"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Mobile toolbar */}
        {isMobileView && (
          <div className="flex items-center gap-1 px-2 pb-2" onMouseDown={(e) => e.stopPropagation()}>
            <button onClick={handleBack} disabled={!canGoBack} className={cn("w-8 h-8 flex items-center justify-center", canGoBack ? "text-[#007AFF]" : "text-[#C7C7CC] dark:text-[#48484A]")}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <form onSubmit={handleAddressSubmit} className="flex-1 mx-1">
              <input
                type="text"
                value={isEditing ? addressInput : displayUrl(currentUrl)}
                onChange={(e) => setAddressInput(e.target.value)}
                onFocus={() => { setIsEditing(true); setAddressInput(currentUrl); }}
                onBlur={() => { setIsEditing(false); setAddressInput(currentUrl); }}
                onKeyDown={handleKeyDown}
                className="w-full h-8 bg-white/80 dark:bg-white/10 rounded-md px-3 text-[13px] text-center text-[#1C1C1E] dark:text-[#F2F2F7] outline-none focus:ring-2 focus:ring-[#007AFF]/60"
                placeholder="Search or enter URL"
                spellCheck={false}
              />
            </form>
            <button onClick={handleForward} disabled={!canGoForward} className={cn("w-8 h-8 flex items-center justify-center", canGoForward ? "text-[#007AFF]" : "text-[#C7C7CC] dark:text-[#48484A]")}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0 relative bg-white dark:bg-[#1C1C1E]">
        {showLinkedIn ? (
          <LinkedInPage />
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-white dark:bg-[#1C1C1E] flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-[#007AFF] border-t-transparent animate-spin" />
                  <span className="text-sm text-[#8E8E93] dark:text-[#636366]">Loading…</span>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={currentUrl}
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              title="Safari Browser"
            />
          </>
        )}
      </div>
    </div>
  );
}

function LinkedInPage() {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="w-full h-full relative overflow-hidden bg-[#F3F2EF] cursor-pointer"
      onClick={() => window.open("https://www.linkedin.com/in/james-b-mcfadden/", "_blank")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{ filter: hovered ? "blur(2px)" : "blur(6px)", transform: "scale(1.04)" }}
      >
        <Image src="/linkedin-profile.png" alt="LinkedIn Profile" fill className="object-cover object-top" unoptimized />
      </div>
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{ background: hovered ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.35)" }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-[#0A66C2] flex items-center justify-center shadow-2xl">
          <svg viewBox="0 0 24 24" className="w-9 h-9 fill-white">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white text-xl font-semibold drop-shadow-lg">James McFadden</p>
          <p className="text-white/80 text-sm mt-1 drop-shadow">View LinkedIn Profile</p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-2.5 bg-[#0A66C2] text-white text-[14px] font-semibold rounded-full shadow-xl transition-all duration-200 can-hover:hover:bg-[#004182] can-hover:hover:scale-105"
          onClick={(e) => { e.stopPropagation(); window.open("https://www.linkedin.com/in/james-b-mcfadden/", "_blank"); }}
        >
          <ExternalLink className="w-4 h-4" />
          Open on LinkedIn
        </button>
      </div>
    </div>
  );
}
