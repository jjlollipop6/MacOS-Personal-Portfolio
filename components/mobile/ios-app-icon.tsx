"use client";

import Image from "next/image";
import type { AppConfig } from "@/types/apps";

interface IOSAppIconProps {
  app: AppConfig;
  onOpen: () => void;
  size?: number;
  showLabel?: boolean;
}

export function IOSAppIcon({ app, onOpen, size = 76, showLabel = true }: IOSAppIconProps) {
  return (
    <button
      onClick={onOpen}
      className="flex flex-col items-center gap-[6px] active:opacity-70 transition-opacity duration-100 select-none"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.225,
        }}
      >
        <Image
          src={app.icon}
          alt={app.name}
          fill
          className="object-contain"
          style={app.iconScale ? { transform: `scale(${app.iconScale})` } : undefined}
          draggable={false}
        />
      </div>
      {showLabel && (
        <span
          className="text-white text-[11px] leading-none font-medium drop-shadow text-center w-[80px] truncate"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
        >
          {app.name}
        </span>
      )}
    </button>
  );
}
