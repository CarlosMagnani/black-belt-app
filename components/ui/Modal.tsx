import React from "react";
import {
  Modal as RNModal,
  Pressable,
  ScrollView,
  Text,
  View,
  type ModalProps as RNModalProps,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { X } from "lucide-react-native";

import { getIconColor } from "../../src/ui/theme/icon-colors";
import { useTheme } from "../../src/ui/theme/ThemeProvider";

type ModalProps = RNModalProps & {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  showCloseButton?: boolean;
  maxWidth?: "sm" | "md" | "lg";
};

const MAX_WIDTH_MAP = {
  sm: 400,
  md: 500,
  lg: 600,
};

export function Modal({
  title,
  onClose,
  children,
  showCloseButton = true,
  maxWidth = "md",
  visible,
  ...props
}: ModalProps) {
  const { theme } = useTheme();
  const iconColor = getIconColor(theme, "header");

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      {...props}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable
          className="flex-1 items-center justify-center px-4"
          onPress={onClose}
        >
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            className="absolute inset-0 bg-black/60"
          />
          <Animated.View
            entering={SlideInDown.duration(300).springify()}
            exiting={SlideOutDown.duration(200)}
          >
            <Pressable
              className="w-full rounded-card bg-surface-light p-card dark:bg-surface-dark"
              style={{ maxWidth: MAX_WIDTH_MAP[maxWidth] }}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {(title || showCloseButton) ? (
                <View className="mb-4 flex-row items-center justify-between">
                  {title ? (
                    <Text className="font-display text-xl text-strong-light dark:text-strong-dark">
                      {title}
                    </Text>
                  ) : (
                    <View />
                  )}
                  {showCloseButton ? (
                    <Pressable
                      onPress={onClose}
                      accessibilityRole="button"
                      accessibilityLabel="Fechar"
                      className="rounded-full p-2"
                      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    >
                      <X size={20} color={iconColor} />
                    </Pressable>
                  ) : null}
                </View>
              ) : null}

              {/* Content */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </KeyboardAvoidingView>
    </RNModal>
  );
}
