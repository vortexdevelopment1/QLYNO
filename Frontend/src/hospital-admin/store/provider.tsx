"use client";

import { useEffect, useRef } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { hydrateNursingOperations } from "./slices/nursingOperationsSlice";
import { RootState, store } from "./store";

export const NURSING_STORAGE_KEY = "qlyno.nursing-operations.v1";

function NursingStatePersistence() {
  const dispatch = useDispatch();
  const nursingOperations = useSelector((state: RootState) => state.nursingOperations);
  const isHydratedRef = useRef(false);

  // 1. Initial hydration on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = window.localStorage.getItem(NURSING_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object" && parsed.currentRole) {
            dispatch(hydrateNursingOperations(parsed));
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load nursing state from storage:", e);
    } finally {
      // Allow state hydration to apply to Redux before enabling localStorage writes
      setTimeout(() => {
        isHydratedRef.current = true;
      }, 150);
    }
  }, [dispatch]);

  // 2. Persist state changes only AFTER hydration completes
  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(NURSING_STORAGE_KEY, JSON.stringify(nursingOperations));
      }
    } catch (e) {
      console.warn("Failed to save nursing state to storage:", e);
    }
  }, [nursingOperations]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <NursingStatePersistence />
      {children}
    </Provider>
  );
}
