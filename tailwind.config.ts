import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dce8ff",
          200: "#b8d0ff",
          300: "#8ab0ff",
          400: "#5c8dff",
          500: "#3468f0",
          600: "#254fce",
          700: "#1f3fa6",
          800: "#1d3684",
          900: "#1c2f6b",
          950: "#131c40",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5d9e1",
          300: "#b0b8c6",
          400: "#8591a6",
          500: "#65728a",
          600: "#505b71",
          700: "#424a5c",
          800: "#39404e",
          900: "#333844",
          950: "#1b1e26",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Inter", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
