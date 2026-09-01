import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Logo } from "./Logo";
import { getCategories } from "@/lib/data/posts";
import { NewsletterForm } from "./NewsletterForm";

export async function SiteFooter() {
  const categories = await getCategories();

  return (
    <footer className="mt-20 border-t border-slate-200 bg-[#101828] text-slate-300">
      <div className="container py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="inline-block rounded-xl bg-white/5 p-2 text-white backdrop-blur">
              <Logo />
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Cổng thông tin công nghệ độc lập, tập trung vào những góc nhìn thực dụng, phân tích có chiều sâu và công cụ giúp công việc hiệu quả hơn.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ccff00]">
              <Sparkles size={14} />
              <span>Chính xác • Khách quan • Đáng tin</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#ccff00]">
              Chuyên mục
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/chu-de/${cat.slug}`}
                    className="text-slate-400 transition hover:text-white"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="text-xs text-slate-500">Đang cập nhật...</li>
              )}
            </ul>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#ccff00]">
              Khám phá
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-slate-400 transition hover:text-white">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/page/1" className="text-slate-400 transition hover:text-white">
                  Lưu trữ tất cả bài viết
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-slate-400 transition hover:text-white">
                  Tìm kiếm bài viết
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-slate-400 transition hover:text-white">
                  Khu vực quản trị
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter Box */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#ccff00]">
              Nhận bản tin
            </h3>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Tổng hợp những chuyển động công nghệ quan trọng nhất vào sáng thứ Hai hằng tuần.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} NOVA//TECH. Mọi quyền được bảo lưu.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-slate-300">
              Giới thiệu
            </Link>
            <Link href="/" className="hover:text-slate-300">
              Quy định biên tập
            </Link>
            <Link href="/" className="hover:text-slate-300">
              Bảo mật dữ liệu
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
