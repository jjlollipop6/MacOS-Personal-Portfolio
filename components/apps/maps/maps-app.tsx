"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { useWindowNavBehavior } from "@/lib/use-window-nav-behavior";
import { WindowControls } from "@/components/window-controls";
import type { MapHandle } from "./leaf-map";

const LeafMap = dynamic(
  () => import("./leaf-map").then((m) => m.LeafMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#E8EFEE]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Loading Map…</span>
        </div>
      </div>
    ),
  }
);

interface MapsAppProps {
  isMobile?: boolean;
  inShell?: boolean;
}

export function MapsApp({ isMobile = false, inShell = false }: MapsAppProps) {
  const nav = useWindowNavBehavior({ isDesktop: inShell, isMobile });
  const [searchQuery, setSearchQuery] = useState("");
  const [mapType, setMapType] = useState<"standard" | "transit" | "satellite">("transit");
  const [showMapTypeMenu, setShowMapTypeMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const mapHandleRef = useRef<MapHandle | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) setShowSearchResults(true);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#E8EFEE] relative">
      {/* Apple Maps top bar */}
      <div
        className="flex-shrink-0 bg-[#F2F2F7]/95 backdrop-blur-xl border-b border-black/10 z-20"
        onMouseDown={nav.inShell ? nav.onDragStart : undefined}
      >
        {/* Traffic lights row */}
        <div
          className="flex items-center h-8 px-3"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <WindowControls
            inShell={nav.inShell}
            showWhenNotInShell={true}
            onClose={nav.onClose}
            onMinimize={nav.onMinimize}
            onToggleMaximize={nav.onToggleMaximize}
            isMaximized={nav.isMaximized}
          />
        </div>

        {/* Search bar row */}
        <div className="flex items-center gap-2 px-3 pb-2" onMouseDown={(e) => e.stopPropagation()}>
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-gray-400">
                  <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M9 9L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(false); }}
                placeholder="Search for a place or address"
                className="w-full h-[34px] bg-white/70 rounded-[10px] pl-8 pr-4 text-[13px] text-gray-800 placeholder:text-gray-400 outline-none border border-black/8 focus:bg-white focus:border-[#007AFF]/40 transition-all shadow-sm"
              />
            </div>
          </form>

          {/* Map type picker */}
          <div className="relative">
            <button
              onClick={() => setShowMapTypeMenu(!showMapTypeMenu)}
              className="flex items-center justify-center w-[34px] h-[34px] bg-white/70 border border-black/10 rounded-[10px] hover:bg-white transition-colors shadow-sm"
              title="Map Type"
            >
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <path d="M8.5 2L1 6L8.5 10L16 6L8.5 2Z" stroke="#555" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
                <path d="M1 10L8.5 14L16 10" stroke="#555" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </button>
            {showMapTypeMenu && (
              <div className="absolute right-0 top-10 w-44 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-black/8 overflow-hidden z-50">
                <div className="p-1.5">
                  {(["transit", "standard", "satellite"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => { setMapType(type); setShowMapTypeMenu(false); }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] transition-colors",
                        mapType === type
                          ? "bg-[#007AFF] text-white"
                          : "text-gray-800 hover:bg-gray-100"
                      )}
                    >
                      <span className="font-medium">
                        {type === "transit" ? "Transit" : type === "satellite" ? "Satellite" : "Standard"}
                      </span>
                      {mapType === type && (
                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                          <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location chip */}
        <div className="flex items-center gap-2 px-3 pb-2" onMouseDown={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5 bg-[#007AFF] text-white px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <rect x="1" y="3.5" width="9" height="5" rx="1.5" fill="white" opacity="0.9"/>
              <rect x="3.5" y="1.5" width="4" height="3" rx="0.5" fill="white" opacity="0.9"/>
              <circle cx="3" cy="9" r="1" fill="white"/>
              <circle cx="8" cy="9" r="1" fill="white"/>
            </svg>
            Transit
          </div>
          <span className="text-[12px] text-gray-500 font-medium">The Loop · Chicago, IL</span>
        </div>
      </div>

      {/* Search results dropdown */}
      {showSearchResults && searchQuery && (
        <div className="absolute top-[130px] left-3 right-3 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-black/8 overflow-hidden z-30">
          <div className="p-1.5">
            <button
              onClick={() => setShowSearchResults(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-9 h-9 bg-[#FF3B30] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg width="14" height="18" viewBox="0 0 14 18" fill="white">
                  <path d="M7 0C3.13 0 0 3.13 0 7C0 12.25 7 18 7 18C7 18 14 12.25 14 7C14 3.13 10.87 0 7 0Z"/>
                  <circle cx="7" cy="7" r="3" fill="white" fillOpacity="0.8"/>
                </svg>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-gray-800">{searchQuery}</div>
                <div className="text-[12px] text-gray-500">The Loop, Chicago, IL</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Map */}
      <div
        className="flex-1 relative min-h-0"
        onClick={() => { setShowMapTypeMenu(false); setShowSearchResults(false); }}
      >
        <LeafMap mapType={mapType} onReady={(h) => { mapHandleRef.current = h; }} />

        {/* Map controls (top right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-[400]">
          {/* Compass */}
          <button className="w-[36px] h-[36px] bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors border border-black/8">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="#C7C7CC" strokeWidth="1" fill="white"/>
              <polygon points="10,2.5 11.2,10 10,9 8.8,10" fill="#FF3B30"/>
              <polygon points="10,17.5 11.2,10 10,11 8.8,10" fill="#8E8E93"/>
              <circle cx="10" cy="10" r="1.5" fill="#1C1C1E"/>
            </svg>
          </button>

          {/* Zoom +/- */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-black/8">
            <button
              className="w-[36px] h-[36px] flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors border-b border-black/8 text-gray-700 font-light text-xl leading-none"
              onClick={(e) => { e.stopPropagation(); mapHandleRef.current?.zoomIn(); }}
            >
              +
            </button>
            <button
              className="w-[36px] h-[36px] flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-700 font-light text-xl leading-none"
              onClick={(e) => { e.stopPropagation(); mapHandleRef.current?.zoomOut(); }}
            >
              −
            </button>
          </div>

          {/* 3D button */}
          <button className="w-[36px] h-[36px] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center hover:bg-white transition-colors border border-black/8">
            <span className="text-[11px] font-bold text-gray-600 tracking-tight">3D</span>
          </button>
        </div>

        {/* CTA transit legend (bottom left) */}
        {mapType !== "satellite" && (
          <div className="absolute bottom-3 left-3 z-[400]">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-black/8 p-2.5 flex flex-col gap-1.5">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">CTA Lines</div>
              {[
                { color: "#C60C30", label: "Red / Loop" },
                { color: "#00A1DE", label: "Blue" },
                { color: "#009B3A", label: "Green" },
                { color: "#F9461C", label: "Orange" },
                { color: "#E27EA6", label: "Pink" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[11px] text-gray-700 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="flex-shrink-0 bg-[#F2F2F7]/95 backdrop-blur-xl border-t border-black/10 z-20">
        <div className="flex items-center justify-around py-1.5 px-4">
          <button className="flex flex-col items-center gap-0.5 px-3 py-1.5 hover:bg-black/5 rounded-xl transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17L3 11L9 5" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 11H14C15.66 11 17 9.66 17 8V4" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-[11px] font-medium text-[#007AFF]">Directions</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 px-3 py-1.5 hover:bg-black/5 rounded-xl transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="3" fill="#007AFF"/>
              <circle cx="10" cy="10" r="6" stroke="#007AFF" strokeWidth="1.5" fill="none" opacity="0.4"/>
              <path d="M10 1V4M10 16V19M1 10H4M16 10H19" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="text-[11px] font-medium text-[#007AFF]">My Location</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 px-3 py-1.5 hover:bg-black/5 rounded-xl transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8.5" stroke="#007AFF" strokeWidth="1.5"/>
              <path d="M10 9V14" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="10" cy="6.5" r="1" fill="#007AFF"/>
            </svg>
            <span className="text-[11px] font-medium text-[#007AFF]">Information</span>
          </button>
        </div>
      </div>

      {/* Click outside overlay */}
      {(showMapTypeMenu || showSearchResults) && (
        <div
          className="absolute inset-0 z-20"
          onClick={() => { setShowMapTypeMenu(false); setShowSearchResults(false); }}
        />
      )}
    </div>
  );
}
