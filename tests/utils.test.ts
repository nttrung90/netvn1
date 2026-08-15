import { describe, expect, it } from "vitest";
import { formatCount, slugify } from "../lib/utils";

describe("slugify", () => {
  it("tạo slug thân thiện SEO từ tiếng Việt có dấu", () => {
    expect(slugify("Trí tuệ nhân tạo & Dữ liệu số")).toBe("tri-tue-nhan-tao-du-lieu-so");
  });

  it("loại bỏ khoảng trắng và ký tự không hợp lệ", () => {
    expect(slugify("  Bảo   mật---2026! ")).toBe("bao-mat-2026");
  });
});

describe("formatCount", () => {
  it("định dạng số lượt xem theo locale Việt Nam", () => {
    expect(formatCount(1250)).toContain("1,3");
  });
});
