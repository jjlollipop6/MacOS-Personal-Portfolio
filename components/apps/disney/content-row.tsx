"use client";

import { cn } from "@/lib/utils";
import { Title } from "./types";
import { Tile } from "./tile";

interface ContentRowProps {
  title: string;
  titles: Title[];
  onTitleClick: (title: Title) => void;
  isMobileView: boolean;
}

export function ContentRow({ title, titles, onTitleClick, isMobileView }: ContentRowProps) {
  if (titles.length === 0) return null;

  return (
    <section className={cn("mb-8", isMobileView ? "px-3" : "px-9")}>
      <h2
        className={cn(
          "text-white font-medium tracking-wide mb-3",
          isMobileView ? "text-base" : "text-xl"
        )}
      >
        {title}
      </h2>
      <div
        className={cn(
          "grid gap-4",
          isMobileView ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        )}
      >
        {titles.map((t) => (
          <Tile key={t.id} title={t} onClick={onTitleClick} />
        ))}
      </div>
    </section>
  );
}
