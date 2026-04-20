import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Neutral, premium-but-accessible palette
        bone: "#F7F3EC",
        paper: "#FBF9F4",
        ink: "#1A1A1A",
        stone: {
          50:  "#F5F4F1",
          100: "#EAE8E2",
          200: "#D6D3CA",
          300: "#B9B5A9",
          400: "#948F80",
          500: "#6E6A5E",
          600: "#51503F",
          700: "#3D3A30",
          800: "#2A2820",
          900: "#1C1B15"
        },
        accent: {
          DEFAULT: "#8B5A3C",  // warm sienna
          soft:    "#B27E5C",
          ink:     "#4B2E1E"
        }
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans:  ["system-ui", "-apple-system", "Segoe UI", "Inter", "sans-serif"]
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        lg: "14px",
        xl: "22px"
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -12px rgba(0,0,0,0.12)",
        ring: "0 0 0 3px rgba(139,90,60,0.22)"
      },
      letterSpacing: {
        tight2: "-0.02em"
      }
    }
  },
  plugins: []
};

export default config;
