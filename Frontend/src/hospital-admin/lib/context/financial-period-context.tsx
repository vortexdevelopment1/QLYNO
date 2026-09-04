"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export type AccountingPeriod =
  | "Today"
  | "This Week"
  | "This Month"
  | "This Quarter"
  | "FY 2025-26"
  | "Custom";

interface FinancialPeriodContextType {
  period: AccountingPeriod;
  setPeriod: (newPeriod: AccountingPeriod) => void;
  periodMultiplier: number;
  periodLabel: string;
}

const FinancialPeriodContext = createContext<FinancialPeriodContextType>({
  period: "This Month",
  setPeriod: () => {},
  periodMultiplier: 1.0,
  periodLabel: "This Month (Aug 2026)",
});

export function FinancialPeriodProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const queryPeriod = searchParams.get("period") as AccountingPeriod;
  const initialPeriod = queryPeriod || "This Month";

  const [period, setPeriodState] = useState<AccountingPeriod>(initialPeriod);

  useEffect(() => {
    if (queryPeriod && queryPeriod !== period) {
      setPeriodState(queryPeriod);
    }
  }, [queryPeriod]);

  const setPeriod = (newPeriod: AccountingPeriod) => {
    setPeriodState(newPeriod);
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", newPeriod);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const getMultiplier = (p: AccountingPeriod): number => {
    switch (p) {
      case "Today":
        return 0.033;
      case "This Week":
        return 0.23;
      case "This Month":
        return 1.0;
      case "This Quarter":
        return 2.9;
      case "FY 2025-26":
        return 11.8;
      case "Custom":
        return 0.5;
      default:
        return 1.0;
    }
  };

  const getLabel = (p: AccountingPeriod): string => {
    switch (p) {
      case "Today":
        return "Today (Live 24h)";
      case "This Week":
        return "This Week (W34)";
      case "This Month":
        return "This Month (Aug 2026)";
      case "This Quarter":
        return "This Quarter (Q2 FY26)";
      case "FY 2025-26":
        return "FY 2025–26 (YTD)";
      case "Custom":
        return "Custom Range (Aug 10 - Aug 25)";
      default:
        return "This Month (Aug 2026)";
    }
  };

  return (
    <FinancialPeriodContext.Provider
      value={{
        period,
        setPeriod,
        periodMultiplier: getMultiplier(period),
        periodLabel: getLabel(period),
      }}
    >
      {children}
    </FinancialPeriodContext.Provider>
  );
}

export function useFinancialPeriod() {
  return useContext(FinancialPeriodContext);
}
