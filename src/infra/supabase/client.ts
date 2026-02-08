import "react-native-url-polyfill/auto";

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { createSupabaseClient } from "./blackbelt-supabase";

const storage = Platform.OS === "web" ? undefined : AsyncStorage;

/**
 * Singleton Supabase client instance.
 * ALL code must use this single instance (directly or via blackBeltAdapters).
 */
export const supabase = createSupabaseClient({ storage });
