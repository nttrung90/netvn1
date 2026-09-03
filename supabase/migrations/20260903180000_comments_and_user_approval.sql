-- Migration: Comments and User Approval System
-- Date: 2026-09-03

-- 1. Add status column to profiles table if not exists
alter table public.profiles 
  add column if not exists status text not null default 'pending' 
  check (status in ('pending', 'approved', 'rejected'));

-- Update existing admins and editors to approved
update public.profiles 
  set status = 'approved' 
  where role in ('admin', 'editor');

-- 2. Update handle_new_user() to register users with status = 'pending' and role = 'reader'
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, status, role)
  values (
    new.id, 
    coalesce(new.email, ''), 
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    'pending',
    'reader'
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(excluded.name, profiles.name);
  return new;
end;
$$;

-- 3. Create comments table
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  email text not null,
  name text,
  content text not null,
  created_at timestamptz not null default now()
);

-- Index for fast retrieval of comments per post ordered by newest first
create index if not exists comments_post_id_idx on public.comments(post_id, created_at desc);

-- 4. Set up Row Level Security for comments
alter table public.comments enable row level security;

-- Everyone can read comments
create policy "public reads comments" on public.comments 
  for select using (true);

-- Anyone can post comments as long as email and content are provided
create policy "public creates comments" on public.comments 
  for insert with check (
    length(trim(content)) > 0 
    and length(trim(email)) > 0
  );

-- Admins can update and delete comments
create policy "admins manage comments" on public.comments 
  for all using (public.is_admin()) with check (public.is_admin());
