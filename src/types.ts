import type { LucideIcon } from "lucide-react";

export type Lang = "ru" | "kz";

export type LocalizedString = Record<Lang, string>;

export type PageId =
  | "home"
  | "journal"
  | "academy"
  | "archive"
  | "news"
  | "library"
  | "residents"
  | "faculty"
  | "research"
  | "case"
  | "quiz"
  | "admin";

export type NavItem = {
  id: PageId;
  label: LocalizedString;
  shortLabel: LocalizedString;
};

export type Stat = {
  label: LocalizedString;
  value: string;
  detail: LocalizedString;
};

export type Meeting = {
  id: string;
  date: string;
  time: string;
  topic: LocalizedString;
  presenter: string;
  moderator: string;
  room: LocalizedString;
  status: "upcoming" | "completed";
  articleLink: string;
  presentationFile: string;
  notes: LocalizedString;
};

export type Presentation = {
  id: string;
  title: LocalizedString;
  presenter: string;
  supervisor: string;
  date: string;
  year: string;
  category: LocalizedString;
  abstract: LocalizedString;
  keyPoints: LocalizedString[];
  tags: string[];
  slidesUrl?: string;
  pdfUrl?: string;
};

export type NewsPost = {
  id: string;
  title: LocalizedString;
  author: string;
  date: string;
  category: string;
  summary: LocalizedString;
  body: LocalizedString;
  tags: string[];
};

export type LibraryItem = {
  id: string;
  title: LocalizedString;
  author: string;
  year: string;
  category: LocalizedString;
  section: "books" | "guidelines" | "papers" | "images" | "links";
  description: LocalizedString;
  tags: string[];
  link: string;
};

export type Resident = {
  id: string;
  name: string;
  year: LocalizedString;
  interests: LocalizedString[];
  presentations: number;
  upcoming: LocalizedString[];
  publications: number;
  certificates: number;
  score: number;
};

export type Faculty = {
  id: string;
  name: string;
  degree: LocalizedString;
  position: LocalizedString;
  expertise: LocalizedString[];
  bio: LocalizedString;
  contact: string;
};

export type ResearchProject = {
  id: string;
  title: LocalizedString;
  investigator: string;
  residents: string[];
  status: LocalizedString;
  deadline: string;
  protocol: string;
  related: LocalizedString[];
  progress: LocalizedString;
};

export type LearningModule = {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  lessons: LocalizedString[];
  icon: LucideIcon;
};

export type QuizQuestion = {
  id: string;
  question: LocalizedString;
  options: LocalizedString[];
  correct: number;
  explanation: LocalizedString;
};

export type SearchItem = {
  page: PageId;
  title: LocalizedString;
  description: LocalizedString;
  type: LocalizedString;
};
