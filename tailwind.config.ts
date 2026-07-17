// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neutral scale (backgrounds/text) — kept under the old names so
        // existing className references (bg-ink, text-ink-faint, etc.)
        // still work, just pointing at fresh values.
        ink: {
          DEFAULT: "#0F172A", // slate-900, near-black with a cool blue cast
          soft: "#1E293B",
          faint: "#64748B",
        },
        paper: {
          DEFAULT: "#F8FAFC", // very light cool gray, app background
          dim: "#F1F5F9",
          raised: "#FFFFFF",
        },
        line: "#E2E8F0",

        // Accent palette — vibrant, multi-color, playful SaaS feel
        brass: {
          // primary accent: indigo
          DEFAULT: "#6366F1",
          soft: "#E0E7FF",
          deep: "#4338CA",
        },
        violet: { DEFAULT: "#8B5CF6", soft: "#EDE9FE", deep: "#6D28D9" },
        sky: { DEFAULT: "#0EA5E9", soft: "#E0F2FE", deep: "#0369A1" },
        forest: { DEFAULT: "#10B981", soft: "#D1FAE5", deep: "#047857" }, // success
        amber: { DEFAULT: "#F59E0B", soft: "#FEF3C7", deep: "#B45309" }, // warning
        rust: { DEFAULT: "#EF4444", soft: "#FEE2E2", deep: "#B91C1C" }, // danger
      },
      fontFamily: {
        display: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "12px",
        md: "14px",
        lg: "20px",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        "card-hover": "0 4px 12px -2px rgb(15 23 42 / 0.10), 0 2px 6px -2px rgb(15 23 42 / 0.06)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 55%, #0EA5E9 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;