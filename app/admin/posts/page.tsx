import Link from "next/link";
import { getAdminPosts } from "@/lib/data/posts";

export default async function PostsPage() {
  const posts = await getAdminPosts();
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[.17em] text-[#4062ff]">Xuất bản</p><h1 className="display mt-1 text-4xl font-bold">Bài viết</h1></div>
        <Link className="rounded-xl bg-[#101828] px-4 py-3 text-sm font-bold text-white" href="/admin/posts/new">Viết bài mới</Link>
      </div>
      <div className="mt-8 overflow-hidden rounded-2xl border bg-white">
        {posts.length ? posts.map((post) => <Link className="flex items-center justify-between gap-4 border-b p-5 last:border-0 hover:bg-[#f9fafb]" href={`/admin/posts/${post.id}/edit`} key={post.id}><span><span className="block font-bold">{post.title}</span><span className="mt-1 block text-xs text-[#667085]">{post.category?.name || "Chưa phân loại"}</span></span><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${post.status === "published" ? "bg-[#ecfdf3] text-[#027a48]" : "bg-[#f2f4f7] text-[#475467]"}`}>{post.status === "published" ? "Đã xuất bản" : "Bản nháp"}</span></Link>) : <p className="p-8 text-center text-sm text-[#667085]">Chưa có bài viết. Hãy tạo bài đầu tiên.</p>}
      </div>
    </>
  );
}
