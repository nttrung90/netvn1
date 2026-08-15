import Link from "next/link";
import { getDashboardStats } from "@/lib/data/posts";
import { formatCount } from "@/lib/utils";

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
      <section className="mt-8 rounded-2xl border bg-white p-5">
        <h2 className="font-bold">Cập nhật gần đây</h2>
        {stats.latest.length ? (
          <ul className="mt-3 divide-y">
            {stats.latest.map((post) => (
              <li className="py-3" key={post.id}>
                <Link className="font-bold hover:text-[#4062ff]" href={`/admin/posts/${post.id}/edit`}>
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[#667085]">Chưa có bài viết nào.</p>
        )}
      </section>
    </>
  );
}
