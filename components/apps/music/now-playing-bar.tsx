"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAudio } from "@/lib/music/audio-context";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  ListMusic,
  Loader2,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { formatDuration } from "@/lib/music/utils";

interface NowPlayingBarProps {
  isMobileView: boolean;
}

export function NowPlayingBar({ isMobileView }: NowPlayingBarProps) {
  const {
    playbackState,
    pause,
    resume,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  } = useAudio();

  const { currentTrack, isPlaying, isResolving, progress, volume, isShuffle, repeatMode, duration, queue, queueIndex, error } =
    playbackState;

  const [isLiked, setIsLiked] = useState(false);

  if (!currentTrack) return null;

  const canNavigate = queue.length > 1;
  const canGoPrevious = canNavigate && queueIndex > 0;
  const canGoNext = canNavigate && (queueIndex < queue.length - 1 || repeatMode === "all");

  const handlePlayPause = () => (isPlaying ? pause() : resume());

  const handleVolumeToggle = () => setVolume(volume > 0 ? 0 : 0.7);

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.4 ? Volume1 : Volume2;

  const currentTime = Math.floor(progress * duration);

  return (
    <div
      className={cn(
        "flex-shrink-0 border-t border-white/10",
        "bg-[#181818]",
        isMobileView ? "h-16 px-3" : "h-[90px] px-4"
      )}
    >
      <div className="h-full flex items-center gap-2">
        {/* Left: Track info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={cn(
              "relative flex-shrink-0 rounded overflow-hidden bg-zinc-800",
              isMobileView ? "w-10 h-10" : "w-[56px] h-[56px]"
            )}
          >
            <Image
              src={currentTrack.albumArt}
              alt={currentTrack.album || currentTrack.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <p className={cn("font-medium truncate", isMobileView ? "text-xs" : "text-sm")}>
              {currentTrack.name}
            </p>
            {error ? (
              <p className={cn("text-red-400 truncate", isMobileView ? "text-[11px]" : "text-xs")}>
                {error}
              </p>
            ) : (
              <p className={cn("text-zinc-400 truncate", isMobileView ? "text-[11px]" : "text-xs")}>
                {currentTrack.artist}
              </p>
            )}
          </div>
          {!isMobileView && (
            <button
              onClick={() => setIsLiked((v) => !v)}
              className={cn(
                "ml-1 p-1 transition-colors flex-shrink-0",
                isLiked ? "text-[#1DB954]" : "text-zinc-400 hover:text-white"
              )}
              title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
            >
              <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
            </button>
          )}
        </div>

        {/* Center: Controls + progress */}
        <div className={cn("flex flex-col items-center justify-center gap-1", isMobileView ? "flex-shrink-0" : "flex-1 max-w-[45%]")}>
          {/* Control buttons */}
          <div className="flex items-center gap-1">
            {!isMobileView && (
              <button
                onClick={toggleShuffle}
                className={cn(
                  "p-2 rounded-full transition-colors relative",
                  isShuffle ? "text-[#1DB954]" : "text-zinc-400 hover:text-white"
                )}
                title={isShuffle ? "Shuffle On" : "Shuffle Off"}
              >
                <Shuffle className="w-4 h-4" />
                {isShuffle && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1DB954] rounded-full" />
                )}
              </button>
            )}

            <button
              onClick={previous}
              disabled={!canGoPrevious}
              className={cn(
                "p-2 transition-colors",
                canGoPrevious ? "text-zinc-400 hover:text-white" : "text-zinc-600 cursor-not-allowed"
              )}
            >
              <SkipBack className={cn(isMobileView ? "w-5 h-5" : "w-4 h-4")} />
            </button>

            <button
              onClick={handlePlayPause}
              disabled={isResolving}
              className={cn(
                "flex items-center justify-center rounded-full bg-white hover:scale-105 active:scale-100 transition-transform text-black",
                isMobileView ? "w-8 h-8" : "w-9 h-9",
                isResolving && "opacity-70 cursor-default"
              )}
            >
              {isResolving ? (
                <Loader2 className={cn("animate-spin", isMobileView ? "w-3.5 h-3.5" : "w-4 h-4")} />
              ) : isPlaying ? (
                <Pause className={cn("fill-black", isMobileView ? "w-3.5 h-3.5" : "w-4 h-4")} />
              ) : (
                <Play className={cn("fill-black ml-0.5", isMobileView ? "w-3.5 h-3.5" : "w-4 h-4")} />
              )}
            </button>

            <button
              onClick={next}
              disabled={!canGoNext}
              className={cn(
                "p-2 transition-colors",
                canGoNext ? "text-zinc-400 hover:text-white" : "text-zinc-600 cursor-not-allowed"
              )}
            >
              <SkipForward className={cn(isMobileView ? "w-5 h-5" : "w-4 h-4")} />
            </button>

            {!isMobileView && (
              <button
                onClick={toggleRepeat}
                className={cn(
                  "p-2 rounded-full transition-colors relative",
                  repeatMode !== "off" ? "text-[#1DB954]" : "text-zinc-400 hover:text-white"
                )}
              >
                {repeatMode === "one" ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
                {repeatMode !== "off" && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1DB954] rounded-full" />
                )}
              </button>
            )}
          </div>

          {/* Progress bar */}
          {!isMobileView && (
            <div className="w-full flex items-center gap-2">
              <span className="text-[11px] text-zinc-400 w-9 text-right tabular-nums select-none">
                {formatDuration(currentTime)}
              </span>
              <div className="flex-1 group/bar">
                <Slider
                  value={[progress * 100]}
                  max={100}
                  step={0.1}
                  onValueChange={([value]) => seek(value / 100)}
                  className="flex-1"
                />
              </div>
              <span className="text-[11px] text-zinc-400 w-9 tabular-nums select-none">
                {formatDuration(duration)}
              </span>
            </div>
          )}
        </div>

        {/* Right: Volume + extras */}
        {!isMobileView && (
          <div className="flex items-center gap-1 flex-1 justify-end max-w-[30%]">
            <button className="p-2 text-zinc-400 hover:text-white transition-colors" title="Queue">
              <ListMusic className="w-4 h-4" />
            </button>
            <button
              onClick={handleVolumeToggle}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <VolumeIcon className="w-4 h-4" />
            </button>
            <div className="w-24">
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={([value]) => setVolume(value / 100)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
