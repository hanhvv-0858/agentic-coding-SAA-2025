-- 0001_kudos_schema.sql
-- Sun* Kudos Live board schema — 7 tables + indexes.
-- Derived verbatim from .momorph/specs/MaZUn5xHXZ-kudos-live-board/plan.md
-- §Database Schema.

create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name_vi text not null,
  name_en text not null,
  created_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  department_id uuid references departments(id),
  created_at timestamptz default now()
);

create table if not exists hashtags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  created_at timestamptz default now()
);

create table if not exists kudos (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists kudo_recipients (
  kudo_id uuid references kudos(id) on delete cascade,
  recipient_id uuid references profiles(id) on delete cascade,
  primary key (kudo_id, recipient_id)
);

create table if not exists kudo_hashtags (
  kudo_id uuid references kudos(id) on delete cascade,
  hashtag_id uuid references hashtags(id) on delete cascade,
  primary key (kudo_id, hashtag_id)
);

-- kudo_hearts: composite PK (kudo_id, user_id) enforces idempotent
-- heart toggle per TR-006. INSERT ... ON CONFLICT DO NOTHING / DELETE
-- against this composite are both naturally idempotent.
create table if not exists kudo_hearts (
  kudo_id uuid references kudos(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (kudo_id, user_id)
);

-- Indexes (plan §Database Schema — 3 indexes):
--  * kudos_created_at_desc — hot-path feed order by created_at desc
--  * kudo_hearts_user_id   — per-user has_hearted lookup
--  * kudo_hashtags_hashtag_id — hashtag filter join
create index if not exists kudos_created_at_desc on kudos (created_at desc);
create index if not exists kudo_hearts_user_id on kudo_hearts (user_id);
create index if not exists kudo_hashtags_hashtag_id on kudo_hashtags (hashtag_id);
