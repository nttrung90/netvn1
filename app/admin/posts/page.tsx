import Link from "next/link";
import { getAdminPosts } from "@/lib/data/posts";
import { PostManagementList } from "@/components/admin/PostManagementList";

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const { deleted } = await searchParams;
  const posts = await getAdminPosts();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.17em] text-[#d72626]">
            Xuất bản
          </p>
          <h1 className="display mt-1 text-4xl font-bold">Bài viết</h1>
        </div>
        <Link
          className="rounded-sm bg-[#101828] px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
          href="/admin/posts/new"
        >
          Viết bài mới
        </Link>
      </div>
      {deleted && <p role="status" className="mt-5 rounded-sm border border-[#a6f4c5] bg-[#ecfdf3] px-4 py-3 text-sm text-[#027a48]">Đã xóa bài viết.</p>}
      
      <div className="mt-8 overflow-hidden rounded-md border bg-white">
        <PostManagementList posts={posts} />
      </div>
    </>
  );
}
