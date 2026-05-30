create extension if not exists "pgcrypto";

create table if not exists public.residents (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  residency_year_ru text not null,
  residency_year_kz text not null,
  research_interests_ru text[] not null default '{}',
  research_interests_kz text[] not null default '{}',
  presentations_completed integer not null default 0,
  upcoming_topics_ru text[] not null default '{}',
  upcoming_topics_kz text[] not null default '{}',
  publications integer not null default 0,
  certificates integer not null default 0,
  activity_score integer not null default 0,
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.faculty (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  degree_ru text not null,
  degree_kz text not null,
  position_ru text not null,
  position_kz text not null,
  expertise_ru text[] not null default '{}',
  expertise_kz text[] not null default '{}',
  bio_ru text not null,
  bio_kz text not null,
  contact text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  meeting_date date not null,
  meeting_time time not null,
  topic_ru text not null,
  topic_kz text not null,
  presenter text not null,
  moderator text not null,
  room_ru text not null,
  room_kz text not null,
  status text not null check (status in ('upcoming', 'completed')),
  article_link text,
  presentation_file text,
  notes_ru text,
  notes_kz text,
  created_at timestamptz not null default now()
);

create table if not exists public.presentations (
  id uuid primary key default gen_random_uuid(),
  title_ru text not null,
  title_kz text not null,
  presenter text not null,
  supervisor text,
  presentation_date date not null,
  year text not null,
  category_ru text not null,
  category_kz text not null,
  abstract_ru text,
  abstract_kz text,
  key_points_ru text[] not null default '{}',
  key_points_kz text[] not null default '{}',
  slides_url text,
  pdf_url text,
  references_text text,
  discussion_notes text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.presentations add column if not exists slides_url text;
alter table public.presentations add column if not exists pdf_url text;
alter table public.presentations add column if not exists references_text text;
alter table public.presentations add column if not exists discussion_notes text;

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title_ru text not null,
  title_kz text not null,
  author text not null,
  post_date date not null default current_date,
  category text not null,
  summary_ru text,
  summary_kz text,
  body_ru text,
  body_kz text,
  references_text text,
  tags text[] not null default '{}',
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  title_ru text not null,
  title_kz text not null,
  author text,
  year text,
  category_ru text not null,
  category_kz text not null,
  section text not null check (section in ('books', 'guidelines', 'papers', 'images', 'links')),
  file_url text,
  external_link text,
  description_ru text,
  description_kz text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.research_projects (
  id uuid primary key default gen_random_uuid(),
  title_ru text not null,
  title_kz text not null,
  principal_investigator text not null,
  residents_involved text[] not null default '{}',
  status_ru text not null,
  status_kz text not null,
  deadline date,
  protocol_file text,
  related_articles_ru text[] not null default '{}',
  related_articles_kz text[] not null default '{}',
  progress_ru text,
  progress_kz text,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  question_ru text not null,
  question_kz text not null,
  options_ru text[] not null,
  options_kz text[] not null,
  correct_index integer not null,
  explanation_ru text,
  explanation_kz text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  author_name text not null,
  body text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  block_key text not null,
  title_ru text,
  title_kz text,
  body_ru text,
  body_kz text,
  metadata_json jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  unique (page_key, block_key)
);

alter table public.residents enable row level security;
alter table public.faculty enable row level security;
alter table public.meetings enable row level security;
alter table public.presentations enable row level security;
alter table public.news_posts enable row level security;
alter table public.library_items enable row level security;
alter table public.research_projects enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.comments enable row level security;
alter table public.site_content enable row level security;

drop policy if exists "Public read residents" on public.residents;
drop policy if exists "Public read faculty" on public.faculty;
drop policy if exists "Public read meetings" on public.meetings;
drop policy if exists "Public read presentations" on public.presentations;
drop policy if exists "Public read published news" on public.news_posts;
drop policy if exists "Public read library" on public.library_items;
drop policy if exists "Public read research projects" on public.research_projects;
drop policy if exists "Public read active quiz questions" on public.quiz_questions;
drop policy if exists "Public read approved comments" on public.comments;
drop policy if exists "Public read site content" on public.site_content;
drop policy if exists "Authenticated manage residents" on public.residents;
drop policy if exists "Authenticated manage faculty" on public.faculty;
drop policy if exists "Authenticated manage meetings" on public.meetings;
drop policy if exists "Authenticated manage presentations" on public.presentations;
drop policy if exists "Authenticated manage news" on public.news_posts;
drop policy if exists "Authenticated manage library" on public.library_items;
drop policy if exists "Authenticated manage research" on public.research_projects;
drop policy if exists "Authenticated manage quiz" on public.quiz_questions;
drop policy if exists "Authenticated manage comments" on public.comments;
drop policy if exists "Authenticated manage site content" on public.site_content;

create policy "Public read residents" on public.residents for select using (true);
create policy "Public read faculty" on public.faculty for select using (true);
create policy "Public read meetings" on public.meetings for select using (true);
create policy "Public read presentations" on public.presentations for select using (true);
create policy "Public read published news" on public.news_posts for select using (published = true);
create policy "Public read library" on public.library_items for select using (true);
create policy "Public read research projects" on public.research_projects for select using (true);
create policy "Public read active quiz questions" on public.quiz_questions for select using (is_active = true);
create policy "Public read approved comments" on public.comments for select using (is_approved = true);
create policy "Public read site content" on public.site_content for select using (is_published = true);

create policy "Authenticated manage residents" on public.residents for all to authenticated using (true) with check (true);
create policy "Authenticated manage faculty" on public.faculty for all to authenticated using (true) with check (true);
create policy "Authenticated manage meetings" on public.meetings for all to authenticated using (true) with check (true);
create policy "Authenticated manage presentations" on public.presentations for all to authenticated using (true) with check (true);
create policy "Authenticated manage news" on public.news_posts for all to authenticated using (true) with check (true);
create policy "Authenticated manage library" on public.library_items for all to authenticated using (true) with check (true);
create policy "Authenticated manage research" on public.research_projects for all to authenticated using (true) with check (true);
create policy "Authenticated manage quiz" on public.quiz_questions for all to authenticated using (true) with check (true);
create policy "Authenticated manage comments" on public.comments for all to authenticated using (true) with check (true);
create policy "Authenticated manage site content" on public.site_content for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values
  ('presentations', 'presentations', true),
  ('library', 'library', true),
  ('clinical-images', 'clinical-images', true),
  ('resident-photos', 'resident-photos', true),
  ('faculty-photos', 'faculty-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public read uploaded files" on storage.objects;
drop policy if exists "Authenticated upload files" on storage.objects;
drop policy if exists "Authenticated update files" on storage.objects;
drop policy if exists "Authenticated delete files" on storage.objects;

create policy "Public read uploaded files" on storage.objects
for select
using (bucket_id in ('presentations', 'library', 'clinical-images', 'resident-photos', 'faculty-photos'));

create policy "Authenticated upload files" on storage.objects
for insert
to authenticated
with check (bucket_id in ('presentations', 'library', 'clinical-images', 'resident-photos', 'faculty-photos'));

create policy "Authenticated update files" on storage.objects
for update
to authenticated
using (bucket_id in ('presentations', 'library', 'clinical-images', 'resident-photos', 'faculty-photos'))
with check (bucket_id in ('presentations', 'library', 'clinical-images', 'resident-photos', 'faculty-photos'));

create policy "Authenticated delete files" on storage.objects
for delete
to authenticated
using (bucket_id in ('presentations', 'library', 'clinical-images', 'resident-photos', 'faculty-photos'));
