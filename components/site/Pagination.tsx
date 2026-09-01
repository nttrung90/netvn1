import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  current,
  total,
  makeHref,
}: {
  current: number;
  total: number;
  makeHref: (page: number) => string;
}) {
  if (total <= 1) return null;

  return (
    <nav aria-label="Phân trang" className="mt-12 flex items-center justify-center gap-2">
      {/* Previous Button */}
      {current > 1 ? (
        <Link
          href={makeHref(current - 1)}
          className="inline-flex h-9 items-center gap-1 rounded-sm border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#d72626] hover:bg-[#edf0ff] hover:text-[#d72626]"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Trước</span>
        </Link>
      ) : (
        <span className="inline-flex h-9 items-center gap-1 rounded-sm border border-slate-100 bg-slate-50 px-3 text-xs font-medium text-slate-400">
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Trước</span>
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }, (_, index) => index + 1).map((page) => (
          <Link
            aria-current={page === current ? "page" : undefined}
            className={`grid h-9 w-9 place-items-center rounded-sm text-xs font-bold transition shadow-sm ${
              page === current
                ? "bg-[#101828] text-white shadow"
                : "border border-slate-200 bg-white text-slate-700 hover:border-[#d72626] hover:bg-[#edf0ff] hover:text-[#d72626]"
            }`}
            href={makeHref(page)}
            key={page}
          >
            {page}
          </Link>
        ))}
      </div>

      {/* Next Button */}
      {current < total ? (
        <Link
          href={makeHref(current + 1)}
          className="inline-flex h-9 items-center gap-1 rounded-sm border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#d72626] hover:bg-[#edf0ff] hover:text-[#d72626]"
        >
          <span className="hidden sm:inline">Tiếp</span>
          <ChevronRight size={14} />
        </Link>
      ) : (
        <span className="inline-flex h-9 items-center gap-1 rounded-sm border border-slate-100 bg-slate-50 px-3 text-xs font-medium text-slate-400">
          <span className="hidden sm:inline">Tiếp</span>
          <ChevronRight size={14} />
        </span>
      )}
    </nav>
  );
}
