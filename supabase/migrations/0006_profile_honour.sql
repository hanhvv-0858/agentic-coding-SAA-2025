-- 0006_profile_honour.sql
-- Adds per-profile honour attributes surfaced by the Kudos Live board
-- participant row (§17 design — pill + CECV code). Before this migration
-- the UI decorated these values in-memory via `decorateKudoMock`; now
-- they live on the real `profiles` row.

-- Honour title is a closed set (4 tiers). Using a Postgres enum keeps
-- the column self-describing and prevents typos in the backend.
do $$ begin
  if not exists (select 1 from pg_type where typname = 'honour_title') then
    create type honour_title as enum (
      'Legend Hero',
      'Rising Hero',
      'Super Hero',
      'New Hero'
    );
  end if;
end $$;

alter table profiles
  add column if not exists honour_code text,
  add column if not exists honour_title honour_title;

-- Honour is nullable; profiles without one render a plain name row.
-- No index: lookups are per-profile via id, not by honour value.
