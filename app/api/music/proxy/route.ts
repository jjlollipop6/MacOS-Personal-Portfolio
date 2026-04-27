import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set([
  "audio-ssl.itunes.apple.com",
  "cdnp.dzcdn.net",
  "cdn-preview-d.dzcdn.net",
  "cdns-preview-d.dzcdn.net",
  "e-cdns-proxy.dzcdn.net",
]);

// Piped/YouTube CDN hostnames follow patterns like rr*.googlevideo.com
function isAllowed(hostname: string): boolean {
  if (ALLOWED_HOSTS.has(hostname)) return true;
  if (hostname.endsWith(".googlevideo.com")) return true;
  if (hostname.endsWith(".dzcdn.net")) return true;
  return false;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("Missing url", { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  if (parsed.protocol !== "https:") {
    return new NextResponse("Only HTTPS sources allowed", { status: 400 });
  }

  if (!isAllowed(parsed.hostname)) {
    return new NextResponse("Host not allowed", { status: 403 });
  }

  const fetchHeaders: HeadersInit = {};
  const rangeHeader = request.headers.get("range");
  if (rangeHeader) fetchHeaders["Range"] = rangeHeader;

  try {
    const upstream = await fetch(url, { headers: fetchHeaders });

    const responseHeaders = new Headers();
    responseHeaders.set(
      "Content-Type",
      upstream.headers.get("Content-Type") ?? "audio/mpeg"
    );
    const contentLength = upstream.headers.get("Content-Length");
    if (contentLength) responseHeaders.set("Content-Length", contentLength);
    const contentRange = upstream.headers.get("Content-Range");
    if (contentRange) responseHeaders.set("Content-Range", contentRange);
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Cache-Control", "public, max-age=3600");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return new NextResponse("Proxy error", { status: 502 });
  }
}
