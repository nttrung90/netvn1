import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="border-b border-[#e6eaf0] bg-white/90 backdrop-blur">
      <div className="container flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
        <Logo />
        <nav aria-label="Điều hướng chính" className="flex items-center gap-2 sm:gap-4">
          <Link className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-[#475467] transition hover:bg-[#edf0ff] hover:text-[#4062ff]" href="/search">
            <Search size={16} />
            <span className="hidden sm:inline">Tìm kiếm</span>
          </Link>
          <Link className="rounded-lg bg-[#101828] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#344054]" href="/login">
            Đăng nhập quản trị
          </Link>
        </nav>
      </div>
    </header>
  );
}
