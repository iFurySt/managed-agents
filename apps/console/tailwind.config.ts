import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#fcfcfb",
        ink: "#0b0b0b",
        muted: "#77736d",
        line: "#e8e6e1",
        clay: "#c6613f",
        fill: "#f2f1ee"
      },
      borderRadius: {
        cds: "8px",
        control: "7px"
      },
      fontFamily: {
        sans: ["anthropicSans", "\"anthropicSans Fallback\"", "system-ui", "\"Segoe UI\"", "Roboto", "Helvetica", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      }
    }
  },
  plugins: []
} satisfies Config;
