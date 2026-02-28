import "../global.css";

import { useEffect, type ReactNode } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

import { blackBeltAdapters } from "../src/infra/supabase/adapters";
import { ThemeProvider, useTheme } from "../src/ui/theme/ThemeProvider";

function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const { unsubscribe } = blackBeltAdapters.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.replace("/auth");
      }
    });
    return () => unsubscribe();
  }, [router]);

  return <>{children}</>;
}

function RootShell() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View className="flex-1 bg-app-light dark:bg-app-dark">
      <StatusBar style={isDark ? "light" : "dark"} />
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthGate>
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
