import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, FolderOpen, ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/site/EmptyState";
import { PostCard } from "@/components/site/PostCard";
import { getPublishedPosts, getCategories } from "@/lib/data/posts";

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
  const [result, categories] = await Promise.all([
    getPublishedPosts(1, 30, slug),
    getCategories(),
  ]);

  const currentCategory = categories.find((c) => c.slug === slug);
  const title = currentCategory?.name || result.posts[0]?.category?.name || "Chuyên mục";
  const description = currentCategory?.description || "Các bài viết chọn lọc và phân tích chuyên sâu.";

  return (
    <main className="container py-8 md:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Đường dẫn" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="transition hover:text-[#4062ff]">
          Trang chủ
        </Link>
        <ChevronRight size={13} className="text-slate-400" />
        <span className="text-slate-400">Chuyên đề</span>
        <ChevronRight size={13} className="text-slate-400" />
        <span className="text-slate-900 font-bold">{title}</span>
      </nav>

      {/* Category Hero Header */}
      <div className="mt-6 rounded-3xl bg-white border border-slate-200/80 p-6 md:p-10 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#4062ff]">
          <FolderOpen size={15} />
          <span>Chuyên mục tin tức</span>
        </div>
        <h1 className="display mt-2 text-3xl font-bold text-[#101828] sm:text-4xl md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          {description}
        </p>
        <div className="mt-5 flex items-center gap-3 text-xs font-semibold text-slate-500">
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 font-bold">
            {result.total} bài viết
          </span>
        </div>
      </div>

      {/* Posts Grid */}
      {result.posts.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.posts.map((post) => (
            <PostCard key={post.id} post={post} variant="standard" />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="Chuyên mục chưa có bài viết"
            description="Các bài viết mới cho chuyên mục này đang được ban biên tập biên soạn."
          />
        </div>
      )}

      {/* Navigation Footer */}
      <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6">
        <Link
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4062ff] transition hover:underline"
          href="/"
        >
          <ArrowLeft size={14} /> Về trang chủ
        </Link>
        <Link
          className="text-xs font-bold text-slate-600 transition hover:text-[#4062ff]"
          href="/page/1"
        >
          Xem tất cả bài viết →
        </Link>
      </div>
    </main>
  );
}
