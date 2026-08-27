import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { updatePost } from "@/app/actions";
import { getAdminPost, getCategories } from "@/lib/data/posts";

export default async function EditPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const [post, categories] = await Promise.all([getAdminPost(id), getCategories()]);
  if (!post) notFound();
  return <>{saved && <p role="status" className="mb-4 rounded-xl border border-[#a6f4c5] bg-[#ecfdf3] px-4 py-3 text-sm text-[#027a48]">Đã lưu thay đổi.</p>}<h1 className="display text-4xl font-bold">Chỉnh sửa bài viết</h1><div className="mt-7"><PostEditor action={updatePost.bind(null, post.id)} categories={categories} post={post} /></div></>;
}
