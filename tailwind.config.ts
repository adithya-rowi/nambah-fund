import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // token names reused across the app; values tuned for a premium,
        // restrained "growth" system (one emerald accent + warm neutrals)
        cream: "var(--bg)",
        sand: "var(--surface-2)",
        clay: "var(--border)",
        ink: "var(--text)",
        muted: "var(--text-muted)",
        surface: "var(--surface)",
        brand: {
          DEFAULT: "#0E9F6E",
          soft: "#34D399",
          dark: "#047857",
        },
        gain: "#0E9F6E",
        loss: "#E1533D",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16,24,40,.04), 0 12px 32px -16px rgba(16,24,40,.18)",
        lift: "0 2px 4px rgba(16,24,40,.05), 0 24px 48px -20px rgba(6,78,59,.28)",
      },
    },
  },
  plugins: [],
};

export default config;
