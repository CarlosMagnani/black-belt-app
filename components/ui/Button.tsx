import React from "react";
import { Pressable, Text, type PressableProps } from "react-native";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

type ButtonProps = PressableProps & {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  textClassName?: string;
};

const VARIANT_STYLES: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: "bg-brand-600 border border-brand-600",
    text: "text-white",
  },
  secondary: {
    container: "bg-surface-light dark:bg-surface-dark border border-subtle-light dark:border-subtle-dark",
    text: "text-strong-light dark:text-strong-dark",
  },
  ghost: {
    container: "bg-transparent",
    text: "text-strong-light dark:text-strong-dark",
  },
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 rounded-button",
  md: "px-5 py-3 rounded-button",
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  className,
  textClassName,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={[
        "items-center justify-center",
        SIZE_STYLES[size],
        styles.container,
        disabled ? "opacity-60" : "",
        className ?? "",
      ].join(" ")}
      style={({ pressed }) => (pressed && !disabled ? { opacity: 0.9 } : undefined)}
      {...props}
    >
      {label ? (
        <Text className={[styles.text, "font-body text-sm", textClassName ?? ""].join(" ")}>
          {label}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
