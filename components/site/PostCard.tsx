import Link from "next/link";
import { Clock, ArrowUpRight } from "lucide-react";
import type { PostWithRelations } from "@/types/database";
import { estimateReadingTime, formatViDate } from "@/lib/utils";

export type PostCardVariant =
  | "hero"
  | "secondary"
  | "standard"
  | "compact"
  | "numbered";

export function PostCard({
  post,
  variant = "standard",
  featured = false,
  rank,
  className = "",
}: {
  post: PostWithRelations;
  variant?: PostCardVariant;
  featured?: boolean;
  rank?: number;
  className?: string;
}) {
  const readTime = estimateReadingTime(post.content || post.excerpt);
  const formattedDate = formatViDate(post.published_at);
  const categoryName = post.category?.name || "Công nghệ";
  const categorySlug = post.category?.slug || "tin-cong-nghe";

  // Backward compatibility
  const effectiveVariant: PostCardVariant = featured ? "hero" : variant;

  // 1. Numbered Variant (for Trending / "Đọc nhiều" Sidebar)
  if (effectiveVariant === "numbered") {
    return (
      <article className={`group flex items-start gap-4 py-3.5 transition ${className}`}>
        <span className="display flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-400 transition-colors group-hover:bg-[#4062ff] group-hover:text-white">
          {rank !== undefined ? String(rank).padStart(2, "0") : "•"}
        </span>
        <div className="min-w-0 flex-1">
          <Link
            href={`/chu-de/${categorySlug}`}
            className="text-[11px] font-bold uppercase tracking-wider text-[#4062ff] hover:underline"
          >
            {categoryName}
          </Link>
          <h4 className="mt-1 font-bold leading-snug text-[#101828] transition group-hover:text-[#4062ff]">
            <Link href={`/bai-viet/${post.slug}`} className="line-clamp-2">
              {post.title}
            </Link>
          </h4>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-[#667085]">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {readTime} phút đọc
            </span>
          </div>
        </div>
      </article>
    );
  }

  // 2. Compact Variant (Horizontal card for lists/related)
  if (effectiveVariant === "compact") {
    return (
      <article className={`group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition hover:border-slate-200 hover:shadow-md ${className}`}>
        {post.cover_image ? (
          <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={post.cover_image}
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-indigo-50 text-[#4062ff]">
            <span className="font-mono text-xs font-bold">NOVA</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <Link
            href={`/chu-de/${categorySlug}`}
            className="text-[11px] font-bold uppercase tracking-wider text-[#4062ff] hover:underline"
          >
            {categoryName}
          </Link>
          <h4 className="mt-1 font-bold leading-snug text-[#101828] transition group-hover:text-[#4062ff]">
            <Link href={`/bai-viet/${post.slug}`} className="line-clamp-2">
              {post.title}
            </Link>
          </h4>
          <p className="mt-1 text-xs text-[#667085]">{formattedDate}</p>
        </div>
      </article>
    );
  }

  // 3. Hero Lead Variant (Large story card on Home Page)
  if (effectiveVariant === "hero") {
    return (
      <article className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-xl md:p-8 ${className}`}>
        {post.cover_image ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              src={post.cover_image}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        ) : (
          <div className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl bg-gradient-to-tr from-[#101828] to-[#1e293b] p-8 text-white">
            <span className="display text-3xl font-bold tracking-tight text-white/80">NOVA<span className="text-[#ccff00]">{"//"}</span>TECH</span>
          </div>
        )}

        <div className="mt-6 flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href={`/chu-de/${categorySlug}`}
                className="inline-block rounded-full bg-[#edf0ff] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#4062ff] transition hover:bg-[#4062ff] hover:text-white"
              >
                {categoryName}
              </Link>
              <span className="text-xs text-[#667085]">Tiêu điểm</span>
            </div>

            <h2 className="display mt-3 text-2xl font-bold leading-tight text-[#101828] transition group-hover:text-[#4062ff] sm:text-3xl md:text-4xl">
              <Link href={`/bai-viet/${post.slug}`} className="hover:underline decoration-[#4062ff]/40 underline-offset-4">
                {post.title}
              </Link>
            </h2>

            {post.excerpt && (
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#667085] sm:text-base">
                {post.excerpt}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between border-t border-slate-100 pt-4 text-xs text-[#667085]">
            <div className="flex items-center gap-2 font-medium">
              {post.author?.name ? (
                <span className="text-slate-900 font-bold">{post.author.name}</span>
              ) : (
                <span className="text-slate-900 font-bold">Ban biên tập NOVA//TECH</span>
              )}
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-[#4062ff]">
              <Clock size={13} />
              <span>{readTime} phút đọc</span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // 4. Secondary Feature Variant
  if (effectiveVariant === "secondary") {
    return (
      <article className={`group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-lg ${className}`}>
        {post.cover_image ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={post.cover_image}
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50 p-6 text-slate-400">
            <span className="font-mono text-sm font-bold">NOVA//TECH</span>
          </div>
        )}

        <div className="mt-4 flex flex-1 flex-col justify-between">
          <div>
            <Link
              href={`/chu-de/${categorySlug}`}
              className="inline-block text-xs font-bold uppercase tracking-wider text-[#4062ff] hover:underline"
            >
              {categoryName}
            </Link>
            <h3 className="display mt-2 text-xl font-bold leading-snug text-[#101828] transition group-hover:text-[#4062ff]">
              <Link href={`/bai-viet/${post.slug}`} className="line-clamp-2">
                {post.title}
              </Link>
            </h3>
            {post.excerpt && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#667085]">
                {post.excerpt}
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-[#667085]">
            <span>{formattedDate}</span>
            <span className="inline-flex items-center gap-1 font-medium text-slate-500">
              <Clock size={12} />
              {readTime} phút
            </span>
          </div>
        </div>
      </article>
    );
  }

  // 5. Standard Variant (Default 3-Column / Grid Card)
  return (
    <article className={`group flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md ${className}`}>
      <div>
        {post.cover_image ? (
          <div className="relative mb-3.5 aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={post.cover_image}
              loading="lazy"
            />
          </div>
        ) : (
          <div className="relative mb-3.5 flex aspect-[16/10] w-full items-center justify-center rounded-xl bg-gradient-to-tr from-slate-100 to-slate-50 text-slate-400">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">NOVA//TECH</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Link
            href={`/chu-de/${categorySlug}`}
            className="text-[11px] font-bold uppercase tracking-wider text-[#4062ff] hover:underline"
          >
            {categoryName}
          </Link>
          <span className="inline-flex items-center gap-1 text-[11px] text-[#667085]">
            <Clock size={11} />
            {readTime} phút
          </span>
        </div>

        <h3 className="display mt-2 text-lg font-bold leading-snug text-[#101828] transition group-hover:text-[#4062ff]">
          <Link href={`/bai-viet/${post.slug}`} className="line-clamp-2">
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#667085]">
            {post.excerpt}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 text-xs text-[#667085]">
        <span>{formattedDate}</span>
        <Link
          href={`/bai-viet/${post.slug}`}
          className="inline-flex items-center gap-0.5 font-bold text-[#4062ff] transition hover:translate-x-0.5"
        >
          Đọc <ArrowUpRight size={13} />
        </Link>
      </div>
    </article>
  );
}
