"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone: "success" | "info" | "warning";
}

interface ToastContextValue {
  showToast: (msg: Omit<ToastMessage, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneIcon = { success: CheckCircle2, info: Info, warning: AlertTriangle };
const toneClasses = {
  success: "border-green-200 bg-white text-status-success",
  info: "border-blue-200 bg-white text-status-info",
  warning: "border-amber-200 bg-white text-status-warning",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const showToast = useCallback((msg: Omit<ToastMessage, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setMessages((prev) => [...prev, { ...msg, id }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0" aria-live="polite">
        {messages.map((m) => {
          const Icon = toneIcon[m.tone];
          return (
            <div
              key={m.id}
              className={cn("pointer-events-auto flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-md", toneClasses[m.tone])}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-main">{m.title}</p>
                {m.description && <p className="text-xs text-text-muted">{m.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => setMessages((prev) => prev.filter((x) => x.id !== m.id))}
                aria-label="Dismiss notification"
                className="rounded p-0.5 text-text-muted hover:bg-app-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
