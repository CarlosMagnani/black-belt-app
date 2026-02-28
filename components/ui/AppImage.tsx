import React from "react";
import { Image as ExpoImage, type ImageProps as ExpoImageProps } from "expo-image";

type AppImageProps = Omit<ExpoImageProps, "placeholder"> & {
  /** Blurhash placeholder string for loading transition */
  blurhash?: string;
  /** Accessible description of the image */
  alt?: string;
};

const DEFAULT_BLURHASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

export function AppImage({
  blurhash = DEFAULT_BLURHASH,
  alt,
  transition = 200,
  cachePolicy = "memory-disk",
  contentFit = "cover",
  ...rest
}: AppImageProps) {
  return (
    <ExpoImage
      placeholder={{ blurhash }}
      transition={transition}
      cachePolicy={cachePolicy}
      contentFit={contentFit}
      accessibilityLabel={alt}
      {...rest}
    />
  );
}
