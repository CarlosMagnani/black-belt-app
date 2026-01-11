import "react-native-url-polyfill/auto";

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { createSupabaseAdapters } from "./dojoflow-supabase";

const storage = Platform.OS === "web" ? undefined : AsyncStorage;

export const dojoFlowAdapters = createSupabaseAdapters({ storage });
