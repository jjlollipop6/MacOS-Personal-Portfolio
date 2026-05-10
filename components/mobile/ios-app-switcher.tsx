"use client";

import Image from "next/image";
import { useRef } from "react";
import { APPS } from "@/lib/app-config";
import { IOSStatusBar } from "./ios-status-bar";

const WALLPAPER_SRC = "/desktop/versions/tahoe-2-wallpaper.webp";

interface IOSAppSwitcherProps {
  recentApps: string[];
  activeAppId: string | null;
  onSelectApp: (appId: string) => void;
  onCloseApp: (appId: string) => void;
  onGoHome: () => void;
}

export function IOSAppSwitcher({
  recentApps,
  activeAppId,
  onSelectApp,
  onCloseApp,
  onGoHome,
}: IOSAppSwitcherProps) {
  const touchStartY = useRef<number>(0);

  const getAppConfig = (id: string) => APPS.find((a) => a.id === id);

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Blurred wallpaper background */}
      <Image
        src={WALLPAPER_SRC}
        alt="Switcher background"
        fill
        className="object-cover -z-10"
        style={{ filter: "blur(20px) brightness(0.6)", transform: "scale(1.05)" }}
        priority
        quality={50}
        draggable={false}
      />

      <IOSStatusBar />

      <div className="flex-1 flex flex-col justify-center px-6">
        <p className="text-white/70 text-[13px] font-medium text-center mb-4 tracking-wide uppercase">
          App Switcher
        </p>

        <div className="flex flex-row gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
          {recentApps.length === 0 && (
            <p className="text-white/50 text-sm text-center w-full">No recent apps</p>
          )}
          {recentApps.map((appId) => {
            const app = getAppConfig(appId);
            if (!app) return null;
            const isActive = appId === activeAppId;

            return (
              <div
                key={appId}
                className="snap-center flex-shrink-0 flex flex-col items-center gap-2"
                style={{ width: 200 }}
                onTouchStart={(e) => {
                  touchStartY.current = e.touches[0].clientY;
                }}
                onTouchEnd={(e) => {
                  const deltaY = touchStartY.current - e.changedTouches[0].clientY;
                  if (deltaY > 60) {
                    onCloseApp(appId);
                  }
                }}
              >
                {/* App preview card */}
                <button
                  onClick={() => onSelectApp(appId)}
                  className="w-full rounded-[16px] overflow-hidden shadow-2xl active:scale-95 transition-transform duration-150"
                  style={{
                    height: 300,
                    background: "rgba(30,30,40,0.85)",
                    border: isActive ? "2px solid rgba(255,255,255,0.6)" : "2px solid transparent",
                  }}
                >
                  {/* App icon as placeholder for preview */}
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <div
                      className="relative overflow-hidden shadow-lg"
                      style={{ width: 72, height: 72, borderRadius: 16 }}
                    >
                      <Image
                        src={app.icon}
                        alt={app.name}
                        fill
                        className="object-contain"
                        style={app.iconScale ? { transform: `scale(${app.iconScale})` } : undefined}
                      />
                    </div>
                    <span className="text-white/80 text-sm font-medium">{app.name}</span>
                    {isActive && (
                      <span className="text-white/50 text-[11px]">Active</span>
                    )}
                  </div>
                </button>

                {/* Close button */}
                <button
                  onClick={() => onCloseApp(appId)}
                  className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center active:bg-white/40 transition-colors"
                  aria-label={`Close ${app.name}`}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 2L8 8M8 2L2 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Home button */}
      <div className="flex justify-center pb-8">
        <button
          onClick={onGoHome}
          className="px-8 py-3 rounded-full text-white text-sm font-semibold active:opacity-70 transition-opacity"
          style={{
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          Home
        </button>
      </div>
    </div>
  );
}
