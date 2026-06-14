import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

interface SidebarContextValue {
  isOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

const getInitialSidebarState = (): boolean => {
  if (typeof window === "undefined") return true;

  const saved = localStorage.getItem("sidebarOpen");
  if (saved !== null) {
    return saved === "true";
  }

  return window.innerWidth > 768;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(getInitialSidebarState);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", String(isOpen));
  }, [isOpen]);

  const value = useMemo<SidebarContextValue>(
    () => ({
      isOpen,
      toggleSidebar: () => setIsOpen((prev) => !prev),
      openSidebar: () => setIsOpen(true),
      closeSidebar: () => setIsOpen(false),
    }),
    [isOpen]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export const useSidebar = (): SidebarContextValue => {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar debe usarse dentro de SidebarProvider");
  }

  return context;
};