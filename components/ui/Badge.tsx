import React from "react";
import { Text, View } from "react-native";

type BadgeVariant = "brand" | "neutral" | "outline";

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  className?: string;
  textClassName?: string;
};

const VARIANT_STYLES: Record<BadgeVariant, { container: string; text: string }> = {
  brand: {
    container: "bg-brand-50 border border-brand-100",
    text: "text-brand-700",
  },
  neutral: {
    container: "bg-surface-light border border-subtle-light dark:bg-surface-dark dark:border-subtle-dark",
    text: "text-strong-light dark:text-strong-dark",
  },
  outline: {
    container: "border border-subtle-light dark:border-subtle-dark",
    text: "text-muted-light dark:text-muted-dark",
  },
};

export function Badge({
  label,
  variant = "neutral",
  className,
  textClassName,
}: BadgeProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <View
      className={[
        "rounded-full px-3 py-1",
        styles.container,
        className ?? "",
      ].join(" ")}
    >
      <Text className={["text-xs font-body", styles.text, textClassName ?? ""].join(" ")}>
        {label}
      </Text>
    </View>
  );
}
