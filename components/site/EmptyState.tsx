export function EmptyState({
  title = "Chưa có nội dung để hiển thị",
  description = "Hãy quay lại sau khi tòa soạn có bài viết mới.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed bg-white p-8 text-center">
      <p className="font-bold text-[#101828]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#667085]">{description}</p>
    </div>
  );
}
