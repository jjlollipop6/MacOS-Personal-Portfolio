"use client";

import { APPS } from "@/lib/app-config";
import { IOSAppIcon } from "./ios-app-icon";

const DOCK_APP_IDS = ["finder", "messages", "safari", "settings"];

interface IOSDockProps {
  onOpenApp: (appId: string) => void;
}

export function IOSDock({ onOpenApp }: IOSDockProps) {
  const dockApps = DOCK_APP_IDS.map((id) => APPS.find((a) => a.id === id)).filter(Boolean) as (typeof APPS)[number][];

  return (
    <div className="flex items-center justify-center px-4 pb-8">
      <div
        className="flex items-center gap-4 px-5 py-3 rounded-[22px]"
        style={{
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.25)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
        }}
      >
        {dockApps.map((app) => (
          <IOSAppIcon key={app.id} app={app} onOpen={() => onOpenApp(app.id)} size={60} showLabel={false} />
        ))}
      </div>
    </div>
  );
}
