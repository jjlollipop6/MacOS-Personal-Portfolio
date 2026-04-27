"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAudio } from "@/lib/music/audio-context";
import { useWindowFocus } from "@/lib/window-focus-context";
import { usePlaylists } from "@/lib/music/use-playlists";
import { loadMusicState, saveMusicState } from "@/lib/sidebar-persistence";
import { MusicView, PlaylistTrack } from "./types";
import { Sidebar } from "./sidebar";
import { Nav } from "./nav";
import { NowPlayingBar } from "./now-playing-bar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HomeView, PlaylistView, SearchView } from "./content-views";

interface NavEntry {
  view: MusicView;
  playlistId: string | null;
}

interface AppProps {
  isDesktop?: boolean;
}

const getInitialState = () => {
  const saved = loadMusicState();
  return {
    view: saved.view,
    playlistId: saved.playlistId,
    showContent: saved.view !== "home",
  };
};

export default function App({ isDesktop = false }: AppProps) {
  const { playbackState, pause, resume, next, previous } = useAudio();
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
  } = usePlaylists();

  const [initialState] = useState(getInitialState);
  const [activeView, setActiveView] = useState<MusicView>(initialState.view);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    initialState.playlistId
  );
  const [isMobileView, setIsMobileView] = useState(false);
  const [isLayoutInitialized, setIsLayoutInitialized] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showContent, setShowContent] = useState(initialState.showContent);

  // Navigation history (Spotify-style back/forward)
  const [navHistory, setNavHistory] = useState<NavEntry[]>([
    { view: initialState.view, playlistId: initialState.playlistId },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const windowFocus = useWindowFocus();
  const inShell = !!(isDesktop && windowFocus);

  useEffect(() => {
    setIsMobileView(!isDesktop);
    setIsLayoutInitialized(true);
  }, [isDesktop]);

  useEffect(() => {
    saveMusicState(activeView, selectedPlaylistId);
  }, [activeView, selectedPlaylistId]);

  const applyNavEntry = useCallback((entry: NavEntry) => {
    setActiveView(entry.view);
    setSelectedPlaylistId(entry.playlistId);
    setShowContent(entry.view !== "home");
  }, []);

  const goBack = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    applyNavEntry(navHistory[newIndex]);
  }, [historyIndex, navHistory, applyNavEntry]);

  const goForward = useCallback(() => {
    if (historyIndex >= navHistory.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    applyNavEntry(navHistory[newIndex]);
  }, [historyIndex, navHistory, applyNavEntry]);

  const handleViewSelect = useCallback(
    (view: MusicView, playlistId?: string) => {
      const entry: NavEntry = {
        view,
        playlistId: view === "playlist" && playlistId ? playlistId : null,
      };
      setNavHistory((prev) => {
        const trimmed = prev.slice(0, historyIndex + 1);
        return [...trimmed, entry];
      });
      setHistoryIndex((prev) => prev + 1);
      applyNavEntry(entry);
    },
    [historyIndex, applyNavEntry]
  );

  const handleBack = useCallback(() => setShowContent(false), []);

  const handleCreatePlaylist = useCallback(() => {
    const name = `My Playlist #${playlists.length + 1}`;
    createPlaylist(name);
  }, [playlists.length, createPlaylist]);

  const handleDeletePlaylist = useCallback(
    (id: string) => {
      deletePlaylist(id);
      if (selectedPlaylistId === id) {
        setActiveView("home");
        setSelectedPlaylistId(null);
      }
    },
    [deletePlaylist, selectedPlaylistId]
  );

  const handleAddToPlaylist = useCallback(
    (playlistId: string, track: PlaylistTrack) => {
      addTrackToPlaylist(playlistId, track);
    },
    [addTrackToPlaylist]
  );

  const handleRemoveFromPlaylist = useCallback(
    (trackId: string) => {
      if (!selectedPlaylistId) return;
      removeTrackFromPlaylist(selectedPlaylistId, trackId);
    },
    [selectedPlaylistId, removeTrackFromPlaylist]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inShell && windowFocus && !windowFocus.isFocused) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          playbackState.isPlaying ? pause() : resume();
          break;
        case "ArrowRight":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            next();
          }
          break;
        case "ArrowLeft":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            previous();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inShell, windowFocus, playbackState.isPlaying, pause, resume, next, previous]);

  const selectedPlaylist = selectedPlaylistId
    ? playlists.find((p) => p.id === selectedPlaylistId)
    : null;

  if (!isLayoutInitialized) {
    return <div className="h-full bg-[#121212]" />;
  }

  const showSidebar = !isMobileView || !showContent;
  const showMainContent = !isMobileView || showContent;
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < navHistory.length - 1;

  const renderContent = () => {
    switch (activeView) {
      case "home":
        return (
          <HomeView
            playlists={playlists}
            onPlaylistSelect={(id) => handleViewSelect("playlist", id)}
            isMobileView={isMobileView}
          />
        );
      case "search":
        return (
          <SearchView
            isMobileView={isMobileView}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
          />
        );
      case "playlist":
        return selectedPlaylist ? (
          <PlaylistView
            playlist={selectedPlaylist}
            isMobileView={isMobileView}
            onRemoveTrack={handleRemoveFromPlaylist}
            onRename={(name) => renamePlaylist(selectedPlaylist.id, name)}
          />
        ) : (
          <HomeView
            playlists={playlists}
            onPlaylistSelect={(id) => handleViewSelect("playlist", id)}
            isMobileView={isMobileView}
          />
        );
      default:
        return (
          <HomeView
            playlists={playlists}
            onPlaylistSelect={(id) => handleViewSelect("playlist", id)}
            isMobileView={isMobileView}
          />
        );
    }
  };

  return (
    <div
      ref={containerRef}
      data-app="spotify"
      tabIndex={-1}
      onMouseDown={() => containerRef.current?.focus()}
      className="music-app h-full flex flex-col bg-[#121212] text-white outline-none overflow-hidden"
    >
      <main className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            "h-full flex-shrink-0 overflow-hidden",
            showSidebar
              ? isMobileView
                ? "block w-full"
                : "block w-[240px]"
              : "hidden"
          )}
        >
          <Sidebar
            playlists={playlists}
            activeView={activeView}
            selectedPlaylistId={selectedPlaylistId}
            onViewSelect={handleViewSelect}
            onCreatePlaylist={handleCreatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            isMobileView={isMobileView}
            onScroll={setIsScrolled}
          >
            <Nav
              isMobileView={isMobileView}
              isScrolled={isScrolled}
              isDesktop={isDesktop}
            />
          </Sidebar>
        </div>

        {/* Main Content */}
        <div
          className={cn(
            "flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden relative",
            showMainContent ? "flex" : "hidden"
          )}
        >
          {/* Desktop top bar: draggable + back/forward nav */}
          {!isMobileView && (
            <div
              className="flex-shrink-0 flex items-center px-4 h-[52px] bg-[#121212] z-10 select-none"
              onMouseDown={
                inShell && windowFocus ? windowFocus.onDragStart : undefined
              }
            >
              <div
                className="flex items-center gap-2"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <button
                  onClick={goBack}
                  disabled={!canGoBack}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                    canGoBack
                      ? "bg-black/60 hover:bg-black/80 text-white cursor-pointer"
                      : "bg-black/30 text-white/25 cursor-not-allowed"
                  )}
                  aria-label="Go back"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goForward}
                  disabled={!canGoForward}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                    canGoForward
                      ? "bg-black/60 hover:bg-black/80 text-white cursor-pointer"
                      : "bg-black/30 text-white/25 cursor-not-allowed"
                  )}
                  aria-label="Go forward"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Mobile back button */}
          {isMobileView && (
            <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0 select-none bg-[#121212]">
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </main>

      <NowPlayingBar isMobileView={isMobileView} />
    </div>
  );
}
