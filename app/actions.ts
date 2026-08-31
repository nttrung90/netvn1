"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { PostActionState } from "@/types/actions";

const postSchema = z.object({ title: z.string().trim().min(3).max(180), excerpt: z.string().trim().max(400).optional(), content: z.string().trim().min(1), coverImage: z.string().url().optional().or(z.literal("")), categoryId: z.string().uuid().optional().or(z.literal("")), status: z.enum(["draft", "published"]), tags: z.string().max(300).optional() });
const categorySchema = z.object({ name: z.string().trim().min(2).max(80), description: z.string().trim().max(240).optional() });
const tagSchema = z.object({ name: z.string().trim().min(2).max(50) });

function postActionError(error: unknown) {
  console.error("Post action failed", error);
  const message = error instanceof Error ? error.message : "Lỗi không xác định.";
  if (/row-level security|permission denied|not authorized/i.test(message)) {
    return "Tài khoản này chưa có quyền quản trị để lưu bài viết.";
  }
  if (/relation .* does not exist|schema cache/i.test(message)) {
    return "Cơ sở dữ liệu chưa được khởi tạo đầy đủ. Hãy chạy migration Supabase.";
  }
  if (/duplicate key|unique constraint/i.test(message)) {
    return "Dữ liệu bị trùng. Hãy đổi tiêu đề hoặc thẻ rồi thử lại.";
  }
  if (/Supabase chưa được cấu hình/i.test(message)) {
    return "Supabase chưa được cấu hình đúng trên môi trường này.";
  }
  return "Không thể lưu bài viết. Hãy thử lại hoặc kiểm tra Runtime Logs trên Vercel.";
}

function fromPostForm(formData: FormData) {
  const values = postSchema.parse({ title: formData.get("title"), excerpt: formData.get("excerpt") || "", content: formData.get("content"), coverImage: formData.get("coverImage") || "", categoryId: formData.get("categoryId") || "", status: formData.get("status") || "draft", tags: formData.get("tags") || "" });
  return { ...values, content: sanitizeHtml(values.content, { allowedTags: ["p", "br", "h2", "h3", "strong", "em", "u", "ul", "ol", "li", "a", "img", "blockquote", "pre", "code", "span"], allowedAttributes: { "*": ["class"], a: ["href", "target", "rel"], img: ["src", "alt", "title"] }, allowedSchemes: ["http", "https", "mailto"], transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }) } }) };
}

async function syncPostTags(postId: string, rawTags: string | undefined) {
  const supabase = await createClient();
  const names = Array.from(new Set((rawTags ?? "").split(",").map((tag) => tag.trim()).filter(Boolean))).slice(0, 10);
  await supabase.from("post_tags").delete().eq("post_id", postId);
  if (!names.length) return;
  const tags = await Promise.all(names.map(async (name) => {
    const slug = slugify(name);
    const { data, error } = await supabase.from("tags").upsert({ name, slug }, { onConflict: "slug" }).select("id").maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Không thể tạo thẻ: " + name);
    return { post_id: postId, tag_id: data.id };
  }));
  const { error } = await supabase.from("post_tags").insert(tags);
  if (error) throw new Error(error.message);
}

export async function createPost(_: PostActionState, formData: FormData): Promise<PostActionState> {
  const { user } = await requireAdmin();
  try {
    const values = fromPostForm(formData);
    const supabase = await createClient();
    const slug = `${slugify(values.title)}-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const publishedAt = values.status === "published" ? now : null;

    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: values.title,
        slug,
        excerpt: values.excerpt || null,
        content: values.content,
        cover_image: values.coverImage || null,
        category_id: values.categoryId || null,
        status: values.status,
        published_at: publishedAt,
        author_id: user.id,
      })
      .select("id, slug")
      .single();

    if (error) throw new Error(error.message);
    await syncPostTags(data.id, values.tags);

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin/posts");
    revalidatePath("/page/1");

    const isPublished = values.status === "published";
    return {
      error: null,
      redirectTo: `/admin/posts/${data.id}/edit?published=${isPublished ? "1" : "0"}&saved=1&slug=${encodeURIComponent(data.slug)}&ts=${Date.now()}`,
    };
  } catch (error) {
    return { error: postActionError(error), redirectTo: null };
  }
}

export async function updatePost(id: string, _: PostActionState, formData: FormData): Promise<PostActionState> {
  await requireAdmin();
  try {
    const values = fromPostForm(formData);
    const supabase = await createClient();
    const { data: previous, error: previousError } = await supabase
      .from("posts")
      .select("slug, published_at, status")
      .eq("id", id)
      .single();

    if (previousError) throw new Error(previousError.message);

    const now = new Date().toISOString();
    // When publishing, set published_at to current timestamp so the post is brought immediately to the top
    const publishedAt = values.status === "published"
      ? (previous?.status !== "published" || !previous?.published_at ? now : now)
      : null;

    const { error } = await supabase
      .from("posts")
      .update({
        title: values.title,
        excerpt: values.excerpt || null,
        content: values.content,
        cover_image: values.coverImage || null,
        category_id: values.categoryId || null,
        status: values.status,
        published_at: publishedAt,
        updated_at: now,
      })
      .eq("id", id);

    if (error) throw new Error(error.message);
    await syncPostTags(id, values.tags);

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin/posts");
    revalidatePath(`/admin/posts/${id}/edit`);
    revalidatePath("/page/1");

    const postSlug = previous?.slug || slugify(values.title);
    const isPublished = values.status === "published";

    return {
      error: null,
      redirectTo: `/admin/posts/${id}/edit?published=${isPublished ? "1" : "0"}&saved=1&slug=${encodeURIComponent(postSlug)}&ts=${Date.now()}`,
    };
  } catch (error) {
    return { error: postActionError(error), redirectTo: null };
  }
}

export async function deletePost(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/posts");
  redirect("/admin/posts?deleted=1");
}

export async function createCategory(formData: FormData) {
  await requireAdmin(); const values = categorySchema.parse({ name: formData.get("name"), description: formData.get("description") || "" }); const supabase = await createClient(); const { error } = await supabase.from("categories").insert({ name: values.name, slug: slugify(values.name), description: values.description || null }); if (error) throw new Error(error.message); revalidatePath("/"); revalidatePath("/admin/categories");
}
export async function updateCategory(id: string, formData: FormData) {
  await requireAdmin(); const values = categorySchema.parse({ name: formData.get("name"), description: formData.get("description") || "" }); const supabase = await createClient(); const { error } = await supabase.from("categories").update({ name: values.name, slug: slugify(values.name), description: values.description || null }).eq("id", id); if (error) throw new Error(error.message); revalidatePath("/"); revalidatePath("/admin/categories");
}
export async function deleteCategory(id: string) { await requireAdmin(); const supabase = await createClient(); const { error } = await supabase.from("categories").delete().eq("id", id); if (error) throw new Error(error.message); revalidatePath("/"); revalidatePath("/admin/categories"); }
export async function createTag(formData: FormData) { await requireAdmin(); const values = tagSchema.parse({ name: formData.get("name") }); const supabase = await createClient(); const { error } = await supabase.from("tags").upsert({ name: values.name, slug: slugify(values.name) }, { onConflict: "slug" }); if (error) throw new Error(error.message); revalidatePath("/admin/tags"); }
export async function deleteTag(id: string) { await requireAdmin(); const supabase = await createClient(); const { error } = await supabase.from("tags").delete().eq("id", id); if (error) throw new Error(error.message); revalidatePath("/admin/tags"); }

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
