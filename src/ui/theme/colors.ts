/**
 * Shared color constants for use in components
 * These match the NativeWind/Tailwind tokens defined in tailwind.config.js
 */

export const colors = {
  // Brand colors
  brand: {
    400: "#A78BFA",
    500: "#8B5CF6",
    600: "#7C3AED",
  },
  
  // Gradient presets
  gradients: {
    primary: ["#7C3AED", "#6366F1"] as const,
    disabled: ["#374151", "#374151"] as const,
  },
  
  // Status colors
  success: "#34D399",
  error: "#F87171",
  
  // Text colors (dark theme)
  text: {
    primary: "#F8FAFC",
    secondary: "#94A3B8",
    muted: "#64748B",
  },
  
  // Icon colors
  icon: {
    default: "#94A3B8",
    brand: "#8B5CF6",
  },
} as const;

export type GradientPreset = keyof typeof colors.gradients;
