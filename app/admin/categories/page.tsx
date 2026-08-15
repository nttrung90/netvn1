import { CategoryManager } from "@/components/admin/CategoryManager";
import { getCategories } from "@/lib/data/posts";
export default async function CategoriesPage() { const categories = await getCategories(); return <><div><p className="text-xs font-bold uppercase tracking-[.17em] text-[#4062ff]">Phân loại</p><h1 className="display mt-1 text-4xl font-bold">Chuyên mục</h1><p className="mt-3 text-sm text-[#667085]">Tổ chức bài viết để độc giả dễ tìm và điều hướng.</p></div><div className="mt-8"><CategoryManager categories={categories}/></div></>; }
