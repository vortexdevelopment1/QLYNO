"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function Drawer({
  open,
  onClose,
  title,
  children,
  headerAction,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }

    if (open) document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-ink-900/30 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex h-full w-full max-w-full sm:max-w-md flex-col bg-white shadow-2xl border-l border-ink-100 transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Fixed Header */}
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-ink-900">{title}</h2>
            {headerAction}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
