import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, Flame, Zap, Compass, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/site/EmptyState";
import { PostCard } from "@/components/site/PostCard";
import { getHomeFeedData } from "@/lib/data/posts";

export default async function HomePage() {
  const { featured, latest, popular, sections } = await getHomeFeedData();

  const heroLead = featured[0];
  const heroSecondaries = featured.slice(1, 3);

  return (
    <main className="pb-16">
      {/* Editorial Announcement Bar & Headline */}
      <section className="container pt-6 pb-8 md:pt-10 md:pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#101828] px-5 py-3.5 text-xs text-slate-300 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ccff00]"></span>
            </span>
            <span className="inline-flex items-center gap-1 font-bold uppercase tracking-widest text-[#ccff00]">
              <Sparkles size={13} />
              Tín hiệu mới
            </span>
            <span className="hidden text-slate-400 sm:inline">•</span>
            <span className="hidden text-slate-200 sm:inline">
              Ý tưởng, công cụ và góc nhìn giúp công nghệ phục vụ công việc tốt hơn.
            </span>
          </div>

          <Link
            href="/page/1"
            className="inline-flex items-center gap-1 font-semibold text-slate-300 transition hover:text-white"
          >
            <span>Kho bài viết</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-6 md:mt-12 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4062ff]">
              Bản tin chọn lọc & Phân tích độc lập
            </p>
            <h1 className="display mt-3 text-4xl font-bold leading-[1.02] text-[#101828] sm:text-5xl md:text-6xl">
              Công nghệ nên rõ ràng, <span className="text-[#4062ff] italic font-serif">hữu ích</span> và đáng tin.
            </h1>
          </div>
          <Link
            href="#moi-nhat"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-[#101828] shadow-sm transition hover:border-[#4062ff] hover:text-[#4062ff]"
          >
            Khám phá bài mới <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Featured Lead Section */}
      <section className="container">
        {featured.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-12">
            {heroLead && (
              <div className={heroSecondaries.length ? "lg:col-span-7 xl:col-span-8" : "lg:col-span-12"}>
                <PostCard post={heroLead} variant="hero" />
              </div>
            )}
            {heroSecondaries.length > 0 && (
              <div className="flex flex-col gap-6 lg:col-span-5 xl:col-span-4">
                {heroSecondaries.map((post) => (
                  <PostCard key={post.id} post={post} variant="secondary" />
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            title="Tòa soạn đang chuẩn bị những bài viết đầu tiên"
            description="Các phân tích và bản tin công nghệ mới sẽ được cập nhật sớm."
          />
        )}
      </section>

      {/* Latest Stream & Trending Sidebar */}
      <section
        id="moi-nhat"
        className="container mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]"
      >
        {/* Left Column: Latest Stream */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edf0ff] text-[#4062ff]">
                <Zap size={16} />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#4062ff]">
                  Dòng chảy
                </p>
                <h2 className="display text-2xl font-bold text-[#101828]">Mới nhất</h2>
              </div>
            </div>
            <Link
              href="/page/1"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 transition hover:text-[#4062ff]"
            >
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>

          {latest.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {latest.map((post) => (
                <PostCard key={post.id} post={post} variant="standard" />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState title="Chưa có bài viết mới" description="Hãy khám phá các chuyên đề bên dưới." />
            </div>
          )}
        </div>

        {/* Right Column: Trending Sidebar + Newsletter Widget */}
        <aside className="space-y-8">
          {/* Trending Box */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                <Flame size={15} />
              </span>
              <h3 className="display text-lg font-bold text-[#101828]">
                Đọc nhiều nhất
              </h3>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {popular.length > 0 ? (
                popular.map((post, index) => (
                  <PostCard key={post.id} post={post} variant="numbered" rank={index + 1} />
                ))
              ) : (
                <p className="py-6 text-center text-xs text-slate-500">
                  Các bài đọc nhiều sẽ hiển thị khi có dữ liệu lượt đọc.
                </p>
              )}
            </div>
          </div>

          {/* Editorial Callout Card */}
          <div className="rounded-3xl bg-gradient-to-br from-[#101828] to-[#1e293b] p-6 text-white shadow-md">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#ccff00]">
              <Sparkles size={13} />
              Bản tin độc quyền
            </span>
            <h4 className="display mt-2 text-xl font-bold">
              Công nghệ phục vụ bạn, không phải ngược lại.
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Những tổng hợp ngắn gọn, không quảng cáo, tập trung vào hiệu quả và an toàn số.
            </p>
            <Link
              href="/search"
              className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#101828] transition hover:bg-slate-100 active:scale-[.98]"
            >
              Tìm kiếm chủ đề quan tâm <ArrowRight size={14} />
            </Link>
          </div>
        </aside>
      </section>

      {/* Category Sections (Chuyên đề) - Guaranteed Non-Duplicate */}
      {sections.map(({ category, posts }) => (
        <section className="container mt-16" key={category.id}>
          <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-1 rounded-full bg-[#4062ff]" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#4062ff]">
                  Chuyên đề
                </p>
                <h2 className="display text-2xl font-bold text-[#101828]">
                  {category.name}
                </h2>
              </div>
            </div>
            <Link
              href={`/chu-de/${category.slug}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 transition hover:text-[#4062ff]"
            >
              Xem chuyên mục <ChevronRight size={14} />
            </Link>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} variant="standard" />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
