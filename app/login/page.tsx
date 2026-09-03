"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, UserPlus, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfigurationMessage, isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  // Login form handler
  async function onLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setSuccess("");

    if (!isSupabaseConfigured) {
      setError(
        `Dịch vụ xác thực chưa được cấu hình. ${
          getSupabaseConfigurationMessage() || "Hãy kiểm tra biến môi trường Supabase."
        }`
      );
      setPending(false);
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Không thể đăng nhập. Hãy kiểm tra email và mật khẩu của bạn.");
        setPending(false);
        return;
      }

      if (!authData.user) {
        setError("Không tìm thấy thông tin người dùng.");
        setPending(false);
        return;
      }

      // Check user approval status in public.profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (profileError) {
        console.warn("Could not query profile status:", profileError.message);
      }

      // If account status is pending approval
      if (profile?.status === "pending") {
        await supabase.auth.signOut();
        setError(
          "Tài khoản của bạn đang chờ Quản trị viên phê duyệt. Vui lòng liên hệ ban quản trị hoặc quay lại sau."
        );
        setPending(false);
        return;
      }

      // If account status was rejected
      if (profile?.status === "rejected") {
        await supabase.auth.signOut();
        setError("Tài khoản của bạn đã bị từ chối hoặc vô hiệu hóa bởi Quản trị viên.");
        setPending(false);
        return;
      }

      // Successful login redirect
      const nextPath = new URLSearchParams(window.location.search).get("next");
      const isSafePath = Boolean(nextPath) && nextPath!.startsWith("/") && !nextPath!.startsWith("//");

      if (isSafePath) {
        window.location.assign(nextPath!);
      } else if (profile?.role === "admin" || profile?.role === "editor") {
        window.location.assign("/admin");
      } else {
        window.location.assign("/");
      }
    } catch {
      setError("Không thể kết nối đến máy chủ xác thực. Hãy thử lại sau.");
      setPending(false);
    }
  }

  // Register form handler
  async function onRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setSuccess("");

    if (!isSupabaseConfigured) {
      setError("Dịch vụ đăng ký chưa được cấu hình.");
      setPending(false);
      return;
    }

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      setPending(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      setPending(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split("@")[0],
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message || "Không thể đăng ký tài khoản. Email có thể đã được sử dụng.");
        setPending(false);
        return;
      }

      // Sign out immediately so pending user doesn't stay authenticated
      await supabase.auth.signOut();

      setSuccess(
        "Đăng ký tài khoản thành công! Tài khoản của bạn đang ở trạng thái CHỜ PHÊ DUYỆT từ Quản trị viên. Bạn sẽ có thể đăng nhập sau khi được duyệt."
      );
      setTab("login");
    } catch {
      setError("Không thể hoàn tất đăng ký. Hãy thử lại sau.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f9fc] p-5">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-8 rounded-md border border-[#e6eaf0] bg-white p-7 shadow-[0_16px_45px_rgba(16,24,40,.08)] sm:p-9">
          {/* Tab Selection */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError("");
              }}
              className={`flex-1 pb-3 text-sm font-bold transition flex items-center justify-center gap-2 border-b-2 ${
                tab === "login"
                  ? "border-[#d72626] text-[#d72626]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <LockKeyhole size={16} />
              <span>Đăng nhập</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab("register");
                setError("");
              }}
              className={`flex-1 pb-3 text-sm font-bold transition flex items-center justify-center gap-2 border-b-2 ${
                tab === "register"
                  ? "border-[#d72626] text-[#d72626]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <UserPlus size={16} />
              <span>Đăng ký tài khoản</span>
            </button>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="mb-5 rounded-md bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{success}</p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex items-start gap-2.5"
            >
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {tab === "login" ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#d72626]">
                Cổng thông tin & Tòa soạn
              </p>
              <h1 className="display mt-1 text-3xl font-bold text-[#101828]">Đăng nhập</h1>
              <p className="mt-2 text-xs leading-5 text-[#667085]">
                Đăng nhập để vào trang quản trị hoặc truy cập các tính năng nâng cao.
              </p>

              <form onSubmit={onLoginSubmit} className="mt-6 grid gap-4">
                <label className="grid gap-1.5 text-xs font-bold text-[#344054]">
                  Email
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="email@example.com"
                    className="rounded-sm border border-[#d0d5dd] px-3.5 py-2.5 text-sm font-normal outline-none transition focus:border-[#d72626] focus:ring-1 focus:ring-[#d72626]"
                  />
                </label>

                <label className="grid gap-1.5 text-xs font-bold text-[#344054]">
                  Mật khẩu
                  <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="rounded-sm border border-[#d0d5dd] px-3.5 py-2.5 text-sm font-normal outline-none transition focus:border-[#d72626] focus:ring-1 focus:ring-[#d72626]"
                  />
                </label>

                <button
                  disabled={pending}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-sm bg-[#101828] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#344054] disabled:opacity-60 active:scale-[.98]"
                >
                  {pending ? "Đang xác thực…" : <>Đăng nhập <ArrowRight size={15} /></>}
                </button>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-4 text-center">
                <p className="text-xs text-slate-500">
                  Chưa có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setTab("register");
                      setError("");
                    }}
                    className="font-bold text-[#d72626] hover:underline"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#d72626]">
                Đăng ký thành viên
              </p>
              <h1 className="display mt-1 text-3xl font-bold text-[#101828]">Tạo tài khoản</h1>
              <div className="mt-2 rounded-sm bg-amber-50 border border-amber-200 p-3 flex items-start gap-2 text-xs text-amber-800">
                <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p>Tài khoản sau khi đăng ký sẽ cần <strong>Quản trị viên phê duyệt</strong> trước khi có thể đăng nhập.</p>
              </div>

              <form onSubmit={onRegisterSubmit} className="mt-5 grid gap-4">
                <label className="grid gap-1.5 text-xs font-bold text-[#344054]">
                  Họ và tên
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    className="rounded-sm border border-[#d0d5dd] px-3.5 py-2.5 text-sm font-normal outline-none transition focus:border-[#d72626] focus:ring-1 focus:ring-[#d72626]"
                  />
                </label>

                <label className="grid gap-1.5 text-xs font-bold text-[#344054]">
                  Email
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="email@example.com"
                    className="rounded-sm border border-[#d0d5dd] px-3.5 py-2.5 text-sm font-normal outline-none transition focus:border-[#d72626] focus:ring-1 focus:ring-[#d72626]"
                  />
                </label>

                <label className="grid gap-1.5 text-xs font-bold text-[#344054]">
                  Mật khẩu (tối thiểu 6 ký tự)
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    className="rounded-sm border border-[#d0d5dd] px-3.5 py-2.5 text-sm font-normal outline-none transition focus:border-[#d72626] focus:ring-1 focus:ring-[#d72626]"
                  />
                </label>

                <label className="grid gap-1.5 text-xs font-bold text-[#344054]">
                  Xác nhận mật khẩu
                  <input
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    className="rounded-sm border border-[#d0d5dd] px-3.5 py-2.5 text-sm font-normal outline-none transition focus:border-[#d72626] focus:ring-1 focus:ring-[#d72626]"
                  />
                </label>

                <button
                  disabled={pending}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-sm bg-[#d72626] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#b91c1c] disabled:opacity-60 active:scale-[.98]"
                >
                  {pending ? "Đang xử lý…" : <>Đăng ký ngay <ArrowRight size={15} /></>}
                </button>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-4 text-center">
                <p className="text-xs text-slate-500">
                  Đã có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setTab("login");
                      setError("");
                    }}
                    className="font-bold text-[#d72626] hover:underline"
                  >
                    Đăng nhập tại đây
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 text-center">
          <Link href="/" className="text-xs font-bold text-[#667085] hover:text-[#d72626]">
            ← Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
