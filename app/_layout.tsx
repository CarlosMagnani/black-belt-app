import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

import { ThemeProvider, useTheme } from "../src/ui/theme/ThemeProvider";

function RootShell() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View className={["flex-1 bg-app-light dark:bg-app-dark", isDark ? "dark" : ""].join(" ")}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootShell />
    </ThemeProvider>
  );
}
