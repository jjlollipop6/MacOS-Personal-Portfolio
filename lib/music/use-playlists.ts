"use client";

import { useState, useCallback, useEffect } from "react";
import { Playlist, PlaylistTrack } from "@/components/apps/music/types";
import {
  loadUserPlaylists,
  createPlaylist as storeCreate,
  deletePlaylist as storeDelete,
  renamePlaylist as storeRename,
  addTrackToPlaylist as storeAdd,
  removeTrackFromPlaylist as storeRemove,
} from "./playlist-store";

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Load from localStorage on mount (client only)
  useEffect(() => {
    setPlaylists(loadUserPlaylists());
  }, []);

  const createPlaylist = useCallback((name: string) => {
    setPlaylists((prev) => storeCreate(name, prev));
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists((prev) => storeDelete(id, prev));
  }, []);

  const renamePlaylist = useCallback((id: string, name: string) => {
    setPlaylists((prev) => storeRename(id, name, prev));
  }, []);

  const addTrackToPlaylist = useCallback(
    (playlistId: string, track: PlaylistTrack) => {
      setPlaylists((prev) => storeAdd(playlistId, track, prev));
    },
    []
  );

  const removeTrackFromPlaylist = useCallback(
    (playlistId: string, trackId: string) => {
      setPlaylists((prev) => storeRemove(playlistId, trackId, prev));
    },
    []
  );

  return {
    playlists,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
  };
}
