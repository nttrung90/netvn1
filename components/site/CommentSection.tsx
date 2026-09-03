"use client";

import { useState, useTransition, FormEvent } from "react";
import { MessageSquare, Send, CheckCircle2, AlertCircle, Trash2, User } from "lucide-react";
import type { Comment } from "@/types/database";
import { formatViDate } from "@/lib/utils";
import { addCommentAction, deleteCommentAction } from "@/app/actions";

function maskEmail(email: string) {
  if (!email || !email.includes("@")) return "Độc giả ẩn danh";
  const [username, domain] = email.split("@");
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }
  return `${username.slice(0, 3)}***@${domain}`;
}

export function CommentSection({
  postId,
  postSlug,
  initialComments,
  isAdmin = false,
}: {
  postId: string;
  postSlug: string;
  initialComments: Comment[];
  isAdmin?: boolean;
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);

    const trimmedEmail = email.trim();
    const trimmedContent = content.trim();

    if (!trimmedEmail) {
      setStatus({ type: "error", text: "Vui lòng nhập địa chỉ email của bạn." });
      return;
    }

    if (!trimmedContent) {
      setStatus({ type: "error", text: "Vui lòng nhập nội dung bình luận." });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", trimmedEmail);
      formData.append("content", trimmedContent);

      const result = await addCommentAction(postId, postSlug, formData);

      if (result.error) {
        setStatus({ type: "error", text: result.error });
      } else {
        if (result.comment) {
          setComments((prev) => [result.comment!, ...prev]);
        }
        setContent("");
        setStatus({
          type: "success",
          text: "Bình luận của bạn đã được gửi thành công!",
        });
      }
    });
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    startTransition(async () => {
      const result = await deleteCommentAction(commentId, postSlug);
      if (result.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else if (result.error) {
        alert(result.error);
      }
    });
  }

  return (
    <section className="mt-12 border-t border-slate-200 pt-8" id="binh-luan">
      {/* Section Header */}
      <div className="border-b-2 border-[#d72626] pb-2 mb-6 flex items-center justify-between">
        <h3 className="text-[17px] font-bold text-[#222] uppercase tracking-wide flex items-center gap-2">
          <MessageSquare size={19} className="text-[#d72626]" />
          <span>Ý kiến bạn đọc ({comments.length})</span>
        </h3>
        <span className="text-xs text-slate-500 font-medium">Bình luận văn minh & lịch sự</span>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 p-5 rounded-md mb-8">
        <div className="mb-4">
          <label htmlFor="comment-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Email của bạn <span className="text-red-500">*</span>
            <span className="font-normal text-slate-400 lowercase ml-1">(được bảo mật, không hiển thị công khai)</span>
          </label>
          <input
            id="comment-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nhap-email-cua-ban@gmail.com"
            className="w-full max-w-md rounded-sm border border-slate-300 bg-white px-3.5 py-2 text-sm text-[#222] outline-none transition focus:border-[#d72626] focus:ring-1 focus:ring-[#d72626]"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="comment-content" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Nội dung bình luận <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment-content"
            required
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ quan điểm hoặc đặt câu hỏi của bạn về bài viết này..."
            className="w-full rounded-sm border border-slate-300 bg-white p-3 text-sm text-[#222] outline-none transition focus:border-[#d72626] focus:ring-1 focus:ring-[#d72626]"
          />
        </div>

        {status && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-sm p-3 text-sm font-medium ${
              status.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {status.type === "success" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
            <span>{status.text}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-sm bg-[#d72626] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#b91c1c] active:scale-[0.98] disabled:opacity-60"
          >
            {isPending ? (
              <span>Đang gửi...</span>
            ) : (
              <>
                <Send size={14} />
                <span>Gửi bình luận</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const masked = maskEmail(comment.email);
            const initial = (comment.email[0] || "U").toUpperCase();

            return (
              <div
                key={comment.id}
                className="group flex items-start gap-3.5 border-b border-slate-100 pb-4 last:border-0"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-sm shadow-sm">
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#222]">
                        {comment.name || masked}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-400">
                        {formatViDate(comment.created_at, "long")}
                      </span>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        title="Xóa bình luận này (Admin)"
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <p className="mt-1.5 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-slate-400 bg-slate-50/50 rounded-sm border border-dashed border-slate-200">
            <User size={28} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">Chưa có bình luận nào.</p>
            <p className="text-xs text-slate-400 mt-0.5">Hãy là người đầu tiên chia sẻ cảm nghĩ của bạn!</p>
          </div>
        )}
      </div>
    </section>
  );
}
