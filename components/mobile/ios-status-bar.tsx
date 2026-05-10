"use client";

import { useEffect, useState } from "react";

interface IOSStatusBarProps {
  className?: string;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function IOSStatusBar({ className = "" }: IOSStatusBarProps) {
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const tick = () => setTime(formatTime(new Date()));
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`flex items-center justify-between px-6 text-white text-[15px] font-semibold select-none ${className}`}
      style={{ height: 44 }}
    >
      <span>{time}</span>
      <div className="flex items-center gap-[6px]">
        {/* Signal bars */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <rect x="0" y="7" width="3" height="5" rx="1" fill="white" />
          <rect x="4.5" y="4.5" width="3" height="7.5" rx="1" fill="white" />
          <rect x="9" y="2" width="3" height="10" rx="1" fill="white" />
          <rect x="13.5" y="0" width="3" height="12" rx="1" fill="white" />
        </svg>
        {/* WiFi icon */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 9.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" fill="white" />
          <path
            d="M4.1 7.1a5.5 5.5 0 0 1 7.8 0"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M1.3 4.3a9.5 9.5 0 0 1 13.4 0"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {/* Battery */}
        <div className="flex items-center gap-[2px]">
          <div className="relative rounded-[3px] border border-white/80" style={{ width: 25, height: 12 }}>
            <div className="absolute inset-[2px] right-[2px] rounded-[1px] bg-white" style={{ right: 2 }} />
          </div>
          <div className="rounded-r-[1px] bg-white/80" style={{ width: 2, height: 5 }} />
        </div>
      </div>
    </div>
  );
}
