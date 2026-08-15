export type Role = "admin" | "editor" | "reader";
export type PostStatus = "draft" | "published";

export type Profile = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category_id: string | null;
  author_id: string;
  status: PostStatus;
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type PostWithRelations = Post & {
  author?: Pick<Profile, "name" | "avatar"> | null;
  category?: Pick<Category, "id" | "name" | "slug"> | null;
  tags: Tag[];
};

export type PaginatedPosts = {
  posts: PostWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};
