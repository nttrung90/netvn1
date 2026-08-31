import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, Calendar, ChevronRight, User, Sparkles, BookOpen } from "lucide-react";
import { getPostBySlug, getRelatedPosts, recordView } from "@/lib/data/posts";
import { PostCard } from "@/components/site/PostCard";
import { ReadingProgressBar } from "@/components/site/ReadingProgressBar";
import { ShareButtons } from "@/components/site/ShareButtons";
import { estimateReadingTime, formatViDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Bài viết không tồn tại" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const related = await getRelatedPosts(post, 3);
  await recordView(slug);

  const readTime = estimateReadingTime(post.content || post.excerpt);
  const formattedDate = formatViDate(post.published_at, "long");

  return (
    <>
      <ReadingProgressBar />
      <main className="container max-w-4xl py-8 md:py-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Đường dẫn bài viết" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="transition hover:text-[#4062ff]">
            Trang chủ
          </Link>
          <ChevronRight size={13} className="text-slate-400" />
          {post.category ? (
            <Link
              href={`/chu-de/${post.category.slug}`}
              className="transition hover:text-[#4062ff]"
            >
              {post.category.name}
            </Link>
          ) : (
            <span>Công nghệ</span>
          )}
          <ChevronRight size={13} className="text-slate-400" />
          <span className="truncate text-slate-400 max-w-[200px] sm:max-w-xs">{post.title}</span>
        </nav>

        {/* Category Badge & Meta */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {post.category && (
            <Link
              href={`/chu-de/${post.category.slug}`}
              className="rounded-full bg-[#edf0ff] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#4062ff] transition hover:bg-[#4062ff] hover:text-white"
            >
              {post.category.name}
            </Link>
          )}
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
            <Clock size={13} className="text-[#4062ff]" />
            {readTime} phút đọc
          </span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
            <Calendar size={13} />
            {formattedDate}
          </span>
        </div>

        {/* Title & Excerpt */}
        <h1 className="display mt-4 text-3xl font-bold leading-[1.12] text-[#101828] sm:text-4xl md:text-5xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-5 border-l-2 border-[#4062ff] pl-4 text-lg font-normal leading-relaxed text-slate-600">
            {post.excerpt}
          </p>
        )}

        {/* Author Bar & Share Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-slate-200/80 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-bold text-white shadow-sm">
              {post.author?.name ? post.author.name.charAt(0).toUpperCase() : "N"}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {post.author?.name || "Ban biên tập NOVA//TECH"}
              </p>
              <p className="text-[11px] text-slate-500">Biên tập viên công nghệ</p>
            </div>
          </div>

          <ShareButtons title={post.title} slug={post.slug} />
        </div>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-sm">
            <Image
              alt={post.title}
              className="object-cover"
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              src={post.cover_image}
            />
          </div>
        )}

        {/* Article Body Content */}
        <article
          className="prose-news mt-10"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags List */}
        {post.tags.length > 0 && (
          <div className="mt-12 border-t border-slate-200 pt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Chủ đề liên quan:
            </p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  href={`/search?q=${encodeURIComponent(tag.name)}`}
                  key={tag.id}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-[#4062ff] hover:bg-[#edf0ff] hover:text-[#4062ff]"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Editorial Box */}
        <div className="mt-12 rounded-3xl bg-slate-50 border border-slate-200/80 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#101828] text-white">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="display text-lg font-bold text-[#101828]">
                Về ban biên tập NOVA//TECH
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Tất cả bài viết được phân tích độc lập với tiêu chí rõ ràng, thực chứng và hữu ích cho công việc thực tế của bạn.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles - Guaranteed Non-Duplicate */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-slate-200 pt-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#4062ff]">
                  Khám phá thêm
                </p>
                <h2 className="display text-2xl font-bold text-[#101828]">
                  Bài viết liên quan
                </h2>
              </div>
              <Link
                href={post.category ? `/chu-de/${post.category.slug}` : "/page/1"}
                className="text-xs font-bold text-[#4062ff] hover:underline"
              >
                Xem thêm trong chuyên mục →
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <PostCard key={item.id} post={item} variant="standard" />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
