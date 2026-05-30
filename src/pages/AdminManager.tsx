import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Award,
  BarChart3,
  BookMarked,
  CalendarDays,
  ClipboardList,
  Edit3,
  FilePlus2,
  ListChecks,
  MessageSquare,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  UsersRound,
} from "lucide-react";
import { AdminPanelLayout } from "../components/common";
import { getCurrentUser, signInAdmin, signOutAdmin } from "../lib/auth";
import { supabase } from "../lib/supabase";
import type { Lang } from "../types";

type Field = {
  key: string;
  label: Record<Lang, string>;
  type?: "text" | "number" | "date" | "time" | "textarea" | "select";
  required?: boolean;
  options?: string[];
  defaultValue?: string;
};

type Config = {
  id: string;
  table: string;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  icon: typeof UsersRound;
  fields: Field[];
  summary: (row: Record<string, unknown>) => string;
  toPayload: (values: Record<string, string>) => Record<string, unknown>;
};

const list = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
const numeric = (value: string) => Number(value || 0);

const configs: Config[] = [
  {
    id: "residents",
    table: "residents",
    title: { ru: "Резиденты", kz: "Резиденттер" },
    description: { ru: "Все карточки резидентов и их портфолио.", kz: "Резиденттер карточкалары және портфолиосы." },
    icon: UsersRound,
    fields: [
      { key: "full_name", label: { ru: "ФИО", kz: "Аты-жөні" }, required: true },
      { key: "residency_year_ru", label: { ru: "Год резидентуры RU", kz: "Резидентура жылы RU" }, defaultValue: "1 год резидентуры", required: true },
      { key: "residency_year_kz", label: { ru: "Год резидентуры KZ", kz: "Резидентура жылы KZ" }, defaultValue: "1-резидентура жылы", required: true },
      { key: "research_interests_ru", label: { ru: "Интересы RU через запятую", kz: "Қызығушылық RU" }, defaultValue: "Урология" },
      { key: "research_interests_kz", label: { ru: "Интересы KZ через запятую", kz: "Қызығушылық KZ" }, defaultValue: "Урология" },
      { key: "upcoming_topics_ru", label: { ru: "Темы RU через запятую", kz: "Тақырыптар RU" }, defaultValue: "Тема будет назначена" },
      { key: "upcoming_topics_kz", label: { ru: "Темы KZ через запятую", kz: "Тақырыптар KZ" }, defaultValue: "Тақырып кейін беріледі" },
      { key: "presentations_completed", label: { ru: "Докладов", kz: "Баяндамалар" }, type: "number", defaultValue: "0" },
      { key: "publications", label: { ru: "Публикации", kz: "Жарияланымдар" }, type: "number", defaultValue: "0" },
      { key: "certificates", label: { ru: "Сертификаты", kz: "Сертификаттар" }, type: "number", defaultValue: "0" },
      { key: "activity_score", label: { ru: "Активность", kz: "Белсенділік" }, type: "number", defaultValue: "80" },
    ],
    summary: (row) => String(row.full_name ?? "Резидент"),
    toPayload: (v) => ({
      full_name: v.full_name,
      residency_year_ru: v.residency_year_ru,
      residency_year_kz: v.residency_year_kz,
      research_interests_ru: list(v.research_interests_ru),
      research_interests_kz: list(v.research_interests_kz),
      upcoming_topics_ru: list(v.upcoming_topics_ru),
      upcoming_topics_kz: list(v.upcoming_topics_kz),
      presentations_completed: numeric(v.presentations_completed),
      publications: numeric(v.publications),
      certificates: numeric(v.certificates),
      activity_score: numeric(v.activity_score),
    }),
  },
  {
    id: "faculty",
    table: "faculty",
    title: { ru: "Преподаватели", kz: "Оқытушылар" },
    description: { ru: "Преподаватели, модераторы и научные руководители.", kz: "Оқытушылар, модераторлар және ғылыми жетекшілер." },
    icon: Award,
    fields: [
      { key: "full_name", label: { ru: "ФИО", kz: "Аты-жөні" }, required: true },
      { key: "degree_ru", label: { ru: "Степень RU", kz: "Дәреже RU" }, required: true },
      { key: "degree_kz", label: { ru: "Степень KZ", kz: "Дәреже KZ" }, required: true },
      { key: "position_ru", label: { ru: "Должность RU", kz: "Қызмет RU" }, required: true },
      { key: "position_kz", label: { ru: "Должность KZ", kz: "Қызмет KZ" }, required: true },
      { key: "expertise_ru", label: { ru: "Экспертиза RU через запятую", kz: "Сараптама RU" }, defaultValue: "Урология" },
      { key: "expertise_kz", label: { ru: "Экспертиза KZ через запятую", kz: "Сараптама KZ" }, defaultValue: "Урология" },
      { key: "bio_ru", label: { ru: "Биография RU", kz: "Өмірбаян RU" }, type: "textarea", required: true },
      { key: "bio_kz", label: { ru: "Биография KZ", kz: "Өмірбаян KZ" }, type: "textarea", required: true },
      { key: "contact", label: { ru: "Контакт", kz: "Байланыс" } },
    ],
    summary: (row) => String(row.full_name ?? "Преподаватель"),
    toPayload: (v) => ({ ...v, expertise_ru: list(v.expertise_ru), expertise_kz: list(v.expertise_kz) }),
  },
  {
    id: "meetings",
    table: "meetings",
    title: { ru: "Пятничные встречи", kz: "Жұма кездесулері" },
    description: { ru: "Календарь Journal Club, темы и докладчики.", kz: "Journal Club күнтізбесі, тақырыптар және баяндамашылар." },
    icon: CalendarDays,
    fields: [
      { key: "meeting_date", label: { ru: "Дата", kz: "Күні" }, type: "date", required: true },
      { key: "meeting_time", label: { ru: "Время", kz: "Уақыты" }, type: "time", defaultValue: "15:00", required: true },
      { key: "topic_ru", label: { ru: "Тема RU", kz: "Тақырып RU" }, required: true },
      { key: "topic_kz", label: { ru: "Тема KZ", kz: "Тақырып KZ" }, required: true },
      { key: "presenter", label: { ru: "Докладчик", kz: "Баяндамашы" }, required: true },
      { key: "moderator", label: { ru: "Модератор", kz: "Модератор" }, required: true },
      { key: "room_ru", label: { ru: "Аудитория RU", kz: "Аудитория RU" }, defaultValue: "Аудитория 402", required: true },
      { key: "room_kz", label: { ru: "Аудитория KZ", kz: "Аудитория KZ" }, defaultValue: "402 аудитория", required: true },
      { key: "status", label: { ru: "Статус", kz: "Мәртебе" }, type: "select", options: ["upcoming", "completed"], defaultValue: "upcoming" },
      { key: "article_link", label: { ru: "Ссылка на статью", kz: "Мақала сілтемесі" } },
      { key: "presentation_file", label: { ru: "Файл презентации", kz: "Презентация файлы" } },
      { key: "notes_ru", label: { ru: "Заметки RU", kz: "Жазбалар RU" }, type: "textarea" },
      { key: "notes_kz", label: { ru: "Заметки KZ", kz: "Жазбалар KZ" }, type: "textarea" },
    ],
    summary: (row) => String(row.topic_ru ?? "Встреча"),
    toPayload: (v) => v,
  },
  {
    id: "topics",
    table: "meetings",
    title: { ru: "Назначение тем", kz: "Тақырыптарды бөлу" },
    description: { ru: "Быстрое создание темы Journal Club.", kz: "Journal Club тақырыбын жылдам құру." },
    icon: ClipboardList,
    fields: [
      { key: "meeting_date", label: { ru: "Дата", kz: "Күні" }, type: "date", required: true },
      { key: "meeting_time", label: { ru: "Время", kz: "Уақыты" }, type: "time", defaultValue: "15:00", required: true },
      { key: "topic_ru", label: { ru: "Тема RU", kz: "Тақырып RU" }, required: true },
      { key: "topic_kz", label: { ru: "Тема KZ", kz: "Тақырып KZ" }, required: true },
      { key: "presenter", label: { ru: "Докладчик", kz: "Баяндамашы" }, required: true },
      { key: "moderator", label: { ru: "Модератор", kz: "Модератор" }, defaultValue: "Будет назначен", required: true },
      { key: "room_ru", label: { ru: "Аудитория RU", kz: "Аудитория RU" }, defaultValue: "Аудитория 402", required: true },
      { key: "room_kz", label: { ru: "Аудитория KZ", kz: "Аудитория KZ" }, defaultValue: "402 аудитория", required: true },
      { key: "status", label: { ru: "Статус", kz: "Мәртебе" }, type: "select", options: ["upcoming", "completed"], defaultValue: "upcoming" },
    ],
    summary: (row) => String(row.topic_ru ?? "Тема"),
    toPayload: (v) => v,
  },
  {
    id: "presentations",
    table: "presentations",
    title: { ru: "Презентации", kz: "Презентациялар" },
    description: { ru: "Архив докладов и карточки презентаций.", kz: "Баяндамалар архиві және презентация карточкалары." },
    icon: Upload,
    fields: [
      { key: "title_ru", label: { ru: "Название RU", kz: "Атауы RU" }, required: true },
      { key: "title_kz", label: { ru: "Название KZ", kz: "Атауы KZ" }, required: true },
      { key: "presenter", label: { ru: "Докладчик", kz: "Баяндамашы" }, required: true },
      { key: "supervisor", label: { ru: "Руководитель", kz: "Жетекші" } },
      { key: "presentation_date", label: { ru: "Дата", kz: "Күні" }, type: "date", required: true },
      { key: "year", label: { ru: "Год", kz: "Жыл" }, defaultValue: "2026", required: true },
      { key: "category_ru", label: { ru: "Категория RU", kz: "Санат RU" }, defaultValue: "Урология", required: true },
      { key: "category_kz", label: { ru: "Категория KZ", kz: "Санат KZ" }, defaultValue: "Урология", required: true },
      { key: "abstract_ru", label: { ru: "Аннотация RU", kz: "Аннотация RU" }, type: "textarea" },
      { key: "abstract_kz", label: { ru: "Аннотация KZ", kz: "Аннотация KZ" }, type: "textarea" },
      { key: "key_points_ru", label: { ru: "Выводы RU через запятую", kz: "Тұжырым RU" } },
      { key: "key_points_kz", label: { ru: "Выводы KZ через запятую", kz: "Тұжырым KZ" } },
      { key: "tags", label: { ru: "Теги через запятую", kz: "Тегтер" } },
    ],
    summary: (row) => String(row.title_ru ?? "Презентация"),
    toPayload: (v) => ({ ...v, key_points_ru: list(v.key_points_ru), key_points_kz: list(v.key_points_kz), tags: list(v.tags) }),
  },
  {
    id: "library",
    table: "library_items",
    title: { ru: "Книги и рекомендации", kz: "Кітаптар мен нұсқаулықтар" },
    description: { ru: "Библиотека, рекомендации, статьи и ссылки.", kz: "Кітапхана, нұсқаулықтар, мақалалар және сілтемелер." },
    icon: BookMarked,
    fields: [
      { key: "title_ru", label: { ru: "Название RU", kz: "Атауы RU" }, required: true },
      { key: "title_kz", label: { ru: "Название KZ", kz: "Атауы KZ" }, required: true },
      { key: "author", label: { ru: "Автор", kz: "Автор" } },
      { key: "year", label: { ru: "Год", kz: "Жыл" }, defaultValue: "2026" },
      { key: "category_ru", label: { ru: "Категория RU", kz: "Санат RU" }, defaultValue: "Рекомендации", required: true },
      { key: "category_kz", label: { ru: "Категория KZ", kz: "Санат KZ" }, defaultValue: "Нұсқаулықтар", required: true },
      { key: "section", label: { ru: "Раздел", kz: "Бөлім" }, type: "select", options: ["books", "guidelines", "papers", "images", "links"], defaultValue: "guidelines" },
      { key: "external_link", label: { ru: "Внешняя ссылка", kz: "Сыртқы сілтеме" } },
      { key: "description_ru", label: { ru: "Описание RU", kz: "Сипаттама RU" }, type: "textarea" },
      { key: "description_kz", label: { ru: "Описание KZ", kz: "Сипаттама KZ" }, type: "textarea" },
      { key: "tags", label: { ru: "Теги через запятую", kz: "Тегтер" } },
    ],
    summary: (row) => String(row.title_ru ?? "Материал"),
    toPayload: (v) => ({ ...v, tags: list(v.tags) }),
  },
  {
    id: "news",
    table: "news_posts",
    title: { ru: "Новости", kz: "Жаңалықтар" },
    description: { ru: "Новости урологии и кафедральные публикации.", kz: "Урология жаңалықтары және кафедра жарияланымдары." },
    icon: FilePlus2,
    fields: [
      { key: "title_ru", label: { ru: "Заголовок RU", kz: "Тақырып RU" }, required: true },
      { key: "title_kz", label: { ru: "Заголовок KZ", kz: "Тақырып KZ" }, required: true },
      { key: "author", label: { ru: "Автор", kz: "Автор" }, required: true },
      { key: "post_date", label: { ru: "Дата", kz: "Күні" }, type: "date" },
      { key: "category", label: { ru: "Категория", kz: "Санат" }, defaultValue: "Guidelines Updates", required: true },
      { key: "summary_ru", label: { ru: "Кратко RU", kz: "Қысқаша RU" }, type: "textarea" },
      { key: "summary_kz", label: { ru: "Кратко KZ", kz: "Қысқаша KZ" }, type: "textarea" },
      { key: "body_ru", label: { ru: "Текст RU", kz: "Мәтін RU" }, type: "textarea" },
      { key: "body_kz", label: { ru: "Текст KZ", kz: "Мәтін KZ" }, type: "textarea" },
      { key: "tags", label: { ru: "Теги через запятую", kz: "Тегтер" } },
    ],
    summary: (row) => String(row.title_ru ?? "Новость"),
    toPayload: (v) => ({ ...v, tags: list(v.tags), published: true }),
  },
  {
    id: "comments",
    table: "comments",
    title: { ru: "Комментарии", kz: "Пікірлер" },
    description: { ru: "Комментарии и модерация обсуждений.", kz: "Пікірлер және талқылауларды модерациялау." },
    icon: MessageSquare,
    fields: [
      { key: "entity_type", label: { ru: "Тип", kz: "Түрі" }, type: "select", options: ["presentation", "news", "case"], defaultValue: "presentation" },
      { key: "author_name", label: { ru: "Автор", kz: "Автор" }, required: true },
      { key: "body", label: { ru: "Комментарий", kz: "Пікір" }, type: "textarea", required: true },
      { key: "is_approved", label: { ru: "Одобрен true/false", kz: "Бекітілді true/false" }, defaultValue: "true" },
    ],
    summary: (row) => `${String(row.author_name ?? "Комментарий")}: ${String(row.body ?? "").slice(0, 60)}`,
    toPayload: (v) => ({ entity_type: v.entity_type, entity_id: crypto.randomUUID(), author_name: v.author_name, body: v.body, is_approved: v.is_approved !== "false" }),
  },
  {
    id: "quiz",
    table: "quiz_questions",
    title: { ru: "Вопросы тестов", kz: "Тест сұрақтары" },
    description: { ru: "Вопросы, ответы и объяснения.", kz: "Сұрақтар, жауаптар және түсіндірмелер." },
    icon: ListChecks,
    fields: [
      { key: "question_ru", label: { ru: "Вопрос RU", kz: "Сұрақ RU" }, required: true },
      { key: "question_kz", label: { ru: "Вопрос KZ", kz: "Сұрақ KZ" }, required: true },
      { key: "options_ru", label: { ru: "Варианты RU через запятую", kz: "Нұсқалар RU" }, required: true },
      { key: "options_kz", label: { ru: "Варианты KZ через запятую", kz: "Нұсқалар KZ" }, required: true },
      { key: "correct_index", label: { ru: "Правильный индекс с 0", kz: "Дұрыс индекс 0-ден" }, type: "number", defaultValue: "0" },
      { key: "explanation_ru", label: { ru: "Объяснение RU", kz: "Түсіндірме RU" }, type: "textarea" },
      { key: "explanation_kz", label: { ru: "Объяснение KZ", kz: "Түсіндірме KZ" }, type: "textarea" },
    ],
    summary: (row) => String(row.question_ru ?? "Вопрос"),
    toPayload: (v) => ({ question_ru: v.question_ru, question_kz: v.question_kz, options_ru: list(v.options_ru), options_kz: list(v.options_kz), correct_index: numeric(v.correct_index), explanation_ru: v.explanation_ru, explanation_kz: v.explanation_kz, is_active: true }),
  },
  {
    id: "research",
    table: "research_projects",
    title: { ru: "Исследовательские проекты", kz: "Ғылыми жобалар" },
    description: { ru: "Проекты, сроки, участники и прогресс.", kz: "Жобалар, мерзімдер, қатысушылар және прогресс." },
    icon: BarChart3,
    fields: [
      { key: "title_ru", label: { ru: "Название RU", kz: "Атауы RU" }, required: true },
      { key: "title_kz", label: { ru: "Название KZ", kz: "Атауы KZ" }, required: true },
      { key: "principal_investigator", label: { ru: "Руководитель", kz: "Жетекші" }, required: true },
      { key: "residents_involved", label: { ru: "Участники через запятую", kz: "Қатысушылар" } },
      { key: "status_ru", label: { ru: "Статус RU", kz: "Мәртебе RU" }, defaultValue: "В работе", required: true },
      { key: "status_kz", label: { ru: "Статус KZ", kz: "Мәртебе KZ" }, defaultValue: "Жұмыста", required: true },
      { key: "deadline", label: { ru: "Дедлайн", kz: "Мерзімі" }, type: "date" },
      { key: "related_articles_ru", label: { ru: "Статьи RU через запятую", kz: "Мақалалар RU" } },
      { key: "related_articles_kz", label: { ru: "Статьи KZ через запятую", kz: "Мақалалар KZ" } },
      { key: "progress_ru", label: { ru: "Прогресс RU", kz: "Ілгерілеу RU" }, type: "textarea" },
      { key: "progress_kz", label: { ru: "Прогресс KZ", kz: "Ілгерілеу KZ" }, type: "textarea" },
    ],
    summary: (row) => String(row.title_ru ?? "Проект"),
    toPayload: (v) => ({ ...v, residents_involved: list(v.residents_involved), related_articles_ru: list(v.related_articles_ru), related_articles_kz: list(v.related_articles_kz) }),
  },
  {
    id: "siteContent",
    table: "site_content",
    title: { ru: "Контент сайта", kz: "Сайт контенті" },
    description: { ru: "Статические блоки: Академия, правила, шаблоны, главная, клинический случай.", kz: "Статикалық блоктар: Академия, ережелер, үлгілер, басты бет, клиникалық жағдай." },
    icon: ClipboardList,
    fields: [
      { key: "page_key", label: { ru: "Страница: home / academy / case", kz: "Бет: home / academy / case" }, defaultValue: "academy", required: true },
      { key: "block_key", label: { ru: "Ключ блока", kz: "Блок кілті" }, required: true },
      { key: "title_ru", label: { ru: "Заголовок RU", kz: "Тақырып RU" } },
      { key: "title_kz", label: { ru: "Заголовок KZ", kz: "Тақырып KZ" } },
      { key: "body_ru", label: { ru: "Текст RU", kz: "Мәтін RU" }, type: "textarea" },
      { key: "body_kz", label: { ru: "Текст KZ", kz: "Мәтін KZ" }, type: "textarea" },
      { key: "sort_order", label: { ru: "Порядок", kz: "Реті" }, type: "number", defaultValue: "100" },
      { key: "is_published", label: { ru: "Опубликовано true/false", kz: "Жарияланды true/false" }, defaultValue: "true" },
    ],
    summary: (row) => `${String(row.page_key)}/${String(row.block_key)}: ${String(row.title_ru ?? "")}`,
    toPayload: (v) => ({ page_key: v.page_key, block_key: v.block_key, title_ru: v.title_ru, title_kz: v.title_kz, body_ru: v.body_ru, body_kz: v.body_kz, sort_order: numeric(v.sort_order), is_published: v.is_published !== "false" }),
  },
];

