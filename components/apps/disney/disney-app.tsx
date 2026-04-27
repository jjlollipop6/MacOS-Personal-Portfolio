"use client";

import App from "./app";

interface DisneyAppProps {
  isMobile?: boolean;
}

export function DisneyApp({ isMobile = false }: DisneyAppProps) {
  return (
    <div className="h-full w-full overflow-hidden">
      <App isDesktop={!isMobile} />
    </div>
  );
}
