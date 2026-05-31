create extension if not exists "pgcrypto";

create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

grant execute on function public.is_editor() to authenticated;

alter table public.library_items add column if not exists file_url text;
alter table public.presentations add column if not exists slides_url text;
alter table public.presentations add column if not exists pdf_url text;
alter table public.presentations add column if not exists references_text text;
alter table public.presentations add column if not exists discussion_notes text;

alter table public.comments add column if not exists entity_id text;
alter table public.comments alter column entity_id type text using entity_id::text;
alter table public.comments alter column is_approved set default true;

create table if not exists public.clinical_cases (
  id uuid primary key default gen_random_uuid(),
  title_ru text not null,
  title_kz text not null,
  description_ru text,
  description_kz text,
  differential_ru text[] not null default '{}',
  differential_kz text[] not null default '{}',
  options_ru text[] not null default '{}',
  options_kz text[] not null default '{}',
  final_ru text,
  final_kz text,
  learning_ru text[] not null default '{}',
  learning_kz text[] not null default '{}',
  media_urls text[] not null default '{}',
  file_urls text[] not null default '{}',
  opinion_prompt_ru text,
  opinion_prompt_kz text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.clinical_cases enable row level security;

drop policy if exists "Public read approved comments" on public.comments;
drop policy if exists "Public insert comments" on public.comments;
drop policy if exists "Editors manage comments" on public.comments;
drop policy if exists "Public read active clinical cases" on public.clinical_cases;
drop policy if exists "Editors manage clinical cases" on public.clinical_cases;

create policy "Public read approved comments" on public.comments
for select
using (is_approved = true);

create policy "Public insert comments" on public.comments
for insert
with check (is_approved = true);

create policy "Editors manage comments" on public.comments
for all
to authenticated
using (public.is_editor())
with check (public.is_editor());

create policy "Public read active clinical cases" on public.clinical_cases
for select
using (is_active = true);

create policy "Editors manage clinical cases" on public.clinical_cases
for all
to authenticated
using (public.is_editor())
with check (public.is_editor());

insert into storage.buckets (id, name, public)
values
  ('presentations', 'presentations', true),
  ('library', 'library', true),
  ('clinical-images', 'clinical-images', true),
  ('resident-photos', 'resident-photos', true),
  ('faculty-photos', 'faculty-photos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read uploaded files" on storage.objects;
drop policy if exists "Authenticated upload files" on storage.objects;
drop policy if exists "Authenticated update files" on storage.objects;
drop policy if exists "Authenticated delete files" on storage.objects;
drop policy if exists "Editors upload files" on storage.objects;
drop policy if exists "Editors update files" on storage.objects;
drop policy if exists "Editors delete files" on storage.objects;

create policy "Public read uploaded files" on storage.objects
for select
using (bucket_id in ('presentations', 'library', 'clinical-images', 'resident-photos', 'faculty-photos'));

create policy "Editors upload files" on storage.objects
for insert
to authenticated
with check (
  public.is_editor()
  and bucket_id in ('presentations', 'library', 'clinical-images', 'resident-photos', 'faculty-photos')
);

create policy "Editors update files" on storage.objects
for update
to authenticated
using (
  public.is_editor()
  and bucket_id in ('presentations', 'library', 'clinical-images', 'resident-photos', 'faculty-photos')
)
with check (
  public.is_editor()
  and bucket_id in ('presentations', 'library', 'clinical-images', 'resident-photos', 'faculty-photos')
);

create policy "Editors delete files" on storage.objects
for delete
to authenticated
using (
  public.is_editor()
  and bucket_id in ('presentations', 'library', 'clinical-images', 'resident-photos', 'faculty-photos')
);

insert into public.site_content (
  page_key,
  block_key,
  title_ru,
  title_kz,
  body_ru,
  body_kz,
  sort_order
) values
  (
    'case',
    'case_of_week',
    'Клинический случай недели',
    'Аптаның клиникалық жағдайы',
    'Интерактивный клинический случай с голосованием, дифференциальным диагнозом и учебными выводами.',
    'Дауыс беру, дифференциалды диагноз және оқу тұжырымдары бар интерактивті клиникалық жағдай.',
    60
  ),
  (
    'case',
    'case_media',
    'Изображения, видео и файлы',
    'Суреттер, видео және файлдар',
    'Медиа и вложения клинического случая недели.',
    'Аптаның клиникалық жағдайына арналған медиа және файлдар.',
    61
  ),
  (
    'case',
    'case_opinion',
    'Мнение аудитории',
    'Аудитория пікірі',
    'Блок комментариев и мнений под клиническим случаем.',
    'Клиникалық жағдай астындағы пікірлер мен комментарийлер блогы.',
    62
  ),
  (
    'case',
    'case_answer',
    'Финальный ответ и учебные выводы',
    'Қорытынды жауап және оқу тұжырымдары',
    'Финальный разбор, диагноз, тактика и ключевые выводы.',
    'Қорытынды талдау, диагноз, тактика және негізгі тұжырымдар.',
    63
  )
on conflict (page_key, block_key) do update set
  title_ru = excluded.title_ru,
  title_kz = excluded.title_kz,
  body_ru = excluded.body_ru,
  body_kz = excluded.body_kz,
  sort_order = excluded.sort_order,
  is_published = true;

insert into public.clinical_cases (
  title_ru,
  title_kz,
  description_ru,
  description_kz,
  differential_ru,
  differential_kz,
  options_ru,
  options_kz,
  final_ru,
  final_kz,
  learning_ru,
  learning_kz,
  opinion_prompt_ru,
  opinion_prompt_kz,
  is_active
)
select
  'Лихорадка после уретероскопии',
  'Уретероскопиядан кейінгі қызба',
  'Пациент после эндоскопического удаления камня жалуется на озноб, температуру и боль в пояснице. Нужно определить тактику первых часов.',
  'Эндоскопиялық тас алу операциясынан кейін пациент қалтырау, қызба және бел ауыруына шағымданады. Алғашқы сағаттардағы тактиканы анықтау қажет.',
  array['Обструктивный пиелонефрит', 'Уросепсис', 'Послеоперационная боль', 'Остаточный фрагмент камня'],
  array['Обструктивті пиелонефрит', 'Уросепсис', 'Операциядан кейінгі ауырсыну', 'Тастың қалдық фрагменті'],
  array['Наблюдение дома', 'Срочная оценка, посевы, антибиотик и дренирование при обструкции', 'Только обезболивание', 'Плановый контроль через неделю'],
  array['Үйде бақылау', 'Шұғыл бағалау, себінділер, антибиотик және обструкция болса дренаж', 'Тек ауырсынуды басу', 'Бір аптадан кейін жоспарлы бақылау'],
  'Правильная тактика: срочная оценка витальных показателей, анализы, посевы, ранний антибиотик и исключение обструкции с готовностью к дренированию.',
  'Дұрыс тактика: өмірлік көрсеткіштерді шұғыл бағалау, талдаулар, себінділер, ерте антибиотик және обструкцияны жоққа шығару, қажет болса дренаж.',
  array['После уретероскопии лихорадка требует активного исключения инфекции.', 'Обструкция плюс инфекция - показание к срочному дренированию.', 'Антибиотик лучше назначать после посевов, не задерживая лечение.'],
  array['Уретероскопиядан кейін қызба инфекцияны белсенді жоққа шығаруды талап етеді.', 'Обструкция және инфекция - шұғыл дренаж көрсеткіші.', 'Антибиотикті себінділерден кейін, емді кешіктірмей бастау керек.'],
  'Какую тактику вы выбрали бы в первые 60 минут?',
  'Алғашқы 60 минутта қандай тактиканы таңдар едіңіз?',
  true
where not exists (
  select 1
  from public.clinical_cases
  where title_ru = 'Лихорадка после уретероскопии'
);
