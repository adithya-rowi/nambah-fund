import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF6EE",
        sand: "#F3EADB",
        clay: "#E9DAC3",
        ink: "#3D3227",
        muted: "#8A7A64",
        brand: {
          DEFAULT: "#E07A3E",
          soft: "#F5A25D",
          dark: "#C4652C",
        },
        gain: "#2E9E6B",
        loss: "#D2603A",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(61, 50, 39, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
