import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseServiceRoleKey, supabaseUrl } from "./config";

export function createAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) throw new Error("Thiếu SUPABASE_SERVICE_ROLE_KEY cho tác vụ server-only.");
  return createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}
