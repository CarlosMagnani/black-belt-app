import React from "react";
import { View, type ViewProps } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useReducedMotion } from "../../src/core/utils/use-reduced-motion";

type CardVariant = "default" | "outline" | "ghost";

type CardProps = ViewProps & {
  variant?: CardVariant;
  animate?: boolean;
  className?: string;
};

const VARIANT_STYLES: Record<CardVariant, string> = {
  default: "bg-surface-light dark:bg-surface-dark border border-subtle-light dark:border-subtle-dark shadow-card",
  outline: "bg-transparent border border-subtle-light dark:border-subtle-dark",
  ghost: "bg-transparent",
};

export function Card({ variant = "default", animate = false, className, ...props }: CardProps) {
  const reducedMotion = useReducedMotion();
  const cls = ["rounded-card p-card", VARIANT_STYLES[variant], className ?? ""].join(" ");

  if (animate && !reducedMotion) {
    return (
      <Animated.View
        entering={FadeInDown.duration(250).springify()}
        className={cls}
        {...props}
      />
    );
  }

  return <View className={cls} {...props} />;
}
