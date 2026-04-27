"use client";

import { cn } from "@/lib/utils";
import { DisneyView } from "./types";
import { Home, Search, Plus, Star, Film, Tv } from "lucide-react";

interface NavItem {
  id: DisneyView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "HOME", icon: Home },
  { id: "search", label: "SEARCH", icon: Search },
  { id: "watchlist", label: "WATCHLIST", icon: Plus },
  { id: "originals", label: "ORIGINALS", icon: Star },
  { id: "movies", label: "MOVIES", icon: Film },
  { id: "series", label: "SERIES", icon: Tv },
];

interface HeaderProps {
  activeView: DisneyView;
  onViewSelect: (view: DisneyView) => void;
  isMobileView: boolean;
  isDetailView?: boolean;
}

export function Header({ activeView, onViewSelect, isMobileView, isDetailView = false }: HeaderProps) {
  return (
    <header
      className={cn(
        "relative z-30 w-full transition-colors duration-300",
        isMobileView ? "h-12 px-3" : "h-[70px] px-9",
        isDetailView
          ? "bg-transparent border-none"
          : "bg-[#090b13]/95 backdrop-blur-sm border-b border-white/5"
      )}
    >
      {/* Three-column layout: logo | centered nav | avatar */}
      <div className="relative flex items-center h-full">
        {/* Logo — left */}
        <button
          onClick={() => onViewSelect("home")}
          className="flex items-center select-none flex-shrink-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/disney-logo.svg"
            alt="Disney+"
            style={{ filter: "brightness(0) invert(1)", width: isMobileView ? 72 : 96, height: "auto" }}
          />
        </button>

        {/* Nav links — absolutely centered in the full header width */}
        <nav
          className={cn(
            "absolute left-1/2 -translate-x-1/2 flex items-center",
            isMobileView ? "gap-0" : "gap-1"
          )}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewSelect(item.id)}
                className={cn(
                  "group relative flex items-center gap-1.5 transition-colors flex-shrink-0",
                  isMobileView ? "px-2 py-2" : "px-3 py-2",
                  isActive ? "text-white" : "text-white/85 hover:text-white"
                )}
              >
                <Icon className={cn("flex-shrink-0", isMobileView ? "w-4 h-4" : "w-[18px] h-[18px]")} />
                {!isMobileView && (
                  <>
                    <span className="text-[13px] font-medium tracking-wider">{item.label}</span>
                    <span
                      className={cn(
                        "absolute left-3 right-3 -bottom-0.5 h-[2px] bg-white origin-left transition-transform duration-300",
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      )}
                    />
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Avatar — right */}
        {!isMobileView && (
          <div className="ml-auto flex-shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-white/60 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/stitch.webp" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
