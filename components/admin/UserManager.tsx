"use client";

import { useState, useTransition } from "react";
import { Check, X, Shield, Clock, CheckCircle2, XCircle, Trash2, UserCog, Filter } from "lucide-react";
import type { Profile, Role, UserStatus } from "@/types/database";
import { formatViDate } from "@/lib/utils";
import { approveUser, rejectUser, updateUserRole, deleteUser } from "@/app/actions";

export function UserManager({
  initialUsers,
  currentAdminId,
}: {
  initialUsers: Profile[];
  currentAdminId?: string;
}) {
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [filter, setFilter] = useState<"all" | UserStatus>("all");
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  // Counts
  const totalCount = users.length;
  const pendingCount = users.filter((u) => u.status === "pending").length;
  const approvedCount = users.filter((u) => u.status === "approved" || !u.status).length;
  const rejectedCount = users.filter((u) => u.status === "rejected").length;

  const filteredUsers = users.filter((u) => {
    if (filter === "all") return true;
    if (filter === "approved") return u.status === "approved" || !u.status;
    return u.status === filter;
  });

  async function handleApprove(userId: string, role: Role) {
    setActionId(userId);
    startTransition(async () => {
      try {
        await approveUser(userId, role);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: "approved", role } : u))
        );
      } catch (err) {
        alert("Lỗi khi phê duyệt: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setActionId(null);
      }
    });
  }

  async function handleReject(userId: string) {
    if (!confirm("Bạn có chắc chắn muốn từ chối hoặc vô hiệu hóa tài khoản này?")) return;
    setActionId(userId);
    startTransition(async () => {
      try {
        await rejectUser(userId);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: "rejected" } : u))
        );
      } catch (err) {
        alert("Lỗi khi từ chối: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setActionId(null);
      }
    });
  }

  async function handleRoleChange(userId: string, newRole: Role) {
    setActionId(userId);
    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } catch (err) {
        alert("Lỗi khi đổi quyền: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setActionId(null);
      }
    });
  }

  async function handleDelete(userId: string) {
    if (!confirm("Hành động này sẽ xóa hoàn toàn tài khoản này. Bạn có chắc chắn?")) return;
    setActionId(userId);
    startTransition(async () => {
      try {
        await deleteUser(userId);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } catch (err) {
        alert("Lỗi khi xóa: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setActionId(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng tài khoản</span>
            <UserCog size={18} className="text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[#101828]">{totalCount}</p>
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Chờ phê duyệt</span>
            <Clock size={18} className="text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-800">{pendingCount}</p>
        </div>

        <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Đã phê duyệt</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-800">{approvedCount}</p>
        </div>

        <div className="rounded-md border border-red-200 bg-red-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">Đã từ chối</span>
            <XCircle size={18} className="text-red-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-red-800">{rejectedCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <div className="flex gap-1.5">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-sm px-3 py-1.5 text-xs font-bold transition ${
                filter === "all"
                  ? "bg-[#101828] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tất cả ({totalCount})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`rounded-sm px-3 py-1.5 text-xs font-bold transition ${
                filter === "pending"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              Chờ duyệt ({pendingCount})
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`rounded-sm px-3 py-1.5 text-xs font-bold transition ${
                filter === "approved"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              Đã duyệt ({approvedCount})
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`rounded-sm px-3 py-1.5 text-xs font-bold transition ${
                filter === "rejected"
                  ? "bg-red-600 text-white"
                  : "bg-red-50 text-red-800 hover:bg-red-100"
              }`}
            >
              Từ chối ({rejectedCount})
            </button>
          </div>
        </div>

        {isPending && (
          <span className="text-xs text-[#d72626] font-semibold animate-pulse">
            Đang cập nhật...
          </span>
        )}
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Người dùng</th>
                <th className="px-5 py-3.5">Ngày đăng ký</th>
                <th className="px-5 py-3.5">Vai trò</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isSelf = u.id === currentAdminId;
                  const isCurrentPending = actionId === u.id && isPending;
                  const status = u.status || "approved";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      {/* Name & Email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-700 text-xs">
                            {(u.name?.[0] || u.email?.[0] || "U").toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#101828] flex items-center gap-1.5">
                              <span>{u.name || "Chưa đặt tên"}</span>
                              {isSelf && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                                  Bạn
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {formatViDate(u.created_at, "short")}
                      </td>

                      {/* Role Dropdown */}
                      <td className="px-5 py-4">
                        <select
                          disabled={isSelf || isCurrentPending}
                          value={u.role || "reader"}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                          className="rounded-sm border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-[#d72626] disabled:opacity-60"
                        >
                          <option value="reader">Độc giả (Reader)</option>
                          <option value="editor">Biên tập viên (Editor)</option>
                          <option value="admin">Quản trị viên (Admin)</option>
                        </select>
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        {status === "pending" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                            <Clock size={12} />
                            <span>Chờ duyệt</span>
                          </span>
                        )}
                        {status === "approved" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                            <CheckCircle2 size={12} />
                            <span>Đã duyệt</span>
                          </span>
                        )}
                        {status === "rejected" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800">
                            <XCircle size={12} />
                            <span>Từ chối</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {status === "pending" && (
                            <>
                              <button
                                disabled={isCurrentPending}
                                onClick={() => handleApprove(u.id, u.role || "reader")}
                                className="inline-flex items-center gap-1 rounded-sm bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                title="Phê duyệt tài khoản này"
                              >
                                <Check size={13} />
                                <span>Phê duyệt</span>
                              </button>
                              <button
                                disabled={isCurrentPending}
                                onClick={() => handleReject(u.id)}
                                className="inline-flex items-center gap-1 rounded-sm bg-red-50 border border-red-200 px-2 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                                title="Từ chối tài khoản này"
                              >
                                <X size={13} />
                                <span>Từ chối</span>
                              </button>
                            </>
                          )}

                          {status === "approved" && !isSelf && (
                            <button
                              disabled={isCurrentPending}
                              onClick={() => handleReject(u.id)}
                              className="inline-flex items-center gap-1 rounded-sm border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700 hover:border-red-200 disabled:opacity-50"
                              title="Khóa/Thu hồi quyền"
                            >
                              <X size={13} />
                              <span>Vô hiệu hóa</span>
                            </button>
                          )}

                          {status === "rejected" && (
                            <button
                              disabled={isCurrentPending}
                              onClick={() => handleApprove(u.id, u.role || "reader")}
                              className="inline-flex items-center gap-1 rounded-sm bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                              title="Kích hoạt lại tài khoản"
                            >
                              <Check size={13} />
                              <span>Kích hoạt lại</span>
                            </button>
                          )}

                          {!isSelf && (
                            <button
                              disabled={isCurrentPending}
                              onClick={() => handleDelete(u.id)}
                              className="rounded-sm p-1.5 text-slate-400 hover:text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                              title="Xóa tài khoản"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Không có tài khoản nào theo bộ lọc này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
