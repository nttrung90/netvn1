"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import NextImage from "next/image";
import NextLink from "next/link";
import { createLowlight, common } from "lowlight";
import {
  Bold,
  Code2,
  ImageUp,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import { ChangeEvent, useActionState, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { Category, PostWithRelations } from "@/types/database";
import { initialPostActionState, type PostActionState } from "@/types/actions";

const lowlight = createLowlight(common);

type SubmitAction = (state: PostActionState, formData: FormData) => Promise<PostActionState>;

export function PostEditor({
  post,
  categories,
  action,
}: {
  post?: PostWithRelations;
  categories: Category[];
  action: SubmitAction;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isJustPublished = searchParams.get("published") === "1";
  const isJustDraftSaved = searchParams.get("published") === "0" && searchParams.get("saved") === "1";
  const urlSlug = searchParams.get("slug") || post?.slug;

  const [state, formAction, pending] = useActionState(action, initialPostActionState);
  const [content, setContent] = useState(post?.content || "");
  const [coverImage, setCoverImage] = useState(post?.cover_image || "");
  const [uploading, setUploading] = useState(false);
  const [activeButton, setActiveButton] = useState<"published" | "draft" | null>(null);

  // Success Banner State
  const [showSuccessBanner, setShowSuccessBanner] = useState(isJustPublished || isJustDraftSaved);

  useEffect(() => {
    if (isJustPublished) {
      toast.success("Xuất bản bài viết thành công!", {
        description: "Bài viết đã được đưa lên trang đầu website.",
      });
    } else if (isJustDraftSaved) {
      toast.success("Đã lưu bản nháp thành công!");
    }
  }, [isJustPublished, isJustDraftSaved]);

  useEffect(() => {
    if (state.redirectTo) {
      router.replace(state.redirectTo);
      router.refresh();
    }
  }, [router, state.redirectTo]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Link.configure({ openOnClick: false }),
      TiptapImage,
      Placeholder.configure({ placeholder: "Bắt đầu viết nội dung bài viết…" }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: post?.content || "",
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "min-h-[360px] outline-none prose-news max-w-none p-5",
      },
    },
  });

  const run = (command: () => void) => command();
  const setLink = () => {
    const url = window.prompt("Nhập URL liên kết");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  };

  async function uploadImage(event: ChangeEvent<HTMLInputElement>, asCover = false) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: data });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(result.error || "Không thể tải ảnh lên.");
        return;
      }
      if (asCover) {
        setCoverImage(result.url);
        toast.success("Đã tải ảnh đại diện thành công!");
      } else {
        editor?.chain().focus().setImage({ src: result.url, alt: file.name }).run();
        toast.success("Đã chèn ảnh vào nội dung!");
      }
      event.target.value = "";
    } catch {
      toast.error("Không thể tải ảnh lên. Vui lòng kiểm tra kết nối mạng.");
    } finally {
      setUploading(false);
    }
  }

  const toolbar = [
    { icon: Bold, label: "Đậm", onClick: () => run(() => editor?.chain().focus().toggleBold().run()) },
    { icon: Italic, label: "Nghiêng", onClick: () => run(() => editor?.chain().focus().toggleItalic().run()) },
    { icon: Link2, label: "Liên kết", onClick: setLink },
    { icon: List, label: "Danh sách", onClick: () => run(() => editor?.chain().focus().toggleBulletList().run()) },
    { icon: ListOrdered, label: "Danh sách số", onClick: () => run(() => editor?.chain().focus().toggleOrderedList().run()) },
    { icon: Quote, label: "Trích dẫn", onClick: () => run(() => editor?.chain().focus().toggleBlockquote().run()) },
    { icon: Code2, label: "Code", onClick: () => run(() => editor?.chain().focus().toggleCodeBlock().run()) },
  ];

  return (
    <form action={formAction} className="grid gap-6">
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="coverImage" value={coverImage} />

      {/* Success Notification Banner */}
      {showSuccessBanner && (
        <div className="flex flex-col gap-3 rounded-md border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-emerald-600 text-white shadow">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="font-bold text-sm text-emerald-950">
                {isJustPublished ? "Xuất bản bài viết thành công!" : "Đã lưu bản nháp thành công!"}
              </p>
              <p className="text-xs text-emerald-700">
                {isJustPublished
                  ? "Bài viết đã được đưa lên trang đầu website và cập nhật tới độc giả."
                  : "Bản nháp đã được lưu an toàn trong hệ thống."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {urlSlug && (
              <NextLink
                href={`/bai-viet/${urlSlug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800"
              >
                <span>Xem bài viết trên web</span>
                <ExternalLink size={13} />
              </NextLink>
            )}
            <NextLink
              href="/admin/posts"
              className="inline-flex items-center gap-1 rounded-sm border border-emerald-300 bg-white px-3.5 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
            >
              Về danh sách bài
            </NextLink>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {state.error && (
        <p role="alert" className="rounded-sm border border-[#fecdca] bg-[#fef3f2] px-4 py-3 text-sm leading-6 text-[#b42318]">
          {state.error}
        </p>
      )}

      {/* Title & Excerpt Section */}
      <section className="rounded-md border bg-white p-5 shadow-sm">
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-bold">
            Tiêu đề bài viết
            <input
              name="title"
              required
              defaultValue={post?.title}
              placeholder="Một tiêu đề rõ ràng, hấp dẫn…"
              className="display w-full border-b border-[#cbd5e1] bg-transparent py-3 text-2xl md:text-3xl font-bold outline-none placeholder:text-[#98a2b3] focus:border-[#d72626]"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Mô tả ngắn (Excerpt)
            <textarea
              name="excerpt"
              defaultValue={post?.excerpt || ""}
              maxLength={400}
              rows={3}
              placeholder="Tóm tắt giá trị chính của bài viết…"
              className="resize-y rounded-sm border border-[#d0d5dd] p-3 text-sm font-normal leading-6 outline-none focus:border-[#d72626]"
            />
          </label>
        </div>
      </section>

      {/* Editor Content */}
      <section className="overflow-hidden rounded-md border bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-1 border-b bg-[#f9fafb] p-2">
          {toolbar.map(({ icon: Icon, label, onClick }) => (
            <button
              type="button"
              onClick={onClick}
              title={label}
              aria-label={label}
              key={label}
              className="grid h-9 w-9 place-items-center rounded-lg text-[#475467] transition hover:bg-white hover:text-[#d72626]"
            >
              <Icon size={17} />
            </button>
          ))}
          <label
            title="Chèn ảnh vào nội dung"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-[#475467] hover:bg-white hover:text-[#d72626]"
          >
            <ImageUp size={17} />
            <input
              onChange={(event) => uploadImage(event)}
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
            />
          </label>
          <span className="mx-1 h-6 w-px bg-[#d0d5dd]" />
          <button
            type="button"
            onClick={() => editor?.chain().focus().undo().run()}
            className="grid h-9 w-9 place-items-center rounded-lg text-[#475467] hover:bg-white"
          >
            <Undo2 size={17} />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().redo().run()}
            className="grid h-9 w-9 place-items-center rounded-lg text-[#475467] hover:bg-white"
          >
            <Redo2 size={17} />
          </button>
        </div>
        <EditorContent editor={editor} />
      </section>

      {/* Live Preview */}
      <section className="rounded-md border bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[.15em] text-[#d72626]">
          Xem trước trực tiếp
        </p>
        <div
          className="prose-news mt-3 max-w-none rounded-sm bg-[#f9fafb] p-5"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: content || "<p>Phần xem trước sẽ xuất hiện khi bạn bắt đầu viết.</p>",
          }}
        />
      </section>

      {/* Categories & Cover Image */}
      <section className="grid gap-5 rounded-md border bg-white p-5 lg:grid-cols-2 shadow-sm">
        <div className="grid gap-2">
          <label className="text-sm font-bold">
            Chuyên mục
            <select
              name="categoryId"
              defaultValue={post?.category_id || ""}
              className="mt-2 w-full rounded-sm border border-[#d0d5dd] bg-white px-3 py-3 text-sm font-normal outline-none focus:border-[#d72626]"
            >
              <option value="">Chưa phân loại</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold">
            Thẻ (ngăn cách bằng dấu phẩy)
            <input
              name="tags"
              defaultValue={post?.tags?.map((tag) => tag.name).join(", ") || ""}
              placeholder="AI, hướng dẫn, năng suất"
              className="mt-2 w-full rounded-sm border border-[#d0d5dd] px-3 py-3 text-sm font-normal outline-none focus:border-[#d72626]"
            />
          </label>
        </div>

        <div>
          <p className="text-sm font-bold">Ảnh đại diện bài viết</p>
          <div className="mt-2 flex items-center gap-3">
            {coverImage ? (
              <NextImage
                src={coverImage}
                alt=""
                width={112}
                height={80}
                className="h-20 w-28 rounded-sm object-cover border"
              />
            ) : (
              <div className="grid h-20 w-28 place-items-center rounded-sm bg-[#edf0ff] text-xs text-[#667085]">
                Chưa có ảnh
              </div>
            )}
            <label className="cursor-pointer rounded-sm border border-[#d0d5dd] px-3 py-2.5 text-sm font-bold transition hover:border-[#d72626]">
              {uploading ? "Đang tải…" : "Tải ảnh lên"}
              <input
                onChange={(event) => uploadImage(event, true)}
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
              />
            </label>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#667085]">JPG, PNG, WEBP hoặc GIF. Dung lượng tối đa 5 MB.</p>
        </div>
      </section>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-md border bg-white/95 p-4 shadow-xl backdrop-blur">
        <NextLink
          href="/admin/posts"
          className="text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          ← Danh sách bài viết
        </NextLink>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            name="status"
            value="draft"
            onClick={() => setActiveButton("draft")}
            className="inline-flex items-center gap-1.5 rounded-sm border border-[#d0d5dd] bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-400 active:scale-[.98] disabled:opacity-60"
          >
            {pending && activeButton === "draft" && <Loader2 size={14} className="animate-spin text-slate-600" />}
            <span>{pending && activeButton === "draft" ? "Đang lưu nháp…" : "Lưu nháp"}</span>
          </button>

          <button
            type="submit"
            disabled={pending}
            name="status"
            value="published"
            onClick={() => setActiveButton("published")}
            className="inline-flex items-center gap-1.5 rounded-sm bg-[#101828] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#344054] active:scale-[.98] disabled:opacity-60"
          >
            {pending && activeButton === "published" ? (
              <>
                <Loader2 size={14} className="animate-spin text-[#ccff00]" />
                <span>Đang xuất bản…</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-[#ccff00]" />
                <span>Xuất bản ngay</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
