import { PostEditor } from "@/components/admin/PostEditor";
import { createPost } from "@/app/actions";
import { getCategories } from "@/lib/data/posts";
import type { Category } from "@/types/database";

export default async function NewPostPage() {
  // A post can be saved without a category. Do not make a temporary Supabase
  // error while loading this optional list block the whole publishing form.
  let categories: Category[] = [];
  let categoriesUnavailable = false;

  try {
    categories = await getCategories();
  } catch (error) {
    categoriesUnavailable = true;
    console.error("Unable to load post categories", error);
  }

  return <>
    <h1 className="display text-4xl font-bold">Bài viết mới</h1>
    {categoriesUnavailable && <p role="alert" className="mt-4 rounded-xl border border-[#fecdca] bg-[#fef3f2] px-4 py-3 text-sm leading-6 text-[#b42318]">Không thể tải danh sách chuyên mục. Bạn vẫn có thể lưu nháp hoặc xuất bản bài viết mà không chọn chuyên mục.</p>}
    <div className="mt-7"><PostEditor action={createPost} categories={categories} /></div>
  </>;
}
