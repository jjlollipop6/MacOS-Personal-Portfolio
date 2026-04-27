"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Playlist, PlaylistTrack } from "../types";
import { useAudio } from "@/lib/music/audio-context";
import { Play, Pause, Shuffle, Trash2, Music2, Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { formatDuration, formatTotalDuration } from "@/lib/music/utils";

interface PlaylistViewProps {
  playlist: Playlist;
  isMobileView: boolean;
  onRemoveTrack?: (trackId: string) => void;
  onRename?: (name: string) => void;
}

export function PlaylistView({ playlist, isMobileView, onRemoveTrack, onRename }: PlaylistViewProps) {
  const { playbackState, play, pause, resume, toggleShuffle } = useAudio();
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(playlist.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraftName(playlist.name); }, [playlist.name]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commitRename = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== playlist.name) onRename?.(trimmed);
    else setDraftName(playlist.name);
    setEditing(false);
  };

  const handleTrackPlay = (track: PlaylistTrack) => {
    if (playbackState.currentTrack?.id === track.id && playbackState.isPlaying) {
      pause();
    } else if (playbackState.currentTrack?.id === track.id) {
      resume();
    } else {
      play(track, playlist.tracks);
    }
  };

  const isPlayingPlaylist =
    playbackState.isPlaying &&
    playbackState.currentTrack &&
    playlist.tracks.some((t) => t.id === playbackState.currentTrack?.id);

  const handlePlayAll = () => {
    if (isPlayingPlaylist) {
      pause();
    } else {
      const first = playlist.tracks.find((t) => t.previewUrl);
      if (first) play(first, playlist.tracks);
    }
  };

  const handleShufflePlay = () => {
    if (!playbackState.isShuffle) toggleShuffle();
    const first = playlist.tracks.find((t) => t.previewUrl);
    if (first) setTimeout(() => play(first, playlist.tracks), 0);
  };

  const totalDuration = playlist.tracks.reduce((sum, t) => sum + t.duration, 0);

  // Determine background gradient — use a muted purple/blue that feels Spotify-like
  const gradientColor = "#1a1a2e";

  return (
    <ScrollArea className="h-full" bottomMargin="0">
      <div className="min-h-full" style={{ background: `linear-gradient(180deg, ${gradientColor} 0%, #121212 340px)` }}>
        {/* Header */}
        <div
          className={cn(
            "flex gap-6 px-6 pt-6 pb-6",
            isMobileView && "flex-col items-center text-center px-4"
          )}
        >
          {/* Cover art */}
          <div
            className={cn(
              "relative flex-shrink-0 shadow-2xl",
              isMobileView ? "w-48 h-48 rounded-lg overflow-hidden" : "w-52 h-52 rounded overflow-hidden"
            )}
          >
            {playlist.tracks[0]?.albumArt ? (
              <Image
                src={playlist.tracks[0].albumArt}
                alt={playlist.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-900">
                <Music2 className="w-16 h-16 text-zinc-500" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-end">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">
              Playlist
            </p>
            {editing ? (
              <input
                ref={inputRef}
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") { setDraftName(playlist.name); setEditing(false); } }}
                className={cn(
                  "font-black text-white mb-3 leading-tight bg-transparent border-b border-white/50 outline-none w-full",
                  draftName.length > 20 ? "text-3xl" : "text-4xl"
                )}
              />
            ) : (
              <h1
                onClick={() => onRename && setEditing(true)}
                className={cn(
                  "font-black text-white mb-3 leading-tight",
                  playlist.name.length > 20 ? "text-3xl" : "text-4xl",
                  onRename && "cursor-text hover:opacity-80 transition-opacity"
                )}
              >
                {playlist.name}
              </h1>
            )}
            {playlist.description && (
              <p className="text-sm text-zinc-400 mb-2">{playlist.description}</p>
            )}
            <p className="text-sm text-zinc-400">
              {playlist.tracks.length} songs
              {totalDuration > 0 && (
                <span className="text-zinc-500"> · {formatTotalDuration(totalDuration)}</span>
              )}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 px-6 pb-6">
          <button
            onClick={handlePlayAll}
            disabled={playlist.tracks.length === 0}
            className="w-14 h-14 rounded-full bg-[#1DB954] hover:bg-[#1ed760] hover:scale-105 transition-all flex items-center justify-center shadow-lg disabled:opacity-40"
          >
            {isPlayingPlaylist ? (
              <Pause className="w-6 h-6 text-black fill-black" />
            ) : (
              <Play className="w-6 h-6 text-black fill-black ml-1" />
            )}
          </button>
          <button
            onClick={handleShufflePlay}
            disabled={playlist.tracks.length === 0}
            className={cn(
              "p-2 transition-colors disabled:opacity-40",
              playbackState.isShuffle
                ? "text-[#1DB954]"
                : "text-zinc-400 hover:text-white"
            )}
            title="Shuffle"
          >
            <Shuffle className="w-6 h-6" />
          </button>
        </div>

        {/* Track list */}
        <div className="px-4 pb-8">
          {/* Column headers (desktop) */}
          {!isMobileView && (
            <div className="flex items-center gap-4 px-4 pb-2 mb-1 border-b border-white/10 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
              <span className="w-5 text-center">#</span>
              <span className="flex-1">Title</span>
              <span className="w-14 flex items-center justify-end">
                <Clock className="w-3.5 h-3.5" />
              </span>
              {onRemoveTrack && <span className="w-8" />}
            </div>
          )}

          {playlist.tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Music2 className="w-12 h-12 text-zinc-600 mb-3" />
              <p className="text-white font-semibold mb-1">This playlist is empty</p>
              <p className="text-sm text-zinc-400">
                Search for songs and add them with the + button
              </p>
            </div>
          ) : (
            <div className="space-y-0.5 mt-1">
              {playlist.tracks.map((track, index) => {
                const isCurrent = playbackState.currentTrack?.id === track.id;
                const trackIsPlaying = isCurrent && playbackState.isPlaying;

                return (
                  <div
                    key={track.id}
                    className={cn(
                      "group flex items-center gap-4 px-4 py-2 rounded-md cursor-pointer transition-colors",
                      isCurrent ? "bg-white/10" : "hover:bg-white/10"
                    )}
                    onClick={() => handleTrackPlay(track)}
                  >
                    {/* Index / play icon */}
                    <div className="w-5 flex items-center justify-center flex-shrink-0">
                      {trackIsPlaying ? (
                        <Pause className="w-4 h-4 text-[#1DB954]" />
                      ) : (
                        <>
                          <span
                            className={cn(
                              "text-sm tabular-nums can-hover:group-hover:hidden",
                              isCurrent ? "text-[#1DB954]" : "text-zinc-400"
                            )}
                          >
                            {index + 1}
                          </span>
                          <Play className="w-4 h-4 text-white hidden can-hover:group-hover:block" />
                        </>
                      )}
                    </div>

                    {/* Album art */}
                    <div className="relative w-10 h-10 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
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
                          <Music2 className="w-4 h-4 text-zinc-600" />
                        </div>
                      )}
                    </div>

                    {/* Track name + artist */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          isCurrent ? "text-[#1DB954]" : "text-white"
                        )}
                      >
                        {track.name}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                    </div>

                    {/* Duration */}
                    <span className="text-xs text-zinc-400 w-14 text-right flex-shrink-0 tabular-nums">
                      {formatDuration(track.duration)}
                    </span>

                    {/* Remove button */}
                    {onRemoveTrack && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveTrack(track.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                        title="Remove from playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
