import { supabase } from "./supabase";
import type { Resident } from "../types";

type ResidentRow = {
  id: string;
  full_name: string;
  residency_year_ru: string;
  residency_year_kz: string;
  research_interests_ru: string[] | null;
  research_interests_kz: string[] | null;
  presentations_completed: number | null;
  upcoming_topics_ru: string[] | null;
  upcoming_topics_kz: string[] | null;
  publications: number | null;
  certificates: number | null;
  activity_score: number | null;
};

function toLocalizedArray(ru: string[] | null, kz: string[] | null) {
  const maxLength = Math.max(ru?.length ?? 0, kz?.length ?? 0);
  return Array.from({ length: maxLength }, (_, index) => ({
    ru: ru?.[index] ?? kz?.[index] ?? "",
    kz: kz?.[index] ?? ru?.[index] ?? "",
  })).filter((item) => item.ru || item.kz);
}

function mapResident(row: ResidentRow): Resident {
  return {
    id: row.id,
    name: row.full_name,
    year: {
      ru: row.residency_year_ru,
      kz: row.residency_year_kz,
    },
    interests: toLocalizedArray(row.research_interests_ru, row.research_interests_kz),
    presentations: row.presentations_completed ?? 0,
    upcoming: toLocalizedArray(row.upcoming_topics_ru, row.upcoming_topics_kz),
    publications: row.publications ?? 0,
    certificates: row.certificates ?? 0,
    score: row.activity_score ?? 0,
  };
}

export async function fetchResidents() {
  const { data, error } = await supabase
    .from("residents")
    .select(
      "id, full_name, residency_year_ru, residency_year_kz, research_interests_ru, research_interests_kz, presentations_completed, upcoming_topics_ru, upcoming_topics_kz, publications, certificates, activity_score",
    )
    .order("activity_score", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapResident(row as ResidentRow));
}

export type NewResidentInput = {
  fullName: string;
  residencyYearRu: string;
  residencyYearKz: string;
  researchInterestsRu: string[];
  researchInterestsKz: string[];
  presentationsCompleted: number;
  upcomingTopicsRu: string[];
  upcomingTopicsKz: string[];
  publications: number;
  certificates: number;
  activityScore: number;
};

export async function createResident(input: NewResidentInput) {
  const { data, error } = await supabase
    .from("residents")
    .insert({
      full_name: input.fullName,
      residency_year_ru: input.residencyYearRu,
      residency_year_kz: input.residencyYearKz,
      research_interests_ru: input.researchInterestsRu,
      research_interests_kz: input.researchInterestsKz,
      presentations_completed: input.presentationsCompleted,
      upcoming_topics_ru: input.upcomingTopicsRu,
      upcoming_topics_kz: input.upcomingTopicsKz,
      publications: input.publications,
      certificates: input.certificates,
      activity_score: input.activityScore,
    })
    .select(
      "id, full_name, residency_year_ru, residency_year_kz, research_interests_ru, research_interests_kz, presentations_completed, upcoming_topics_ru, upcoming_topics_kz, publications, certificates, activity_score",
    )
    .single();

  if (error) {
    throw error;
  }

  return mapResident(data as ResidentRow);
}
