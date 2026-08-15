import Link from "next/link";

export function Logo() {
  return (
    <Link className="display inline-flex items-baseline gap-1 text-2xl font-bold tracking-[-.07em]" href="/">
      NOVA<span className="text-[#4062ff]">{"//"}</span>TECH
    </Link>
  );
}
