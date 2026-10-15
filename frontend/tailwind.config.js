/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        metro: {
          950: "#070B0E",
          900: "#0B1015",
          850: "#10161E",
          800: "#151D26",
          750: "#1C2633",
          700: "#243242",
          600: "#33455B",
          500: "#4B6382",
          400: "#7089A8",
          300: "#9CB0C9",
          200: "#CBD8E7",
          100: "#E5EDF6",
          50:  "#F4F7FB",
        },
        civic: {
          mint: {
            DEFAULT: "#10B981",
            hover: "#059669",
            light: "#34D399",
            glow: "rgba(16, 185, 129, 0.2)",
            subtle: "rgba(16, 185, 129, 0.08)",
          },
          panel: {
            DEFAULT: "#10161E",
            border: "#1C2936",
            hover: "#151F2B",
            muted: "#0C1218",
          },
          status: {
            critical: "#F43F5E",
            high: "#F59E0B",
            medium: "#0EA5E9",
            low: "#10B981",
          }
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        "mint-glow": "0 0 20px -5px rgba(16, 185, 129, 0.3)",
        "card-subtle": "0 4px 20px -2px rgba(0, 0, 0, 0.45)",
      }
    },
  },
  plugins: [],
}
