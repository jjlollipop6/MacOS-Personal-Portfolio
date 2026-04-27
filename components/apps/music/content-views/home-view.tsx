"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Playlist, PlaylistTrack } from "../types";
import { useAudio } from "@/lib/music/audio-context";
import { Play, Pause, Loader2, Music2 } from "lucide-react";

interface HomeViewProps {
  playlists: Playlist[];
  onPlaylistSelect: (playlistId: string) => void;
  isMobileView: boolean;
}

interface Section {
  title: string;
  tracks: PlaylistTrack[];
}

export function HomeView({ playlists, onPlaylistSelect, isMobileView }: HomeViewProps) {
  const { playbackState, play, pause } = useAudio();
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/music/deezer?action=trending")
      .then((r) => r.json())
      .then((data) => {
        const tracks: PlaylistTrack[] = data.tracks ?? [];

        setSections([
          { title: "Trending Now", tracks: tracks.slice(0, 8) },
          { title: "Popular This Week", tracks: tracks.slice(4, 12) },
          { title: "Fresh Picks", tracks: tracks.slice(8, 16) },
        ]);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handlePlay = (track: PlaylistTrack, queue: PlaylistTrack[]) => {
    if (playbackState.currentTrack?.id === track.id && playbackState.isPlaying) {
      pause();
    } else {
      play(track, queue);
    }
  };

  const handlePlayPlaylist = (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    const isPlayingThis =
      playbackState.isPlaying &&
      playlist.tracks.some((t) => t.id === playbackState.currentTrack?.id);
    if (isPlayingThis) {
      pause();
    } else {
      onPlaylistSelect(playlist.id);
      const first = playlist.tracks.find((t) => t.previewUrl);
      if (first) play(first, playlist.tracks);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden" style={{ background: "linear-gradient(180deg, #1f1f1f 0%, #121212 300px)" }}>
      <div className={cn("px-6 pb-8", isMobileView && "px-4 pb-20")}>
        {/* Greeting header */}
        <div className="pt-6 pb-5">
          <h1 className="text-2xl font-bold text-white">{getGreeting()}</h1>
        </div>

        {/* Quick-access playlist grid */}
        {playlists.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-2">
              {playlists.slice(0, 6).map((playlist) => {
                const isPlayingThis =
                  playbackState.isPlaying &&
                  playlist.tracks.some(
                    (t) => t.id === playbackState.currentTrack?.id
                  );
                return (
                  <button
                    key={playlist.id}
                    onClick={() => onPlaylistSelect(playlist.id)}
                    className="group relative flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-md overflow-hidden transition-all duration-200 text-left h-[52px]"
                  >
                    <div className="w-[52px] h-[52px] flex-shrink-0 bg-zinc-700 flex items-center justify-center overflow-hidden">
                      {playlist.tracks[0]?.albumArt ? (
                        <Image
                          src={playlist.tracks[0].albumArt}
                          alt={playlist.name}
                          width={52}
                          height={52}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      ) : (
                        <Music2 className="w-5 h-5 text-zinc-400" />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-white truncate flex-1 pr-2">
                      {playlist.name}
                    </span>
                    {/* Play button */}
                    <button
                      onClick={(e) => handlePlayPlaylist(playlist, e)}
                      className="absolute right-3 w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-lg flex-shrink-0"
                    >
                      {isPlayingThis ? (
                        <Pause className="w-4 h-4 text-black fill-black" />
                      ) : (
                        <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                      )}
                    </button>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Trending sections */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#1DB954] animate-spin" />
          </div>
        ) : (
          sections.map((section) => (
            <TrackSection
              key={section.title}
              title={section.title}
              tracks={section.tracks}
              onPlay={handlePlay}
              currentTrackId={playbackState.currentTrack?.id ?? null}
              isPlaying={playbackState.isPlaying}
              isMobileView={isMobileView}
            />
          ))
        )}

        {/* Empty state */}
        {playlists.length === 0 && !isLoading && sections.every((s) => s.tracks.length === 0) && (
          <div className="bg-[#181818] rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Music2 className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-white font-semibold mb-1">Start listening</p>
            <p className="text-sm text-zinc-400">Search for songs and create playlists</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TrackSection({
  title,
  tracks,
  onPlay,
  currentTrackId,
  isPlaying,
  isMobileView,
}: {
  title: string;
  tracks: PlaylistTrack[];
  onPlay: (track: PlaylistTrack, queue: PlaylistTrack[]) => void;
  currentTrackId: string | null;
  isPlaying: boolean;
  isMobileView: boolean;
}) {
  if (tracks.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <button className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
          Show all
        </button>
      </div>

      <div className={cn("grid gap-4", isMobileView ? "grid-cols-2" : "grid-cols-4")}>
        {tracks.slice(0, isMobileView ? 4 : 4).map((track) => {
          const isCurrent = currentTrackId === track.id;
          const trackIsPlaying = isCurrent && isPlaying;

          return (
            <button
              key={track.id}
              onClick={() => onPlay(track, tracks)}
              className="group text-left bg-[#181818] hover:bg-[#282828] rounded-md p-3 transition-all duration-200 cursor-pointer"
            >
              {/* Album art */}
              <div className="relative w-full aspect-square rounded mb-3 overflow-hidden bg-zinc-700 shadow-lg">
                {track.albumArt ? (
                  <Image
                    src={track.albumArt}
                    alt={track.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music2 className="w-8 h-8 text-zinc-500" />
                  </div>
                )}
                {/* Hover play button */}
                <div className="absolute inset-0 flex items-end justify-end p-2">
                  <div
                    className={cn(
                      "w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center shadow-xl transition-all duration-200",
                      trackIsPlaying
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                    )}
                  >
                    {trackIsPlaying ? (
                      <Pause className="w-4 h-4 text-black fill-black" />
                    ) : (
                      <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Track info */}
              <p
                className={cn(
                  "text-sm font-semibold truncate mb-1",
                  isCurrent ? "text-[#1DB954]" : "text-white"
                )}
              >
                {track.name}
              </p>
              <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
