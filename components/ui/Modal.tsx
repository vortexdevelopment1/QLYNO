"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_CLASSES: Record<string, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      headingRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-ink-900/30 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`w-full ${SIZE_CLASSES[size]} max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-ink-100 transform transition-all my-auto sm:my-8`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3.5 sm:px-6 sm:py-4 shrink-0">
          <h2 id="modal-title" ref={headingRef} tabIndex={-1} className="text-sm sm:text-base font-bold text-ink-900 outline-none pr-2">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors shrink-0"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">{children}</div>
        {footer && <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 border-t border-ink-100 bg-ink-50/50 px-4 py-3.5 sm:px-6 sm:py-4 rounded-b-2xl shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
