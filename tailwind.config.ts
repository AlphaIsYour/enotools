import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Neutral surface palette
        surface: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        // Dashboard-specific dark tokens
        dashboard: {
          bg: "#050505",
          "bg-alt": "#080808",
          "bg-deep": "#0A0A0A",
          panel: "#0D0D0F",
          card: "#101014",
          "card-alt": "#141417",
          "card-hover": "#18181B",
          border: "rgba(255,255,255,0.08)",
          "border-hover": "rgba(255,255,255,0.14)",
          "border-subtle": "rgba(255,255,255,0.05)",
          "text-primary": "#FAFAFA",
          "text-secondary": "#A1A1AA",
          "text-muted": "#71717A",
          sidebar: "#080808",
        },
        // Accent colors (minimal use)
        accent: {
          blue: "#3B82F6",
          green: "#10B981",
          yellow: "#F59E0B",
          red: "#EF4444",
          cyan: "#06B6D4",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Fira Code", "monospace"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        glow: "0 0 20px rgba(255, 255, 255, 0.03)",
        "glow-lg": "0 0 40px rgba(255, 255, 255, 0.05)",
        panel: "0 1px 3px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)",
      },
      backgroundImage: {
        "dashboard-dots":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
      },
      backgroundSize: {
        "dots-24": "24px 24px",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.15s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.98)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
