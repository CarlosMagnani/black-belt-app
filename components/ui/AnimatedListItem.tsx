import React from "react";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useReducedMotion } from "../../src/core/utils/use-reduced-motion";

type AnimatedListItemProps = {
  index?: number;
  children: React.ReactNode;
  className?: string;
};

export function AnimatedListItem({ index = 0, children, className }: AnimatedListItemProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <Animated.View className={className}>{children}</Animated.View>;
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(250).delay(index * 60).springify()}
      className={className}
    >
      {children}
    </Animated.View>
  );
}
