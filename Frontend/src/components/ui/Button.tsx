"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabledReason?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-blue text-white hover:bg-blue-600 focus-visible:ring-brand-blue disabled:bg-blue-300",
  secondary: "bg-pastel-blue text-brand-blue hover:bg-blue-100 focus-visible:ring-brand-blue",
  outline: "border border-app-border bg-white text-text-main hover:bg-app-bg focus-visible:ring-brand-blue",
  ghost: "text-text-main hover:bg-app-bg focus-visible:ring-brand-blue",
  destructive: "bg-status-critical text-white hover:bg-red-600 focus-visible:ring-status-critical",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
  icon: "h-10 w-10 justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", disabledReason, disabled, title, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      title={disabled && disabledReason ? disabledReason : title}
      className={cn(
        "inline-flex items-center rounded-control font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
