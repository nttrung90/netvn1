import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Comment } from "@/types/database";

export const getCommentsByPostId = cache(async (postId: string): Promise<Comment[]> => {
  if (!isSupabaseConfigured || !postId) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("comments")
      .select("id, post_id, email, name, content, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load comments", error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error fetching comments", err);
    return [];
  }
});
