"use client";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
export function DeleteButton({ action, label = "Xóa" }: { action: () => Promise<void>; label?: string }) { const [pending, startTransition] = useTransition(); return <button type="button" disabled={pending} onClick={() => { if (confirm("Bạn chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.")) startTransition(() => action()); }} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold text-[#b42318] transition hover:bg-[#fef3f2] disabled:opacity-50"><Trash2 size={15}/>{pending ? "Đang xóa…" : label}</button>; }
