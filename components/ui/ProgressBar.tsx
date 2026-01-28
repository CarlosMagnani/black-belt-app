import React from "react";
import { View } from "react-native";

type ProgressBarProps = {
  value: number;
  className?: string;
  indicatorClassName?: string;
};

export function ProgressBar({ value, className, indicatorClassName }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const remaining = Math.max(1 - clamped, 0);

  return (
    <View
      className={[
        "flex-row h-2 w-full overflow-hidden rounded-full bg-subtle-light dark:bg-subtle-dark",
        className ?? "",
      ].join(" ")}
    >
      <View
        className={[
          "h-full rounded-full bg-brand-600",
          indicatorClassName ?? "",
        ].join(" ")}
        style={{ flex: clamped }}
      />
      <View style={{ flex: remaining }} />
    </View>
  );
}
