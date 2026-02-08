import { supabase } from "./client";
import { createSupabaseAdapters } from "./blackbelt-supabase";

/**
 * Single adapter instance backed by the singleton Supabase client.
 * Never create a second client — always use this or import `supabase` from ./client.
 */
export const blackBeltAdapters = createSupabaseAdapters({ client: supabase });
