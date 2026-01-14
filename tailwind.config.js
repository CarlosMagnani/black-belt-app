/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#1D4ED8",
          600: "#1E40AF",
          700: "#1E3A8A",
        },
        app: {
          light: "#F8FAFC",
          dark: "#0B1220",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#0F1A2B",
        },
        subtle: {
          light: "#E5E7EB",
          dark: "#1F2A37",
        },
        strong: {
          light: "#111827",
          dark: "#E5E7EB",
        },
        muted: {
          light: "#6B7280",
          dark: "#9CA3AF",
        },
        ink: "#0F172A",
      },
      borderRadius: {
        card: "24px",
        input: "16px",
        button: "18px",
      },
      boxShadow: {
        card: "0 1px 10px rgba(0,0,0,0.06)",
        pop: "0 12px 30px rgba(15,23,42,0.2)",
      },
      spacing: {
        page: "20px",
        "page-lg": "32px",
        card: "24px",
        input: "16px",
        section: "28px",
      },
      fontFamily: {
        display: ["Sora", "serif"],
        body: ["SpaceGrotesk", "serif"],
      },
    },
  },
};
