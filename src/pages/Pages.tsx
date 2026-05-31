import {
  Award,
  BarChart3,
  BookMarked,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  FileText,
  LineChart,
  ListChecks,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Trophy,
  Upload,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  articleOfWeek,
  bestPresentation,
  caseOfWeek,
  faculty,
  leaderboard,
  learningModules,
  libraryItems,
  meetings,
  newsCategories,
  newsPosts,
  presentations,
  quizQuestions,
  researchProjects,
  residents,
  slideRules,
  stats,
  templates,
  topicIdeas,
} from "../data";
import { navItems, t } from "../i18n";
import { getCurrentUser, signInAdmin, signOutAdmin } from "../lib/auth";
import { generateGuidelineTopic } from "../lib/topicGenerator";
import { formatDisplayDate } from "../lib/dates";
import {
  fetchFaculty,
  fetchLibraryItems,
  fetchMeetings,
  fetchNewsPosts,
  fetchPresentations,
  fetchQuizQuestions,
  fetchResearchProjects,
  fetchSiteContent,
  type SiteContentBlock,
} from "../lib/content";
import { createResident, fetchResidents } from "../lib/residents";
import { FullAdminPage } from "./AdminManager";
import {
  AdminPanelLayout,
  FacultyCard,
  FilterBar,
  Hero,
  IconSparkles,
  JournalClubCard,
  LibraryCard,
  NewsCard,
  PlaceholderCard,
  PresentationCard,
  QuickLinkGrid,
  QuizCard,
  ResearchProjectCard,
  ResidentCard,
  Section,
  SectionTitle,
  StatsCard,
  localize,
} from "../components/common";
import type { Lang, LibraryItem, Meeting, NewsPost, PageId, Presentation, QuizQuestion, Resident, ResearchProject, Faculty } from "../types";

type PageProps = {
  lang: Lang;
  countdown: string;
  nextMeeting: Meeting;
  onNavigate: (page: PageId) => void;
};

function PageIntro({
  lang,
  page,
  description,
}: {
  lang: Lang;
  page: PageId;
  description: { ru: string; kz: string };
}) {
  const nav = navItems.find((item) => item.id === page)!;
  return (
    <section className="bg-white py-10 dark:bg-navy-950 sm:py-12">
      <div className="shell">
        <p className="eyebrow mb-2">{t.appName}</p>
        <h1 className="max-w-4xl text-3xl font-black text-navy-950 dark:text-white sm:text-4xl">
          {localize(nav.label, lang)}
        </h1>
        <p className="muted mt-3 max-w-3xl text-base">{localize(description, lang)}</p>
      </div>
    </section>
  );
}

export function HomePage({ lang, countdown, nextMeeting, onNavigate }: PageProps) {
  const [topicIndex, setTopicIndex] = useState(0);
  const [generatedTopic, setGeneratedTopic] = useState(topicIdeas[0]);
  const [topicLoading, setTopicLoading] = useState(false);
  const PresentationBadge = bestPresentation.badge;
  const ArticleIcon = articleOfWeek.icon;

  const handleGenerateTopic = async () => {
    setTopicLoading(true);
    try {
      setGeneratedTopic(await generateGuidelineTopic(lang));
    } catch {
      const nextIndex = (topicIndex + 1) % topicIdeas.length;
      setTopicIndex(nextIndex);
      setGeneratedTopic(topicIdeas[nextIndex]);
    } finally {
      setTopicLoading(false);
    }
  };

  return (
    <>
      <Hero lang={lang} countdown={countdown} meeting={nextMeeting} onNavigate={onNavigate} />
      <Section>
        <div className="shell">
          <SectionTitle title={localize(t.quickStats, lang)} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => <StatsCard key={localize(stat.label, lang)} stat={stat} lang={lang} />)}
          </div>
        </div>
      </Section>

      <Section className="bg-white dark:bg-navy-950">
        <div className="shell grid gap-6 lg:grid-cols-[1fr_380px]">
          <div>
            <SectionTitle title={localize(t.recentPresentations, lang)} />
            <div className="grid gap-4 md:grid-cols-2">
              {presentations.slice(0, 2).map((item) => <PresentationCard key={item.id} item={item} lang={lang} />)}
            </div>
          </div>
          <aside className="grid content-start gap-4">
            <article className="card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500 text-navy-950">
                  <PresentationBadge className="h-5 w-5" />
                </span>
                <div>
                  <p className="eyebrow">{localize(t.bestPresentation, lang)}</p>
                  <h3 className="font-bold text-navy-950 dark:text-white">{localize(bestPresentation.title, lang)}</h3>
                </div>
              </div>
              <p className="muted mt-3">{bestPresentation.presenter}</p>
            </article>
            <article className="card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800 text-white dark:bg-gold-500 dark:text-navy-950">
                  <ArticleIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="eyebrow">{localize(t.articleOfWeek, lang)}</p>
                  <h3 className="font-bold text-navy-950 dark:text-white">{localize(articleOfWeek.title, lang)}</h3>
                </div>
              </div>
              <p className="muted mt-3">{articleOfWeek.source}</p>
            </article>
            <article className="card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800 text-white dark:bg-gold-500 dark:text-navy-950">
                  <IconSparkles className="h-5 w-5" />
                </span>
                <p className="eyebrow">{localize(t.topicGenerator, lang)}</p>
              </div>
              <p className="mt-4 font-bold text-navy-950 dark:text-white">{localize(generatedTopic, lang)}</p>
              <button
                className="secondary-button mt-4"
                disabled={topicLoading}
                onClick={handleGenerateTopic}
                type="button"
              >
                <RefreshCw className="h-4 w-4" />
                {topicLoading ? (lang === "ru" ? "Генерирую..." : "Генерация...") : localize(t.generate, lang)}
              </button>
            </article>
          </aside>
        </div>
      </Section>

      <Section>
        <div className="shell">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <SectionTitle title={localize(t.latestNews, lang)} />
              <div className="grid gap-4">
                {newsPosts.slice(0, 2).map((post) => <NewsCard key={post.id} post={post} lang={lang} />)}
              </div>
            </div>
            <div>
              <SectionTitle title={localize(t.quickLinks, lang)} />
              <QuickLinkGrid lang={lang} onNavigate={onNavigate} />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

