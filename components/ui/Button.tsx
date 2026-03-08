import React from "react";
import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { hapticLight } from "../../src/core/utils/haptics";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

type ButtonProps = PressableProps & {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
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
  sm: "px-4 py-2 min-h-[44px] rounded-button",
  md: "px-5 py-3 min-h-[48px] rounded-button",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  className,
  textClassName,
  disabled,
  children,
  onPress,
  ...props
}: ButtonProps) {
  const styles = VARIANT_STYLES[variant];
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) scale.value = withTiming(0.97, { duration: 80 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 120 });
  };

  const handlePress = (e: Parameters<NonNullable<PressableProps["onPress"]>>[0]) => {
    if (isDisabled) return;
    void hapticLight();
    onPress?.(e);
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      className={[
        "items-center justify-center",
        SIZE_STYLES[size],
        styles.container,
        isDisabled ? "opacity-60" : "",
        className ?? "",
      ].join(" ")}
      style={animatedStyle}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#fff" : "#6366F1"}
          size="small"
        />
      ) : label ? (
        <Text className={[styles.text, "font-body font-medium text-sm", textClassName ?? ""].join(" ")}>
          {label}
        </Text>
      ) : (
        children
      )}
    </AnimatedPressable>
  );
}
