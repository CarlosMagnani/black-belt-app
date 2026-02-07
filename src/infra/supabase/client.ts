import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSupabaseClient } from "./blackbelt-supabase";

/**
 * Singleton Supabase client instance with AsyncStorage for session persistence
 */
export const supabase = createSupabaseClient({
  storage: AsyncStorage,
});
