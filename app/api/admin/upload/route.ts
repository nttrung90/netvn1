import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const extensionByType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  const current = await getCurrentUser();
  if (!current?.user) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  if (current.profile?.role !== "admin") return NextResponse.json({ error: "Bạn không có quyền tải ảnh." }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Không tìm thấy tệp ảnh." }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Chỉ hỗ trợ JPEG, PNG, WebP và GIF." }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Ảnh phải nhỏ hơn 5 MB." }, { status: 400 });

  try {
    const client = createAdminClient();
    const path = `${current.user.id}/${randomUUID()}.${extensionByType[file.type]}`;
    const arrayBuffer = await file.arrayBuffer();
    const { error } = await client.storage.from("media").upload(path, Buffer.from(arrayBuffer), { contentType: file.type, upsert: false });
    if (error) throw error;
    const { data } = client.storage.from("media").getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    console.error("Media upload failed", error);
    return NextResponse.json({ error: "Không thể tải ảnh lên. Hãy kiểm tra cấu hình Storage." }, { status: 500 });
  }
}
