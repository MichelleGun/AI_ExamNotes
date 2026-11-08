-- AI Exam Revision: Supabase setup
-- Run this whole file once in Supabase > SQL Editor > New query > Run.
-- Then: Authentication > Sign In / Providers > Email: turn OFF "Confirm email".

-- 1. Profiles (one row per user, public username + points for the leaderboard)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-zA-Z0-9_]{3,20}$'),
  points integer not null default 0,
  quizzes_done integer not null default 0,
  cards_done integer not null default 0,
  calc_done integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 2. Private study data (saved cards, notes, progress) as one JSON blob per user
create table if not exists public.user_data (
  id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_data enable row level security;

-- Anyone (even signed out) can read the leaderboard
drop policy if exists "profiles readable" on public.profiles;
create policy "profiles readable" on public.profiles for select using (true);

-- Users can only read/write their own study data
drop policy if exists "own data select" on public.user_data;
create policy "own data select" on public.user_data for select using (auth.uid() = id);
drop policy if exists "own data insert" on public.user_data;
create policy "own data insert" on public.user_data for insert with check (auth.uid() = id);
drop policy if exists "own data update" on public.user_data;
create policy "own data update" on public.user_data for update using (auth.uid() = id);

-- No direct insert/update on profiles from the browser.
-- Points only change through the add_points() function below (limits cheating).

-- 3. Create a profile automatically when someone signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  insert into public.user_data (id) values (new.id);
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Add points safely (max 60 points per call, at most one call every 5 seconds)
create or replace function public.add_points(p_points int, p_quizzes int, p_cards int, p_calc int)
returns integer language plpgsql security definer set search_path = public as $$
declare new_total int; last_time timestamptz;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select updated_at into last_time from public.profiles where id = auth.uid();
  if last_time is not null and now() - last_time < interval '5 seconds' then
    raise exception 'too fast';
  end if;
  update public.profiles set
    points = points + greatest(0, least(p_points, 60)),
    quizzes_done = quizzes_done + greatest(0, least(p_quizzes, 30)),
    cards_done = cards_done + greatest(0, least(p_cards, 60)),
    calc_done = calc_done + greatest(0, least(p_calc, 20)),
    updated_at = now()
  where id = auth.uid()
  returning points into new_total;
  return new_total;
end; $$;

grant execute on function public.add_points(int, int, int, int) to authenticated;

-- 5. Check if a username is free (used on the sign up form)
create or replace function public.username_taken(p_username text)
returns boolean language sql security definer set search_path = public as $$
  select exists(select 1 from public.profiles where lower(username) = lower(p_username));
$$;
grant execute on function public.username_taken(text) to anon, authenticated;
