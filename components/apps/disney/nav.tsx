"use client";

import { WindowControls } from "@/components/window-controls";
import { WindowNavShell, WindowNavSpacer } from "@/components/window-nav-shell";
import { useWindowNavBehavior } from "@/lib/use-window-nav-behavior";

interface NavProps {
  isMobileView: boolean;
  isScrolled?: boolean;
  isDesktop?: boolean;
  transparent?: boolean;
}

export function Nav({ isMobileView, isScrolled, isDesktop = false, transparent = false }: NavProps) {
  const nav = useWindowNavBehavior({ isDesktop, isMobile: isMobileView });

  return (
    <WindowNavShell
      isMobile={isMobileView}
      isScrolled={isScrolled}
      className={transparent ? "bg-transparent" : undefined}
      onMouseDown={nav.onDragStart}
      left={
        <WindowControls
          inShell={nav.inShell}
          showWhenNotInShell={!isDesktop}
          className="p-2"
          onClose={nav.onClose}
          onMinimize={nav.onMinimize}
          onToggleMaximize={nav.onToggleMaximize}
          isMaximized={nav.isMaximized}
          closeLabel={nav.closeLabel}
        />
      }
      right={<WindowNavSpacer isMobile={isMobileView} />}
    />
  );
}
