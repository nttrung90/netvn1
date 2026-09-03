import Link from "next/link";
import { UserCheck, Clock } from "lucide-react";
import { getDashboardStats } from "@/lib/data/posts";
import { createClient } from "@/lib/supabase/server";
import { formatCount } from "@/lib/utils";
import { PostManagementList } from "@/components/admin/PostManagementList";

export default async function AdminPage() {
  const supabase = await createClient();
  const [stats, { count: pendingCount }] = await Promise.all([
    getDashboardStats(),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

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
          <p className="text-xs font-bold uppercase tracking-[.17em] text-[#d72626]">Tòa soạn</p>
          <h1 className="display mt-1 text-4xl font-bold">Tổng quan</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            className="rounded-sm border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            href="/admin/users"
          >
            Quản lý tài khoản
          </Link>
          <Link className="rounded-sm bg-[#101828] px-4 py-3 text-sm font-bold text-white" href="/admin/posts/new">
            Viết bài mới
          </Link>
        </div>
      </div>

      {pendingCount && pendingCount > 0 ? (
        <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="text-amber-700 shrink-0" size={20} />
            <p className="text-sm font-medium text-amber-900">
              Có <strong className="font-bold text-amber-950">{pendingCount} tài khoản</strong> đang chờ phê duyệt đăng ký.
            </p>
          </div>
          <Link
            href="/admin/users"
            className="shrink-0 rounded-sm bg-amber-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-800 transition"
          >
            Xem và phê duyệt ngay →
          </Link>
        </div>
      ) : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(([label, value]) => (
          <section className="rounded-md border bg-white p-5" key={label}>
            <p className="text-sm text-[#667085]">{label}</p>
            <p className="display mt-2 text-3xl font-bold">{value}</p>
          </section>
        ))}
      </div>
      <section className="mt-8 overflow-hidden rounded-md border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <h2 className="font-bold">Cập nhật gần đây</h2>
            <p className="mt-1 text-xs text-[#667085]">Chỉnh sửa hoặc xóa nhanh một bài viết.</p>
          </div>
          <Link href="/admin/posts" className="text-sm font-bold text-[#d72626] hover:text-[#3446cc]">Quản lý tất cả</Link>
        </div>
        <div className="px-5 pb-2"><PostManagementList posts={stats.latest} compact /></div>
      </section>
    </>
  );
}
