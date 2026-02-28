import React, { useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

type AvatarSize = "sm" | "md" | "lg" | "xl";

type AvatarProps = {
  uri?: string | null;
  name?: string | null;
  size?: AvatarSize;
  editable?: boolean;
  onImageSelected?: (uri: string) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  className?: string;
};

const SIZE_MAP: Record<AvatarSize, { container: number; text: string; icon: number }> = {
  sm: { container: 40, text: "text-sm", icon: 16 },
  md: { container: 56, text: "text-lg", icon: 20 },
  lg: { container: 80, text: "text-2xl", icon: 28 },
  xl: { container: 120, text: "text-4xl", icon: 40 },
};

const getInitials = (name?: string | null): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export function Avatar({
  uri,
  name,
  size = "md",
  editable = false,
  onImageSelected,
  onUploadStart,
  onUploadEnd,
  className,
}: AvatarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const sizeConfig = SIZE_MAP[size];
  const initials = getInitials(name);

  const handlePickImage = async () => {
    if (!editable) return;

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      return;
    }

    setIsLoading(true);
    onUploadStart?.();

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected?.(result.assets[0].uri);
      }
    } finally {
      setIsLoading(false);
      onUploadEnd?.();
    }
  };

  const containerStyle = {
    width: sizeConfig.container,
    height: sizeConfig.container,
    borderRadius: sizeConfig.container / 2,
  };

  const content = uri ? (
    <Image
      source={{ uri }}
      style={containerStyle}
      className="bg-subtle-dark"
    />
  ) : (
    <View
      style={containerStyle}
      className="items-center justify-center bg-brand-600"
    >
      <Text className={`font-display font-semibold text-white ${sizeConfig.text}`}>
        {initials}
      </Text>
    </View>
  );

  if (!editable) {
    return <View className={className}>{content}</View>;
  }

  return (
    <Pressable
      onPress={handlePickImage}
      className={`relative ${className ?? ""}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
    >
      {content}
      {isLoading ? (
        <View
          style={containerStyle}
          className="absolute inset-0 items-center justify-center bg-black/50"
        >
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <View
          className="absolute bottom-0 right-0 items-center justify-center rounded-full bg-brand-500 p-1.5"
          style={{ 
            width: sizeConfig.icon + 8, 
            height: sizeConfig.icon + 8,
            borderWidth: 2,
            borderColor: "#0A0F1A",
          }}
        >
          <Text className="text-white text-xs">✏️</Text>
        </View>
      )}
    </Pressable>
  );
}
