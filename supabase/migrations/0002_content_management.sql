-- HH Medics — Phase 2: content management tables
-- Run this against your Supabase project (SQL editor or CLI migration).
-- Existing tables (products, categories, orders, coupons, etc.) are untouched.

create table if not exists banners (
  id text primary key,
  title text not null,
  subtitle text,
  image text not null,
  link_href text,
  cta_label text,
  sort_order integer not null default 0,
  active integer not null default 1,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists cms_pages (
  id text primary key,
  slug text not null unique,
  title text not null,
  content text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists blog_posts (
  id text primary key,
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null default '',
  cover_image text,
  author text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists faqs (
  id text primary key,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  active integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists testimonials (
  id text primary key,
  author_name text not null,
  author_detail text,
  quote text not null,
  rating integer not null default 5,
  sort_order integer not null default 0,
  active integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists newsletter_subscribers (
  id text primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_banners_active_sort on banners (active, sort_order);
create index if not exists idx_blog_posts_status_published on blog_posts (status, published_at desc);
create index if not exists idx_faqs_active_sort on faqs (active, sort_order);
create index if not exists idx_testimonials_active_sort on testimonials (active, sort_order);

-- Row Level Security: the app talks to Supabase with the service_role key
-- (server-side only), which bypasses RLS — same model as every other table
-- in this project. Enable RLS with no public policies so these tables are
-- unreachable with the anon/public key if it's ever exposed.
alter table banners enable row level security;
alter table cms_pages enable row level security;
alter table blog_posts enable row level security;
alter table faqs enable row level security;
alter table testimonials enable row level security;
alter table newsletter_subscribers enable row level security;
