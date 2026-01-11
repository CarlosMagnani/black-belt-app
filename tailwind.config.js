/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
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
        ink: "#0F172A",
      },
      fontFamily: {
        display: ["Sora", "serif"],
        body: ["SpaceGrotesk", "serif"],
      },
    },
  },
};
