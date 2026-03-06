import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This tells Tailwind to scan all your components and pages
  ],
  theme: {
    extend: {
      animation: {
        marquee: "marquee 20s linear infinite",
        "spin-slow": "spin 3s linear infinite",
        // #region agent log
        // Debug: Custom spin animation added
        // #endregion
      },
      colors: {
        primary: "#0F172A",
        secondary: "#1E293B",
        accent: "#38BDF8",
        emerald: "#22C55E",
        glassWhite: "rgba(255,255,255,0.15)",
        glassBorder: "rgba(255,255,255,0.2)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      backdropBlur: {
        glass: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
