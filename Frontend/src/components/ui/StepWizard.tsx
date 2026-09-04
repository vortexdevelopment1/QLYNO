"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface WizardStep {
  id: string;
  label: string;
}

export function StepWizard({
  steps,
  currentIndex,
  onStepClick,
}: {
  steps: WizardStep[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-y-3" aria-label="Order entry steps">
      {steps.map((step, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming";
        return (
          <li key={step.id} className="flex items-center">
            <button
              type="button"
              disabled={!onStepClick || i > currentIndex}
              onClick={() => onStepClick?.(i)}
              className={cn(
                "flex items-center gap-2 rounded-full px-2.5 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue",
                state === "current" && "bg-blue-50 text-brand-blue",
                state === "done" && "text-status-success",
                state === "upcoming" && "text-text-muted",
                (!onStepClick || i > currentIndex) && "cursor-default"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold",
                  state === "current" && "border-brand-blue text-brand-blue",
                  state === "done" && "border-status-success bg-status-success text-white",
                  state === "upcoming" && "border-app-border text-text-muted"
                )}
              >
                {state === "done" ? <Check className="h-3 w-3" aria-hidden="true" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {i < steps.length - 1 && <span className="mx-1 h-px w-4 bg-app-border sm:w-6" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
