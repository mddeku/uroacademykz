import { topicIdeas } from "../data";
import type { Lang, LocalizedString } from "../types";

const guidelineTopics: LocalizedString[] = [
  {
    ru: "EAU/AUA review: выбор тактики при камне мочеточника 5-10 мм",
    kz: "EAU/AUA review: 5-10 мм несепағар тасында тактиканы таңдау",
  },
  {
    ru: "Guideline debate: активное наблюдение или биопсия при PI-RADS 3",
    kz: "Guideline debate: PI-RADS 3 кезінде бақылау ма, биопсия ма",
  },
  {
    ru: "Clinical pathway: рецидивирующая инфекция мочевых путей у женщин",
    kz: "Clinical pathway: әйелдердегі қайталамалы несеп жолы инфекциясы",
  },
  {
    ru: "Journal Club: антибиотикопрофилактика перед эндоурологическими вмешательствами",
    kz: "Journal Club: эндоурологиялық араласулар алдындағы антибиотикопрофилактика",
  },
  {
    ru: "Case discussion: малое почечное образование и выбор наблюдения",
    kz: "Case discussion: кіші бүйрек ісігі және бақылауды таңдау",
  },
  {
    ru: "Critical review: диагностика и ведение мужского бесплодия по AUA/EAU",
    kz: "Critical review: AUA/EAU бойынша ер бедеулігін диагностикалау және жүргізу",
  },
];

export async function generateGuidelineTopic(lang: Lang): Promise<LocalizedString> {
  const endpoint = import.meta.env.VITE_TOPIC_GENERATOR_ENDPOINT;

  if (endpoint) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lang,
        prompt:
          "Generate one urology Journal Club topic grounded in current EAU and AUA guideline domains. Return JSON with ru and kz strings only.",
      }),
    });

    if (!response.ok) {
      throw new Error("Topic generator endpoint failed");
    }

    const data = await response.json();
    if (typeof data?.ru === "string" && typeof data?.kz === "string") {
      return { ru: data.ru, kz: data.kz };
    }
  }

  const pool = [...guidelineTopics, ...topicIdeas];
  return pool[Math.floor(Math.random() * pool.length)];
}
