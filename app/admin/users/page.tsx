import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { UserManager } from "@/components/admin/UserManager";
import type { Profile } from "@/types/database";

export const metadata: Metadata = {
  title: "Quản lý & Phê duyệt tài khoản — NOVA//TECH Admin",
};

export default async function UsersAdminPage() {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, avatar, role, status, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load profiles:", error.message);
  }

  const profiles = (data || []) as Profile[];

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[.17em] text-[#d72626]">
          Phân quyền & Kiểm duyệt
        </p>
        <h1 className="display mt-1 text-3xl sm:text-4xl font-bold text-[#101828]">
          Tài khoản & Phê duyệt
        </h1>
        <p className="mt-2 text-sm text-[#667085]">
          Xem danh sách tài khoản đã đăng ký, phê duyệt thành viên mới hoặc điều chỉnh vai trò quản trị.
        </p>
      </div>

      <UserManager initialUsers={profiles} currentAdminId={user.id} />
    </div>
  );
}
