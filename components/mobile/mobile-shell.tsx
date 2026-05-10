"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { RecentsProvider } from "@/lib/recents-context";
import { APP_SHELL_URL_CHANGE_EVENT, pushUrl, setUrl } from "@/lib/set-url";
import type { Note as NoteType } from "@/lib/notes/types";
import {
  getShellAppIdForContext,
  getShellUrlForApp,
  parseShellLocation,
  SHELL_DEFAULT_APP_ID,
} from "@/lib/shell-routing";
import { IOSHomeScreen } from "./ios-home-screen";
import { IOSStatusBar } from "./ios-status-bar";
import { IOSAppSwitcher } from "./ios-app-switcher";

const NotesApp = dynamic(() => import("@/components/apps/notes/notes-app").then((m) => m.NotesApp), { ssr: false });
const MessagesApp = dynamic(() => import("@/components/apps/messages/messages-app").then((m) => m.MessagesApp), { ssr: false });
const SettingsApp = dynamic(() => import("@/components/apps/settings/settings-app").then((m) => m.SettingsApp), { ssr: false });
const ITermApp = dynamic(() => import("@/components/apps/iterm/iterm-app").then((m) => m.ITermApp), { ssr: false });
const FinderApp = dynamic(() => import("@/components/apps/finder/finder-app").then((m) => m.FinderApp), { ssr: false });
const CalendarApp = dynamic(() => import("@/components/apps/calendar/calendar-app").then((m) => m.CalendarApp), { ssr: false });
const WeatherApp = dynamic(() => import("@/components/apps/weather/weather-app").then((m) => m.WeatherApp), { ssr: false });
const MusicApp = dynamic(() => import("@/components/apps/music/music-app").then((m) => m.MusicApp), { ssr: false });
const CanvasApp = dynamic(() => import("@/components/apps/canvas/canvas-app").then((m) => m.CanvasApp), { ssr: false });
const SafariApp = dynamic(() => import("@/components/apps/safari/safari-app").then((m) => m.SafariApp), { ssr: false });
const DisneyApp = dynamic(() => import("@/components/apps/disney/disney-app").then((m) => m.DisneyApp), { ssr: false });

const MAX_RECENT_APPS = 5;

interface MobileShellProps {
  initialApp?: string;
  initialNoteSlug?: string;
  initialNote?: NoteType;
}

