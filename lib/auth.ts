import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Profile } from "@/types/database";

export async function getCurrentUser() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, avatar, role, email, status")
    .eq("id", user.id)
    .maybeSingle();
  return { user, profile: profile as Profile | null };
}

export async function requireAdmin() {
  const current = await getCurrentUser();
  if (!current?.user) redirect("/login?next=/admin");
  if (
    current.profile?.role !== "admin" ||
    (current.profile?.status && current.profile.status !== "approved")
  ) {
    redirect("/?error=forbidden");
  }
  return current;
}
