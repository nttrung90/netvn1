import { Inbox } from "lucide-react";

export function EmptyState({
  title = "Chưa có nội dung để hiển thị",
  description = "Hãy quay lại sau khi tòa soạn có bài viết mới.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white/60 p-10 text-center backdrop-blur-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-slate-400">
        <Inbox size={22} />
      </div>
      <p className="mt-4 font-bold text-[#101828] text-base">{title}</p>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#667085]">{description}</p>
    </div>
  );
}
