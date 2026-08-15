create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  avatar text,
  role text not null default 'reader' check (role in ('admin', 'editor', 'reader')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image text,
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  view_count integer not null default 0 check (view_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create index posts_published_at_idx on public.posts (published_at desc) where status = 'published';
create index posts_category_id_idx on public.posts (category_id);
create index post_tags_tag_id_idx on public.post_tags (tag_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, coalesce(new.email, ''), new.raw_user_meta_data ->> 'name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger categories_updated_at before update on public.categories
  for each row execute procedure public.set_updated_at();
create trigger posts_updated_at before update on public.posts
  for each row execute procedure public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.increment_post_view(post_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts
  set view_count = view_count + 1
  where slug = post_slug and status = 'published';
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.posts enable row level security;
alter table public.post_tags enable row level security;

create policy "public reads published posts" on public.posts for select using (status = 'published' or public.is_admin());
create policy "public reads categories" on public.categories for select using (true);
create policy "public reads tags" on public.tags for select using (true);
create policy "public reads post tags" on public.post_tags for select using (true);
create policy "users read own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage tags" on public.tags for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage posts" on public.posts for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage post tags" on public.post_tags for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "public reads media" on storage.objects for select using (bucket_id = 'media');
create policy "admins upload media" on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
create policy "admins update media" on storage.objects for update using (bucket_id = 'media' and public.is_admin());
create policy "admins delete media" on storage.objects for delete using (bucket_id = 'media' and public.is_admin());
