import { describe, expect, it } from "vitest";
import { buildPostSearchClauses, collectSearchRelationIds } from "../lib/data/search";

describe("buildPostSearchClauses", () => {
  it("tạo pattern ilike chính xác, không thêm khoảng trắng ở cuối", () => {
    const { search } = buildPostSearchClauses("  AI thực dụng  ");
    expect(search).toBe("%AI thực dụng%");
  });

  it("thêm post ids được suy ra từ tags vào điều kiện tìm kiếm", () => {
    const { clauses } = buildPostSearchClauses("bao mat", ["category-1"], ["post-tag-1", "post-tag-2"]);
    expect(clauses).toContain("category_id.in.(category-1)");
    expect(clauses).toContain("id.in.(post-tag-1,post-tag-2)");
  });

  it("truy vết tag khớp đến đúng các post ids trước khi lọc danh sách bài viết", async () => {
    const calls: Array<{ table: string; field?: string; values?: string[] }> = [];
    const client = { from(table: "categories" | "tags" | "post_tags") {
      if (table === "categories") return { select: () => ({ ilike: async () => ({ data: [{ id: "category-security" }] }) }) };
      if (table === "tags") return { select: () => ({ ilike: async () => ({ data: [{ id: "tag-security" }] }) }) };
      return { select: () => ({ in: async (field: string, values: string[]) => { calls.push({ table, field, values }); return { data: [{ post_id: "post-from-tag" }] }; } }) };
    }};
    await expect(collectSearchRelationIds(client as never, "Bảo mật")).resolves.toEqual({ categoryIds: ["category-security"], postIdsFromTags: ["post-from-tag"] });
    expect(calls).toEqual([{ table: "post_tags", field: "tag_id", values: ["tag-security"] }]);
  });
});
