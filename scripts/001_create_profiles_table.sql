-- Create profiles table for user portfolio data
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  bio text,
  avatar_url text,
  website_url text,
  phone text,
  location text,
  theme text default 'default',
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS policies for profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_public"
  on public.profiles for select
  using (is_public = true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Create profile blocks table for the block-based content system
create table if not exists public.profile_blocks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  block_type text not null, -- 'about', 'social', 'contact', 'gallery', 'video', 'audio', 'link', etc.
  title text,
  content jsonb not null default '{}',
  position integer not null default 0,
  is_visible boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profile blocks
alter table public.profile_blocks enable row level security;

-- RLS policies for profile blocks
create policy "blocks_select_own"
  on public.profile_blocks for select
  using (
    profile_id in (
      select id from public.profiles where auth.uid() = id
    )
  );

create policy "blocks_select_public"
  on public.profile_blocks for select
  using (
    is_visible = true and profile_id in (
      select id from public.profiles where is_public = true
    )
  );

create policy "blocks_insert_own"
  on public.profile_blocks for insert
  with check (
    profile_id in (
      select id from public.profiles where auth.uid() = id
    )
  );

create policy "blocks_update_own"
  on public.profile_blocks for update
  using (
    profile_id in (
      select id from public.profiles where auth.uid() = id
    )
  );

create policy "blocks_delete_own"
  on public.profile_blocks for delete
  using (
    profile_id in (
      select id from public.profiles where auth.uid() = id
    )
  );
