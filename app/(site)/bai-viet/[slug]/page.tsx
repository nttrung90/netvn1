import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, Calendar, ChevronRight, BookOpen } from "lucide-react";
import { getPostBySlug, getRelatedPosts, recordView } from "@/lib/data/posts";
import { PostCard } from "@/components/site/PostCard";
import { ReadingProgressBar } from "@/components/site/ReadingProgressBar";
import { ShareButtons } from "@/components/site/ShareButtons";
import { estimateReadingTime, formatViDate, getFirstImageFromHtml } from "@/lib/utils";

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
  
  // Get 5 related posts for the sidebar
  const related = await getRelatedPosts(post, 5);
  await recordView(slug);

  const readTime = estimateReadingTime(post.content || post.excerpt);
  const formattedDate = formatViDate(post.published_at, "long");

  return (
    <>
      <ReadingProgressBar />
      <main className="container py-8 md:py-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Đường dẫn bài viết" className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link href="/" className="transition hover:text-[#d72626]">
            Trang chủ
          </Link>
          <ChevronRight size={13} className="text-slate-400" />
          {post.category ? (
            <Link
              href={`/chu-de/${post.category.slug}`}
              className="transition hover:text-[#d72626]"
            >
              {post.category.name}
            </Link>
          ) : (
            <span>Công nghệ</span>
          )}
        </nav>

        {/* Title */}
        <h1 className="display text-3xl font-bold leading-[1.25] text-[#222] sm:text-4xl md:text-[44px] max-w-4xl">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="mt-5 flex flex-wrap items-center gap-4 border-y border-slate-200 py-3 max-w-4xl">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#222]">
              {post.author?.name || "Ban biên tập NOVA//TECH"}
            </span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-500">
            <Calendar size={14} />
            {formattedDate}
          </span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-500">
            <Clock size={14} className="text-[#d72626]" />
            {readTime} phút đọc
          </span>
          
          <div className="ml-auto">
            <ShareButtons title={post.title} slug={post.slug} />
          </div>
        </div>

        {/* Sapo */}
        {post.excerpt && (
          <p className="mt-6 text-xl font-medium leading-relaxed text-[#444] max-w-4xl">
            {post.excerpt}
          </p>
        )}

        {/* Hero Image */}
        {(post.cover_image || getFirstImageFromHtml(post.content)) && (
          <div className="relative mt-8 aspect-[16/9] w-full max-w-5xl overflow-hidden bg-slate-100">
            <img
              alt={post.title}
              className="w-full h-full object-cover"
              src={(post.cover_image || getFirstImageFromHtml(post.content)) as string}
            />
          </div>
        )}

        {/* Main Content & Sidebar Layout */}
        <div className="mt-10 flex flex-col lg:flex-row gap-10">
          
          {/* Main Article */}
          <div className="flex-1 lg:max-w-[760px]">
            <article
              className="prose-news"
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
                      className="rounded-sm border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#d72626] hover:text-[#d72626]"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Editorial Box */}
            <div className="mt-10 bg-slate-50 border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#222] text-white">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="display text-lg font-bold text-[#222]">
                    Về ban biên tập NOVA//TECH
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Tất cả bài viết được phân tích độc lập với tiêu chí rõ ràng, thực chứng và hữu ích cho công việc thực tế của bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-[320px] shrink-0">
            <div className="sticky top-24">
              <div className="border-b-2 border-[#d72626] mb-5">
                <h3 className="text-[16px] font-bold text-[#d72626] uppercase tracking-wide py-1 inline-block">
                  Tin liên quan
                </h3>
              </div>
              <div className="flex flex-col gap-4">
                {related.length > 0 ? (
                  related.map((item) => (
                    <PostCard key={item.id} post={item} variant="compact" />
                  ))
                ) : (
                  <p className="text-sm text-gray-500 py-4">Chưa có bài viết liên quan.</p>
                )}
              </div>
            </div>
          </aside>

        </div>
      </main>
    </>
  );
}
