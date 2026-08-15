import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) { const { user, profile } = await requireAdmin(); return <AdminShell name={profile?.name} email={user.email}>{children}</AdminShell>; }
