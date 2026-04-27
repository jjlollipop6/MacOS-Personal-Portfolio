"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Search, X, Play, Pause, Loader2, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudio } from "@/lib/music/audio-context";
import { PlaylistTrack, Playlist } from "../types";
import { formatDuration } from "@/lib/music/utils";

const GENRES = [
  { label: "Pop",        color: "#E8115B", id: 132 },
  { label: "Hip-Hop",   color: "#8D67AB", id: 116 },
  { label: "Rock",      color: "#E61E32", id: 152 },
  { label: "Electronic",color: "#0D73EC", id: 106 },
  { label: "R&B",       color: "#E91429", id: 165 },
  { label: "Latin",     color: "#27856A", id: 197 },
  { label: "Indie",     color: "#477D95", id: 85  },
  { label: "Jazz",      color: "#BA5D07", id: 129 },
  { label: "Country",   color: "#DC148C", id: 84  },
  { label: "Classical", color: "#006450", id: 98  },
  { label: "Dance",     color: "#8C1932", id: 113 },
  { label: "Metal",     color: "#509BF5", id: 464 },
  { label: "Reggae",    color: "#1E3264", id: 144 },
  { label: "Soul",      color: "#BA5D07", id: 169 },
];

interface SearchViewProps {
  isMobileView: boolean;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, track: PlaylistTrack) => void;
}

export function SearchView({ isMobileView, playlists, onAddToPlaylist }: SearchViewProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaylistTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [addMenuTrackId, setAddMenuTrackId] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const { playbackState, play, pause, resume } = useAudio();

  useEffect(() => {
    const close = () => setAddMenuTrackId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const fetchGenre = useCallback(async (genreId: number, label: string) => {
    setIsLoading(true);
    setHasSearched(true);
    setQuery(label);
    try {
      const res = await fetch(`/api/music/deezer?action=genre&id=${genreId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(data.tracks ?? []);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchTracks = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(
        `/api/music/deezer?action=search&q=${encodeURIComponent(term)}`
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      const tracks: PlaylistTrack[] = data.tracks ?? [];
      setResults(tracks);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchTracks(val), 400);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handlePlay = (track: PlaylistTrack) => {
    if (playbackState.currentTrack?.id === track.id) {
      playbackState.isPlaying ? pause() : resume();
      return;
    }
    play(track, results);
  };

  const handleAddToPlaylist = (e: React.MouseEvent, track: PlaylistTrack, playlistId: string) => {
    e.stopPropagation();
    onAddToPlaylist(playlistId, track);
    setRecentlyAdded((prev) => ({ ...prev, [track.id]: playlistId }));
    setTimeout(() => {
      setRecentlyAdded((prev) => {
        const next = { ...prev };
        delete next[track.id];
        return next;
      });
    }, 2000);
    setAddMenuTrackId(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#121212]">
      {/* Search input */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="What do you want to listen to?"
            autoFocus
            className="w-full h-10 bg-white rounded-full pl-9 pr-9 text-sm text-black placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-white/20"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#1DB954] animate-spin" />
          </div>
        )}

        {/* No results */}
        {!isLoading && hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-base font-semibold text-white mb-1">
              No results found for &ldquo;{query}&rdquo;
            </p>
            <p className="text-sm text-zinc-400">
              Check the spelling, or search for something else.
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="px-2 pb-4">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2 py-2">
              Songs
            </p>
            {results.map((track) => {
              const isCurrent = playbackState.currentTrack?.id === track.id;
              const trackIsPlaying = isCurrent && playbackState.isPlaying;
              const wasAdded = !!recentlyAdded[track.id];

              return (
                <div
                  key={track.id}
                  className={cn(
                    "group flex items-center gap-3 px-2 py-2 rounded-md transition-colors",
                    isCurrent ? "bg-white/10" : "hover:bg-white/10"
                  )}
                >
                  {/* Album art */}
                  <button
                    onClick={() => handlePlay(track)}
                    className="relative flex-shrink-0 w-10 h-10 rounded overflow-hidden bg-zinc-800"
                  >
                    {track.albumArt ? (
                      <Image
                        src={track.albumArt}
                        alt={track.name}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                        <Play className="w-4 h-4 text-zinc-400" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity",
                        isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}
                    >
                      {trackIsPlaying ? (
                        <Pause className="w-4 h-4 text-white fill-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                      )}
                    </div>
                  </button>

                  {/* Track info */}
                  <button onClick={() => handlePlay(track)} className="flex-1 min-w-0 text-left">
                    <p className={cn("text-sm font-medium truncate", isCurrent ? "text-[#1DB954]" : "text-white")}>
                      {track.name}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                  </button>

                  <span className="text-xs text-zinc-400 tabular-nums flex-shrink-0">
                    {formatDuration(track.duration)}
                  </span>

                  {/* Add to playlist */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                        setAddMenuTrackId(addMenuTrackId === track.id ? null : track.id);
                      }}
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                        wasAdded
                          ? "text-[#1DB954]"
                          : "text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100"
                      )}
                    >
                      {wasAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>

                    {addMenuTrackId === track.id && (
                      <div
                        className="absolute right-0 bottom-8 w-52 bg-[#282828] rounded-md shadow-xl border border-white/10 z-50 overflow-hidden"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();
                        }}
                      >
                        <p className="text-xs text-zinc-400 px-3 py-2 border-b border-white/10 font-semibold uppercase tracking-wider">
                          Add to playlist
                        </p>
                        <div className="max-h-48 overflow-y-auto">
                          {playlists.length === 0 ? (
                            <p className="px-3 py-3 text-sm text-zinc-500">
                              Create a playlist first using the + in Your Library.
                            </p>
                          ) : (
                            playlists.map((pl) => (
                              <button
                                key={pl.id}
                                onClick={(e) => handleAddToPlaylist(e, track, pl.id)}
                                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors truncate"
                              >
                                {pl.name}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Browse genres */}
        {!hasSearched && !isLoading && (
          <div className="px-4 pb-4">
            <p className="text-base font-bold text-white mb-4">Browse all</p>
            <div className="grid grid-cols-2 gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre.label}
                  onClick={() => fetchGenre(genre.id, genre.label)}
                  className="relative h-16 rounded-lg overflow-hidden text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: genre.color }}
                >
                  <span className="absolute bottom-2 left-3">
                    <span className="text-sm font-bold text-white drop-shadow">
                      {genre.label}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
