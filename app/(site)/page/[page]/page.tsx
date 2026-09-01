import Link from "next/link";
import { ChevronRight, Archive, Layers, ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/site/EmptyState";
import { Pagination } from "@/components/site/Pagination";
import { PostCard } from "@/components/site/PostCard";
import { getPublishedPosts, getCategories } from "@/lib/data/posts";

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page: rawPage } = await params;
  const page = Math.max(1, Number(rawPage) || 1);
  const [result, categories] = await Promise.all([
    getPublishedPosts(page, 9),
    getCategories(),
  ]);

  return (
    <main className="container py-8 md:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Đường dẫn" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="transition hover:text-[#d72626]">
          Trang chủ
        </Link>
        <ChevronRight size={13} className="text-slate-400" />
        <span className="text-slate-900 font-bold">Lưu trữ tất cả bài viết</span>
      </nav>

      {/* Hero Header */}
      <div className="mt-6 rounded-md bg-white border border-slate-200/80 p-6 md:p-10 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#d72626]">
          <Archive size={15} />
          <span>Kho lưu trữ tòa soạn</span>
        </div>
        <h1 className="display mt-2 text-3xl font-bold text-[#101828] sm:text-4xl md:text-5xl">
          Tất cả bài viết
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Toàn bộ các phân tích công nghệ, hướng dẫn thực tế và đánh giá độc lập được lưu trữ theo thời gian.
        </p>

        {/* Category Pills Filter */}
        {categories.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Layers size={13} /> Lọc nhanh:
            </span>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/chu-de/${cat.slug}`}
                className="rounded-sm border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#d72626] hover:bg-[#edf0ff] hover:text-[#d72626]"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Posts */}
      {result.posts.length > 0 ? (
        <>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.posts.map((post) => (
              <PostCard key={post.id} post={post} variant="standard" />
            ))}
          </div>
          <Pagination
            current={result.page}
            makeHref={(target) => `/page/${target}`}
            total={result.pageCount}
          />
        </>
      ) : (
        <div className="mt-10">
          <EmptyState
            title="Chưa có bài viết lưu trữ"
            description="Hãy quay lại khi tòa soạn xuất bản thêm nội dung mới."
          />
        </div>
      )}

      {/* Back to Home Link */}
      <div className="mt-12 border-t border-slate-200 pt-6">
        <Link
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#d72626] transition hover:underline"
          href="/"
        >
          <ArrowLeft size={14} /> Về trang chủ
        </Link>
      </div>
    </main>
  );
}
