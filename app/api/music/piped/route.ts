import { NextRequest, NextResponse } from "next/server";

// Public Piped instances — tried in order, first working one wins
const PIPED_HOSTS = [
  "https://pipedapi.kavin.rocks",
  "https://piped-api.garudalinux.org",
  "https://api.piped.projectsegfau.lt",
  "https://pipedapi.drgns.space",
];

async function pipedFetch(path: string, revalidate = 300): Promise<Response | null> {
  for (const host of PIPED_HOSTS) {
    try {
      const res = await fetch(`${host}${path}`, {
        headers: { Accept: "application/json" },
        next: { revalidate },
      });
      if (res.ok) return res;
    } catch {
      // try next host
    }
  }
  return null;
}

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────
export interface PipedVideoItem {
  url: string;          // "/watch?v=VIDEO_ID"
  title: string;
  thumbnail: string;
  uploaderName: string;
  uploaderUrl?: string;
  duration: number;     // seconds
  views?: number;
  isShort?: boolean;
}

interface PipedSearchResponse {
  items: PipedVideoItem[];
}

interface PipedAudioStream {
  url: string;
  bitrate: number;
  mimeType: string;
  quality?: string;
  codec?: string;
}

interface PipedStreamsResponse {
  title?: string;
  uploader?: string;
  thumbnail?: string;
  duration?: number;
  audioStreams: PipedAudioStream[];
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────
function extractVideoId(url: string): string | null {
  const m = url.match(/[?&]v=([^&]+)/);
  return m ? m[1] : null;
}

function isMusicLike(item: PipedVideoItem): boolean {
  if (item.isShort) return false;
  // Typical song: 90 s – 8 min
  if (item.duration > 0 && (item.duration < 90 || item.duration > 480)) return false;
  return true;
}

function bestAudioStream(streams: PipedAudioStream[]): PipedAudioStream | null {
  if (!streams.length) return null;
  // Prefer M4A/AAC over webm/opus for broader browser compat, then highest bitrate
  const m4a = streams
    .filter((s) => s.mimeType?.includes("mp4") || s.mimeType?.includes("m4a"))
    .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));
  if (m4a.length) return m4a[0];
  return streams.sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
}

// ──────────────────────────────────────────
// Route handler
// ──────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  // ── TRENDING ─────────────────────────────
  if (action === "trending") {
    // Use YouTube trending filtered to music-length videos.
    // Augment with a "top hits" music search so results are always music.
    const [trendRes, searchRes] = await Promise.all([
      pipedFetch("/trending?region=US", 600),
      pipedFetch("/search?q=top+hits+2024+official+audio&filter=music_songs", 600),
    ]);

    const tracks: ReturnType<typeof itemToTrack>[] = [];

    if (trendRes) {
      const trending: PipedVideoItem[] = await trendRes.json();
      for (const item of trending) {
        if (!isMusicLike(item)) continue;
        const id = extractVideoId(item.url);
        if (!id) continue;
        tracks.push(itemToTrack(item, id));
        if (tracks.length >= 12) break;
      }
    }

    if (searchRes) {
      const data: PipedSearchResponse = await searchRes.json();
      for (const item of (data.items ?? [])) {
        if (!isMusicLike(item)) continue;
        const id = extractVideoId(item.url);
        if (!id) continue;
        // Avoid duplicates
        if (tracks.some((t) => t.id === `youtube:${id}`)) continue;
        tracks.push(itemToTrack(item, id));
        if (tracks.length >= 24) break;
      }
    }

    return NextResponse.json({ tracks });
  }

  // ── SEARCH ───────────────────────────────
  if (action === "search") {
    const q = searchParams.get("q")?.trim();
    if (!q) return NextResponse.json({ tracks: [] });

    const res = await pipedFetch(
      `/search?q=${encodeURIComponent(q)}&filter=music_songs`,
      120
    );
    if (!res) return NextResponse.json({ error: "Piped unavailable" }, { status: 503 });

    const data: PipedSearchResponse = await res.json();
    const tracks = (data.items ?? [])
      .filter((item) => {
        const id = extractVideoId(item.url);
        return id && item.duration > 0;
      })
      .slice(0, 40)
      .map((item) => {
        const id = extractVideoId(item.url)!;
        return itemToTrack(item, id);
      });

    return NextResponse.json({ tracks });
  }

  // ── STREAM URL ───────────────────────────
  if (action === "stream") {
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const res = await pipedFetch(`/streams/${id}`, 0); // never cache — URLs expire
    if (!res) return NextResponse.json({ error: "Piped unavailable" }, { status: 503 });

    const data: PipedStreamsResponse = await res.json();
    const stream = bestAudioStream(data.audioStreams ?? []);

    if (!stream) return NextResponse.json({ error: "No audio stream" }, { status: 404 });

    return NextResponse.json({ url: stream.url });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// ──────────────────────────────────────────
// Conversion helper (used internally + exported for UI)
// ──────────────────────────────────────────
function itemToTrack(item: PipedVideoItem, videoId: string) {
  return {
    id: `youtube:${videoId}`,
    name: item.title,
    artist: item.uploaderName,
    album: "",
    albumArt: item.thumbnail,
    previewUrl: null as null, // resolved at play-time via action=stream
    duration: item.duration,
  };
}
