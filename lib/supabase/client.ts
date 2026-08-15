import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseConfig } from "./config";

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = requireSupabaseConfig();
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
