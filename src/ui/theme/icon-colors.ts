type Theme = "light" | "dark";
type IconVariant = "active" | "inactive" | "muted" | "brand" | "header";

const ICON_COLORS: Record<Theme, Record<IconVariant, string>> = {
  light: {
    active: "#1E3A8A",
    inactive: "#94A3B8",
    muted: "#64748B",
    brand: "#7C3AED",
    header: "#0F172A",
  },
  dark: {
    active: "#EEF2FF",
    inactive: "#94A3B8",
    muted: "#64748B",
    brand: "#A78BFA",
    header: "#E5E7EB",
  },
};

export function getIconColor(theme: Theme, variant: IconVariant = "inactive"): string {
  return ICON_COLORS[theme][variant];
}
