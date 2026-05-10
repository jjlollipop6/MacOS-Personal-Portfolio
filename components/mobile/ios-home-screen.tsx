"use client";

import { APPS } from "@/lib/app-config";
import { IOSAppIcon } from "./ios-app-icon";
import { IOSDock } from "./ios-dock";
import { IOSStatusBar } from "./ios-status-bar";

const WALLPAPER_SRC = "/desktop/versions/tahoe-2-wallpaper.webp";
const HOME_SCREEN_APPS = APPS.filter((a) => a.mobile?.supported !== false);

interface IOSHomeScreenProps {
  onOpenApp: (appId: string) => void;
}

function ResumeIcon() {
  return (
    <button
      onClick={() => window.open("/resume.pdf", "_blank")}
      className="flex flex-col items-center gap-[6px] active:opacity-70 transition-opacity duration-100 select-none"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* PDF document icon — same proportions as the desktop version, no container */}
      <svg width="63" height="76" viewBox="0 0 56 68" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="46" height="58" rx="4" fill="white" />
        <path d="M34 2 L48 16 L34 16 Z" fill="#E5E7EB" />
        <path d="M34 2 L48 16 H34 V2 Z" fill="#CBD5E1" />
        <rect x="2" y="2" width="46" height="58" rx="4" fill="none" stroke="#D1D5DB" strokeWidth="1" />
        <rect x="0" y="30" width="50" height="22" rx="3" fill="#DC2626" />
        <text x="25" y="46" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" letterSpacing="1">PDF</text>
        <line x1="10" y1="12" x2="32" y2="12" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="18" x2="30" y2="18" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="24" x2="34" y2="24" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span
        className="text-white text-[11px] leading-none font-medium text-center w-[80px] truncate"
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
      >
        Resume
      </span>
    </button>
  );
}

export function IOSHomeScreen({ onOpenApp }: IOSHomeScreenProps) {
  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        backgroundImage: `url(${WALLPAPER_SRC})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <IOSStatusBar />

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2">
        <div className="grid grid-cols-4 gap-x-2 gap-y-6">
          {HOME_SCREEN_APPS.map((app) => (
            <div key={app.id} className="flex justify-center">
              <IOSAppIcon app={app} onOpen={() => onOpenApp(app.id)} size={76} showLabel />
            </div>
          ))}
          <div className="flex justify-center">
            <ResumeIcon />
          </div>
        </div>
      </div>

      <IOSDock onOpenApp={onOpenApp} />
    </div>
  );
}
