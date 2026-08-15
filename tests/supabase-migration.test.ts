import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = join(process.cwd(), "supabase/migrations/20260815103000_initial_schema.sql");

describe("Supabase migration", () => {
  it("định nghĩa bảng nội dung, RLS và Storage policies bắt buộc", async () => {
    const sql = await readFile(migrationPath, "utf8");
    ["create table public.profiles", "create table public.posts", "create table public.categories", "create table public.tags", "create table public.post_tags", "alter table public.posts enable row level security", "create policy \"admins manage posts\"", "insert into storage.buckets", "create policy \"admins upload media\""]
      .forEach((fragment) => expect(sql).toContain(fragment));
  });

  it("bảo vệ role admin bằng hàm database thay vì client", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("create or replace function public.is_admin()");
    expect(sql).toContain("role = 'admin'");
  });
});
