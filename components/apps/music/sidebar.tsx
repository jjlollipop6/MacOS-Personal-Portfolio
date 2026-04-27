"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MusicView, Playlist } from "./types";
import { Search, Home, ListMusic, Plus, Trash2 } from "lucide-react";

interface SidebarProps {
  children: React.ReactNode;
  playlists: Playlist[];
  activeView: MusicView;
  selectedPlaylistId: string | null;
  onViewSelect: (view: MusicView, playlistId?: string) => void;
  onCreatePlaylist: () => void;
  onDeletePlaylist: (id: string) => void;
  isMobileView: boolean;
  onScroll?: (isScrolled: boolean) => void;
}

export function Sidebar({
  children,
  playlists,
  activeView,
  selectedPlaylistId,
  onViewSelect,
  onCreatePlaylist,
  onDeletePlaylist,
  isMobileView,
  onScroll,
}: SidebarProps) {
  const [hoveredPlaylist, setHoveredPlaylist] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "flex flex-col h-full",
        isMobileView ? "bg-background" : "bg-[#000000]"
      )}
    >
      {children}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea
          className="h-full"
          bottomMargin="0"
          onScrollCapture={(e) => {
            const target = e.target as HTMLElement;
            onScroll?.(target.scrollTop > 0);
          }}
        >
          <div className={cn("px-2 py-2", isMobileView ? "w-full" : "w-[220px]")}>
            {/* Main nav */}
            <div className="mb-6">
              <SidebarItem
                icon={<Home className="w-[22px] h-[22px]" />}
                label="Home"
                isActive={activeView === "home"}
                onClick={() => onViewSelect("home")}
                isMobileView={isMobileView}
              />
              <SidebarItem
                icon={<Search className="w-[22px] h-[22px]" />}
                label="Search"
                isActive={activeView === "search"}
                onClick={() => onViewSelect("search")}
                isMobileView={isMobileView}
              />
            </div>

            {/* Your Library */}
            <div className="bg-[#121212] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 pt-3 pb-2">
                <button
                  onClick={() => onViewSelect("home")}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <ListMusic className="w-[22px] h-[22px]" />
                  <span className="text-sm font-bold">Your Library</span>
                </button>
                <button
                  onClick={onCreatePlaylist}
                  className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  title="Create playlist"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="pb-2">
                {playlists.length === 0 ? (
                  <div className="px-3 py-4">
                    <p className="text-sm font-semibold text-white mb-1">
                      Create your first playlist
                    </p>
                    <p className="text-xs text-zinc-400 mb-3">
                      It&apos;s easy, we&apos;ll help you
                    </p>
                    <button
                      onClick={onCreatePlaylist}
                      className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:scale-[1.04] transition-transform"
                    >
                      Create playlist
                    </button>
                  </div>
                ) : (
                  playlists.map((playlist) => {
                    const isActive =
                      activeView === "playlist" &&
                      selectedPlaylistId === playlist.id;
                    const isHovered = hoveredPlaylist === playlist.id;

                    return (
                      <div
                        key={playlist.id}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors group rounded-md mx-1",
                          isActive ? "bg-[#282828]" : "hover:bg-[#1a1a1a]"
                        )}
                        onClick={() => onViewSelect("playlist", playlist.id)}
                        onMouseEnter={() => setHoveredPlaylist(playlist.id)}
                        onMouseLeave={() => setHoveredPlaylist(null)}
                      >
                        <div className="w-10 h-10 rounded bg-[#282828] flex items-center justify-center flex-shrink-0">
                          <ListMusic className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-medium truncate",
                              isActive ? "text-white" : "text-zinc-300"
                            )}
                          >
                            {playlist.name}
                          </p>
                          <p className="text-xs text-zinc-500 truncate">
                            Playlist · {playlist.tracks.length} songs
                          </p>
                        </div>
                        {isHovered && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePlaylist(playlist.id);
                            }}
                            className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-red-400 transition-colors flex-shrink-0"
                            title="Delete playlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  isActive,
  onClick,
  isMobileView,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isMobileView: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-bold transition-colors text-left",
        isActive
          ? "text-white"
          : isMobileView
          ? "text-foreground hover:text-foreground/80"
          : "text-zinc-400 hover:text-white",
        isMobileView && "py-3"
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