export function JournalPage({ lang, countdown }: PageProps) {
  const [liveMeetings, setLiveMeetings] = useState<Meeting[]>(meetings);

  useEffect(() => {
    fetchMeetings()
      .then((items) => {
        if (items.length) setLiveMeetings(items);
      })
      .catch(() => setLiveMeetings(meetings));
  }, []);

  return (
    <>
      <PageIntro
        lang={lang}
        page="journal"
        description={{
          ru: "Пятничное расписание, назначенные темы, модераторы, ссылки на статьи и заметки обсуждений.",
          kz: "Жұма кестесі, берілген тақырыптар, модераторлар, мақала сілтемелері және талқылау жазбалары.",
        }}
      />
      <Section>
        <div className="shell">
          <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="card p-5">
              <SectionTitle
                kicker={localize(t.nextFriday, lang)}
                title={countdown}
                description={{
                  ru: "Следующая встреча запланирована на пятницу, 15:00.",
                  kz: "Келесі кездесу жұма күні, 15:00-ге жоспарланған.",
                }[lang]}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                {liveMeetings.map((meeting) => (
                  <div className="rounded-lg bg-clinic-50 p-4 dark:bg-white/5" key={meeting.id}>
                    <p className="text-sm font-black text-navy-950 dark:text-white">{formatDisplayDate(meeting.date)}</p>
                    <p className="muted mt-1 line-clamp-2">{localize(meeting.topic, lang)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5">
              <p className="eyebrow">{localize(t.status, lang)}</p>
              <div className="mt-4 grid gap-3">
                <StatusLine value={liveMeetings.filter((item) => item.status === "upcoming").length} label={localize(t.upcoming, lang)} />
                <StatusLine value={liveMeetings.filter((item) => item.status === "completed").length} label={localize(t.completed, lang)} />
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            {liveMeetings.map((meeting) => <JournalClubCard key={meeting.id} meeting={meeting} lang={lang} />)}
          </div>
        </div>
      </Section>
    </>
  );
}

function StatusLine({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-clinic-50 p-4 dark:bg-white/5">
      <span className="font-semibold text-navy-950 dark:text-white">{label}</span>
      <span className="text-2xl font-black text-gold-700 dark:text-gold-300">{value}</span>
    </div>
  );
}

export function AcademyPage({ lang }: PageProps) {
  const [contentBlocks, setContentBlocks] = useState<SiteContentBlock[]>([]);

  useEffect(() => {
    fetchSiteContent("academy")
      .then(setContentBlocks)
      .catch(() => setContentBlocks([]));
  }, []);

  const moduleBlocks = contentBlocks.filter((block) => block.blockKey.startsWith("module:"));
  const ruleBlocks = contentBlocks.filter((block) => block.blockKey.startsWith("slide_rule:"));
  const templateBlocks = contentBlocks.filter((block) => block.blockKey.startsWith("template:"));

  return (
    <>
      <PageIntro
        lang={lang}
        page="academy"
        description={{
          ru: "Практические модули для поиска литературы, чтения статей, анализа рекомендаций и подготовки сильных презентаций.",
          kz: "Әдебиет іздеу, мақала оқу, нұсқаулық талдау және мықты презентация дайындауға арналған практикалық модульдер.",
        }}
      />
      <Section>
        <div className="shell">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(moduleBlocks.length ? moduleBlocks : learningModules).map((module) => {
              if ("blockKey" in module) {
                return (
                  <article className="card p-5" key={module.id}>
                    <BookMarked className="h-6 w-6 text-gold-700 dark:text-gold-300" />
                    <h3 className="mt-4 text-lg font-bold text-navy-950 dark:text-white">{localize(module.title, lang)}</h3>
                    <p className="muted mt-2">{localize(module.body, lang)}</p>
                  </article>
                );
              }
              const Icon = module.icon;
              return (
                <article className="card p-5" key={module.id}>
                  <Icon className="h-6 w-6 text-gold-700 dark:text-gold-300" />
                  <h3 className="mt-4 text-lg font-bold text-navy-950 dark:text-white">{localize(module.title, lang)}</h3>
                  <p className="muted mt-2">{localize(module.description, lang)}</p>
                  <ul className="mt-4 space-y-2">
                    {module.lessons.map((lesson) => (
                      <li className="flex gap-2 text-sm text-navy-800 dark:text-slate-100" key={localize(lesson, lang)}>
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-700 dark:text-gold-300" />
                        {localize(lesson, lang)}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </Section>
      <Section className="bg-white dark:bg-navy-950">
        <div className="shell grid gap-8 lg:grid-cols-2">
          <div>
            <SectionTitle
              title={lang === "ru" ? "Правила сильных слайдов" : "Мықты слайд ережелері"}
            />
            <div className="grid gap-3">
              {(ruleBlocks.length ? ruleBlocks.map((block) => block.title) : slideRules).map((rule) => (
                <div className="card flex items-center gap-3 p-4" key={localize(rule, lang)}>
                  <ListChecks className="h-5 w-5 text-gold-700 dark:text-gold-300" />
                  <p className="font-semibold text-navy-950 dark:text-white">{localize(rule, lang)}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionTitle
              title={lang === "ru" ? "Готовые шаблоны" : "Дайын үлгілер"}
            />
            <div className="grid gap-3">
              {(templateBlocks.length ? templateBlocks.map((block) => block.title) : templates).map((template) => (
                <div className="card flex items-center justify-between gap-3 p-4" key={localize(template, lang)}>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gold-700 dark:text-gold-300" />
                    <p className="font-semibold text-navy-950 dark:text-white">{localize(template, lang)}</p>
                  </div>
                  <span className="tag">PPTX</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

export function ArchivePage({ lang }: PageProps) {
  const [livePresentations, setLivePresentations] = useState<Presentation[]>(presentations);
  const [previewPresentation, setPreviewPresentation] = useState<Presentation | null>(null);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("all");
  const [resident, setResident] = useState("all");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetchPresentations()
      .then((items) => {
        if (items.length) setLivePresentations(items);
      })
      .catch(() => setLivePresentations(presentations));
  }, []);

  const years = Array.from(new Set(livePresentations.map((item) => item.year)));
  const residentsList = Array.from(new Set(livePresentations.map((item) => item.presenter)));
  const categories = Array.from(new Set(livePresentations.map((item) => localize(item.category, lang))));

  const filtered = livePresentations.filter((item) => {
    const query = search.trim().toLowerCase();
    const matchesQuery = query
      ? `${localize(item.title, lang)} ${item.presenter} ${localize(item.abstract, lang)} ${item.tags.join(" ")}`.toLowerCase().includes(query)
      : true;
    const matchesYear = year === "all" || item.year === year;
    const matchesResident = resident === "all" || item.presenter === resident;
    const matchesCategory = category === "all" || localize(item.category, lang) === category;
    return matchesQuery && matchesYear && matchesResident && matchesCategory;
  });

  return (
    <>
      <PageIntro
        lang={lang}
        page="archive"
        description={{
          ru: "Блог-архив кафедральных докладов с аннотациями, ключевыми выводами, тегами и зонами для файлов.",
          kz: "Аннотация, негізгі тұжырым, тегтер және файл аймақтары бар кафедралық баяндамалар блог-архиві.",
        }}
      />
      <Section>
        <div className="shell">
          <FilterBar lang={lang}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-clinic-700 dark:text-slate-300" />
              <input className="field pl-9" onChange={(event) => setSearch(event.target.value)} placeholder={localize(t.searchPlaceholder, lang)} value={search} />
            </div>
            <Select label={localize(t.year, lang)} value={year} onChange={setYear} options={["all", ...years]} lang={lang} />
            <Select label={localize(t.resident, lang)} value={resident} onChange={setResident} options={["all", ...residentsList]} lang={lang} />
            <Select label={localize(t.category, lang)} value={category} onChange={setCategory} options={["all", ...categories]} lang={lang} />
          </FilterBar>
          <div className="grid gap-4 lg:grid-cols-3">
            {filtered.map((item) => <PresentationCard key={item.id} item={item} lang={lang} onPreview={setPreviewPresentation} />)}
          </div>
          <ArchiveDetails lang={lang} item={filtered[0] ?? livePresentations[0] ?? presentations[0]} onPreview={setPreviewPresentation} />
        </div>
      </Section>
      {previewPresentation ? (
        <PresentationPreview item={previewPresentation} lang={lang} onClose={() => setPreviewPresentation(null)} />
      ) : null}
    </>
  );
}

function Select({
  label,
  value,
  options,
  lang,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  lang: Lang;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.08em] text-clinic-700 dark:text-slate-300">
      {label}
      <select className="field normal-case tracking-normal" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? localize(t.all, lang) : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ArchiveDetails({ item, lang, onPreview }: { item: Presentation; lang: Lang; onPreview: (item: Presentation) => void }) {
  const fileUrl = item.pdfUrl || item.slidesUrl || "";

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_340px]">
      <article className="card p-5">
        <SectionTitle
          kicker={localize(t.abstract, lang)}
          title={localize(item.title, lang)}
          description={localize(item.abstract, lang)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            className="flex min-h-20 w-full items-center gap-3 rounded-lg border border-dashed border-clinic-200 bg-clinic-50 p-3 text-left text-sm font-semibold text-clinic-700 transition hover:border-gold-500 hover:bg-white hover:text-gold-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-gold-300"
            disabled={!fileUrl}
            onClick={() => onPreview(item)}
            type="button"
          >
            <FileText className="h-5 w-5 shrink-0 text-gold-700 dark:text-gold-300" />
            {fileUrl ? localize(t.pdfPlaceholder, lang) : lang === "ru" ? "Файл доклада пока не загружен" : "Баяндама файлы әлі жүктелмеген"}
          </button>
          <PlaceholderCard icon={BookMarked} label={localize(t.references, lang)} />
          <PlaceholderCard icon={ClipboardList} label={localize(t.comments, lang)} />
        </div>
      </article>
      <article className="card p-5">
        <p className="eyebrow">{localize(t.keyPoints, lang)}</p>
        <ul className="mt-4 space-y-3">
          {item.keyPoints.map((point) => (
            <li className="flex gap-2 text-sm text-navy-800 dark:text-slate-100" key={localize(point, lang)}>
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-700 dark:text-gold-300" />
              {localize(point, lang)}
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

function PresentationPreview({ item, lang, onClose }: { item: Presentation; lang: Lang; onClose: () => void }) {
  const fileUrl = item.pdfUrl || item.slidesUrl || "";
  const isPdf = fileUrl.toLowerCase().includes(".pdf");

  return (
    <div className="fixed inset-0 z-[80] bg-navy-950/70 p-0 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true">
      <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-lg border border-clinic-200 bg-white shadow-lift dark:border-white/10 dark:bg-navy-950">
        <div className="flex items-center justify-between gap-3 border-b border-clinic-200 p-4 dark:border-white/10">
          <div className="min-w-0">
            <p className="eyebrow">{lang === "ru" ? "Предпросмотр доклада" : "Баяндаманы алдын ала көру"}</p>
            <h2 className="truncate text-lg font-black text-navy-950 dark:text-white">{localize(item.title, lang)}</h2>
          </div>
          <button className="icon-button shrink-0" onClick={onClose} type="button" aria-label={lang === "ru" ? "Закрыть" : "Жабу"}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-clinic-50 p-2 dark:bg-navy-900 sm:p-4">
          {fileUrl && isPdf ? (
            <div className="grid gap-3">
              <iframe className="h-[72vh] w-full rounded-lg border border-clinic-200 bg-white dark:border-white/10 sm:h-[78vh]" src={`${fileUrl}#view=FitH`} title={localize(item.title, lang)} />
              <a className="secondary-button justify-center sm:hidden" href={fileUrl} rel="noreferrer" target="_blank">
                {lang === "ru" ? "Открыть PDF в новой вкладке" : "PDF файлын жаңа қойындыда ашу"}
              </a>
            </div>
          ) : fileUrl ? (
            <div className="grid h-full min-h-[60vh] place-items-center rounded-lg border border-clinic-200 bg-white p-6 text-center dark:border-white/10 dark:bg-navy-950">
              <div>
                <FileText className="mx-auto h-10 w-10 text-gold-700 dark:text-gold-300" />
                <p className="mt-3 font-bold text-navy-950 dark:text-white">
                  {lang === "ru" ? "Файл загружен. Этот формат лучше открыть в новой вкладке." : "Файл жүктелді. Бұл форматты жаңа қойындыда ашқан дұрыс."}
                </p>
                <a className="primary-button mt-4 inline-flex" href={fileUrl} rel="noreferrer" target="_blank">
                  {lang === "ru" ? "Открыть файл" : "Файлды ашу"}
                </a>
              </div>
            </div>
          ) : (
            <div className="grid h-full min-h-[60vh] place-items-center rounded-lg border border-clinic-200 bg-white p-6 text-center dark:border-white/10 dark:bg-navy-950">
              <p className="font-bold text-navy-950 dark:text-white">
                {lang === "ru" ? "Файл доклада пока не загружен администратором." : "Баяндама файлын әкімші әлі жүктеген жоқ."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function NewsPage({ lang }: PageProps) {
  const [liveNewsPosts, setLiveNewsPosts] = useState<NewsPost[]>(newsPosts);
  const [category, setCategory] = useState("all");
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);

  useEffect(() => {
    fetchNewsPosts()
      .then((items) => {
        if (items.length) setLiveNewsPosts(items);
      })
      .catch(() => setLiveNewsPosts(newsPosts));
  }, []);

  const filtered = category === "all" ? liveNewsPosts : liveNewsPosts.filter((post) => post.category === category);

  if (selectedPost) {
    return <NewsDetail post={selectedPost} lang={lang} onBack={() => setSelectedPost(null)} />;
  }

  return (
    <>
      <PageIntro
        lang={lang}
        page="news"
        description={{
          ru: "Короткие кафедральные новости, обновления рекомендаций и научные заметки от резидентов и преподавателей.",
          kz: "Резиденттер мен оқытушылардан қысқа кафедралық жаңалықтар, нұсқаулық жаңартулары және ғылыми жазбалар.",
        }}
      />
      <Section>
        <div className="shell">
          <div className="mb-6 flex flex-wrap gap-2">
            {["all", ...newsCategories].map((item) => (
              <button
                className={`secondary-button ${category === item ? "border-gold-500 text-gold-700 dark:text-gold-300" : ""}`}
                key={item}
                onClick={() => setCategory(item)}
                type="button"
              >
                {item === "all" ? localize(t.all, lang) : item}
              </button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((post) => <NewsCard key={post.id} post={post} lang={lang} onOpen={setSelectedPost} />)}
          </div>
        </div>
      </Section>
    </>
  );
}

function NewsDetail({ post, lang, onBack }: { post: NewsPost; lang: Lang; onBack: () => void }) {
  return (
    <>
      <section className="bg-white py-10 dark:bg-navy-950 sm:py-12">
        <div className="shell">
          <button className="secondary-button mb-6" onClick={onBack} type="button">
            {lang === "ru" ? "Назад к новостям" : "Жаңалықтарға оралу"}
          </button>
          <div className="max-w-4xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="tag">{post.category}</span>
              <span className="muted">{post.date}</span>
              <span className="tag"><FilePlus2 className="mr-1.5 h-3.5 w-3.5" />{post.author}</span>
            </div>
            <h1 className="text-3xl font-black text-navy-950 dark:text-white sm:text-4xl">{localize(post.title, lang)}</h1>
            <p className="muted mt-4 text-lg">{localize(post.summary, lang)}</p>
          </div>
        </div>
      </section>
      <Section>
        <div className="shell">
          <article className="card max-w-4xl p-6">
            <div className="whitespace-pre-line text-base leading-8 text-navy-800 dark:text-slate-100">
              {localize(post.body, lang)}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
            </div>
          </article>
        </div>
      </Section>
    </>
  );
}

export function LibraryPage({ lang }: PageProps) {
  const [liveLibraryItems, setLiveLibraryItems] = useState<LibraryItem[]>(libraryItems);
  const [section, setSection] = useState<LibraryItem["section"] | "all">("all");
  const sections: { id: LibraryItem["section"] | "all"; label: string }[] = [
    { id: "all", label: localize(t.all, lang) },
    { id: "books", label: localize(t.books, lang) },
    { id: "guidelines", label: localize(t.guidelines, lang) },
    { id: "papers", label: localize(t.papers, lang) },
    { id: "images", label: localize(t.images, lang) },
    { id: "links", label: localize(t.links, lang) },
  ];
  useEffect(() => {
    fetchLibraryItems()
      .then((items) => {
        if (items.length) setLiveLibraryItems(items);
      })
      .catch(() => setLiveLibraryItems(libraryItems));
  }, []);

  const filtered = section === "all" ? liveLibraryItems : liveLibraryItems.filter((item) => item.section === section);

  return (
    <>
      <PageIntro
        lang={lang}
        page="library"
        description={{
          ru: "Цифровая библиотека для учебных материалов, рекомендаций, ключевых статей, изображений и внешних ссылок.",
          kz: "Оқу материалдары, нұсқаулықтар, негізгі мақалалар, суреттер және сыртқы сілтемелерге арналған цифрлық кітапхана.",
        }}
      />
      <Section>
        <div className="shell">
          <div className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
            {sections.map((item) => (
              <button
                className={`secondary-button ${section === item.id ? "border-gold-500 text-gold-700 dark:text-gold-300" : ""}`}
                key={item.id}
                onClick={() => setSection(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
          {filtered.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => <LibraryCard key={item.id} item={item} lang={lang} />)}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="font-bold text-navy-950 dark:text-white">{lang === "ru" ? "Материалов пока нет" : "Әзірге материал жоқ"}</p>
              <p className="muted mt-2">{localize(t.externalLink, lang)}</p>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}

export function ResidentsPage({ lang }: PageProps) {
  const [liveResidents, setLiveResidents] = useState<Resident[]>(residents);
  const [source, setSource] = useState<"supabase" | "local" | "loading">("loading");

  useEffect(() => {
    let isMounted = true;

    fetchResidents()
      .then((items) => {
        if (!isMounted) return;
        if (items.length) {
          setLiveResidents(items);
          setSource("supabase");
        } else {
          setLiveResidents(residents);
          setSource("local");
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setLiveResidents(residents);
        setSource("local");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const liveLeaderboard = liveResidents
    .slice()
    .sort((a, b) => b.score - a.score)
    .map((resident, index) => ({ rank: index + 1, resident }));

  return (
    <>
      <PageIntro
        lang={lang}
        page="residents"
        description={{
          ru: "Портфолио резидентов: исследовательские интересы, активности, назначенные темы и академические достижения.",
          kz: "Резиденттер портфолиосы: ғылыми қызығушылықтар, белсенділік, берілген тақырыптар және академиялық жетістіктер.",
        }}
      />
      <Section>
        <div className="shell grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-4 md:grid-cols-2">
            {liveResidents.map((resident) => <ResidentCard key={resident.id} resident={resident} lang={lang} />)}
          </div>
          <aside className="card self-start p-5">
            <div className="mb-4 flex items-center gap-3">
              <Trophy className="h-5 w-5 text-gold-700 dark:text-gold-300" />
              <h2 className="font-bold text-navy-950 dark:text-white">{localize(t.leaderboard, lang)}</h2>
            </div>
            <div className="mb-4 rounded-lg border border-clinic-200 bg-clinic-50 p-3 text-sm font-semibold text-navy-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
              {source === "loading"
                ? lang === "ru"
                  ? "Проверяю Supabase..."
                  : "Supabase тексерілуде..."
                : source === "supabase"
                  ? lang === "ru"
                    ? "Данные загружены из Supabase"
                    : "Деректер Supabase-тен жүктелді"
                  : lang === "ru"
                    ? "Пока показаны локальные данные. Создайте таблицу residents в Supabase."
                    : "Әзірге жергілікті деректер көрсетіледі. Supabase ішінде residents кестесін құрыңыз."}
            </div>
            <div className="grid gap-3">
              {liveLeaderboard.map(({ rank, resident }) => (
                <div className="flex items-center justify-between rounded-lg bg-clinic-50 p-3 dark:bg-white/5" key={resident.id}>
                  <div>
                    <p className="text-sm font-black text-navy-950 dark:text-white">{rank}. {resident.name}</p>
                    <p className="muted">{localize(t.activityScore, lang)}</p>
                  </div>
                  <span className="text-xl font-black text-gold-700 dark:text-gold-300">{resident.score}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}

export function FacultyPage({ lang }: PageProps) {
  const [liveFaculty, setLiveFaculty] = useState<Faculty[]>(faculty);

  useEffect(() => {
    fetchFaculty()
      .then((items) => {
        if (items.length) setLiveFaculty(items);
      })
      .catch(() => setLiveFaculty(faculty));
  }, []);

  return (
    <>
      <PageIntro
        lang={lang}
        page="faculty"
        description={{
          ru: "Профиль преподавателей, модераторов и научных руководителей кафедры.",
          kz: "Кафедра оқытушыларының, модераторларының және ғылыми жетекшілерінің профилі.",
        }}
      />
      <Section>
        <div className="shell grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {liveFaculty.map((member) => <FacultyCard key={member.id} member={member} lang={lang} />)}
        </div>
      </Section>
    </>
  );
}

export function ResearchPage({ lang }: PageProps) {
  const [liveResearchProjects, setLiveResearchProjects] = useState<ResearchProject[]>(researchProjects);

  useEffect(() => {
    fetchResearchProjects()
      .then((items) => {
        if (items.length) setLiveResearchProjects(items);
      })
      .catch(() => setLiveResearchProjects(researchProjects));
  }, []);

  return (
    <>
      <PageIntro
        lang={lang}
        page="research"
        description={{
          ru: "Активные научные проекты с ответственными, сроками, протоколами и заметками прогресса.",
          kz: "Жауаптылар, мерзімдер, протоколдар және ілгерілеу жазбалары бар белсенді ғылыми жобалар.",
        }}
      />
      <Section>
        <div className="shell grid gap-4">
          {liveResearchProjects.map((project) => <ResearchProjectCard key={project.id} project={project} lang={lang} />)}
        </div>
      </Section>
    </>
  );
}

export function CasePage({ lang }: PageProps) {
  const [selected, setSelected] = useState<number | undefined>();
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <>
      <PageIntro
        lang={lang}
        page="case"
        description={{
          ru: "Интерактивный клинический случай с голосованием, дифференциальным диагнозом и учебными выводами.",
          kz: "Дауыс беру, дифференциалды диагноз және оқу тұжырымдары бар интерактивті клиникалық жағдай.",
        }}
      />
      <Section>
        <div className="shell grid gap-6 lg:grid-cols-[1fr_380px]">
          <article className="card p-5">
            <p className="eyebrow">{localize(t.caseDescription, lang)}</p>
            <h2 className="mt-2 text-2xl font-black text-navy-950 dark:text-white">{localize(caseOfWeek.title, lang)}</h2>
            <p className="muted mt-4 text-base">{localize(caseOfWeek.description, lang)}</p>
            <div className="my-6 grid gap-3 sm:grid-cols-2">
              <PlaceholderCard icon={Upload} label={lang === "ru" ? "Изображения и лабораторные данные" : "Суреттер мен зертханалық деректер"} />
              <PlaceholderCard icon={LineChart} label={lang === "ru" ? "Динамика состояния" : "Жағдай динамикасы"} />
            </div>
            <div className="grid gap-2">
              {caseOfWeek.options.map((option, index) => (
                <button
                  className={`rounded-lg border px-3 py-3 text-left text-sm font-semibold transition ${
                    selected === index
                      ? "border-gold-500 bg-gold-100 text-navy-950 dark:bg-gold-500"
                      : "border-clinic-200 bg-white text-navy-800 hover:border-gold-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                  }`}
                  key={localize(option, lang)}
                  onClick={() => setSelected(index)}
                  type="button"
                >
                  {localize(option, lang)}
                </button>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="primary-button" onClick={() => setShowAnswer(true)} type="button">
                <Send className="h-4 w-4" />
                {selected === undefined ? localize(t.showAnswer, lang) : localize(t.vote, lang)}
              </button>
              <button className="secondary-button" onClick={() => setShowAnswer(!showAnswer)} type="button">
                <ShieldCheck className="h-4 w-4" />
                {localize(t.showAnswer, lang)}
              </button>
            </div>
          </article>
          <aside className="grid content-start gap-4">
            <article className="card p-5">
              <p className="eyebrow">{localize(t.differential, lang)}</p>
              <ul className="mt-4 space-y-2">
                {caseOfWeek.differential.map((item) => (
                  <li className="flex gap-2 text-sm text-navy-800 dark:text-slate-100" key={localize(item, lang)}>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-700 dark:text-gold-300" />
                    {localize(item, lang)}
                  </li>
                ))}
              </ul>
            </article>
            {showAnswer ? (
              <article className="card p-5">
                <p className="eyebrow">{localize(t.finalAnswer, lang)}</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-navy-900 dark:text-slate-100">{localize(caseOfWeek.final, lang)}</p>
                <p className="eyebrow mt-5">{localize(t.learningPoints, lang)}</p>
                <ul className="mt-3 space-y-2">
                  {caseOfWeek.learning.map((item) => (
                    <li className="muted" key={localize(item, lang)}>{localize(item, lang)}</li>
                  ))}
                </ul>
              </article>
            ) : null}
          </aside>
        </div>
      </Section>
    </>
  );
}

export function QuizPage({ lang }: PageProps) {
  const [liveQuizQuestions, setLiveQuizQuestions] = useState<QuizQuestion[]>(quizQuestions);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const score = useMemo(() => liveQuizQuestions.reduce((sum, item) => sum + (answers[item.id] === item.correct ? 1 : 0), 0), [answers, liveQuizQuestions]);
  const answered = Object.keys(answers).length;

  useEffect(() => {
    fetchQuizQuestions()
      .then((items) => {
        if (items.length) setLiveQuizQuestions(items);
      })
      .catch(() => setLiveQuizQuestions(quizQuestions));
  }, []);

  return (
    <>
      <PageIntro
        lang={lang}
        page="quiz"
        description={{
          ru: "Еженедельный тест из 10 вопросов для самопроверки и рейтинга активности.",
          kz: "Өзін-өзі тексеру және белсенділік рейтингіне арналған 10 сұрақтық апталық тест.",
        }}
      />
      <Section>
        <div className="shell grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-4">
            {liveQuizQuestions.map((question, index) => (
              <QuizQuestionBlock
                key={question.id}
                question={question}
                index={index}
                selected={answers[question.id]}
                lang={lang}
                onSelect={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
              />
            ))}
          </div>
          <aside className="card self-start p-5">
            <p className="eyebrow">{localize(t.quizResult, lang)}</p>
            <p className="mt-2 text-4xl font-black text-navy-950 dark:text-white">{score}/{liveQuizQuestions.length}</p>
            <p className="muted mt-2">{answered}/{liveQuizQuestions.length}</p>
            <button className="secondary-button mt-5" onClick={() => setAnswers({})} type="button">
              <RefreshCw className="h-4 w-4" />
              {localize(t.resetQuiz, lang)}
            </button>
            <div className="mt-6">
              <p className="mb-3 font-bold text-navy-950 dark:text-white">{localize(t.leaderboard, lang)}</p>
              <div className="grid gap-2">
                {leaderboard.slice(0, 3).map(({ rank, resident }) => (
                  <div className="flex justify-between rounded-lg bg-clinic-50 p-3 text-sm font-bold dark:bg-white/5" key={resident.id}>
                    <span>{rank}. {resident.name}</span>
                    <span>{resident.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}

function QuizQuestionBlock(props: React.ComponentProps<typeof QuizCard>) {
  return <QuizCard {...props} />;
}

function adminSectionLabel(section: string, lang: Lang) {
  const labels: Record<string, { ru: string; kz: string }> = {
    residents: { ru: "Резиденты", kz: "Резиденттер" },
    faculty: { ru: "Преподаватели", kz: "Оқытушылар" },
    meetings: { ru: "Пятничные встречи", kz: "Жұма кездесулері" },
    topics: { ru: "Назначение тем", kz: "Тақырыптарды бөлу" },
    presentations: { ru: "Презентации", kz: "Презентациялар" },
    library: { ru: "Книги и рекомендации", kz: "Кітаптар мен нұсқаулықтар" },
    news: { ru: "Новости", kz: "Жаңалықтар" },
    comments: { ru: "Комментарии", kz: "Пікірлер" },
    quiz: { ru: "Вопросы тестов", kz: "Тест сұрақтары" },
    research: { ru: "Исследовательские проекты", kz: "Ғылыми жобалар" },
  };

  return labels[section]?.[lang] ?? labels.residents[lang];
}

function adminSectionTable(section: string) {
  const tables: Record<string, string> = {
    residents: "residents",
    faculty: "faculty",
    meetings: "meetings",
    topics: "meetings",
    presentations: "presentations",
    library: "library_items",
    news: "news_posts",
    comments: "comments",
    quiz: "quiz_questions",
    research: "research_projects",
  };

  return tables[section] ?? "residents";
}

function adminSectionHelp(section: string, lang: Lang) {
  if (section === "residents") {
    return lang === "ru"
      ? "Этот раздел уже можно редактировать через форму ниже: войдите администратором и добавьте резидента."
      : "Бұл бөлімді төмендегі форма арқылы өңдеуге болады: әкімші ретінде кіріп, резидент қосыңыз.";
  }

  return lang === "ru"
    ? "Раздел теперь открывается как отдельная вкладка. Таблица уже создана в SQL-схеме; следующий шаг - добавить такую же форму сохранения, как для резидентов."
    : "Бөлім енді жеке қойынды ретінде ашылады. Кесте SQL-схемада бар; келесі қадам - резиденттердегідей сақтау формасын қосу.";
}

export function AdminPage({ lang }: PageProps) {
  return <FullAdminPage lang={lang} />;

  const [activeSection, setActiveSection] = useState("residents");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState("");
  const [residentName, setResidentName] = useState("");
  const [residentYearRu, setResidentYearRu] = useState("1 год резидентуры");
  const [residentYearKz, setResidentYearKz] = useState("1-резидентура жылы");
  const [residentScore, setResidentScore] = useState(80);
  const [residentMessage, setResidentMessage] = useState("");

  useEffect(() => {
    getCurrentUser().then((user) => setCurrentUserEmail(user?.email ?? null));
  }, []);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthMessage(lang === "ru" ? "Выполняю вход..." : "Кіру орындалуда...");

    try {
      const user = await signInAdmin(adminEmail, adminPassword);
      setCurrentUserEmail(user.email ?? adminEmail);
      setAuthMessage(lang === "ru" ? "Вход выполнен" : "Кіру сәтті орындалды");
      setAdminPassword("");
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : lang === "ru" ? "Ошибка входа" : "Кіру қатесі");
    }
  };

  const handleSignOut = async () => {
    await signOutAdmin();
    setCurrentUserEmail(null);
    setAuthMessage(lang === "ru" ? "Вы вышли из аккаунта" : "Аккаунттан шықтыңыз");
  };

  const handleCreateResident = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResidentMessage(lang === "ru" ? "Сохраняю..." : "Сақталуда...");

    try {
      await createResident({
        fullName: residentName,
        residencyYearRu: residentYearRu,
        residencyYearKz: residentYearKz,
        researchInterestsRu: ["Урология"],
        researchInterestsKz: ["Урология"],
        presentationsCompleted: 0,
        upcomingTopicsRu: ["Тема будет назначена"],
        upcomingTopicsKz: ["Тақырып кейін беріледі"],
        publications: 0,
        certificates: 0,
        activityScore: residentScore,
      });
      setResidentName("");
      setResidentScore(80);
      setResidentMessage(
        lang === "ru"
          ? "Резидент добавлен. Откройте раздел Residents, чтобы увидеть данные из Supabase."
          : "Резидент қосылды. Supabase деректерін көру үшін Residents бөлімін ашыңыз.",
      );
    } catch (error) {
      setResidentMessage(error instanceof Error ? error.message : lang === "ru" ? "Ошибка сохранения" : "Сақтау қатесі");
    }
  };

  const blocks = [
    { icon: UsersRound, title: t.admin.residents, action: lang === "ru" ? "Добавить резидента" : "Резидент қосу" },
    { icon: Award, title: t.admin.faculty, action: lang === "ru" ? "Добавить преподавателя" : "Оқытушы қосу" },
    { icon: CalendarDays, title: t.admin.meetings, action: lang === "ru" ? "Создать встречу" : "Кездесу құру" },
    { icon: ClipboardList, title: t.admin.topics, action: lang === "ru" ? "Назначить тему" : "Тақырып беру" },
    { icon: Upload, title: t.admin.presentations, action: lang === "ru" ? "Загрузить доклад" : "Баяндама жүктеу" },
    { icon: BookMarked, title: t.admin.library, action: lang === "ru" ? "Добавить материал" : "Материал қосу" },
    { icon: FilePlus2, title: t.admin.news, action: lang === "ru" ? "Опубликовать новость" : "Жаңалық жариялау" },
    { icon: ListChecks, title: t.admin.quiz, action: lang === "ru" ? "Добавить вопрос" : "Сұрақ қосу" },
  ];

  return (
    <>
      <PageIntro
        lang={lang}
        page="admin"
        description={{
          ru: "Макет админ-панели для управления резидентами, встречами, файлами, новостями, тестами и исследованиями.",
          kz: "Резиденттерді, кездесулерді, файлдарды, жаңалықтарды, тесттерді және зерттеулерді басқаруға арналған әкімші панелі макеті.",
        }}
      />
      <Section>
        <div className="shell">
          <AdminPanelLayout lang={lang} activeSection={activeSection} onSectionChange={setActiveSection}>
            <article className="card mb-4 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-gold-700 dark:text-gold-300" />
                <div>
                  <p className="eyebrow">Admin section</p>
                  <h2 className="text-xl font-black text-navy-950 dark:text-white">
                    {adminSectionLabel(activeSection, lang)}
                  </h2>
                </div>
              </div>
              <p className="muted mt-3">
                {adminSectionHelp(activeSection, lang)}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-clinic-50 p-3 dark:bg-white/5">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-clinic-700 dark:text-slate-300">Supabase table</p>
                  <p className="mt-1 font-mono text-sm font-bold text-navy-950 dark:text-white">{adminSectionTable(activeSection)}</p>
                </div>
                <div className="rounded-lg bg-clinic-50 p-3 dark:bg-white/5">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-clinic-700 dark:text-slate-300">
                    {lang === "ru" ? "Статус" : "Мәртебе"}
                  </p>
                  <p className="mt-1 text-sm font-bold text-navy-950 dark:text-white">
                    {activeSection === "residents"
                      ? lang === "ru"
                        ? "Сохранение уже подключено"
                        : "Сақтау қосылған"
                      : lang === "ru"
                        ? "Вкладка открывается, форма сохранения следующая"
                        : "Қойынды ашылады, сақтау формасы келесі"}
                  </p>
                </div>
              </div>
            </article>
            <div className="mb-4 grid gap-4 lg:grid-cols-[360px_1fr]">
              <article className="card p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-gold-700 dark:text-gold-300" />
                  <h3 className="font-bold text-navy-950 dark:text-white">
                    {lang === "ru" ? "Вход администратора" : "Әкімші кіруі"}
                  </h3>
                </div>
                {currentUserEmail ? (
                  <div className="mt-4">
                    <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
                      {lang === "ru" ? "Вы вошли как" : "Сіз кірдіңіз"} {currentUserEmail}
                    </p>
                    <button className="secondary-button mt-3" onClick={handleSignOut} type="button">
                      {lang === "ru" ? "Выйти" : "Шығу"}
                    </button>
                  </div>
                ) : (
                  <form className="mt-4 grid gap-3" onSubmit={handleSignIn}>
                    <input
                      className="field"
                      onChange={(event) => setAdminEmail(event.target.value)}
                      placeholder="admin@example.com"
                      type="email"
                      value={adminEmail}
                    />
                    <input
                      className="field"
                      onChange={(event) => setAdminPassword(event.target.value)}
                      placeholder={lang === "ru" ? "Пароль" : "Құпиясөз"}
                      type="password"
                      value={adminPassword}
                    />
                    <button className="primary-button" type="submit">
                      <ShieldCheck className="h-4 w-4" />
                      {lang === "ru" ? "Войти" : "Кіру"}
                    </button>
                  </form>
                )}
                {authMessage ? <p className="muted mt-3">{authMessage}</p> : null}
              </article>

              <article className="card p-5">
                <div className="flex items-center gap-3">
                  <UsersRound className="h-5 w-5 text-gold-700 dark:text-gold-300" />
                  <h3 className="font-bold text-navy-950 dark:text-white">
                    {lang === "ru" ? "Добавить резидента в Supabase" : "Supabase ішіне резидент қосу"}
                  </h3>
                </div>
                <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleCreateResident}>
                  <input
                    className="field md:col-span-2"
                    disabled={!currentUserEmail}
                    onChange={(event) => setResidentName(event.target.value)}
                    placeholder={lang === "ru" ? "ФИО резидента" : "Резиденттің аты-жөні"}
                    required
                    value={residentName}
                  />
                  <input
                    className="field"
                    disabled={!currentUserEmail}
                    onChange={(event) => setResidentYearRu(event.target.value)}
                    placeholder="2 год резидентуры"
                    required
                    value={residentYearRu}
                  />
                  <input
                    className="field"
                    disabled={!currentUserEmail}
                    onChange={(event) => setResidentYearKz(event.target.value)}
                    placeholder="2-резидентура жылы"
                    required
                    value={residentYearKz}
                  />
                  <label className="grid gap-1 text-sm font-semibold text-navy-900 dark:text-slate-100">
                    {localize(t.activityScore, lang)}
                    <input
                      className="field"
                      disabled={!currentUserEmail}
                      max={100}
                      min={0}
                      onChange={(event) => setResidentScore(Number(event.target.value))}
                      type="number"
                      value={residentScore}
                    />
                  </label>
                  <button className="primary-button self-end" disabled={!currentUserEmail} type="submit">
                    <Plus className="h-4 w-4" />
                    {lang === "ru" ? "Сохранить" : "Сақтау"}
                  </button>
                </form>
                {!currentUserEmail ? (
                  <p className="muted mt-3">
                    {lang === "ru"
                      ? "Сначала войдите администратором. Пользователя нужно создать в Supabase Authentication."
                      : "Алдымен әкімші ретінде кіріңіз. Пайдаланушыны Supabase Authentication ішінде құру керек."}
                  </p>
                ) : null}
                {residentMessage ? <p className="muted mt-3">{residentMessage}</p> : null}
              </article>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {blocks.map(({ icon: Icon, title, action }) => (
                <article className="card p-5" key={localize(title, lang)}>
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gold-700 dark:text-gold-300" />
                    <h3 className="font-bold text-navy-950 dark:text-white">{localize(title, lang)}</h3>
                  </div>
                  <div className="mt-4 grid gap-3">
                    <input className="field" placeholder={lang === "ru" ? "Название / ФИО" : "Атауы / аты-жөні"} />
                    <textarea className="field min-h-24 resize-y" placeholder={lang === "ru" ? "Описание, заметки, ссылки" : "Сипаттама, жазбалар, сілтемелер"} />
                    <button className="primary-button" type="button">
                      <Plus className="h-4 w-4" />
                      {action}
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <article className="card mt-4 p-5">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-gold-700 dark:text-gold-300" />
                <h3 className="font-bold text-navy-950 dark:text-white">{localize(t.admin.research, lang)}</h3>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                {researchProjects.map((project) => (
                  <div className="rounded-lg bg-clinic-50 p-4 dark:bg-white/5" key={project.id}>
                    <p className="text-sm font-bold text-navy-950 dark:text-white">{localize(project.title, lang)}</p>
                    <p className="muted mt-2">{localize(project.status, lang)}</p>
                  </div>
                ))}
              </div>
            </article>
          </AdminPanelLayout>
        </div>
      </Section>
    </>
  );
}
