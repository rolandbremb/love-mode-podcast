import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Postcards: Andrea's tangerine and bubblegum, inked in warm plum on blush paper
        shell: "#fff2ec",
        peach: "#ffe0d6",
        bubblegum: "#ffcafd",
        tangerine: {
          DEFAULT: "#ff6339",
          ink: "#e5482a",
        },
        plum: "#2d1530",
        mauve: "#6b4a68",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        hand: ["var(--font-hand)", "cursive"],
      },
      boxShadow: {
        postal: "0 30px 60px rgba(45, 21, 48, 0.08)",
      },
      dropShadow: {
        stamp: "0 18px 22px rgba(45, 21, 48, 0.12)",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
