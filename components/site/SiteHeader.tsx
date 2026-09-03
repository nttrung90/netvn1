import Link from "next/link";
import { Search, Menu, UserCheck, LogIn, LayoutDashboard } from "lucide-react";
import { Logo } from "./Logo";
import { getCategories } from "@/lib/data/posts";
import { getCurrentUser } from "@/lib/auth";

export async function SiteHeader() {
  const [categories, currentUser] = await Promise.all([
    getCategories(),
    getCurrentUser(),
  ]);

  const user = currentUser?.user;
  const profile = currentUser?.profile;
  const isStaff = profile?.role === "admin" || profile?.role === "editor";

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#d72626] bg-white transition-all shadow-sm">
      <div className="container">
        <div className="flex h-[72px] items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="shrink-0 flex items-center">
              <Logo />
            </Link>
          </div>

          <nav aria-label="Điều hướng chính" className="hidden lg:flex items-center gap-6 flex-1 ml-6">
            <Link
              href="/"
              className="text-[14px] font-bold uppercase text-[#222] transition hover:text-[#d72626]"
            >
              Trang chủ
            </Link>
            {categories.slice(0, 7).map((category) => (
              <Link
                key={category.id}
                href={`/chu-de/${category.slug}`}
                className="text-[14px] font-bold uppercase text-[#222] transition hover:text-[#d72626]"
              >
                {category.name}
              </Link>
            ))}
            {categories.length > 7 && (
              <Link
                href="/page/1"
                className="text-[14px] font-bold uppercase text-[#222] transition hover:text-[#d72626]"
              >
                Thêm...
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-[#d72626] hover:text-white"
              href="/search"
              aria-label="Tìm kiếm"
            >
              <Search size={18} />
            </Link>

            {user ? (
              isStaff ? (
                <Link
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#222] px-3.5 h-10 text-xs font-bold text-white shadow-sm transition hover:bg-[#d72626] active:scale-[.98]"
                  href="/admin"
                >
                  <LayoutDashboard size={14} className="text-[#d72626]" />
                  <span className="hidden sm:inline">Quản trị</span>
                </Link>
              ) : (
                <Link
                  className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-3.5 h-10 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-200 active:scale-[.98]"
                  href="/admin"
                >
                  <UserCheck size={14} className="text-emerald-600" />
                  <span className="hidden sm:inline">{profile?.name || "Tài khoản"}</span>
                </Link>
              )
            ) : (
              <Link
                className="inline-flex items-center gap-1.5 rounded-md bg-[#222] px-3.5 h-10 text-xs font-bold text-white shadow-sm transition hover:bg-[#d72626] active:scale-[.98]"
                href="/login"
              >
                <LogIn size={14} />
                <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
            )}
            
            <button className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Categories - scrollable */}
      <div className="lg:hidden block border-t border-slate-100 bg-white">
        <div className="container overflow-x-auto no-scrollbar flex items-center gap-5 py-2.5">
          <Link
            href="/"
            className="shrink-0 text-[13px] font-bold uppercase text-[#222] hover:text-[#d72626]"
          >
            Trang chủ
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/chu-de/${category.slug}`}
              className="shrink-0 text-[13px] font-bold uppercase text-[#222] hover:text-[#d72626]"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
