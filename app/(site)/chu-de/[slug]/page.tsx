import Link from "next/link";
import type { Metadata } from "next";
import { EmptyState } from "@/components/site/EmptyState";
import { PostCard } from "@/components/site/PostCard";
import { getPublishedPosts } from "@/lib/data/posts";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedPosts(1, 1, slug).catch(() => ({ posts: [] }));
  const title = result.posts[0]?.category?.name || "Chuyên mục";
  return { title };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPublishedPosts(1, 30, slug);
  const title = result.posts[0]?.category?.name || "Chuyên mục";

  return (
    <main className="container py-12">
      <p className="text-xs font-bold uppercase tracking-[.17em] text-[#4062ff]">Chuyên đề</p>
      <h1 className="display mt-2 text-5xl font-bold">{title}</h1>
      {result.posts.length ? <div className="mt-8 grid gap-x-7 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">{result.posts.map((post) => <PostCard key={post.id} post={post} />)}</div> : <div className="mt-8"><EmptyState title="Chuyên mục chưa có bài viết" /></div>}
      <Link className="mt-7 inline-block text-sm font-bold text-[#4062ff]" href="/">← Về trang chủ</Link>
    </main>
  );
}
