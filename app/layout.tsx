import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { getSiteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "NOVA//TECH — Góc nhìn công nghệ thực dụng", template: "%s | NOVA//TECH" },
  description: "Cổng tin tức công nghệ với những phân tích ngắn gọn, thực dụng và có chiều sâu.",
  openGraph: { type: "website", locale: "vi_VN", siteName: "NOVA//TECH" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <Toaster richColors position="top-right" closeButton />
        {children}
      </body>
    </html>
  );
}
