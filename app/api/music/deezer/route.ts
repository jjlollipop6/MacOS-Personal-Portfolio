import { NextRequest, NextResponse } from "next/server";
import { PlaylistTrack } from "@/components/apps/music/types";

interface DeezerArtist { name: string }
interface DeezerAlbum  { title: string; cover_medium: string }

interface DeezerTrack {
  id: number;
  title: string;
  duration: number;      // seconds
  preview: string;       // direct 30-second MP3 URL
  artist: DeezerArtist;
  album: DeezerAlbum;
}

interface DeezerResponse { data: DeezerTrack[] }

function toPlaylistTrack(t: DeezerTrack): PlaylistTrack {
  return {
    id: `deezer:${t.id}`,
    name: t.title,
    artist: t.artist.name,
    album: t.album.title,
    albumArt: t.album.cover_medium,
    previewUrl: t.preview || null,
    duration: t.duration,
  };
}

async function deezerFetch(path: string): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`https://api.deezer.com${path}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok ? res : null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  // ── TRENDING ─────────────────────────────
  if (action === "trending") {
    const res = await deezerFetch("/chart/0/tracks?limit=50");
    if (!res) return NextResponse.json({ error: "Deezer unavailable" }, { status: 503 });

    const data: DeezerResponse = await res.json();
    const tracks = (data.data ?? [])
      .filter((t) => t.preview)
      .map(toPlaylistTrack);

    return NextResponse.json({ tracks });
  }

  // ── SEARCH ───────────────────────────────
  if (action === "search") {
    const q = searchParams.get("q")?.trim();
    if (!q) return NextResponse.json({ tracks: [] });

    const res = await deezerFetch(`/search?q=${encodeURIComponent(q)}&limit=40`);
    if (!res) return NextResponse.json({ error: "Deezer unavailable" }, { status: 503 });

    const data: DeezerResponse = await res.json();
    const tracks = (data.data ?? [])
      .filter((t) => t.preview)
      .map(toPlaylistTrack);

    return NextResponse.json({ tracks });
  }

  // ── GENRE CHART ──────────────────────────
  if (action === "genre") {
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ tracks: [] });

    const res = await deezerFetch(`/chart/${id}/tracks?limit=50`);
    if (!res) return NextResponse.json({ error: "Deezer unavailable" }, { status: 503 });

    const data: DeezerResponse = await res.json();
    const tracks = (data.data ?? [])
      .filter((t) => t.preview)
      .map(toPlaylistTrack);

    return NextResponse.json({ tracks });
  }

  // ── SINGLE TRACK (fresh preview URL) ─────
  if (action === "track") {
    const id = searchParams.get("id");
    if (!id || !/^\d+$/.test(id)) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const res = await deezerFetch(`/track/${id}`);
    if (!res) return NextResponse.json({ error: "Deezer unavailable" }, { status: 503 });

    const t: DeezerTrack = await res.json();
    if (!t.preview) return NextResponse.json({ error: "No preview" }, { status: 404 });

    return NextResponse.json({ previewUrl: t.preview });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
