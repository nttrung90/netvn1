import { SiteHeader } from "@/components/site/SiteHeader";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><SiteHeader />{children}</>;
}
