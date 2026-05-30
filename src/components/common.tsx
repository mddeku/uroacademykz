import {
  Archive,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  FileText,
  Filter,
  GraduationCap,
  LibraryBig,
  Menu,
  MessageSquare,
  Moon,
  Newspaper,
  PanelLeft,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Tags,
  Upload,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { languages, navItems, t } from "../i18n";
import type {
  Faculty,
  Lang,
  LibraryItem,
  LocalizedString,
  Meeting,
  NavItem,
  NewsPost,
  PageId,
  Presentation,
  Resident,
  ResearchProject,
  SearchItem,
  Stat,
} from "../types";

export const localize = (value: LocalizedString, lang: Lang) => value[lang];

export function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`py-10 sm:py-14 ${className}`}>{children}</section>;
}

export function SectionTitle({
  kicker,
  title,
  description,
}: {
  kicker?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 max-w-3xl">
      {kicker ? <p className="eyebrow mb-2">{kicker}</p> : null}
      <h2 className="text-2xl font-semibold text-navy-950 dark:text-white sm:text-3xl">{title}</h2>
      {description ? <p className="muted mt-3 text-base">{description}</p> : null}
    </div>
  );
}

function LanguageSwitcher({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  return (
    <div className="grid w-[92px] shrink-0 grid-cols-2 rounded-lg border border-clinic-200 bg-clinic-50 p-1 dark:border-white/10 dark:bg-white/5">
      {(Object.keys(languages) as Lang[]).map((item) => (
        <button
          key={item}
          aria-pressed={lang === item}
          className={`min-w-0 rounded-md px-2 py-1.5 text-xs font-bold transition ${
            lang === item
              ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
              : "text-clinic-700 hover:text-navy-900 dark:text-slate-300 dark:hover:text-white"
          }`}
          onClick={() => setLang(item)}
          type="button"
        >
          {languages[item]}
        </button>
      ))}
    </div>
  );
}

function NavButton({
  item,
  active,
  lang,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  lang: Lang;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
        active
          ? "bg-navy-800 text-white dark:bg-gold-500 dark:text-navy-950"
          : "text-clinic-700 hover:bg-clinic-100 hover:text-navy-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="hidden xl:inline">{localize(item.label, lang)}</span>
      <span className="xl:hidden">{localize(item.shortLabel, lang)}</span>
    </button>
  );
}

export function Navbar({
  page,
  lang,
  darkMode,
  query,
  searchResults,
  onNavigate,
  setLang,
  setDarkMode,
  setQuery,
}: {
  page: PageId;
  lang: Lang;
  darkMode: boolean;
  query: string;
  searchResults: SearchItem[];
  onNavigate: (page: PageId) => void;
  setLang: (lang: Lang) => void;
  setDarkMode: (value: boolean) => void;
  setQuery: (query: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleResults = query.trim().length >= 2;

  return (
    <header className="sticky top-0 z-50 border-b border-clinic-200/80 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-navy-950/90">
      <div className="shell">
        <div className="grid min-h-16 grid-cols-[160px_minmax(0,1fr)_auto] items-center gap-3 xl:grid-cols-[190px_minmax(0,1fr)_auto]">
          <button
            className="flex min-w-0 shrink-0 items-center gap-2 overflow-hidden text-left"
            onClick={() => onNavigate("home")}
            type="button"
            aria-label={t.appName}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-white dark:bg-gold-500 dark:text-navy-950">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-black text-navy-950 dark:text-white">{t.appName}</span>
              <span className="block truncate text-xs font-medium text-clinic-700 dark:text-slate-300">
                {lang === "ru" ? "Urology Journal Club" : "Urology Journal Club"}
              </span>
            </span>
          </button>

          <nav className="hidden min-w-0 items-center gap-1 overflow-x-auto px-1 lg:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavButton
                key={item.id}
                active={page === item.id}
                item={item}
                lang={lang}
                onClick={() => onNavigate(item.id)}
              />
            ))}
          </nav>

          <div className="hidden w-56 shrink-0 2xl:w-72 lg:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-clinic-700 dark:text-slate-300" />
              <input
                aria-label={localize(t.searchPlaceholder, lang)}
                className="field pl-9"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={localize(t.searchPlaceholder, lang)}
                value={query}
              />
              {visibleResults ? (
                <SearchPanel lang={lang} results={searchResults} onNavigate={onNavigate} setQuery={setQuery} />
              ) : null}
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <LanguageSwitcher lang={lang} setLang={setLang} />
            <button
              aria-label={darkMode ? "Light mode" : "Dark mode"}
              className="icon-button"
              onClick={() => setDarkMode(!darkMode)}
              type="button"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          <button className="icon-button justify-self-end lg:hidden" onClick={() => setMenuOpen(!menuOpen)} type="button">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-clinic-200 py-4 dark:border-white/10 lg:hidden">
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-clinic-700 dark:text-slate-300" />
              <input
                aria-label={localize(t.searchPlaceholder, lang)}
                className="field pl-9"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={localize(t.searchPlaceholder, lang)}
                value={query}
              />
              {visibleResults ? (
                <SearchPanel lang={lang} results={searchResults} onNavigate={onNavigate} setQuery={setQuery} />
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {navItems.map((item) => (
                <NavButton
                  key={item.id}
                  active={page === item.id}
                  item={item}
                  lang={lang}
                  onClick={() => {
                    onNavigate(item.id);
                    setMenuOpen(false);
                  }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <LanguageSwitcher lang={lang} setLang={setLang} />
              <button
                aria-label={darkMode ? "Light mode" : "Dark mode"}
                className="icon-button"
                onClick={() => setDarkMode(!darkMode)}
                type="button"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function SearchPanel({
  lang,
  results,
  onNavigate,
  setQuery,
}: {
  lang: Lang;
  results: SearchItem[];
  onNavigate: (page: PageId) => void;
  setQuery: (query: string) => void;
}) {
  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-auto rounded-lg border border-clinic-200 bg-white p-2 shadow-lift dark:border-white/10 dark:bg-navy-900">
      {results.length ? (
        results.map((item, index) => (
          <button
            className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-clinic-50 dark:hover:bg-white/5"
            key={`${item.page}-${index}`}
            onClick={() => {
              onNavigate(item.page);
              setQuery("");
            }}
            type="button"
          >
            <span className="tag mb-1">{localize(item.type, lang)}</span>
            <span className="block text-sm font-semibold text-navy-950 dark:text-white">{localize(item.title, lang)}</span>
            <span className="muted line-clamp-2">{localize(item.description, lang)}</span>
          </button>
        ))
      ) : (
        <p className="muted px-3 py-4">{localize(t.noResults, lang)}</p>
      )}
    </div>
  );
}

export function Hero({
  lang,
  countdown,
  meeting,
  onNavigate,
}: {
  lang: Lang;
  countdown: string;
  meeting: Meeting;
  onNavigate: (page: PageId) => void;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-950 text-white">
      <img
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-55"
        src="/hero-journal-club.png"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/75 to-navy-900/30" />
      <div className="shell relative grid min-h-[620px] items-center gap-8 py-16 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">{localize(t.slogan, lang)}</p>
          <h1 className="max-w-2xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{t.appName}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-100 sm:text-xl">{localize(t.department, lang)}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="primary-button bg-gold-500 text-navy-950 hover:bg-gold-300" onClick={() => onNavigate("journal")} type="button">
              <CalendarDays className="h-4 w-4" />
              {localize(t.upcomingJournal, lang)}
            </button>
            <button className="secondary-button border-white/25 bg-white/10 text-white hover:border-gold-300 hover:text-gold-100" onClick={() => onNavigate("academy")} type="button">
              <BookOpen className="h-4 w-4" />
              {localize(navItems.find((item) => item.id === "academy")!.label, lang)}
            </button>
          </div>
        </div>

        <article className="rounded-lg border border-white/20 bg-white/90 p-5 text-navy-950 shadow-lift backdrop-blur dark:bg-navy-900/90 dark:text-white">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{localize(t.upcomingJournal, lang)}</p>
              <h2 className="mt-2 text-xl font-bold">{localize(meeting.topic, lang)}</h2>
            </div>
            <span className="tag border-gold-300 bg-gold-100 text-gold-700">{meeting.date}</span>
          </div>
          <dl className="space-y-3">
            <Detail label={localize(t.presenter, lang)} value={meeting.presenter} />
            <Detail label={localize(t.moderator, lang)} value={meeting.moderator} />
            <Detail label={localize(t.room, lang)} value={localize(meeting.room, lang)} />
          </dl>
          <div className="mt-5 rounded-lg bg-navy-800 p-4 text-white dark:bg-white/10">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-300">{localize(t.nextFriday, lang)}</p>
            <p className="mt-2 text-2xl font-black">{countdown}</p>
          </div>
        </article>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 text-sm">
      <dt className="font-semibold text-clinic-700 dark:text-slate-300">{label}</dt>
      <dd className="font-semibold text-navy-950 dark:text-white">{value}</dd>
    </div>
  );
}

export function StatsCard({ stat, lang }: { stat: Stat; lang: Lang }) {
  return (
    <article className="card p-5">
      <p className="text-3xl font-black text-navy-950 dark:text-white">{stat.value}</p>
      <h3 className="mt-2 font-semibold text-navy-900 dark:text-slate-50">{localize(stat.label, lang)}</h3>
      <p className="muted mt-1">{localize(stat.detail, lang)}</p>
    </article>
  );
}

export function JournalClubCard({ meeting, lang }: { meeting: Meeting; lang: Lang }) {
  const statusText = meeting.status === "upcoming" ? localize(t.upcoming, lang) : localize(t.completed, lang);

  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="tag">{meeting.date} - {meeting.time}</span>
          <h3 className="mt-3 text-lg font-bold text-navy-950 dark:text-white">{localize(meeting.topic, lang)}</h3>
        </div>
        <span className={`tag ${meeting.status === "upcoming" ? "border-gold-300 bg-gold-100 text-gold-700" : ""}`}>
          {statusText}
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Info icon={UserRound} label={localize(t.presenter, lang)} value={meeting.presenter} />
        <Info icon={ShieldCheck} label={localize(t.moderator, lang)} value={meeting.moderator} />
        <Info icon={CalendarDays} label={localize(t.room, lang)} value={localize(meeting.room, lang)} />
        <Info icon={FileText} label={localize(t.article, lang)} value={meeting.articleLink} />
      </div>
      <p className="muted mt-4">{localize(meeting.notes, lang)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="tag"><Download className="mr-1.5 h-3.5 w-3.5" />{meeting.presentationFile}</span>
        <span className="tag"><MessageSquare className="mr-1.5 h-3.5 w-3.5" />{localize(t.notes, lang)}</span>
      </div>
    </article>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg bg-clinic-50 p-3 dark:bg-white/5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-700 dark:text-gold-300" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-clinic-700 dark:text-slate-400">{label}</p>
        <p className="truncate text-sm font-semibold text-navy-950 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export function PresentationCard({ item, lang, onPreview }: { item: Presentation; lang: Lang; onPreview?: (item: Presentation) => void }) {
  const fileUrl = item.pdfUrl || item.slidesUrl || "";
  const previewLabel = fileUrl
    ? localize(t.pdfPlaceholder, lang)
    : lang === "ru"
      ? "Файл доклада пока не загружен"
      : "Баяндама файлы әлі жүктелмеген";

  const handlePreview = () => {
    if (!fileUrl) return;
    if (onPreview) {
      onPreview(item);
      return;
    }
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <article className="card flex h-full flex-col p-5">
      <div className="flex flex-wrap gap-2">
        <span className="tag">{item.date}</span>
        <span className="tag">{localize(item.category, lang)}</span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-navy-950 dark:text-white">{localize(item.title, lang)}</h3>
      <p className="muted mt-2">{localize(item.abstract, lang)}</p>
      <div className="mt-4 grid gap-2 text-sm">
        <Detail label={localize(t.presenter, lang)} value={item.presenter} />
        <Detail label={localize(t.supervisor, lang)} value={item.supervisor} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span className="tag" key={tag}><Tags className="mr-1.5 h-3.5 w-3.5" />{tag}</span>
        ))}
      </div>
      <div className="mt-5">
        <button className="secondary-button w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={!fileUrl} onClick={handlePreview} type="button">
          <FileText className="h-4 w-4" />
          {previewLabel}
        </button>
      </div>
    </article>
  );
}

export function NewsCard({ post, lang, onOpen }: { post: NewsPost; lang: Lang; onOpen?: (post: NewsPost) => void }) {
  return (
    <article className="card flex h-full flex-col p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="tag">{post.category}</span>
        <span className="muted">{post.date}</span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-navy-950 dark:text-white">{localize(post.title, lang)}</h3>
      <p className="muted mt-2">{localize(post.summary, lang)}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <span className="tag"><Newspaper className="mr-1.5 h-3.5 w-3.5" />{post.author}</span>
        {post.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
      </div>
      <button className="primary-button mt-5 disabled:hidden" disabled={!onOpen} onClick={() => onOpen?.(post)} type="button">
        <span>{lang === "ru" ? "Читать полностью" : "Толық оқу"}</span>
        <span className="hidden">
        {lang === "ru" ? "Читать полностью" : "Толық оқу"}
        </span>
      </button>
    </article>
  );
}

export function LibraryCard({ item, lang }: { item: LibraryItem; lang: Lang }) {
  return (
    <article className="card flex h-full flex-col p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800 text-white dark:bg-gold-500 dark:text-navy-950">
          <LibraryBig className="h-5 w-5" />
        </span>
        <div>
          <span className="tag">{localize(item.category, lang)}</span>
        </div>
      </div>
      <h3 className="mt-4 text-lg font-bold text-navy-950 dark:text-white">{localize(item.title, lang)}</h3>
      <p className="muted mt-1">{item.author} - {item.year}</p>
      <p className="muted mt-3">{localize(item.description, lang)}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <span className="tag"><Upload className="mr-1.5 h-3.5 w-3.5" />{item.link}</span>
        {item.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
      </div>
    </article>
  );
}

export function ResidentCard({ resident, lang }: { resident: Resident; lang: Lang }) {
  const initials = resident.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <article className="card p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-navy-800 to-gold-500 text-lg font-black text-white">
          {initials}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-navy-950 dark:text-white">{resident.name}</h3>
          <p className="muted">{localize(resident.year, lang)}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <Metric value={resident.presentations} label={localize(t.presentationsDone, lang)} />
        <Metric value={resident.publications} label={localize(t.publications, lang)} />
        <Metric value={resident.certificates} label={localize(t.certificates, lang)} />
      </div>
      <div className="mt-5">
        <p className="text-sm font-bold text-navy-950 dark:text-white">{localize(t.researchInterests, lang)}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {resident.interests.map((interest) => <span className="tag" key={localize(interest, lang)}>{localize(interest, lang)}</span>)}
        </div>
      </div>
      <div className="mt-5">
        <p className="text-sm font-bold text-navy-950 dark:text-white">{localize(t.upcomingTopics, lang)}</p>
        <p className="muted mt-2">{resident.upcoming.map((topic) => localize(topic, lang)).join(", ")}</p>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm font-semibold text-navy-950 dark:text-white">
          <span>{localize(t.activityScore, lang)}</span>
          <span>{resident.score}</span>
        </div>
        <div className="h-2 rounded-lg bg-clinic-100 dark:bg-white/10">
          <div className="h-2 rounded-lg bg-gold-500" style={{ width: `${resident.score}%` }} />
        </div>
      </div>
    </article>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg bg-clinic-50 p-3 dark:bg-white/5">
      <p className="text-lg font-black text-navy-950 dark:text-white">{value}</p>
      <p className="text-[11px] font-semibold text-clinic-700 dark:text-slate-300">{label}</p>
    </div>
  );
}

export function FacultyCard({ member, lang }: { member: Faculty; lang: Lang }) {
  const initials = member.name
    .replace("проф.", "")
    .replace("д-р", "")
    .trim()
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <article className="card p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-navy-800 text-lg font-black text-white dark:bg-gold-500 dark:text-navy-950">
          {initials}
        </div>
        <div>
          <h3 className="text-lg font-bold text-navy-950 dark:text-white">{member.name}</h3>
          <p className="muted">{localize(member.degree, lang)}</p>
          <p className="mt-1 text-sm font-semibold text-gold-700 dark:text-gold-300">{localize(member.position, lang)}</p>
        </div>
      </div>
      <p className="muted mt-4">{localize(member.bio, lang)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {member.expertise.map((item) => <span className="tag" key={localize(item, lang)}>{localize(item, lang)}</span>)}
      </div>
      <p className="mt-4 text-sm font-semibold text-navy-800 dark:text-slate-100">{member.contact}</p>
    </article>
  );
}

export function ResearchProjectCard({ project, lang }: { project: ResearchProject; lang: Lang }) {
  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="max-w-2xl text-lg font-bold text-navy-950 dark:text-white">{localize(project.title, lang)}</h3>
        <span className="tag border-gold-300 bg-gold-100 text-gold-700">{localize(project.status, lang)}</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Info icon={UserRound} label={localize(t.principalInvestigator, lang)} value={project.investigator} />
        <Info icon={UsersRound} label={localize(t.residentsInvolved, lang)} value={project.residents.join(", ")} />
        <Info icon={Clock} label={localize(t.deadline, lang)} value={project.deadline} />
        <Info icon={FileText} label={localize(t.protocol, lang)} value={project.protocol} />
      </div>
      <p className="muted mt-4">{localize(project.progress, lang)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.related.map((item) => <span className="tag" key={localize(item, lang)}>{localize(item, lang)}</span>)}
      </div>
    </article>
  );
}

export function QuizCard({
  question,
  index,
  selected,
  lang,
  onSelect,
}: {
  question: {
    id: string;
    question: LocalizedString;
    options: LocalizedString[];
    correct: number;
    explanation: LocalizedString;
  };
  index: number;
  selected?: number;
  lang: Lang;
  onSelect: (value: number) => void;
}) {
  return (
    <article className="card p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-sm font-black text-white dark:bg-gold-500 dark:text-navy-950">
          {index + 1}
        </span>
        <h3 className="text-base font-bold text-navy-950 dark:text-white">{localize(question.question, lang)}</h3>
      </div>
      <div className="grid gap-2">
        {question.options.map((option, optionIndex) => {
          const isSelected = selected === optionIndex;
          return (
            <button
              className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
                isSelected
                  ? "border-gold-500 bg-gold-100 text-navy-950 dark:bg-gold-500 dark:text-navy-950"
                  : "border-clinic-200 bg-white text-navy-800 hover:border-gold-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              }`}
              key={localize(option, lang)}
              onClick={() => onSelect(optionIndex)}
              type="button"
            >
              {localize(option, lang)}
            </button>
          );
        })}
      </div>
      {selected !== undefined ? (
        <p className="muted mt-3">
          {selected === question.correct ? <CheckCircle2 className="mr-1 inline h-4 w-4 text-emerald-600" /> : null}
          {localize(question.explanation, lang)}
        </p>
      ) : null}
    </article>
  );
}

export function AdminPanelLayout({
  lang,
  activeSection,
  onSectionChange,
  children,
}: {
  lang: Lang;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  children: React.ReactNode;
}) {
  const items = Object.entries(t.admin);
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="card p-4">
        <div className="mb-4 flex items-center gap-2 font-bold text-navy-950 dark:text-white">
          <PanelLeft className="h-5 w-5 text-gold-700 dark:text-gold-300" />
          {localize(navItems.find((item) => item.id === "admin")!.label, lang)}
        </div>
        <div className="grid gap-2">
          {items.map(([key, item]) => (
            <button
              className={`secondary-button justify-start ${activeSection === key ? "border-gold-500 text-gold-700 dark:text-gold-300" : ""}`}
              key={key}
              onClick={() => onSectionChange?.(key)}
              type="button"
            >
              <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
              {localize(item, lang)}
            </button>
          ))}
        </div>
      </aside>
      <div>{children}</div>
    </div>
  );
}

export function FilterBar({
  lang,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  return (
    <div className="card mb-6 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-navy-950 dark:text-white">
        <Filter className="h-4 w-4 text-gold-700 dark:text-gold-300" />
        {localize(t.filters, lang)}
      </div>
      <div className="grid gap-3 md:grid-cols-4">{children}</div>
    </div>
  );
}

export function PlaceholderCard({ icon: Icon, label }: { icon: typeof Upload; label: string }) {
  return (
    <button
      className="flex min-h-20 w-full items-center gap-3 rounded-lg border border-dashed border-clinic-200 bg-clinic-50 p-3 text-left text-sm font-semibold text-clinic-700 transition hover:border-gold-500 hover:bg-white hover:text-gold-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-gold-300"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("uroacademy-placeholder-action", { detail: label }));
        window.alert(label);
      }}
      type="button"
    >
      <Icon className="h-5 w-5 shrink-0 text-gold-700 dark:text-gold-300" />
      {label}
    </button>
  );
}

export function QuickLinkGrid({
  lang,
  onNavigate,
}: {
  lang: Lang;
  onNavigate: (page: PageId) => void;
}) {
  const links: { page: PageId; icon: typeof Archive }[] = [
    { page: "academy", icon: BookOpen },
    { page: "archive", icon: Archive },
    { page: "library", icon: LibraryBig },
    { page: "journal", icon: CalendarDays },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {links.map(({ page, icon: Icon }) => {
        const nav = navItems.find((item) => item.id === page)!;
        return (
          <button className="card group flex items-center justify-between p-5 text-left" key={page} onClick={() => onNavigate(page)} type="button">
            <span>
              <Icon className="mb-4 h-6 w-6 text-gold-700 dark:text-gold-300" />
              <span className="block font-bold text-navy-950 dark:text-white">{localize(nav.label, lang)}</span>
            </span>
            <ArrowRight className="h-5 w-5 text-clinic-700 transition group-hover:translate-x-1 group-hover:text-gold-700 dark:text-slate-400 dark:group-hover:text-gold-300" />
          </button>
        );
      })}
    </div>
  );
}

export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="border-t border-clinic-200 bg-white py-10 dark:border-white/10 dark:bg-navy-950">
      <div className="shell flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-black text-navy-950 dark:text-white">{t.appName}</p>
          <p className="muted mt-1 max-w-2xl">{localize(t.footer, lang)}</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-clinic-700 dark:text-slate-300">
          <BarChart3 className="h-4 w-4 text-gold-700 dark:text-gold-300" />
          2026
        </div>
      </div>
    </footer>
  );
}

export function useFilteredSearch(items: SearchItem[], query: string, lang: Lang) {
  return useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized.length < 2) return [];
    return items
      .filter((item) => {
        const haystack = `${localize(item.title, lang)} ${localize(item.description, lang)} ${localize(item.type, lang)}`.toLowerCase();
        return haystack.includes(normalized);
      })
      .slice(0, 8);
  }, [items, lang, query]);
}

export const IconSparkles = Sparkles;
