import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/data/posts";
import { getSiteUrl } from "@/lib/utils";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const base = getSiteUrl(); const pages: MetadataRoute.Sitemap = [{ url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 }, { url: `${base}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 }]; const result = await getPublishedPosts(1, 50).catch(() => ({ posts: [] })); return [...pages, ...result.posts.map((post) => ({ url: `${base}/bai-viet/${post.slug}`, lastModified: new Date(post.updated_at), changeFrequency: "monthly" as const, priority: 0.8 }))]; }
