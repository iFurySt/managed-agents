import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#fcfcfb",
        ink: "#0b0b0b",
        primary: "#0b0b0b",
        muted: "#898781",
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
        serif: ["anthropicSerif", "\"anthropicSerif Fallback\"", "Georgia", "\"Times New Roman\"", "serif"],
        voice: [
          "anthropicSerif",
          "\"anthropicSerif Fallback\"",
          "Georgia",
          "\"Arial Hebrew\"",
          "\"Noto Sans Hebrew\"",
          "\"Times New Roman\"",
          "Times",
          "\"Hiragino Sans\"",
          "\"Yu Gothic\"",
          "Meiryo",
          "\"Noto Sans CJK JP\"",
          "\"PingFang TC\"",
          "\"Microsoft JhengHei\"",
          "\"Noto Sans CJK TC\"",
          "\"PingFang SC\"",
          "\"Microsoft YaHei\"",
          "\"Noto Sans CJK SC\"",
          "\"Apple SD Gothic Neo\"",
          "\"Malgun Gothic\"",
          "\"Noto Sans CJK KR\"",
          "serif",
          "ui-serif",
          "Georgia",
          "\"Times New Roman\"",
          "serif"
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      }
    }
  },
  plugins: []
} satisfies Config;
