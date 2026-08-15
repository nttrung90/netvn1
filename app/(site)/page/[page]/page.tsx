import Link from "next/link";
import { EmptyState } from "@/components/site/EmptyState";
import { Pagination } from "@/components/site/Pagination";
import { PostCard } from "@/components/site/PostCard";
import { getPublishedPosts } from "@/lib/data/posts";

export default async function ArchivePage({ params }: { params: Promise<{ page: string }> }) {
  const { page: rawPage } = await params;
  const page = Math.max(1, Number(rawPage) || 1);
  const result = await getPublishedPosts(page);

  return (
    <main className="container py-12">
      <p className="text-xs font-bold uppercase tracking-[.17em] text-[#4062ff]">Lưu trữ</p>
      <h1 className="display mt-2 text-5xl font-bold">Tất cả bài viết</h1>
      {result.posts.length ? (
        <>
          <div className="mt-8 grid gap-x-7 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {result.posts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
          <Pagination current={result.page} makeHref={(target) => `/page/${target}`} total={result.pageCount} />
        </>
      ) : <div className="mt-8"><EmptyState /></div>}
      <Link className="mt-7 inline-block text-sm font-bold text-[#4062ff]" href="/">← Về trang chủ</Link>
    </main>
  );
}
