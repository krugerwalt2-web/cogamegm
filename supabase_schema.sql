-- Run this in your Supabase SQL Editor (supabase.com → project → SQL Editor)

-- Campaigns table
create table campaigns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  system text default 'any system',
  lore text default '',
  created_at timestamp with time zone default now()
);

-- Memory entries table
create table memories (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references campaigns(id) on delete cascade not null,
  tag text check (tag in ('npc','location','plot','rule')) not null,
  text text not null,
  created_at timestamp with time zone default now()
);

-- Session log table
create table session_logs (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references campaigns(id) on delete cascade not null,
  command text not null,
  response text not null,
  mode text not null,
  created_at timestamp with time zone default now()
);

-- Row level security: users can only see their own data
alter table campaigns enable row level security;
alter table memories enable row level security;
alter table session_logs enable row level security;

create policy "Users see own campaigns" on campaigns for all using (auth.uid() = user_id);
create policy "Users see own memories" on memories for all using (
  campaign_id in (select id from campaigns where user_id = auth.uid())
);
create policy "Users see own logs" on session_logs for all using (
  campaign_id in (select id from campaigns where user_id = auth.uid())
);
