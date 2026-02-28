import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutUp } from "react-native-reanimated";

import { useReducedMotion } from "../../src/core/utils/use-reduced-motion";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false);
    });

    return () => unsubscribe();
  }, []);

  if (!isOffline) return null;

  const entering = reducedMotion ? FadeIn.duration(1) : SlideInUp.duration(300).springify();
  const exiting = reducedMotion ? FadeOut.duration(1) : SlideOutUp.duration(200);

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      className="bg-amber-600 px-4 py-2"
    >
      <Text className="text-center text-xs font-medium text-white">
        Voce esta offline
      </Text>
    </Animated.View>
  );
}
