import Link from "next/link";

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
    <nav aria-label="Phân trang" className="mt-8 flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, index) => index + 1).map((page) => (
        <Link
          aria-current={page === current ? "page" : undefined}
          className={`grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-bold ${
            page === current
              ? "bg-[#101828] text-white"
              : "border bg-white text-[#475467] hover:border-[#4062ff]"
          }`}
          href={makeHref(page)}
          key={page}
        >
          {page}
        </Link>
      ))}
    </nav>
  );
}
