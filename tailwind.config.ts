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
        brand: {
          50:  "#faf5f6",
          100: "#f5e9ec",
          200: "#edd6db",
          300: "#dfb6bf",
          400: "#cb8d9b",
          500: "#b86b7c",
          600: "#a05167",
          700: "#864455",
          800: "#713c4a",
          900: "#613643",
          950: "#351b23",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
