"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface DesktopFileIconProps {
  label: string;
  onOpen: () => void;
}

export function DesktopFileIcon({ label, onOpen }: DesktopFileIconProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selected, setSelected] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const didDrag = useRef(false);

  // Initialize position top-right on mount
  useEffect(() => {
    setPosition({ x: window.innerWidth - 110, y: 48 });
  }, []);

  // Deselect when clicking anywhere outside this icon
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (iconRef.current && !iconRef.current.contains(e.target as Node)) {
        setSelected(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelected(true);
      if (!position) return;

      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: position.x,
        origY: position.y,
      };
      didDrag.current = false;

      const onMove = (ev: MouseEvent) => {
        if (!dragState.current) return;
        const dx = ev.clientX - dragState.current.startX;
        const dy = ev.clientY - dragState.current.startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true;
        setPosition({ x: dragState.current.origX + dx, y: dragState.current.origY + dy });
      };

      const onUp = () => {
        dragState.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [position]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!didDrag.current) onOpen();
    },
    [onOpen]
  );

  if (!position) return null;

  return (
    <div
      ref={iconRef}
      className="absolute flex flex-col items-center gap-1 cursor-default select-none z-[5]"
      style={{ left: position.x, top: position.y, width: 80 }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* macOS-style PDF document icon */}
      <svg width="56" height="68" viewBox="0 0 56 68" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Page body */}
        <rect x="2" y="2" width="46" height="58" rx="4" fill="white" />
        {/* Folded corner */}
        <path d="M34 2 L48 16 L34 16 Z" fill="#E5E7EB" />
        <path d="M34 2 L48 16 H34 V2 Z" fill="#CBD5E1" />
        {/* Page border */}
        <rect x="2" y="2" width="46" height="58" rx="4" fill="none" stroke="#D1D5DB" strokeWidth="1" />
        {/* Red PDF banner */}
        <rect x="0" y="30" width="50" height="22" rx="3" fill="#DC2626" />
        <text
          x="25"
          y="46"
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="bold"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          letterSpacing="1"
        >
          PDF
        </text>
        {/* Subtle lines to suggest content */}
        <line x1="10" y1="12" x2="32" y2="12" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="18" x2="30" y2="18" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="24" x2="34" y2="24" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      {/* Label */}
      <span
        className="text-center text-white text-[11px] leading-tight px-1 rounded-[3px] max-w-full break-words"
        style={{
          textShadow: selected ? "none" : "0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.6)",
          background: selected ? "rgba(59,130,246,0.75)" : "transparent",
        }}
      >
        {label}
      </span>
    </div>
  );
}
