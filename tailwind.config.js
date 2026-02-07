/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand colors - BJJ inspired
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1", // Primary
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        // Belt colors
        belt: {
          white: "#FFFFFF",
          blue: "#2563EB",
          purple: "#7C3AED",
          brown: "#92400E",
          black: "#171717",
          coral: "#F97316",
          red: "#DC2626",
        },
        // App backgrounds
        app: {
          light: "#F8FAFC",
          dark: "#0A0F1A",
        },
        // Surface colors (cards, modals)
        surface: {
          light: "#FFFFFF",
          dark: "#111827",
          "dark-elevated": "#1F2937",
        },
        // Subtle backgrounds
        subtle: {
          light: "#F1F5F9",
          dark: "#1E293B",
        },
        // Text colors
        text: {
          primary: {
            light: "#0F172A",
            dark: "#F8FAFC",
          },
          secondary: {
            light: "#475569",
            dark: "#94A3B8",
          },
          muted: {
            light: "#94A3B8",
            dark: "#64748B",
          },
        },
        // Semantic colors
        success: {
          light: "#10B981",
          dark: "#34D399",
        },
        warning: {
          light: "#F59E0B",
          dark: "#FBBF24",
        },
        error: {
          light: "#EF4444",
          dark: "#F87171",
        },
        // Legacy tokens (keep for backward compatibility)
        strong: {
          light: "#0F172A",
          dark: "#F8FAFC",
        },
        muted: {
          light: "#94A3B8",
          dark: "#64748B",
        },
        // Glassmorphism
        glass: {
          light: "rgba(255, 255, 255, 0.1)",
          medium: "rgba(255, 255, 255, 0.15)",
          dark: "rgba(0, 0, 0, 0.2)",
        },
      },
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        'full': '9999px',
        // Semantic
        'card': '20px',
        'input': '12px',
        'button': '12px',
        'avatar': '9999px',
      },
      boxShadow: {
        'none': 'none',
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.15)',
        // Dark mode optimized
        'card': '0 4px 20px rgba(0, 0, 0, 0.25)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.35)',
        'glow-brand': '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.4)',
        'inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        'page': '16px',
        'page-lg': '24px',
        'section': '24px',
        'card': '16px',
        'card-lg': '20px',
        'input': '14px',
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrainsMono", "monospace"],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
