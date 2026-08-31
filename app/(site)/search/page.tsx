import Link from "next/link";
import { Search, Sparkles, Tag, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/site/EmptyState";
import { Pagination } from "@/components/site/Pagination";
import { PostCard } from "@/components/site/PostCard";
import { searchPublishedPosts, getTags } from "@/lib/data/posts";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: rawPage } = await searchParams;
  const page = Math.max(1, Number(rawPage) || 1);
  const [result, tags] = await Promise.all([
    q ? searchPublishedPosts(q, page) : Promise.resolve({ posts: [], total: 0, page, pageSize: 9, pageCount: 1 }),
    getTags(),
  ]);

  return (
    <main className="container py-8 md:py-12">
      {/* Header */}
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4062ff]">
          Tra cứu thông tin
        </p>
        <h1 className="display mt-2 text-3xl font-bold text-[#101828] sm:text-4xl md:text-5xl">
          Tìm kiếm bài viết
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Khám phá theo từ khóa tiêu đề, nội dung, chuyên mục hoặc thẻ công nghệ.
        </p>
      </div>

      {/* Search Input Box */}
      <form
        action="/search"
        method="GET"
        className="mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-[#4062ff] focus-within:ring-4 focus-within:ring-[#4062ff]/10"
      >
        <div className="flex items-center pl-3 text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Nhập nội dung cần tìm (ví dụ: AI, bảo mật, quy trình…)"
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-[#101828] placeholder-slate-400 outline-none"
        />
        <button
          type="submit"
          className="rounded-xl bg-[#101828] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#344054] active:scale-[.97]"
        >
          Tìm kiếm
        </button>
      </form>

      {/* Quick Suggested Tags */}
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Tag size={12} /> Gợi ý:
          </span>
          {tags.slice(0, 6).map((tag) => (
            <Link
              key={tag.id}
              href={`/search?q=${encodeURIComponent(tag.name)}`}
              className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700 transition hover:bg-[#edf0ff] hover:text-[#4062ff]"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Results Section */}
      {q ? (
        <div className="mt-10">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <p className="text-xs font-semibold text-slate-600">
              Tìm thấy <strong className="text-slate-900 font-bold">{result.total}</strong> kết quả cho từ khóa{" "}
              <strong className="text-[#4062ff]">“{q}”</strong>
            </p>
          </div>

          {result.posts.length > 0 ? (
            <>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {result.posts.map((post) => (
                  <PostCard key={post.id} post={post} variant="standard" />
                ))}
              </div>
              <Pagination
                current={page}
                total={result.pageCount}
                makeHref={(target) => `/search?q=${encodeURIComponent(q)}&page=${target}`}
              />
            </>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="Chưa tìm thấy kết quả phù hợp"
                description="Hãy thử cụm từ tìm kiếm ngắn gọn hơn hoặc chọn các thẻ gợi ý phía trên."
              />
            </div>
          )}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            title="Bạn muốn tìm hiểu điều gì hôm nay?"
            description="Nhập từ khóa bất kỳ để tra cứu các bài viết và phân tích công nghệ chất lượng cao."
          />
        </div>
      )}
    </main>
  );
}
