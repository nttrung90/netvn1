import Link from "next/link";
import { Search, Lock, Compass } from "lucide-react";
import { Logo } from "./Logo";
import { getCategories } from "@/lib/data/posts";

export async function SiteHeader() {
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-all">
      <div className="container">
        {/* Main Header Bar */}
        <div className="flex min-h-16 items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-6">
            <Logo />
            <div className="hidden h-5 w-px bg-slate-200 lg:block" />
            <span className="hidden text-xs font-semibold uppercase tracking-widest text-[#667085] lg:inline-block">
              Tạp chí công nghệ thực dụng
            </span>
          </div>

          <nav aria-label="Điều hướng chính" className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/page/1"
              className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
            >
              <Compass size={15} className="text-[#4062ff]" />
              Lưu trữ
            </Link>

            <Link
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-[#4062ff]"
              href="/search"
            >
              <Search size={14} className="text-slate-400" />
              <span>Tìm kiếm…</span>
            </Link>

            <Link
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#101828] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#344054] active:scale-[.98]"
              href="/login"
            >
              <Lock size={13} className="text-[#ccff00]" />
              <span className="hidden sm:inline">Quản trị</span>
            </Link>
          </nav>
        </div>

        {/* Category Navigation Bar */}
        {categories.length > 0 && (
          <div className="no-scrollbar -mx-4 flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 text-xs font-semibold sm:mx-0 sm:px-0">
            <Link
              href="/"
              className="shrink-0 rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-[#4062ff]"
            >
              Trang chủ
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/chu-de/${category.slug}`}
                className="shrink-0 rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-[#edf0ff] hover:text-[#4062ff]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
