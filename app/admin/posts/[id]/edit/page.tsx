import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { updatePost } from "@/app/actions";
import { getAdminPost, getCategories } from "@/lib/data/posts";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categories] = await Promise.all([getAdminPost(id), getCategories()]);
  if (!post) notFound();
  return <><h1 className="display text-4xl font-bold">Chỉnh sửa bài viết</h1><div className="mt-7"><PostEditor action={updatePost.bind(null, post.id)} categories={categories} post={post} /></div></>;
}
