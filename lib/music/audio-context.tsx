"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { PlaylistTrack, RepeatMode, PlaybackState } from "@/components/apps/music/types";
import { useSystemSettingsSafe } from "@/lib/system-settings-context";

interface AudioContextValue {
  playbackState: PlaybackState;
  play: (track: PlaylistTrack, queue: PlaylistTrack[]) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  seek: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

const STORAGE_KEY = "music-playback-state";

interface PersistedState {
  volume: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  currentTrack: PlaylistTrack | null;
  progress: number;
  queue: PlaylistTrack[];
  originalQueue: PlaylistTrack[];
  queueIndex: number;
}

function loadStoredState(): Partial<PlaybackState> {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: PersistedState = JSON.parse(stored);
      return {
        volume: parsed.volume ?? 0.7,
        isShuffle: parsed.isShuffle ?? false,
        repeatMode: parsed.repeatMode ?? "off",
        currentTrack: parsed.currentTrack ?? null,
        progress: parsed.progress ?? 0,
        queue: parsed.queue ?? [],
        originalQueue: parsed.originalQueue ?? [],
        queueIndex: parsed.queueIndex ?? -1,
      };
    }
  } catch { /* ignore */ }
  return {};
}

function saveState(state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const defaultState: PlaybackState = {
  isPlaying: false,
  currentTrack: null,
  queue: [],
  originalQueue: [],
  queueIndex: -1,
  progress: 0,
  volume: 0.7,
  isShuffle: false,
  repeatMode: "off",
  duration: 0,
  error: null,
  isResolving: false,
};

// Only YouTube CDN URLs need proxying (CORS restricted).
// Deezer and iTunes CDNs expose Access-Control-Allow-Origin: * so the browser can load them directly.
function proxiedAudioUrl(url: string): string {
  try {
    const { hostname } = new URL(url);
    if (hostname.endsWith(".googlevideo.com") || hostname.includes("youtube")) {
      return `/api/music/proxy?url=${encodeURIComponent(url)}`;
    }
  } catch {
    // malformed URL — fall through to direct
  }
  return url;
}

// Fetch the playable audio URL for a YouTube track via the Piped proxy
async function resolveYouTubeStream(videoId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/music/piped?action=stream&id=${videoId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.url === "string" ? data.url : null;
  } catch {
    return null;
  }
}

// Fetch a fresh Deezer preview URL (stored URLs carry signed tokens that can expire)
async function resolveDeezerPreview(deezerId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/music/deezer?action=track&id=${deezerId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.previewUrl === "string" ? data.previewUrl : null;
  } catch {
    return null;
  }
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Track the play-request sequence so stale async resolves don't start playing the wrong track
  const playSeqRef = useRef(0);

  const { volume: systemVolume } = useSystemSettingsSafe();
  const [playbackState, setPlaybackState] = useState<PlaybackState>(() => ({
    ...defaultState,
    ...loadStoredState(),
  }));

  const stateRef = useRef(playbackState);
  stateRef.current = playbackState;
  const systemVolumeRef = useRef(systemVolume);
  useEffect(() => { systemVolumeRef.current = systemVolume; }, [systemVolume]);

  // ── Persistence ──────────────────────────────────────────────
  const debouncedSave = useCallback((state: PlaybackState) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveState({
        volume: state.volume,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode,
        currentTrack: state.currentTrack,
        progress: state.progress,
        queue: state.queue,
        originalQueue: state.originalQueue,
        queueIndex: state.queueIndex,
      });
    }, 1000);
  }, []);

  const immediateSave = useCallback((state: PlaybackState) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveState({
      volume: state.volume,
      isShuffle: state.isShuffle,
      repeatMode: state.repeatMode,
      currentTrack: state.currentTrack,
      progress: state.progress,
      queue: state.queue,
      originalQueue: state.originalQueue,
      queueIndex: state.queueIndex,
    });
  }, []);

  // ── Audio element setup ──────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || audioRef.current) return;

    const audio = new Audio();
    const initial = stateRef.current;
    audio.volume = (systemVolumeRef.current / 100) * initial.volume;

    audio.addEventListener("loadedmetadata", () => {
      if (!isFinite(audio.duration)) return;
      const state = stateRef.current;
      if (state.progress > 0 && !state.isPlaying) {
        audio.currentTime = state.progress * audio.duration;
      }
      setPlaybackState((prev) => ({ ...prev, duration: audio.duration }));
    });

    audio.addEventListener("error", () => {
      setPlaybackState((prev) => ({
        ...prev,
        isPlaying: false,
        isResolving: false,
        error: audio.error?.message || "Failed to load audio",
      }));
    });

    audioRef.current = audio;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); }, []);

  // ── Volume sync ──────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = (systemVolume / 100) * playbackState.volume;
    }
  }, [playbackState.volume, systemVolume]);

  // ── Progress ticker ──────────────────────────────────────────
  useEffect(() => {
    if (!playbackState.isPlaying || !audioRef.current) return;
    const interval = setInterval(() => {
      const audio = audioRef.current;
      if (audio && !audio.paused && audio.duration > 0) {
        setPlaybackState((prev) => ({
          ...prev,
          progress: audio.currentTime / audio.duration,
        }));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [playbackState.isPlaying]);

  // ── Debounced progress save ──────────────────────────────────
  useEffect(() => { debouncedSave(stateRef.current); }, [playbackState.progress, debouncedSave]);

  // ── Immediate save on important changes ──────────────────────
  const prevTrackId = useRef(playbackState.currentTrack?.id);
  const prevVolume  = useRef(playbackState.volume);
  const prevShuffle = useRef(playbackState.isShuffle);
  const prevRepeat  = useRef(playbackState.repeatMode);

  useEffect(() => {
    const changed =
      prevTrackId.current !== playbackState.currentTrack?.id ||
      prevVolume.current  !== playbackState.volume ||
      prevShuffle.current !== playbackState.isShuffle ||
      prevRepeat.current  !== playbackState.repeatMode;

    if (changed) {
      immediateSave(stateRef.current);
      prevTrackId.current = playbackState.currentTrack?.id;
      prevVolume.current  = playbackState.volume;
      prevShuffle.current = playbackState.isShuffle;
      prevRepeat.current  = playbackState.repeatMode;
    }
  }, [
    playbackState.currentTrack?.id,
    playbackState.volume,
    playbackState.isShuffle,
    playbackState.repeatMode,
    immediateSave,
  ]);

  // ── Core load+play helper ────────────────────────────────────
  // seq: play-request number to detect if the user changed track before this resolves
  const loadAndPlay = useCallback(async (track: PlaylistTrack, shouldPlay: boolean, seq: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Cancel any in-flight play() promise before changing src
    audio.pause();

    const startPlayback = (targetSeq: number) => {
      if (!shouldPlay) return;
      const tryPlay = () => {
        if (playSeqRef.current !== targetSeq) return;
        audio.play().catch((err) => {
          if (err.name === "AbortError") return; // interrupted by a newer request — safe to ignore
          console.error("Playback failed:", err);
          setPlaybackState((prev) => ({ ...prev, isPlaying: false, error: "Playback blocked by browser. Click play to retry." }));
        });
      };
      audio.addEventListener("canplay", tryPlay, { once: true });
    };

    if (track.id.startsWith("youtube:")) {
      const videoId = track.id.slice("youtube:".length);

      setPlaybackState((prev) => ({
        ...prev,
        isResolving: true,
        error: null,
      }));

      const url = await resolveYouTubeStream(videoId);

      // Discard if user already moved to a different track
      if (playSeqRef.current !== seq) return;

      if (!url) {
        setPlaybackState((prev) => ({
          ...prev,
          isPlaying: false,
          isResolving: false,
          error: "Could not load audio from YouTube. Try another track.",
        }));
        return;
      }

      audio.src = proxiedAudioUrl(url);
      audio.load();
      setPlaybackState((prev) => ({ ...prev, isResolving: false }));
      startPlayback(seq);
    } else if (track.id.startsWith("deezer:")) {
      // Always resolve a fresh signed preview URL — stored URLs carry tokens that expire
      const deezerId = track.id.slice("deezer:".length);

      setPlaybackState((prev) => ({ ...prev, isResolving: true, error: null }));

      const url = await resolveDeezerPreview(deezerId);

      if (playSeqRef.current !== seq) return;

      if (!url) {
        setPlaybackState((prev) => ({
          ...prev,
          isPlaying: false,
          isResolving: false,
          error: "Could not load preview. Try another track.",
        }));
        return;
      }

      audio.src = url;
      audio.load();
      setPlaybackState((prev) => ({ ...prev, isResolving: false }));
      startPlayback(seq);
    } else {
      // Generic direct URL fallback
      if (!track.previewUrl) {
        setPlaybackState((prev) => ({ ...prev, isPlaying: false, error: "No audio available for this track." }));
        return;
      }
      audio.src = proxiedAudioUrl(track.previewUrl);
      audio.load();
      setPlaybackState((prev) => ({ ...prev, isResolving: false }));
      startPlayback(seq);
    }
  }, []);

  // ── Track ended — advance queue ──────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const { repeatMode, queue, queueIndex } = stateRef.current;

      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }

      let nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === "all") nextIndex = 0;
        else {
          setPlaybackState((prev) => ({ ...prev, isPlaying: false, progress: 0 }));
          return;
        }
      }

      const nextTrack = queue[nextIndex];
      if (!nextTrack) return;

      const seq = ++playSeqRef.current;
      setPlaybackState((prev) => ({
        ...prev,
        currentTrack: nextTrack,
        queueIndex: nextIndex,
        progress: 0,
        error: null,
        isResolving: nextTrack.id.startsWith("youtube:") || nextTrack.id.startsWith("deezer:"),
      }));
      loadAndPlay(nextTrack, true, seq);
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [loadAndPlay]);

  // ── Public API ───────────────────────────────────────────────
  const play = useCallback((track: PlaylistTrack, tracks: PlaylistTrack[]) => {
    const seq = ++playSeqRef.current;

    setPlaybackState((prev) => {
      let queue: PlaylistTrack[];
      let queueIndex: number;

      if (prev.isShuffle) {
        const others = tracks.filter((t) => t.id !== track.id);
        queue = [track, ...shuffleArray(others)];
        queueIndex = 0;
      } else {
        queue = tracks;
        queueIndex = tracks.findIndex((t) => t.id === track.id);
        if (queueIndex < 0) queueIndex = 0;
      }

      return {
        ...prev,
        isPlaying: true,
        currentTrack: track,
        queue,
        originalQueue: tracks,
        queueIndex,
        progress: 0,
        duration: 0,
        error: null,
        isResolving: track.id.startsWith("youtube:") || track.id.startsWith("deezer:"),
      };
    });

    loadAndPlay(track, true, seq);
  }, [loadAndPlay]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && playbackState.currentTrack) {
      audioRef.current.play().catch(console.error);
      setPlaybackState((prev) => ({ ...prev, isPlaying: true, error: null }));
    }
  }, [playbackState.currentTrack]);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setPlaybackState({ ...defaultState });
  }, []);

  const next = useCallback(() => {
    const { queue, queueIndex, repeatMode, isPlaying } = stateRef.current;
    if (!queue.length) return;

    let nextIndex = queueIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === "all") nextIndex = 0;
      else return;
    }

    const nextTrack = queue[nextIndex];
    if (!nextTrack) return;

    const seq = ++playSeqRef.current;
    setPlaybackState((prev) => ({
      ...prev,
      currentTrack: nextTrack,
      queueIndex: nextIndex,
      progress: 0,
      duration: 0,
      error: null,
      isResolving: nextTrack.id.startsWith("youtube:") || nextTrack.id.startsWith("deezer:"),
    }));
    loadAndPlay(nextTrack, isPlaying, seq);
  }, [loadAndPlay]);

  const previous = useCallback(() => {
    const { queue, queueIndex, isPlaying } = stateRef.current;
    const audio = audioRef.current;
    if (!audio || !queue.length) return;

    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setPlaybackState((prev) => ({ ...prev, progress: 0 }));
      return;
    }

    const prevIndex = queueIndex - 1;
    if (prevIndex < 0) return;

    const prevTrack = queue[prevIndex];
    if (!prevTrack) return;

    const seq = ++playSeqRef.current;
    setPlaybackState((prev) => ({
      ...prev,
      currentTrack: prevTrack,
      queueIndex: prevIndex,
      progress: 0,
      duration: 0,
      error: null,
      isResolving: prevTrack.id.startsWith("youtube:") || prevTrack.id.startsWith("deezer:"),
    }));
    loadAndPlay(prevTrack, isPlaying, seq);
  }, [loadAndPlay]);

  const seek = useCallback((progress: number) => {
    const audio = audioRef.current;
    if (audio?.duration) {
      audio.currentTime = progress * audio.duration;
      setPlaybackState((prev) => ({ ...prev, progress }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = (systemVolumeRef.current / 100) * clamped;
    }
    setPlaybackState((prev) => ({ ...prev, volume: clamped }));
  }, []);

  const toggleShuffle = useCallback(() => {
    setPlaybackState((prev) => {
      const newShuffle = !prev.isShuffle;
      const cur = prev.currentTrack;
      if (!prev.originalQueue.length || !cur) return { ...prev, isShuffle: newShuffle };

      let newQueue: PlaylistTrack[];
      let newIdx: number;
      if (newShuffle) {
        const others = prev.originalQueue.filter((t) => t.id !== cur.id);
        newQueue = [cur, ...shuffleArray(others)];
        newIdx = 0;
      } else {
        newQueue = prev.originalQueue;
        newIdx = prev.originalQueue.findIndex((t) => t.id === cur.id);
        if (newIdx < 0) newIdx = 0;
      }
      return { ...prev, isShuffle: newShuffle, queue: newQueue, queueIndex: newIdx };
    });
  }, []);

  const toggleRepeat = useCallback(() => {
    setPlaybackState((prev) => {
      const modes: RepeatMode[] = ["off", "all", "one"];
      const next = modes[(modes.indexOf(prev.repeatMode) + 1) % modes.length];
      return { ...prev, repeatMode: next };
    });
  }, []);

  return (
    <AudioContext.Provider value={{
      playbackState,
      play, pause, resume, stop,
      next, previous, seek, setVolume,
      toggleShuffle, toggleRepeat,
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within an AudioProvider");
  return ctx;
}
