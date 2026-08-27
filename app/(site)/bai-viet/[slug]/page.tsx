import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug, getRelatedPosts, recordView } from "@/lib/data/posts";
import { PostCard } from "@/components/site/PostCard";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Bài viết không tồn tại" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const related = await getRelatedPosts(post);
  await recordView(slug);

  return (
    <main className="container max-w-4xl py-12">
      <Link className="text-sm font-bold text-[#4062ff]" href={post.category ? `/chu-de/${post.category.slug}` : "/"}>← {post.category?.name || "Trang chủ"}</Link>
      <p className="mt-8 text-xs font-bold uppercase tracking-[.17em] text-[#4062ff]">{post.category?.name || "Công nghệ"}</p>
      <h1 className="display mt-3 text-4xl font-bold leading-tight sm:text-6xl">{post.title}</h1>
      {post.excerpt ? <p className="mt-5 text-lg leading-8 text-[#667085]">{post.excerpt}</p> : null}
      {post.published_at ? <p className="mt-5 text-sm text-[#667085]">{new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(new Date(post.published_at))}</p> : null}
      {post.cover_image ? <div className="relative mt-8 aspect-[1.7] overflow-hidden rounded-3xl"><Image alt="Ảnh minh họa bài viết" className="object-cover" fill priority sizes="(max-width: 768px) 100vw, 896px" src={post.cover_image} /></div> : null}
      <article className="prose-news mt-8" dangerouslySetInnerHTML={{ __html: post.content }} />
      {post.tags.length ? <div className="mt-8 flex flex-wrap gap-2">{post.tags.map((tag) => <span className="rounded-full bg-[#edf0ff] px-3 py-1 text-sm font-bold text-[#3346aa]" key={tag.id}>#{tag.name}</span>)}</div> : null}
      {related.length ? <section className="mt-14"><h2 className="display text-3xl font-bold">Bài viết liên quan</h2><div className="mt-4 grid gap-7 md:grid-cols-3">{related.map((item) => <PostCard key={item.id} post={item} />)}</div></section> : null}
    </main>
  );
}
