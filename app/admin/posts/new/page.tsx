import { PostEditor } from "@/components/admin/PostEditor";
import { createPost } from "@/app/actions";
import { getCategories } from "@/lib/data/posts";

export default async function NewPostPage() {
  const categories = await getCategories();
  return <><h1 className="display text-4xl font-bold">Bài viết mới</h1><div className="mt-7"><PostEditor action={createPost} categories={categories} /></div></>;
}
