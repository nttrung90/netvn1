import { cache } from "react";
import type { PaginatedPosts, PostWithRelations } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { buildPostSearchClauses, collectSearchRelationIds, type SearchRelationClient } from "./search";

const postSelect = "*, author:profiles!posts_author_id_fkey(name, avatar), category:categories(id, name, slug), post_tags(tags(id, name, slug))";
type PostTagRelation = { tags: { id: string; name: string; slug: string } | null };

function emptyPage(page: number, pageSize: number): PaginatedPosts {
  return { posts: [], total: 0, page, pageSize, pageCount: 1 };
}

function normalizePost(post: Record<string, unknown>): PostWithRelations {
  const { post_tags, ...rest } = post;
  const relations = Array.isArray(post_tags) ? post_tags as unknown as PostTagRelation[] : [];
  return { ...(rest as unknown as PostWithRelations), tags: relations.flatMap((entry) => entry.tags ? [entry.tags] : []) };
}

export const getPublishedPosts = cache(async (page = 1, pageSize = 9, categorySlug?: string): Promise<PaginatedPosts> => {
  if (!isSupabaseConfigured) return emptyPage(page, pageSize);
  const supabase = await createClient();
  const start = Math.max(0, (page - 1) * pageSize);
  const select = categorySlug ? postSelect.replace("category:categories", "category:categories!inner") : postSelect;
  let query = supabase.from("posts").select(select, { count: "exact" }).eq("status", "published").order("published_at", { ascending: false }).range(start, start + pageSize - 1);
  if (categorySlug) query = query.eq("category.slug", categorySlug);
  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { posts: ((data ?? []) as unknown as Record<string, unknown>[]).map(normalizePost), total: count ?? 0, page, pageSize, pageCount: Math.max(1, Math.ceil((count ?? 0) / pageSize)) };
});

export const getPostBySlug = cache(async (slug: string) => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select(postSelect).eq("slug", slug).eq("status", "published").maybeSingle();
  if (error) throw new Error(error.message);
  return data ? normalizePost(data) : null;
});

export const getFeaturedPosts = cache(async (limit = 3) => {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select(postSelect).eq("status", "published").order("view_count", { ascending: false }).order("published_at", { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizePost);
});

export const getPopularPosts = cache(async (limit = 4) => getFeaturedPosts(limit));

export const getRelatedPosts = cache(async (post: PostWithRelations, limit = 3) => {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  let query = supabase.from("posts").select(postSelect).eq("status", "published").neq("id", post.id).order("published_at", { ascending: false }).limit(limit);
  if (post.category?.id) query = query.eq("category_id", post.category.id);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizePost);
});

export const getPostsByCategory = cache(async (limitPerCategory = 3) => {
  if (!isSupabaseConfigured) return [];
  const categories = await getCategories();
  const result = await Promise.all(categories.map(async (category) => ({ category, posts: (await getPublishedPosts(1, limitPerCategory, category.slug)).posts })));
  return result.filter((section) => section.posts.length > 0);
});

export const getCategories = cache(async () => {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getTags = cache(async () => {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("tags").select("*").order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const searchPublishedPosts = cache(async (query: string, page = 1, pageSize = 9): Promise<PaginatedPosts> => {
  if (!query.trim()) return { posts: [], total: 0, page, pageSize, pageCount: 1 };
  if (!isSupabaseConfigured) return emptyPage(page, pageSize);
  const supabase = await createClient();
  const start = Math.max(0, (page - 1) * pageSize);
  const { categoryIds, postIdsFromTags } = await collectSearchRelationIds(supabase as unknown as SearchRelationClient, query);
  const { clauses } = buildPostSearchClauses(query, categoryIds, postIdsFromTags);
  const { data, error, count } = await supabase.from("posts").select(postSelect, { count: "exact" }).eq("status", "published").or(clauses.join(",")).order("published_at", { ascending: false }).range(start, start + pageSize - 1);
  if (error) throw new Error(error.message);
  return { posts: (data ?? []).map(normalizePost), total: count ?? 0, page, pageSize, pageCount: Math.max(1, Math.ceil((count ?? 0) / pageSize)) };
});

export async function recordView(slug: string) {
  if (!isSupabaseConfigured) return;
  const supabase = await createClient();
  await supabase.rpc("increment_post_view", { post_slug: slug });
}

export async function getAdminPosts() {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select(postSelect).order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizePost);
}

export async function getAdminPost(id: string) {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select(postSelect).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? normalizePost(data) : null;
}

export async function getDashboardStats() {
  if (!isSupabaseConfigured) return { total: 0, published: 0, drafts: 0, views: 0, latest: [] };
  const supabase = await createClient();
  const [{ count: total }, { count: published }, { count: drafts }, { data: views }, latest] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("posts").select("view_count"),
    supabase.from("posts").select(postSelect).order("updated_at", { ascending: false }).limit(5),
  ]);
  return { total: total ?? 0, published: published ?? 0, drafts: drafts ?? 0, views: (views ?? []).reduce((sum, item) => sum + Number(item.view_count ?? 0), 0), latest: (latest.data ?? []).map(normalizePost) };
}
