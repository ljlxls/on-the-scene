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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#1a237e",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#ffd700",
          foreground: "#1a237e",
        },
      },
    },
  },
  plugins: [],
};
export default config;
