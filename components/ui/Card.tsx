import React from "react";
import { View, type ViewProps } from "react-native";

type CardVariant = "default" | "outline" | "ghost";

type CardProps = ViewProps & {
  variant?: CardVariant;
  className?: string;
};

const VARIANT_STYLES: Record<CardVariant, string> = {
  default: "bg-surface-light dark:bg-surface-dark border border-subtle-light dark:border-subtle-dark shadow-card",
  outline: "bg-transparent border border-subtle-light dark:border-subtle-dark",
  ghost: "bg-transparent",
};

export function Card({ variant = "default", className, ...props }: CardProps) {
  return (
    <View
      className={["rounded-card p-card", VARIANT_STYLES[variant], className ?? ""].join(" ")}
      {...props}
    />
  );
}
