import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

type ProgressBarProps = {
  value: number;
  className?: string;
  indicatorClassName?: string;
};

export function ProgressBar({ value, className, indicatorClassName }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(clamped, { duration: 300 });
  }, [clamped, animatedWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    flex: animatedWidth.value,
  }));

  const remainingStyle = useAnimatedStyle(() => ({
    flex: Math.max(1 - animatedWidth.value, 0),
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`${Math.round(clamped * 100)}% completo`}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      className={[
        "flex-row h-2 w-full overflow-hidden rounded-full bg-subtle-light dark:bg-subtle-dark",
        className ?? "",
      ].join(" ")}
    >
      <Animated.View
        className={[
          "h-full rounded-full bg-brand-600",
          indicatorClassName ?? "",
        ].join(" ")}
        style={indicatorStyle}
      />
      <Animated.View style={remainingStyle} />
    </View>
  );
}
