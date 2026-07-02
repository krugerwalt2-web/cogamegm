-- Co-Game GM Build 10 — Run this in Supabase SQL Editor

-- Base tables (safe to run even if they exist)
create table if not exists campaigns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  system text default 'D&D 5e',
  lore text default '',
  rules_reference text default '',
  bg_image_url text default '',
  scene_npcs text default null,
  scene_environment text default '',
  created_at timestamptz default now()
);

create table if not exists memories (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references campaigns(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  tag text check (tag in ('npc','creature','location','environment','item','plot','rule')) not null,
  text text not null,
  created_at timestamptz default now()
);

create table if not exists campaign_buttons (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references campaigns(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null,
  text text not null,
  position integer default 0,
  created_at timestamptz default now()
);

-- Add new columns if not present
alter table campaigns add column if not exists scene_npcs text default null;
alter table campaigns add column if not exists scene_environment text default '';
alter table campaigns add column if not exists rules_reference text default '';
alter table campaigns add column if not exists bg_image_url text default '';

-- Update memories tag constraint to include new types
alter table memories drop constraint if exists memories_tag_check;
alter table memories add constraint memories_tag_check
  check (tag in ('npc','creature','location','environment','item','plot','rule'));

-- Row Level Security
alter table campaigns enable row level security;
alter table memories enable row level security;
alter table campaign_buttons enable row level security;

drop policy if exists "Users manage own campaigns" on campaigns;
drop policy if exists "Users manage own memories" on memories;
drop policy if exists "Users manage own buttons" on campaign_buttons;

create policy "Users manage own campaigns" on campaigns for all using (auth.uid() = user_id);
create policy "Users manage own memories" on memories for all using (auth.uid() = user_id);
create policy "Users manage own buttons" on campaign_buttons for all using (auth.uid() = user_id);

-- BUILD 10 PATCH: Force update memories tag constraint to include all new types
-- Run this if creature or item descriptions are not saving to memory
DO $$ 
BEGIN
  ALTER TABLE memories DROP CONSTRAINT IF EXISTS memories_tag_check;
  ALTER TABLE memories ADD CONSTRAINT memories_tag_check 
    CHECK (tag IN ('npc','creature','location','environment','item','plot','rule'));
  RAISE NOTICE 'Tag constraint updated successfully';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Tag constraint update skipped: %', SQLERRM;
END $$;