function defaultValues(config: Config) {
  return Object.fromEntries(config.fields.map((field) => [field.key, field.defaultValue ?? ""]));
}

function rowValues(config: Config, row: Record<string, unknown>) {
  return Object.fromEntries(config.fields.map((field) => {
    const value = row[field.key];
    if (Array.isArray(value)) return [field.key, value.join(", ")];
    if (typeof value === "boolean") return [field.key, String(value)];
    return [field.key, value == null ? "" : String(value)];
  }));
}

function AdminEditor({ config, currentUserEmail, lang }: { config: Config; currentUserEmail: string | null; lang: Lang }) {
  const [values, setValues] = useState<Record<string, string>>(() => defaultValues(config));
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadRows = async () => {
    setLoading(true);
    const { data, error } = await supabase.from(config.table).select("*").limit(20);
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setRows(data ?? []);
  };

  useEffect(() => {
    setValues(defaultValues(config));
    setEditingId(null);
    setMessage("");
    loadRows();
  }, [config]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = config.toPayload(values);
    const request = editingId
      ? supabase.from(config.table).update(payload).eq("id", editingId)
      : config.table === "site_content"
        ? supabase.from(config.table).upsert(payload, { onConflict: "page_key,block_key" })
        : supabase.from(config.table).insert(payload);

    const { error } = await request;
    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(editingId ? (lang === "ru" ? "Изменения сохранены" : "Өзгерістер сақталды") : (lang === "ru" ? "Сохранено" : "Сақталды"));
    setEditingId(null);
    setValues(defaultValues(config));
    await loadRows();
  };

  const deleteRow = async (id: unknown) => {
    if (!id) return;
    const { error } = await supabase.from(config.table).delete().eq("id", String(id));
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage(lang === "ru" ? "Удалено" : "Жойылды");
    await loadRows();
  };

  const uploadPresentationFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!currentUserEmail) {
      setMessage(lang === "ru" ? "Сначала войдите администратором." : "Алдымен әкімші ретінде кіріңіз.");
      return;
    }

    setUploading(true);
    setMessage(lang === "ru" ? "Загружаю файл доклада..." : "Баяндама файлы жүктелуде...");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from("presentations").upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    });
    setUploading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    const { data } = supabase.storage.from("presentations").getPublicUrl(path);
    const publicUrl = data.publicUrl;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    setValues((current) => ({
      ...current,
      slides_url: publicUrl,
      pdf_url: isPdf ? publicUrl : current.pdf_url ?? "",
    }));
    setMessage(
      isPdf
        ? lang === "ru"
          ? "PDF загружен. Заполните карточку и нажмите сохранить."
          : "PDF жүктелді. Карточканы толтырып, сақтаңыз."
        : lang === "ru"
          ? "Файл загружен. Для предпросмотра в браузере лучше загрузить PDF."
          : "Файл жүктелді. Браузерде көру үшін PDF жүктеген дұрыс.",
    );
  };

  return (
    <div className="grid gap-4">
      <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
        {config.id === "presentations" ? (
          <div className="rounded-lg border border-dashed border-clinic-200 bg-clinic-50 p-4 dark:border-white/10 dark:bg-white/5 md:col-span-2">
            <label className="grid gap-2 text-sm font-semibold text-navy-900 dark:text-slate-100">
              {lang === "ru" ? "Загрузить доклад для общего доступа" : "Жалпы қолжетімді баяндама жүктеу"}
              <input
                accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                className="field"
                disabled={!currentUserEmail || uploading}
                onChange={uploadPresentationFile}
                type="file"
              />
            </label>
            <p className="muted mt-2">
              {lang === "ru"
                ? "После загрузки ссылка автоматически попадет в карточку. PDF будет открываться в предпросмотре на сайте."
                : "Жүктелгеннен кейін сілтеме карточкаға автоматты түрде түседі. PDF сайтта алдын ала ашылады."}
            </p>
          </div>
        ) : null}
        {config.fields.map((field) => {
          const common = {
            disabled: !currentUserEmail,
            required: field.required,
            value: values[field.key] ?? "",
            onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
              setValues((current) => ({ ...current, [field.key]: event.target.value })),
          };

          if (field.type === "textarea") {
            return <textarea key={field.key} className="field min-h-24 resize-y md:col-span-2" placeholder={field.label[lang]} {...common} />;
          }
          if (field.type === "select") {
            return (
              <select key={field.key} className="field" {...common}>
                {(field.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            );
          }
          return <input key={field.key} className="field" placeholder={field.label[lang]} type={field.type ?? "text"} {...common} />;
        })}
        <button className="primary-button md:col-span-2" disabled={!currentUserEmail} type="submit">
          <Plus className="h-4 w-4" />
          {editingId ? (lang === "ru" ? "Обновить запись" : "Жазбаны жаңарту") : (lang === "ru" ? "Сохранить" : "Сақтау")}
        </button>
      </form>

      {!currentUserEmail ? <p className="muted">{lang === "ru" ? "Сначала войдите администратором." : "Алдымен әкімші ретінде кіріңіз."}</p> : null}
      {message ? <p className="muted">{message}</p> : null}

      <div className="rounded-lg border border-clinic-200 bg-clinic-50 p-4 dark:border-white/10 dark:bg-white/5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="font-bold text-navy-950 dark:text-white">{lang === "ru" ? "Записи" : "Жазбалар"}</h4>
          <button className="secondary-button" onClick={loadRows} type="button">
            <RefreshCw className="h-4 w-4" />
            {lang === "ru" ? "Обновить" : "Жаңарту"}
          </button>
        </div>
        {loading ? <p className="muted">{lang === "ru" ? "Загрузка..." : "Жүктелуде..."}</p> : null}
        <div className="grid gap-2">
          {rows.map((row) => (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 dark:bg-navy-900" key={String(row.id)}>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-navy-950 dark:text-white">{config.summary(row)}</p>
                <p className="muted font-mono">{String(row.id)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button className="icon-button" disabled={!currentUserEmail} onClick={() => { setValues(rowValues(config, row)); setEditingId(String(row.id)); }} type="button">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button className="icon-button" disabled={!currentUserEmail} onClick={() => deleteRow(row.id)} type="button">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {!rows.length && !loading ? <p className="muted">{lang === "ru" ? "Записей пока нет" : "Әзірге жазба жоқ"}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function FullAdminPage({ lang }: { lang: Lang }) {
  const [activeSection, setActiveSection] = useState("residents");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState("");
  const config = useMemo(() => configs.find((item) => item.id === activeSection) ?? configs[0], [activeSection]);
  const Icon = config.icon;

  useEffect(() => {
    getCurrentUser().then((user) => setCurrentUserEmail(user?.email ?? null));
  }, []);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const user = await signInAdmin(adminEmail, adminPassword);
      setCurrentUserEmail(user.email ?? adminEmail);
      setAdminPassword("");
      setAuthMessage(lang === "ru" ? "Вход выполнен" : "Кіру сәтті орындалды");
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : lang === "ru" ? "Ошибка входа" : "Кіру қатесі");
    }
  };

  const signOut = async () => {
    await signOutAdmin();
    setCurrentUserEmail(null);
    setAuthMessage(lang === "ru" ? "Вы вышли из аккаунта" : "Аккаунттан шықтыңыз");
  };

  return (
    <AdminPanelLayout lang={lang} activeSection={activeSection} onSectionChange={setActiveSection}>
      <div className="grid gap-4">
        <article className="card p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-gold-700 dark:text-gold-300" />
            <h3 className="font-bold text-navy-950 dark:text-white">{lang === "ru" ? "Вход администратора" : "Әкімші кіруі"}</h3>
          </div>
          {currentUserEmail ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
                {lang === "ru" ? "Вы вошли как" : "Сіз кірдіңіз"} {currentUserEmail}
              </p>
              <button className="secondary-button" onClick={signOut} type="button">{lang === "ru" ? "Выйти" : "Шығу"}</button>
            </div>
          ) : (
            <form className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={signIn}>
              <input className="field" onChange={(event) => setAdminEmail(event.target.value)} placeholder="admin@example.com" type="email" value={adminEmail} />
              <input className="field" onChange={(event) => setAdminPassword(event.target.value)} placeholder={lang === "ru" ? "Пароль" : "Құпиясөз"} type="password" value={adminPassword} />
              <button className="primary-button" type="submit"><ShieldCheck className="h-4 w-4" />{lang === "ru" ? "Войти" : "Кіру"}</button>
            </form>
          )}
          {authMessage ? <p className="muted mt-3">{authMessage}</p> : null}
        </article>

        <article className="card p-5">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-gold-700 dark:text-gold-300" />
            <div>
              <p className="eyebrow">{config.table}</p>
              <h2 className="text-xl font-black text-navy-950 dark:text-white">{config.title[lang]}</h2>
            </div>
          </div>
          <p className="muted mt-3">{config.description[lang]}</p>
          <div className="mt-5">
            <AdminEditor config={config} currentUserEmail={currentUserEmail} lang={lang} />
          </div>
        </article>
      </div>
    </AdminPanelLayout>
  );
}
