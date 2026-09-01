export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function formatCount(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function estimateReadingTime(text: string | null | undefined): number {
  if (!text) return 1;
  const clean = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = clean.length ? clean.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatViDate(dateStr: string | null | undefined, style: "short" | "medium" | "long" = "medium"): string {
  if (!dateStr) return "Mới cập nhật";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Mới cập nhật";
    return new Intl.DateTimeFormat("vi-VN", { dateStyle: style }).format(date);
  } catch {
    return "Mới cập nhật";
  }
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (configuredUrl || "http://localhost:3000").replace(/\/$/, "");
}

export function getFirstImageFromHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}
