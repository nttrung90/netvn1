"use client";

import { useState } from "react";
import { Check, Copy, Share2, Facebook, Twitter, Linkedin } from "lucide-react";

export function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : `https://novatech.vn/bai-viet/${slug}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareLinkedin = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">
        <Share2 size={13} /> Chia sẻ:
      </span>
      <button
        type="button"
        onClick={copyToClipboard}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
          copied
            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        }`}
        title="Sao chép liên kết"
      >
        {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
        <span>{copied ? "Đã sao chép liên kết!" : "Sao chép link"}</span>
      </button>

      <button
        type="button"
        onClick={shareTwitter}
        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-sky-500"
        title="Chia sẻ trên X / Twitter"
      >
        <Twitter size={14} />
      </button>

      <button
        type="button"
        onClick={shareFacebook}
        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-blue-600"
        title="Chia sẻ trên Facebook"
      >
        <Facebook size={14} />
      </button>

      <button
        type="button"
        onClick={shareLinkedin}
        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-blue-700"
        title="Chia sẻ trên LinkedIn"
      >
        <Linkedin size={14} />
      </button>
    </div>
  );
}
