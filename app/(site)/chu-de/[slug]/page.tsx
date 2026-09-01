import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/site/EmptyState";
import { PostCard } from "@/components/site/PostCard";
import { getPublishedPosts, getCategories, getHomeFeedData } from "@/lib/data/posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const matched = categories.find((c) => c.slug === slug);
  const title = matched?.name || "Chuyên đề";
  return {
    title: `${title} — NOVA//TECH`,
    description: matched?.description || `Các bài viết thuộc chuyên mục ${title}`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [result, categories, feedData] = await Promise.all([
    getPublishedPosts(1, 30, slug),
    getCategories(),
    getHomeFeedData(), // fetch for sidebar
  ]);

  const currentCategory = categories.find((c) => c.slug === slug);
  const title = currentCategory?.name || result.posts[0]?.category?.name || "Chuyên mục";
  const latestSidebar = feedData.latest.slice(0, 5);

  return (
    <main className="container py-8 md:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Đường dẫn" className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
        <Link href="/" className="transition hover:text-[#d72626]">
          Trang chủ
        </Link>
        <ChevronRight size={13} className="text-slate-400" />
        <span className="text-slate-900 font-bold">{title}</span>
      </nav>

      {/* Category Hero Header */}
      <div className="border-b-2 border-[#d72626] pb-3 mb-8 flex justify-between items-end">
        <h1 className="display text-3xl font-bold uppercase text-[#d72626]">
          {title}
        </h1>
        <span className="text-xs font-bold text-slate-500">
          {result.total} bài viết
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Main Feed */}
        <div className="flex-1 lg:max-w-[850px]">
          {result.posts.length > 0 ? (
            <div className="flex flex-col gap-8">
              {/* Featured Post (first one) */}
              {result.posts[0] && (
                <div className="mb-4">
                  <PostCard post={result.posts[0]} variant="hero" />
                </div>
              )}
              
              {/* Rest of the posts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {result.posts.slice(1).map((post) => (
                  <PostCard key={post.id} post={post} variant="standard" />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState
                title="Chuyên mục chưa có bài viết"
                description="Các bài viết mới cho chuyên mục này đang được ban biên tập biên soạn."
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-[320px] shrink-0">
          <div className="sticky top-24">
            <div className="bg-[#f8f9fa] border border-slate-200 p-5 rounded-md">
              <h3 className="text-[16px] font-bold text-[#222] uppercase border-b border-gray-300 pb-2 mb-4">
                Tin mới cập nhật
              </h3>
              <div className="flex flex-col gap-4">
                {latestSidebar.length > 0 ? (
                  latestSidebar.map((post, index) => (
                    <PostCard key={post.id} post={post} variant="compact" />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Đang cập nhật...</p>
                )}
              </div>
            </div>
          </div>
        </aside>

      </div>

      {/* Navigation Footer */}
      <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6">
        <Link
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#d72626] transition hover:underline"
          href="/"
        >
          <ArrowLeft size={14} /> Về trang chủ
        </Link>
        <Link
          className="text-xs font-bold text-slate-600 transition hover:text-[#d72626]"
          href="/page/1"
        >
          Xem tất cả bài viết →
        </Link>
      </div>
    </main>
  );
}
