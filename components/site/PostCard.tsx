import Link from "next/link";
import type { PostWithRelations } from "@/types/database";

export function PostCard({
  post,
  featured = false,
}: {
  post: PostWithRelations;
  featured?: boolean;
}) {
  return (
    <article className={`group border-b border-[#e6eaf0] py-5 ${featured ? "md:py-0" : ""}`}>
      {post.cover_image ? (
        <div
          className={`mb-4 overflow-hidden rounded-2xl bg-[#edf0ff] ${
            featured ? "aspect-[1.35]" : "aspect-[1.6]"
          }`}
        >
          {/* External upload URLs are validated by Next's image configuration. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" className="h-full w-full object-cover" src={post.cover_image} />
        </div>
      ) : null}
      <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4062ff]">
        {post.category?.name || "Công nghệ"}
      </p>
      <h3 className={`display mt-2 font-bold leading-tight ${featured ? "text-3xl" : "text-xl"}`}>
        <Link className="transition hover:text-[#4062ff]" href={`/bai-viet/${post.slug}`}>
          {post.title}
        </Link>
      </h3>
      {post.excerpt ? <p className="mt-2 text-sm leading-6 text-[#667085]">{post.excerpt}</p> : null}
      <p className="mt-3 text-xs text-[#667085]">
        {post.published_at
          ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(post.published_at))
          : "Bản nháp"}
      </p>
    </article>
  );
}
