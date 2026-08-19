import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/site/EmptyState";
import { PostCard } from "@/components/site/PostCard";
import {
  getFeaturedPosts,
  getPopularPosts,
  getPostsByCategory,
  getPublishedPosts,
} from "@/lib/data/posts";

export default async function HomePage() {
  const [featured, latest, popular, sections] = await Promise.all([
    getFeaturedPosts(3),
    getPublishedPosts(1, 6),
    getPopularPosts(4),
    getPostsByCategory(3),
  ]);

  return (
    <main>
      <section className="container py-7 md:py-10">
        <div className="rounded-[1.5rem] bg-[#101828] px-5 py-3 text-xs text-[#d0d5dd] sm:flex sm:items-center sm:gap-3">
          <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-[0.14em] text-[#ccff00]">
            <Sparkles size={14} />
            Tín hiệu
          </span>
          <span className="mt-1 block sm:mt-0">
            Ý tưởng, công cụ và góc nhìn giúp công nghệ phục vụ công việc tốt hơn.
          </span>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-5 md:mt-12 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#4062ff]">
              Bản tin chọn lọc
            </p>
            <h1 className="display mt-3 text-4xl font-bold leading-[0.96] text-[#101828] sm:text-5xl md:text-7xl">
              Công nghệ nên rõ ràng, <em className="not-italic text-[#4062ff]">hữu ích</em> và đáng tin.
            </h1>
          </div>
          <Link
            href="#moi-nhat"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#101828] transition hover:text-[#4062ff]"
          >
            Khám phá bài mới <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="container">
        <div className="news-grid">
          {featured?.length ? (
            featured.map((post, index) => (
              <div
                className={
                  index === 0
                    ? "col-span-12 md:col-span-6"
                    : "col-span-12 sm:col-span-6 md:col-span-3"
                }
                key={post.id}
              >
                <PostCard post={post} featured />
              </div>
            ))
          ) : (
            <div className="col-span-12">
              <EmptyState title="Tòa soạn đang chuẩn bị những bài viết đầu tiên" />
            </div>
          )}
        </div>
      </section>

      <section
        id="moi-nhat"
        className="container mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_290px]"
      >
        <div>
          <div className="flex items-end justify-between border-b border-[#101828] pb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#4062ff]">
                Dòng chảy
              </p>
              <h2 className="display mt-1 text-3xl font-bold">Mới nhất</h2>
            </div>
            <Link
              href="/page/1"
              className="text-sm font-bold text-[#475467] hover:text-[#4062ff]"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="mt-1 grid gap-x-7 sm:grid-cols-2">
            {latest?.posts?.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          {!latest?.posts?.length && (
            <div className="mt-5">
              <EmptyState />
            </div>
          )}
        </div>

        <aside className="border-t border-[#101828] pt-4 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#4062ff]">
            Đọc nhiều
          </p>
          <div className="mt-4 divide-y divide-[#e6eaf0]">
            {popular?.length ? (
              popular.map((post, index) => (
                <Link
                  href={`/bai-viet/${post.slug}`}
                  key={post.id}
                  className="group grid grid-cols-[28px_1fr] gap-3 py-4"
                >
                  <span className="display text-2xl font-bold text-[#cbd5e1]">
                    0{index + 1}
                  </span>
                  <span>
                    <span className="text-sm font-bold leading-5 transition group-hover:text-[#4062ff]">
                      {post.title}
                    </span>
                    <span className="mt-1 block text-xs text-[#667085]">
                      {post.category?.name || "Công nghệ"}
                    </span>
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-6 text-sm text-[#667085]">
                Các bài đọc nhiều sẽ được cập nhật tại đây.
              </p>
            )}
          </div>
        </aside>
      </section>

      {sections?.map(({ category, posts }) => (
        <section className="container mt-16" key={category.id}>
          <div className="flex items-end justify-between border-b border-[#101828] pb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#4062ff]">
                Chuyên đề
              </p>
              <h2 className="display mt-1 text-3xl font-bold">
                {category.name}
              </h2>
            </div>
            <Link
              href={`/chu-de/${category.slug}`}
              className="text-sm font-bold text-[#475467] hover:text-[#4062ff]"
            >
              Xem thêm
            </Link>
          </div>
          <div className="mt-5 grid gap-7 md:grid-cols-3">
            {posts?.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
