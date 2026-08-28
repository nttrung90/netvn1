"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { deletePost } from "@/app/actions";
import type { PostWithRelations } from "@/types/database";
import { DeleteButton } from "./DeleteButton";

export function PostManagementList({ posts, compact = false }: { posts: PostWithRelations[]; compact?: boolean }) {
  if (!posts.length) {
    return <p className="p-8 text-center text-sm text-[#667085]">Chưa có bài viết. Hãy tạo bài đầu tiên.</p>;
  }

  return (
    <div className="divide-y divide-[#eaecf0]">
      {posts.map((post) => (
        <div className={`flex flex-wrap items-center justify-between gap-4 ${compact ? "py-3" : "p-5"}`} key={post.id}>
          <div className="min-w-0">
            <Link className="block truncate font-bold transition hover:text-[#4062ff]" href={`/admin/posts/${post.id}/edit`}>
              {post.title}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#667085]">
              <span>{post.category?.name || "Chưa phân loại"}</span>
              <span aria-hidden>·</span>
              <span className={`rounded-full px-2 py-0.5 font-bold ${post.status === "published" ? "bg-[#ecfdf3] text-[#027a48]" : "bg-[#f2f4f7] text-[#475467]"}`}>
                {post.status === "published" ? "Đã xuất bản" : "Bản nháp"}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Link aria-label={`Chỉnh sửa ${post.title}`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-bold text-[#4062ff] transition hover:bg-[#edf0ff]" href={`/admin/posts/${post.id}/edit`}>
              <ExternalLink size={14}/>Chỉnh sửa
            </Link>
            <DeleteButton action={deletePost.bind(null, post.id)} />
          </div>
        </div>
      ))}
    </div>
  );
}
