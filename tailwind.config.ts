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
        // Soft pop: bubblegum through cherry to wine
        brand: {
          50:  "#fff1f4",
          100: "#ffe0e8",
          200: "#ffc2d3",
          300: "#ff94b2",
          400: "#f75f8c",
          500: "#e8336b",
          600: "#d41f55",
          700: "#b01444",
          800: "#8e1330",
          900: "#6e0f27",
          950: "#420615",
        },
        cream: "#fff7f0",
        blush: "#ffe4ea",
        butter: "#ffd66b",
        ink: "#3a0a18",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        display: ["var(--theme-heading-font)", "ui-sans-serif", "system-ui", "sans-serif"],
        hand: ["var(--font-hand)", "cursive"],
      },
      boxShadow: {
        pop: "4px 4px 0 0 #3a0a18",
        "pop-sm": "3px 3px 0 0 #3a0a18",
        "pop-lg": "8px 8px 0 0 #3a0a18",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        rise: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(var(--tw-rotate, 0))" },
          "50%": { transform: "translateY(-8px) rotate(var(--tw-rotate, 0))" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        rise: "rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "spin-slow": "spin 18s linear infinite",
        float: "float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
