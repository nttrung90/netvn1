import Link from "next/link";

export function Logo() {
  return (
    <Link className="display inline-flex items-baseline gap-1 text-2xl font-bold tracking-[-.07em]" href="/">
      NOVA<span className="text-[#d72626]">{"//"}</span>TECH
    </Link>
  );
}
