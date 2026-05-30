/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef5fb",
          100: "#d9e8f4",
          500: "#315d8b",
          700: "#183a5a",
          800: "#102c46",
          900: "#081d31",
          950: "#041321"
        },
        gold: {
          100: "#f8eed0",
          300: "#e6c46a",
          500: "#c9962f",
          700: "#936719"
        },
        clinic: {
          50: "#f7f9fb",
          100: "#edf1f5",
          200: "#dde5ee",
          700: "#4c5f73"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(8, 29, 49, 0.10)",
        lift: "0 22px 60px rgba(8, 29, 49, 0.18)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};
