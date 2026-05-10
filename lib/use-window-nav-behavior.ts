"use client";

import { useWindowFocus } from "@/lib/window-focus-context";
import { useMobileShell } from "@/lib/mobile-shell-context";

interface UseWindowNavBehaviorProps {
  isDesktop?: boolean;
  isMobile?: boolean;
  shellEnabled?: boolean;
  allowStandaloneClose?: boolean;
}

export function useWindowNavBehavior({
  isDesktop = false,
  isMobile = false,
  shellEnabled = true,
  allowStandaloneClose = true,
}: UseWindowNavBehaviorProps) {
  const windowFocus = useWindowFocus();
  const mobileShell = useMobileShell();
  const inShell = !!(shellEnabled && isDesktop && windowFocus);

  const mobileGoHome = isMobile && mobileShell ? mobileShell.goHome : undefined;

  return {
    inShell,
    onDragStart: inShell ? windowFocus?.onDragStart : undefined,
    onClose: inShell
      ? windowFocus?.closeWindow
      : mobileGoHome ?? (allowStandaloneClose && !isMobile ? () => window.close() : undefined),
    onMinimize: inShell ? windowFocus?.minimizeWindow : mobileGoHome,
    onToggleMaximize: inShell ? windowFocus?.toggleMaximize : undefined,
    isMaximized: windowFocus?.isMaximized ?? false,
    closeLabel: inShell ? "Close window" : isMobile ? "Go home" : "Close tab",
  };
}