export function MobileShell({ initialApp, initialNoteSlug, initialNote }: MobileShellProps) {
  // null = iOS home screen. Set via useEffect only (no window access during render).
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [activeNoteSlug, setActiveNoteSlug] = useState<string | undefined>(initialNoteSlug);
  const [recentApps, setRecentApps] = useState<string[]>([]);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [appVisible, setAppVisible] = useState(false);

  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const appCardRef = useRef<HTMLDivElement>(null);

  // Open an app with slide-up animation.
  // Does NOT call syncFromLocation — avoids the URL-event feedback loop.
  const openApp = useCallback((appId: string) => {
    setSwitcherOpen(false);
    setActiveAppId(appId);
    setRecentApps((prev) => [appId, ...prev.filter((id) => id !== appId)].slice(0, MAX_RECENT_APPS));
    requestAnimationFrame(() => requestAnimationFrame(() => setAppVisible(true)));

    // Only push URL for apps that have a registered route (canvas/safari/disney don't).
    const nextUrl = getShellUrlForApp(appId, { context: "mobile" });
    if (nextUrl) {
      const { appId: parsedId } = parseShellLocation(nextUrl, "", { context: "mobile" });
      if (parsedId === appId) pushUrl(nextUrl);
    }
  }, []);

  // Go home with slide-down animation.
  const goHome = useCallback(() => {
    setSwitcherOpen(false);
    setAppVisible(false);
    setTimeout(() => {
      setActiveAppId(null);
      pushUrl("/");
    }, 280);
  }, []);

  const handleOpenAppFromFinder = useCallback(
    (appId: string) => openApp(getShellAppIdForContext(appId, "mobile")),
    [openApp]
  );

  // Mount effect: handle deep links on initial load (client-side only).
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/") return;
    const { appId: deepAppId, noteSlug } = parseShellLocation(path, window.location.search, {
      fallbackAppId: initialApp || SHELL_DEFAULT_APP_ID,
      context: "mobile",
    });
    // Only open if it's a real non-default deep link (not just /notes which is the default)
    if (deepAppId && deepAppId !== SHELL_DEFAULT_APP_ID) {
      setActiveAppId(deepAppId);
      setAppVisible(true);
      setRecentApps([deepAppId]);
      if (noteSlug) setActiveNoteSlug(noteSlug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // URL sync: reads location and updates state directly.
  // MUST NOT call openApp/goHome — those call pushUrl which fires the event again (infinite loop).
  useEffect(() => {
    const syncFromLocation = () => {
      const path = window.location.pathname;
      const { normalizedPathname, appId: nextAppId, noteSlug } = parseShellLocation(
        path,
        window.location.search,
        { fallbackAppId: initialApp || SHELL_DEFAULT_APP_ID, context: "mobile" }
      );

      if (path !== normalizedPathname) setUrl(normalizedPathname);
      setActiveNoteSlug(noteSlug);

      if (path === "/") {
        setAppVisible(false);
        setActiveAppId(null);
      } else {
        setActiveAppId(nextAppId);
        requestAnimationFrame(() => requestAnimationFrame(() => setAppVisible(true)));
      }
    };

    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener(APP_SHELL_URL_CHANGE_EVENT, syncFromLocation);
    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener(APP_SHELL_URL_CHANGE_EVENT, syncFromLocation);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialApp]);

  // Swipe-up gesture on the home indicator strip
  const onSwipeStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };
  const onSwipeMove = (e: React.TouchEvent) => {
    const dy = touchStartY.current - e.touches[0].clientY;
    if (dy > 0 && appCardRef.current)
      appCardRef.current.style.transform = `translateY(-${Math.min(dy * 0.4, 60)}px)`;
  };
  const onSwipeEnd = (e: React.TouchEvent) => {
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    const vel = dy / (Date.now() - touchStartTime.current);
    if (appCardRef.current) appCardRef.current.style.transform = "";
    if (dy < 20) return;
    if (dy >= 150 || vel > 0.5) goHome();
    else if (dy >= 50) setSwitcherOpen(true);
  };

  return (
    <RecentsProvider>
      <div className="fixed inset-0 overflow-hidden" data-shell="mobile">

        {/* ── iOS Home Screen ─────────────────────────────────────────── */}
        {!activeAppId && <IOSHomeScreen onOpenApp={openApp} />}

        {/* ── Open app view ───────────────────────────────────────────── */}
        {activeAppId && (
          <div
            ref={appCardRef}
            className="absolute inset-0 flex flex-col transition-transform duration-300 ease-out"
            style={{ transform: appVisible ? "translateY(0)" : "translateY(100%)" }}
          >
            <IOSStatusBar className="flex-shrink-0 bg-black/50" />

            <div className="flex-1 min-h-0 overflow-hidden">
              {activeAppId === "notes" && (
                <NotesApp
                  isMobile={true}
                  inShell={false}
                  initialSlug={activeNoteSlug}
                  initialNote={activeNoteSlug === initialNoteSlug ? initialNote : undefined}
                />
              )}
              {activeAppId === "messages"  && <MessagesApp  isMobile={true} inShell={false} />}
              {activeAppId === "settings"  && <SettingsApp  isMobile={true} inShell={false} />}
              {activeAppId === "iterm"     && <ITermApp     isMobile={true} inShell={false} />}
              {activeAppId === "finder"    && <FinderApp    isMobile={true} inShell={false} onOpenApp={handleOpenAppFromFinder} />}
              {activeAppId === "calendar"  && <CalendarApp  isMobile={true} inShell={false} />}
              {activeAppId === "weather"   && <WeatherApp   isMobile={true} inShell={false} />}
              {activeAppId === "music"     && <MusicApp     isMobile={true} />}
              {activeAppId === "canvas"    && <CanvasApp    isMobile={true} inShell={false} />}
              {activeAppId === "safari"    && <SafariApp    isMobileView={true} inShell={false} />}
              {activeAppId === "disney"    && <DisneyApp    isMobile={true} />}
            </div>

            {/* Home indicator — swipe up to go home or open app switcher */}
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{ height: 34, paddingBottom: 6 }}
              onTouchStart={onSwipeStart}
              onTouchMove={onSwipeMove}
              onTouchEnd={onSwipeEnd}
            >
              <div className="w-32 h-[5px] rounded-full bg-white/50" />
            </div>
          </div>
        )}

        {/* ── App Switcher ─────────────────────────────────────────────── */}
        {switcherOpen && (
          <IOSAppSwitcher
            recentApps={recentApps}
            activeAppId={activeAppId}
            onSelectApp={openApp}
            onCloseApp={(appId) => {
              setRecentApps((prev) => prev.filter((id) => id !== appId));
              if (appId === activeAppId) goHome();
            }}
            onGoHome={goHome}
          />
        )}
      </div>
    </RecentsProvider>
  );
}
