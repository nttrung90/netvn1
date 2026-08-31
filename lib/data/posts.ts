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

function reportPublicDataError(operation: string, error: unknown) {
  // Keep public pages available when Supabase is temporarily unavailable. The
  // complete error remains in the Vercel runtime log for diagnosis.
  console.error(`Supabase query failed (${operation})`, error);
}

function normalizePost(post: Record<string, unknown>): PostWithRelations {
  const { post_tags, ...rest } = post;
  const relations = Array.isArray(post_tags) ? post_tags as unknown as PostTagRelation[] : [];
  return { ...(rest as unknown as PostWithRelations), tags: relations.flatMap((entry) => entry.tags ? [entry.tags] : []) };
}

export const getPublishedPosts = cache(async (
  page = 1,
  pageSize = 9,
  categorySlug?: string,
  excludeIds?: string[],
): Promise<PaginatedPosts> => {
  if (!isSupabaseConfigured) return emptyPage(page, pageSize);
  const supabase = await createClient();
  const start = Math.max(0, (page - 1) * pageSize);
  const select = categorySlug ? postSelect.replace("category:categories", "category:categories!inner") : postSelect;
  let query = supabase
    .from("posts")
    .select(select, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (categorySlug) query = query.eq("category.slug", categorySlug);
  if (excludeIds && excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  query = query.range(start, start + pageSize - 1);

  const { data, error, count } = await query;
  if (error) {
    reportPublicDataError("getPublishedPosts", error);
    return emptyPage(page, pageSize);
  }
  return {
    posts: ((data ?? []) as unknown as Record<string, unknown>[]).map(normalizePost),
    total: count ?? 0,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
});

export const getPostBySlug = cache(async (slug: string) => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select(postSelect).eq("slug", slug).eq("status", "published").maybeSingle();
  if (error) {
    reportPublicDataError("getPostBySlug", error);
    return null;
  }
  return data ? normalizePost(data) : null;
});

export const getFeaturedPosts = cache(async (limit = 3, excludeIds?: string[]) => {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select(postSelect)
    .eq("status", "published")
    .order("view_count", { ascending: false })
    .order("published_at", { ascending: false });

  if (excludeIds && excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  const { data, error } = await query.limit(limit);
  if (error) {
    reportPublicDataError("getFeaturedPosts", error);
    return [];
  }
  return (data ?? []).map(normalizePost);
});

export const getPopularPosts = cache(async (limit = 4, excludeIds?: string[]) => {
  return getFeaturedPosts(limit, excludeIds);
});

export const getRelatedPosts = cache(async (post: PostWithRelations, limit = 3) => {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const excludeList = [post.id];

  let related: PostWithRelations[] = [];

  // 1. First try to find posts in the same category
  if (post.category?.id) {
    const { data, error } = await supabase
      .from("posts")
      .select(postSelect)
      .eq("status", "published")
      .eq("category_id", post.category.id)
      .not("id", "in", `(${excludeList.join(",")})`)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (!error && data) {
      related = data.map(normalizePost);
      for (const item of related) {
        excludeList.push(item.id);
      }
    }
  }

  // 2. If not enough posts in same category, supplement with latest other posts without duplicates
  if (related.length < limit) {
    const needed = limit - related.length;
    const { data: fallbackData } = await supabase
      .from("posts")
      .select(postSelect)
      .eq("status", "published")
      .not("id", "in", `(${excludeList.join(",")})`)
      .order("published_at", { ascending: false })
      .limit(needed);

    if (fallbackData) {
      related = [...related, ...fallbackData.map(normalizePost)];
    }
  }

  return related;
});

export const getPostsByCategory = cache(async (limitPerCategory = 3, excludeIds?: string[]) => {
  if (!isSupabaseConfigured) return [];
  const categories = await getCategories();
  const usedIds = new Set<string>(excludeIds ?? []);
  const result: Array<{ category: (typeof categories)[number]; posts: PostWithRelations[] }> = [];

  for (const category of categories) {
    const currentExclude = Array.from(usedIds);
    const { posts } = await getPublishedPosts(1, limitPerCategory, category.slug, currentExclude);
    if (posts.length > 0) {
      for (const p of posts) {
        usedIds.add(p.id);
      }
      result.push({ category, posts });
    }
  }

  return result;
});

export type HomeFeedData = {
  featured: PostWithRelations[];
  latest: PostWithRelations[];
  popular: PostWithRelations[];
  sections: Array<{ category: { id: string; name: string; slug: string; description: string | null }; posts: PostWithRelations[] }>;
  categories: Array<{ id: string; name: string; slug: string; description: string | null }>;
};

/**
 * Coordinated home feed fetcher that guarantees 100% unique posts across all sections:
 * - Featured (Top 3 by views/priority)
 * - Popular / Trending (Next top by views, strictly excluding Featured)
 * - Latest Stream (Latest by published date, strictly excluding Featured & Popular)
 * - Category Sections (Recent per category, strictly excluding all previously displayed posts)
 */
export const getHomeFeedData = cache(async (): Promise<HomeFeedData> => {
  if (!isSupabaseConfigured) {
    return { featured: [], latest: [], popular: [], sections: [], categories: [] };
  }

  const supabase = await createClient();

  // Fetch categories and published posts pool in parallel
  const [categoriesRes, postsRes] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("posts").select(postSelect).eq("status", "published").order("published_at", { ascending: false }).limit(50),
  ]);

  const categories = categoriesRes.data ?? [];
  const allPosts = (postsRes.data ?? []).map(normalizePost);

  if (!allPosts.length) {
    return { featured: [], latest: [], popular: [], sections: [], categories };
  }

  const displayedIds = new Set<string>();

  // 1. Featured posts: Top 3 by view_count DESC, published_at DESC
  const sortedByViews = [...allPosts].sort((a, b) => {
    if (b.view_count !== a.view_count) return b.view_count - a.view_count;
    return new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime();
  });

  const featured: PostWithRelations[] = [];
  for (const post of sortedByViews) {
    if (featured.length >= 3) break;
    featured.push(post);
    displayedIds.add(post.id);
  }

  // 2. Popular posts (Sidebar "Đọc nhiều"): Next top by views, strictly excluding featured
  const popular: PostWithRelations[] = [];
  for (const post of sortedByViews) {
    if (popular.length >= 4) break;
    if (!displayedIds.has(post.id)) {
      popular.push(post);
      displayedIds.add(post.id);
    }
  }

  // 3. Latest posts ("Mới nhất"): Most recent by published_at DESC, excluding featured & popular
  const sortedByDate = [...allPosts].sort(
    (a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime()
  );

  const latest: PostWithRelations[] = [];
  for (const post of sortedByDate) {
    if (latest.length >= 6) break;
    if (!displayedIds.has(post.id)) {
      latest.push(post);
      displayedIds.add(post.id);
    }
  }

  // 4. Category sections ("Chuyên đề"): Up to 3 distinct posts per category, excluding all already displayed
  const sections: Array<{ category: (typeof categories)[number]; posts: PostWithRelations[] }> = [];
  for (const category of categories) {
    const categoryPosts: PostWithRelations[] = [];
    for (const post of sortedByDate) {
      if (categoryPosts.length >= 3) break;
      if (post.category?.id === category.id && !displayedIds.has(post.id)) {
        categoryPosts.push(post);
        displayedIds.add(post.id);
      }
    }
    if (categoryPosts.length > 0) {
      sections.push({ category, posts: categoryPosts });
    }
  }

  return { featured, latest, popular, sections, categories };
});

export const getCategories = cache(async () => {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) {
    reportPublicDataError("getCategories", error);
    return [];
  }
  return data ?? [];
});

export const getTags = cache(async () => {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("tags").select("*").order("name");
  if (error) {
    reportPublicDataError("getTags", error);
    return [];
  }
  return data ?? [];
});

export const searchPublishedPosts = cache(async (query: string, page = 1, pageSize = 9): Promise<PaginatedPosts> => {
  if (!query.trim()) return { posts: [], total: 0, page, pageSize, pageCount: 1 };
  if (!isSupabaseConfigured) return emptyPage(page, pageSize);
  const supabase = await createClient();
  const start = Math.max(0, (page - 1) * pageSize);
  const { categoryIds, postIdsFromTags } = await collectSearchRelationIds(supabase as unknown as SearchRelationClient, query);
  const { clauses } = buildPostSearchClauses(query, categoryIds, postIdsFromTags);
  if (!clauses.length) return emptyPage(page, pageSize);
  const { data, error, count } = await supabase.from("posts").select(postSelect, { count: "exact" }).eq("status", "published").or(clauses.join(",")).order("published_at", { ascending: false }).range(start, start + pageSize - 1);
  if (error) {
    reportPublicDataError("searchPublishedPosts", error);
    return emptyPage(page, pageSize);
  }
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
