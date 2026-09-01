import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostEditor } from "@/components/admin/PostEditor";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deletePost, updatePost } from "@/app/actions";
import { getAdminPost, getCategories } from "@/lib/data/posts";

export default async function EditPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const [post, categories] = await Promise.all([getAdminPost(id), getCategories()]);
  if (!post) notFound();
  return <>
    {saved && <p role="status" className="mb-4 rounded-sm border border-[#a6f4c5] bg-[#ecfdf3] px-4 py-3 text-sm text-[#027a48]">Đã lưu thay đổi.</p>}
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#d0d5dd] pb-6">
      <div>
        <Link href="/admin/posts" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#475467] transition hover:text-[#d72626]"><ArrowLeft size={16}/>Tất cả bài viết</Link>
        <p className="mt-5 text-xs font-bold uppercase tracking-[.17em] text-[#d72626]">Biên tập</p>
        <h1 className="display mt-1 text-4xl font-bold">Chỉnh sửa bài viết</h1>
        <p className="mt-2 text-sm text-[#667085]">Cập nhật nội dung, phân loại hoặc trạng thái xuất bản.</p>
      </div>
      <DeleteButton action={deletePost.bind(null, post.id)} label="Xóa bài viết" className="rounded-sm border border-[#fecdca] px-4 py-3 text-sm hover:bg-[#fef3f2]" />
    </div>
    <div className="mt-7"><PostEditor action={updatePost.bind(null, post.id)} categories={categories} post={post} /></div>
  </>;
}
