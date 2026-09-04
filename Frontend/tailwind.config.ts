import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#F6F7F2",
          surface: "#FEFEFC",
          sidebar: "#FBFCF9",
          border: "#E2E6DE",
        },
        text: {
          main: "#17251F",
          muted: "#6F7A74",
        },
        brand: {
          blue: "#176B5B",
          teal: "#287D6E",
        },
        pastel: {
          lavender: "#EEEAE4",
          blue: "#E3F0EC",
          lime: "#F2F1E8",
          teal: "#DDEDE8",
        },
        status: {
          success: "#2F9D68",
          warning: "#D99100",
          critical: "#D64545",
          info: "#3678D4",
        },
      },
      borderRadius: {
        card: "10px",
        control: "8px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-lora)", "Georgia", "serif"],
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(23, 37, 31, 0.03), 0 8px 24px rgba(23, 37, 31, 0.035)",
      },
      spacing: {
        sidebar: "292px",
        "sidebar-collapsed": "80px",
        topbar: "68px",
      },
    },
  },
  plugins: [],
};

export default config;
