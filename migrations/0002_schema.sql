create table if not exists voices (
  id text primary key,
  user_id text not null,
  name text not null,
  kind text not null check (kind in ('core', 'brand')),
  parent_id text,
  source_text text not null default '',
  anchors jsonb not null default '[]'::jsonb,
  dials jsonb not null,
  locks jsonb not null default '[]'::jsonb,
  banned jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists voices_user_id_idx on voices (user_id);

create table if not exists domain_locks (
  id text primary key,
  user_id text not null,
  domain text not null,
  dial text not null,
  max int,
  min int,
  reason text
);
create index if not exists domain_locks_user_id_idx on domain_locks (user_id);

create table if not exists trend_scans (
  id text primary key,
  user_id text not null,
  query text not null,
  result jsonb not null,
  model text not null,
  scanned_at timestamptz not null default now()
);
create index if not exists trend_scans_user_idx on trend_scans (user_id, scanned_at desc);

create table if not exists donor_scans (
  id text primary key,
  user_id text not null,
  handle text not null,
  domain text not null,
  result jsonb not null,
  samples jsonb not null default '[]'::jsonb,
  samples_purge_at timestamptz not null,
  model text not null,
  scanned_at timestamptz not null default now()
);
create index if not exists donor_scans_user_idx on donor_scans (user_id, scanned_at desc);
create index if not exists donor_scans_lookup_idx on donor_scans (user_id, handle, domain, scanned_at desc);

create table if not exists runs (
  id text primary key,
  user_id text not null,
  voice_id text not null,
  donor_scan_id text,
  trend_scan_id text,
  recipe jsonb not null,
  draft text not null default '',
  meters jsonb,
  verdict text,
  created_at timestamptz not null default now()
);
create index if not exists runs_user_idx on runs (user_id, created_at desc);

create table if not exists blind_tests (
  id text primary key,
  user_id text not null,
  run_ids jsonb not null,
  ranking jsonb,
  rewrite_flags jsonb,
  created_at timestamptz not null default now()
);
create index if not exists blind_tests_user_idx on blind_tests (user_id, created_at desc);

create table if not exists results (
  id text primary key,
  user_id text not null,
  run_id text not null,
  platform text not null,
  posted_at date not null,
  views int not null default 0,
  shares int not null default 0,
  saves int not null default 0,
  replies int not null default 0,
  long_replies int not null default 0
);
create index if not exists results_user_idx on results (user_id);

create table if not exists lab_settings (
  user_id text primary key,
  slop_patterns jsonb not null,
  updated_at timestamptz not null default now()
);
