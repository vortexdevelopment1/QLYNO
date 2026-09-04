"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { WorkContext } from "./types";

interface ModeContextValue {
  workContext: WorkContext;
  setWorkContext: (m: WorkContext) => void;
  selectedWorkplaceId: string;
  setSelectedWorkplaceId: (id: string) => void;
}

const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [workContext, setWorkContext] = useState<WorkContext>("clinic");
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState("wp-clinic-mg");
  const value = useMemo(
    () => ({ workContext, setWorkContext, selectedWorkplaceId, setSelectedWorkplaceId }),
    [selectedWorkplaceId, workContext]
  );
  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used within ModeProvider");
  return ctx;
}
