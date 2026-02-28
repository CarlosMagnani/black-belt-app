import React, { useEffect } from "react";
import type { DimensionValue } from "react-native";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import { useReducedMotion } from "../../src/core/utils/use-reduced-motion";

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
};

export function Skeleton({ width, height = 16, borderRadius = 8, className }: SkeletonProps) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 0.4;
      return;
    }
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
    return () => cancelAnimation(opacity);
  }, [reducedMotion, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View className={className}>
      <Animated.View
        style={[
          {
            width: (width ?? "100%") as DimensionValue,
            height,
            borderRadius,
          },
          animatedStyle,
        ]}
        className="bg-subtle-light dark:bg-subtle-dark"
      />
    </View>
  );
}
