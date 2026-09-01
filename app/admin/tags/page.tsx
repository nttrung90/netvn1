import { TagManager } from "@/components/admin/TagManager";
import { getTags } from "@/lib/data/posts";

export default async function TagsPage() {
  const tags = await getTags();
  return (
    <>
      <div>
        <p className="text-xs font-bold uppercase tracking-[.17em] text-[#d72626]">Phân loại</p>
        <h1 className="display mt-1 text-4xl font-bold">Thẻ</h1>
        <p className="mt-3 text-sm text-[#667085]">Liên kết các bài viết theo chủ đề giao thoa.</p>
      </div>
      <div className="mt-8"><TagManager tags={tags} /></div>
    </>
  );
}
