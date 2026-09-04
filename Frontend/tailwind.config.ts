import type { Config } from "tailwindcss";

const billingTheme = {
  paper: "#F8FAFC",
  surface: "#FFFFFF",
  line: "#E2E8F0",
  ink: {
    DEFAULT: "#1B1E26",
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
    950: "#020617",
    soft: "#334155",
    muted: "#64748B",
    faint: "#94A3B8",
  },
  brand: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3468F0",
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
    950: "#172554",
  },
  success: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    400: "#34D399",
    500: "#10B981",
    600: "#059669",
  },
  warning: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    400: "#F59E0B",
    500: "#D97706",
    600: "#B45309",
  },
  alert: {
    50: "#FFF1F2",
    100: "#FFE4E6",
    400: "#F43F5E",
    500: "#E11D48",
    600: "#BE123C",
  },
};

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hospital-admin/**/*.{ts,tsx}",
    "./billing-staff/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          muted: "hsl(var(--sidebar-muted))",
          border: "hsl(var(--sidebar-border))",
          active: "hsl(var(--sidebar-active))",
        },
        paper: billingTheme.paper,
        surface: billingTheme.surface,
        ink: billingTheme.ink,
        line: billingTheme.line,
        brand: billingTheme.brand,
        clay: {
          50: billingTheme.warning[50],
          100: billingTheme.warning[100],
          200: billingTheme.warning[100],
          300: billingTheme.warning[400],
          400: billingTheme.warning[400],
          500: billingTheme.warning[500],
          600: billingTheme.warning[600],
        },
        alert: {
          50: billingTheme.alert[50],
          100: billingTheme.alert[100],
          400: billingTheme.alert[400],
          500: billingTheme.alert[500],
          600: billingTheme.alert[600],
        },
        sage: {
          50: billingTheme.success[50],
          100: billingTheme.success[100],
          400: billingTheme.success[400],
          500: billingTheme.success[500],
        },
      },
      fontFamily: {
        display: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgb(15 23 42 / 0.04)",
        card: "0 1px 2px rgb(var(--qlyno-ink-900) / 0.04), 0 10px 24px rgb(var(--qlyno-ink-900) / 0.06)",
        lift: "0 14px 40px rgb(var(--qlyno-ink-900) / 0.12)",
        panel: "0 4px 24px -8px rgb(15 23 42 / 0.12)",
        pop: "0 8px 30px rgb(var(--qlyno-ink-900) / 0.12)",
      },
      borderRadius: {
        card: "8px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.25s ease-out",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
