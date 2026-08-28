import Link from "next/link";
import { getDashboardStats } from "@/lib/data/posts";
import { formatCount } from "@/lib/utils";
import { PostManagementList } from "@/components/admin/PostManagementList";

export default async function AdminPage() {
  const stats = await getDashboardStats();
  const items = [
    ["Tổng bài viết", stats.total],
    ["Đã xuất bản", stats.published],
    ["Bản nháp", stats.drafts],
    ["Lượt xem", formatCount(stats.views)],
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.17em] text-[#4062ff]">Tòa soạn</p>
          <h1 className="display mt-1 text-4xl font-bold">Tổng quan</h1>
        </div>
        <Link className="rounded-xl bg-[#101828] px-4 py-3 text-sm font-bold text-white" href="/admin/posts/new">
          Viết bài mới
        </Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(([label, value]) => (
          <section className="rounded-2xl border bg-white p-5" key={label}>
            <p className="text-sm text-[#667085]">{label}</p>
            <p className="display mt-2 text-3xl font-bold">{value}</p>
          </section>
        ))}
      </div>
      <section className="mt-8 overflow-hidden rounded-2xl border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <h2 className="font-bold">Cập nhật gần đây</h2>
            <p className="mt-1 text-xs text-[#667085]">Chỉnh sửa hoặc xóa nhanh một bài viết.</p>
          </div>
          <Link href="/admin/posts" className="text-sm font-bold text-[#4062ff] hover:text-[#3446cc]">Quản lý tất cả</Link>
        </div>
        <div className="px-5 pb-2"><PostManagementList posts={stats.latest} compact /></div>
      </section>
    </>
  );
}
