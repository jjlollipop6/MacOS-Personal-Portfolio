import { Playlist, PlaylistTrack } from "@/components/apps/music/types";

const STORAGE_KEY = "spotify-user-playlists-v2";

export function loadUserPlaylists(): Playlist[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function persist(playlists: Playlist[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
  } catch {
    // quota exceeded or private browsing
  }
}

export function createPlaylist(name: string, existing: Playlist[]): Playlist[] {
  const newPlaylist: Playlist = {
    id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || "New Playlist",
    description: "",
    coverArt: "",
    tracks: [],
  };
  const updated = [...existing, newPlaylist];
  persist(updated);
  return updated;
}

export function deletePlaylist(id: string, existing: Playlist[]): Playlist[] {
  const updated = existing.filter((p) => p.id !== id);
  persist(updated);
  return updated;
}

export function renamePlaylist(
  id: string,
  name: string,
  existing: Playlist[]
): Playlist[] {
  const updated = existing.map((p) =>
    p.id === id ? { ...p, name: name.trim() || p.name } : p
  );
  persist(updated);
  return updated;
}

export function addTrackToPlaylist(
  playlistId: string,
  track: PlaylistTrack,
  existing: Playlist[]
): Playlist[] {
  const updated = existing.map((p) => {
    if (p.id !== playlistId) return p;
    if (p.tracks.some((t) => t.id === track.id)) return p; // no duplicates
    return { ...p, tracks: [...p.tracks, track] };
  });
  persist(updated);
  return updated;
}

export function removeTrackFromPlaylist(
  playlistId: string,
  trackId: string,
  existing: Playlist[]
): Playlist[] {
  const updated = existing.map((p) => {
    if (p.id !== playlistId) return p;
    return { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) };
  });
  persist(updated);
  return updated;
}
