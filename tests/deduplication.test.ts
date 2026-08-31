import { describe, expect, it } from "vitest";
import { estimateReadingTime, formatViDate } from "../lib/utils";
import type { PostWithRelations } from "../types/database";

describe("Tối ưu hóa Tiện ích (Utils)", () => {
  it("tính toán thời gian đọc ước tính chính xác theo số lượng từ", () => {
    expect(estimateReadingTime(null)).toBe(1);
    expect(estimateReadingTime("")).toBe(1);

    const shortText = Array.from({ length: 100 }, () => "word").join(" ");
    expect(estimateReadingTime(shortText)).toBe(1);

    const mediumText = Array.from({ length: 450 }, () => "từ").join(" ");
    expect(estimateReadingTime(mediumText)).toBe(3);

    const htmlText = "<p>" + Array.from({ length: 400 }, () => "<span>từ</span>").join(" ") + "</p>";
    expect(estimateReadingTime(htmlText)).toBe(2);
  });

  it("định dạng ngày tháng tiếng Việt chuẩn", () => {
    expect(formatViDate(null)).toBe("Mới cập nhật");
    expect(formatViDate("2026-08-15T10:00:00Z")).toContain("2026");
  });
});

describe("Thuật toán Phân phối bài viết Chống Trùng lặp (Deduplication Logic)", () => {
  function createMockPost(id: string, viewCount: number, publishedAt: string, categoryId: string): PostWithRelations {
    return {
      id,
      title: `Bài viết ${id}`,
      slug: `bai-viet-${id}`,
      excerpt: `Tóm tắt bài viết ${id}`,
      content: `<p>Nội dung bài viết ${id}</p>`,
      cover_image: `https://example.com/images/${id}.jpg`,
      category_id: categoryId,
      author_id: "author-1",
      status: "published",
      published_at: publishedAt,
      view_count: viewCount,
      created_at: publishedAt,
      updated_at: publishedAt,
      category: { id: categoryId, name: `Chuyên mục ${categoryId}`, slug: `chuyen-muc-${categoryId}` },
      tags: [],
    };
  }

  it("đảm bảo không có bất kỳ bài viết nào bị trùng lặp giữa Featured, Popular, Latest và Category Sections", () => {
    const categories = [
      { id: "cat-ai", name: "AI", slug: "ai", description: null },
      { id: "cat-sec", name: "Bảo mật", slug: "bao-mat", description: null },
      { id: "cat-dev", name: "Lập trình", slug: "lap-trinh", description: null },
    ];

    const allPosts: PostWithRelations[] = [
      createMockPost("post-1", 1000, "2026-08-20T10:00:00Z", "cat-ai"),
      createMockPost("post-2", 900, "2026-08-19T10:00:00Z", "cat-ai"),
      createMockPost("post-3", 800, "2026-08-18T10:00:00Z", "cat-sec"),
      createMockPost("post-4", 700, "2026-08-17T10:00:00Z", "cat-sec"),
      createMockPost("post-5", 600, "2026-08-16T10:00:00Z", "cat-dev"),
      createMockPost("post-6", 500, "2026-08-15T10:00:00Z", "cat-dev"),
      createMockPost("post-7", 400, "2026-08-14T10:00:00Z", "cat-ai"),
      createMockPost("post-8", 300, "2026-08-13T10:00:00Z", "cat-sec"),
      createMockPost("post-9", 200, "2026-08-12T10:00:00Z", "cat-dev"),
      createMockPost("post-10", 150, "2026-08-11T10:00:00Z", "cat-ai"),
      createMockPost("post-11", 100, "2026-08-10T10:00:00Z", "cat-sec"),
      createMockPost("post-12", 50, "2026-08-09T10:00:00Z", "cat-dev"),
    ];

    const displayedIds = new Set<string>();

    // 1. Featured (Top 3 by views)
    const sortedByViews = [...allPosts].sort((a, b) => b.view_count - a.view_count);
    const featured: PostWithRelations[] = [];
    for (const post of sortedByViews) {
      if (featured.length >= 3) break;
      featured.push(post);
      displayedIds.add(post.id);
    }
    expect(featured.map((p) => p.id)).toEqual(["post-1", "post-2", "post-3"]);

    // 2. Popular (Top 4 by views, excluding featured)
    const popular: PostWithRelations[] = [];
    for (const post of sortedByViews) {
      if (popular.length >= 4) break;
      if (!displayedIds.has(post.id)) {
        popular.push(post);
        displayedIds.add(post.id);
      }
    }
    expect(popular.map((p) => p.id)).toEqual(["post-4", "post-5", "post-6", "post-7"]);

    // 3. Latest (Top 6 by date, excluding featured & popular)
    const sortedByDate = [...allPosts].sort(
      (a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime()
    );
    const latest: PostWithRelations[] = [];
    for (const post of sortedByDate) {
      if (latest.length >= 6) break;
      if (!displayedIds.has(post.id)) {
        latest.push(post);
        displayedIds.add(post.id);
      }
    }
    expect(latest.map((p) => p.id)).toEqual(["post-8", "post-9", "post-10", "post-11", "post-12"]);

    // 4. Categories (Distinct remaining)
    const sections: Array<{ category: (typeof categories)[number]; posts: PostWithRelations[] }> = [];
    for (const category of categories) {
      const categoryPosts: PostWithRelations[] = [];
      for (const post of sortedByDate) {
        if (categoryPosts.length >= 3) break;
        if (post.category?.id === category.id && !displayedIds.has(post.id)) {
          categoryPosts.push(post);
          displayedIds.add(post.id);
        }
      }
      if (categoryPosts.length > 0) {
        sections.push({ category, posts: categoryPosts });
      }
    }

    // Check strict uniqueness
    const allCollectedIds = [
      ...featured.map((p) => p.id),
      ...popular.map((p) => p.id),
      ...latest.map((p) => p.id),
      ...sections.flatMap((s) => s.posts.map((p) => p.id)),
    ];

    const uniqueSet = new Set(allCollectedIds);
    expect(allCollectedIds.length).toBe(uniqueSet.size); // Zero duplicates!
  });
});
