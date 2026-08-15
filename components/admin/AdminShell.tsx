import Link from "next/link";
import { Logo } from "@/components/site/Logo";

export function AdminShell({
  children,
  name,
  email,
}: {
  children: React.ReactNode;
  name?: string | null;
  email?: string;
}) {
  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <header className="border-b bg-white">
        <div className="container flex min-h-16 flex-wrap items-center justify-between gap-4 py-3">
          <Logo />
          <nav className="flex items-center gap-4 text-sm font-bold text-[#475467]">
            <Link href="/admin">Tổng quan</Link>
            <Link href="/admin/posts">Bài viết</Link>
            <Link href="/admin/categories">Chuyên mục</Link>
            <Link href="/admin/tags">Thẻ</Link>
            <Link href="/">Xem trang tin</Link>
          </nav>
          <p className="text-xs text-[#667085]">{name || email || "Quản trị viên"}</p>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
