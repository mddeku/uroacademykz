import { supabase } from "./supabase";
import type { ClinicalCase, Faculty, LibraryItem, Meeting, NewsPost, Presentation, QuizQuestion, ResearchProject } from "../types";

const localizedArray = (ru?: string[] | null, kz?: string[] | null) =>
  Array.from({ length: Math.max(ru?.length ?? 0, kz?.length ?? 0) }, (_, index) => ({
    ru: ru?.[index] ?? kz?.[index] ?? "",
    kz: kz?.[index] ?? ru?.[index] ?? "",
  })).filter((item) => item.ru || item.kz);

export async function fetchMeetings(): Promise<Meeting[]> {
  const { data, error } = await supabase.from("meetings").select("*").order("meeting_date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    date: row.meeting_date,
    time: String(row.meeting_time ?? "").slice(0, 5),
    topic: { ru: row.topic_ru, kz: row.topic_kz },
    presenter: row.presenter,
    moderator: row.moderator,
    room: { ru: row.room_ru, kz: row.room_kz },
    status: row.status,
    articleLink: row.article_link ?? "",
    presentationFile: row.presentation_file ?? "",
    notes: { ru: row.notes_ru ?? "", kz: row.notes_kz ?? "" },
  }));
}

export async function fetchPresentations(): Promise<Presentation[]> {
  const { data, error } = await supabase.from("presentations").select("*").order("presentation_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    title: { ru: row.title_ru, kz: row.title_kz },
    presenter: row.presenter,
    supervisor: row.supervisor ?? "",
    date: row.presentation_date,
    year: row.year,
    category: { ru: row.category_ru, kz: row.category_kz },
    abstract: { ru: row.abstract_ru ?? "", kz: row.abstract_kz ?? "" },
    keyPoints: localizedArray(row.key_points_ru, row.key_points_kz),
    tags: row.tags ?? [],
    slidesUrl: row.slides_url ?? "",
    pdfUrl: row.pdf_url ?? "",
    discussionNotes: row.discussion_notes ?? "",
    referencesText: row.references_text ?? "",
  }));
}

export async function fetchNewsPosts(): Promise<NewsPost[]> {
  const { data, error } = await supabase.from("news_posts").select("*").eq("published", true).order("post_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    title: { ru: row.title_ru, kz: row.title_kz },
    author: row.author,
    date: row.post_date,
    category: row.category,
    summary: { ru: row.summary_ru ?? "", kz: row.summary_kz ?? "" },
    body: { ru: row.body_ru ?? "", kz: row.body_kz ?? "" },
    tags: row.tags ?? [],
  }));
}

export async function fetchLibraryItems(): Promise<LibraryItem[]> {
  const { data, error } = await supabase.from("library_items").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    title: { ru: row.title_ru, kz: row.title_kz },
    author: row.author ?? "",
    year: row.year ?? "",
    category: { ru: row.category_ru, kz: row.category_kz },
    section: row.section,
    description: { ru: row.description_ru ?? "", kz: row.description_kz ?? "" },
    tags: row.tags ?? [],
    link: row.external_link || row.file_url || "",
  }));
}

export async function fetchComments(entityType: string, entityId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("is_approved", true)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createComment(entityType: string, entityId: string, authorName: string, body: string) {
  const { error } = await supabase.from("comments").insert({
    entity_type: entityType,
    entity_id: entityId,
    author_name: authorName,
    body,
    is_approved: true,
  });

  if (error) throw error;
}

export async function fetchFaculty(): Promise<Faculty[]> {
  const { data, error } = await supabase.from("faculty").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.full_name,
    degree: { ru: row.degree_ru, kz: row.degree_kz },
    position: { ru: row.position_ru, kz: row.position_kz },
    expertise: localizedArray(row.expertise_ru, row.expertise_kz),
    bio: { ru: row.bio_ru, kz: row.bio_kz },
    contact: row.contact ?? "",
  }));
}

export async function fetchResearchProjects(): Promise<ResearchProject[]> {
  const { data, error } = await supabase.from("research_projects").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    title: { ru: row.title_ru, kz: row.title_kz },
    investigator: row.principal_investigator,
    residents: row.residents_involved ?? [],
    status: { ru: row.status_ru, kz: row.status_kz },
    deadline: row.deadline ?? "",
    protocol: row.protocol_file ?? "",
    related: localizedArray(row.related_articles_ru, row.related_articles_kz),
    progress: { ru: row.progress_ru ?? "", kz: row.progress_kz ?? "" },
  }));
}

export async function fetchQuizQuestions(): Promise<QuizQuestion[]> {
  const { data, error } = await supabase.from("quiz_questions").select("*").eq("is_active", true).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    question: { ru: row.question_ru, kz: row.question_kz },
    options: localizedArray(row.options_ru, row.options_kz),
    correct: row.correct_index,
    explanation: { ru: row.explanation_ru ?? "", kz: row.explanation_kz ?? "" },
  }));
}

export async function fetchClinicalCase(): Promise<ClinicalCase | null> {
  const { data, error } = await supabase
    .from("clinical_cases")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    title: { ru: data.title_ru, kz: data.title_kz },
    description: { ru: data.description_ru ?? "", kz: data.description_kz ?? "" },
    differential: localizedArray(data.differential_ru, data.differential_kz),
    options: localizedArray(data.options_ru, data.options_kz),
    final: { ru: data.final_ru ?? "", kz: data.final_kz ?? "" },
    learning: localizedArray(data.learning_ru, data.learning_kz),
    mediaUrls: data.media_urls ?? [],
    fileUrls: data.file_urls ?? [],
    opinionPrompt: { ru: data.opinion_prompt_ru ?? "", kz: data.opinion_prompt_kz ?? "" },
  };
}

export type SiteContentBlock = {
  id: string;
  pageKey: string;
  blockKey: string;
  title: { ru: string; kz: string };
  body: { ru: string; kz: string };
  sortOrder: number;
};

export async function fetchSiteContent(pageKey: string): Promise<SiteContentBlock[]> {
  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("page_key", pageKey)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    pageKey: row.page_key,
    blockKey: row.block_key,
    title: { ru: row.title_ru ?? "", kz: row.title_kz ?? "" },
    body: { ru: row.body_ru ?? "", kz: row.body_kz ?? "" },
    sortOrder: row.sort_order ?? 0,
  }));
}
