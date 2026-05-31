import { useEffect, useMemo, useState } from "react";
import { meetings, searchItems } from "./data";
import { Footer, Navbar, useFilteredSearch } from "./components/common";
import { getCurrentUser } from "./lib/auth";
import type { Lang, Meeting, PageId } from "./types";
import {
  AcademyPage,
  AdminPage,
  ArchivePage,
  CasePage,
  FacultyPage,
  HomePage,
  JournalPage,
  LibraryPage,
  NewsPage,
  QuizPage,
  ResearchPage,
  ResidentsPage,
} from "./pages/Pages";

function getNextMeeting(): Meeting {
  const now = new Date();
  const upcoming = meetings
    .filter((meeting) => new Date(`${meeting.date}T${meeting.time}:00`).getTime() >= now.getTime())
    .sort((a, b) => new Date(`${a.date}T${a.time}:00`).getTime() - new Date(`${b.date}T${b.time}:00`).getTime());

  return upcoming[0] ?? meetings[0];
}

function formatCountdown(target: Meeting, lang: Lang) {
  const targetDate = new Date(`${target.date}T${target.time}:00`);
  const diff = Math.max(0, targetDate.getTime() - Date.now());
  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return lang === "ru"
    ? `${days} д ${hours} ч ${minutes} мин`
    : `${days} к ${hours} сағ ${minutes} мин`;
}

export default function App() {
  const [lang, setLang] = useState<Lang>("ru");
  const [page, setPage] = useState<PageId>("home");
  const [darkMode, setDarkMode] = useState(false);
  const [query, setQuery] = useState("");
  const [clock, setClock] = useState(Date.now());
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const nextMeeting = useMemo(getNextMeeting, [clock]);
  const searchResults = useFilteredSearch(searchItems, query, lang);
  const countdown = useMemo(() => formatCountdown(nextMeeting, lang), [clock, lang, nextMeeting]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "ru" ? "ru" : "kk";
  }, [lang]);

  useEffect(() => {
    getCurrentUser().then((user) => setCurrentUserEmail(user?.email ?? null));
  }, []);

  const navigate = (nextPage: PageId) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const props = { lang, countdown, nextMeeting, onNavigate: navigate };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-clinic-50 text-navy-900 dark:bg-navy-950 dark:text-slate-100">
        <Navbar
          page={page}
          lang={lang}
          darkMode={darkMode}
          currentUserEmail={currentUserEmail}
          query={query}
          searchResults={searchResults}
          onNavigate={navigate}
          setLang={setLang}
          setDarkMode={setDarkMode}
          setQuery={setQuery}
        />
        <main>
          {page === "home" ? <HomePage {...props} /> : null}
          {page === "journal" ? <JournalPage {...props} /> : null}
          {page === "academy" ? <AcademyPage {...props} /> : null}
          {page === "archive" ? <ArchivePage {...props} /> : null}
          {page === "news" ? <NewsPage {...props} /> : null}
          {page === "library" ? <LibraryPage {...props} /> : null}
          {page === "residents" ? <ResidentsPage {...props} /> : null}
          {page === "faculty" ? <FacultyPage {...props} /> : null}
          {page === "research" ? <ResearchPage {...props} /> : null}
          {page === "case" ? <CasePage {...props} /> : null}
          {page === "quiz" ? <QuizPage {...props} /> : null}
          {page === "admin" ? <AdminPage {...props} /> : null}
        </main>
        <Footer lang={lang} />
      </div>
    </div>
  );
}
