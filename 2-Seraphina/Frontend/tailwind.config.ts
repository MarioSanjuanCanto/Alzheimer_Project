import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1025px",
      xl: "1280px",
      "2xl": "1700px", // custom value
    },
    extend: {
      fontSize: {
        h1: ["3rem", { lineHeight: "3.5rem", fontWeight: 600 }],
        h2: ["2.25rem", { lineHeight: "2.75rem", fontWeight: 600 }],
        h3: ["2rem", { lineHeight: "2.5rem", fontWeight: 500 }],
        h4: ["1.5rem", { lineHeight: "2rem", fontWeight: 500 }],
        h5: ["1.25rem", { lineHeight: "1.75rem", fontWeight: 500 }],
        body: ["1.25rem", { lineHeight: "1.75rem", fontWeight: 400 }],
      },
      fontFamily: {
        sans: ["Lato", "sans-serif"],
        fraunces: ["Fraunces", "serif"],
      },

      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        bgwhite: "hsl(var(--bgwhite))",
        bggreen: "hsl(var(--bggreen))",
        green: "hsl(var(--green))",
        white: "hsl(var(--white))",
        black: "hsl(var(--black))",
        darkgrey: "hsl(var(--darkgrey))",
        greyhover: "hsl(var(--greyhover))",
        lightgrey: "hsl(var(--lightgrey))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          100: "hsl(var(--primary-100))",
          400: "hsl(var(--primary-400))",
          80: "hsl(var(--primary) / 0.8)",
          hover: "hsl(var(--primary-hover))",
          foreground: "hsl(var(--primary-foreground))",
        },
        red: {
          DEFAULT: "hsl(var(--red))",
          100: "hsl(var(--red-100))",
          200: "hsl(var(--red-200))",

          500: "hsl(var(--red-500))",
        },
        orange: "hsl(var(--orange))",
      },
      borderRadius: {
        sm: "12px",
        md: "20px",
        lg: "32px",
      },
      keyframes: {
        pulseScale: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        drift: {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(20px, -60px) scale(1.05)" },
          "50%": { transform: "translate(-40px, 80px) scale(0.95)" },
          "75%": { transform: "translate(60px, 0px) scale(1.5)" },
          "100%": { transform: "translate(0, 0) scale(1)" },
        },
        driftDiagonal: {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(30px, 30px) scale(1.03)" },
          "50%": { transform: "translate(-30px, -30px) scale(0.97)" },
          "75%": { transform: "translate(20px, -20px) scale(1.02)" },
          "100%": { transform: "translate(0, 0) scale(1)" },
        },
        driftErratic: {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "20%": { transform: "translate(50px, -30px) scale(1.1)" },
          "40%": { transform: "translate(-20px, 40px) scale(0.95)" },
          "60%": { transform: "translate(-60px, -20px) scale(1.05)" },
          "80%": { transform: "translate(30px, 60px) scale(0.9)" },
          "100%": { transform: "translate(0, 0) scale(1)" },
        },
      },
      animation: {
        drift: "drift 18s ease-in-out infinite",
        "drift-slow": "drift 18s ease-in-out infinite",
        "drift-fast": "drift 18s ease-in-out infinite",
        "drift-diagonal": "driftDiagonal 20s ease-in-out infinite",
        "drift-erratic": "driftErratic 15s ease-in-out infinite",
      },
    },
  },
} satisfies Config;
