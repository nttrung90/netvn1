"use client";

import { Send } from "lucide-react";
import { toast } from "sonner";

export function NewsletterForm() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("Đăng ký thành công!", { description: "Cảm ơn bạn đã đăng ký nhận bản tin." });
        (e.target as HTMLFormElement).reset();
      }}
      className="mt-4 flex items-center rounded-xl border border-slate-700 bg-slate-900/80 p-1.5 focus-within:border-[#4062ff]"
    >
      <input
        type="email"
        placeholder="Email của bạn..."
        className="w-full bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
        required
      />
      <button
        type="submit"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4062ff] text-white transition hover:bg-blue-600"
        title="Đăng ký"
      >
        <Send size={13} />
      </button>
    </form>
  );
}
