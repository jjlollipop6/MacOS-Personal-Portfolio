"use client";

import { createContext, useContext } from "react";

interface MobileShellContextValue {
  goHome: () => void;
}

const MobileShellContext = createContext<MobileShellContextValue | null>(null);

export function MobileShellProvider({
  children,
  goHome,
}: {
  children: React.ReactNode;
  goHome: () => void;
}) {
  return (
    <MobileShellContext.Provider value={{ goHome }}>
      {children}
    </MobileShellContext.Provider>
  );
}

export function useMobileShell(): MobileShellContextValue | null {
  return useContext(MobileShellContext);
}
