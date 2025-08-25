import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        shine: {
          "0%": { "background-position": "100%" },
          "100%": { "background-position": "-100%" },
        },
      },
      animation: {
        shine: "shine 3s linear infinite",
      },
      fontFamily: {
        poppins: ["var(--font-poppins)"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    require("tailwindcss-motion"),
    require("@designbycode/tailwindcss-text-shadow"),
    heroui({
      themes: {
        light: {
          colors: {
            //@ts-expect-error this is a custom color name
            "secondary-background": "#F4F4F5",
          },
        },
        dark: {
          colors: {
            background: "#0D0C0F",
            //@ts-expect-error this is a custom color name
            "secondary-background": "#18181B",
          },
        },
      },
    }),
  ],
};

export default config;
