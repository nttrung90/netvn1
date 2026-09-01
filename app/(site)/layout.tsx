import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f0f2f5] font-sans">
      <SiteHeader />
      <div className="flex-1 bg-white mx-auto w-full max-w-[1140px] md:my-6 md:rounded-md shadow-sm">
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
