import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark";
type ThemePreference = Theme | "system";

type ThemeContextValue = {
  theme: Theme;
  preference: ThemePreference;
  isReady: boolean;
  setTheme: (next: Theme) => Promise<void>;
  setPreference: (next: ThemePreference) => Promise<void>;
  toggle: () => Promise<void>;
};

const STORAGE_KEY = "themePreference";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [isReady, setIsReady] = useState(false);

  const theme: Theme =
    preference === "system" ? (systemScheme === "dark" ? "dark" : "light") : preference;

  useEffect(() => {
    let isActive = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!isActive) return;
        if (value === "light" || value === "dark" || value === "system") {
          setPreferenceState(value);
        }
        setIsReady(true);
      })
      .catch(() => {
        if (!isActive) return;
        setIsReady(true);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const setPreference = async (next: ThemePreference) => {
    setPreferenceState(next);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  };

  const setTheme = async (next: Theme) => {
    await setPreference(next);
  };

  const toggle = async () => {
    const next = theme === "dark" ? "light" : "dark";
    await setPreference(next);
  };

  const value = useMemo(
    () => ({
      theme,
      preference,
      isReady,
      setTheme,
      setPreference,
      toggle,
    }),
    [theme, preference, isReady]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
