import { notFound, permanentRedirect } from "next/navigation";
import { getLessons } from "@/lib/lessons";
import { getPrograms } from "@/lib/programs";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const basePath = locale === "en" ? "" : `/${locale}`;
  const owningProgram = getPrograms().find((program) =>
    getLessons(program.slug, locale).some((lesson) => lesson.slug === slug),
  );

  if (!owningProgram) notFound();

  permanentRedirect(`${basePath}/programs/${owningProgram.slug}/lessons/${slug}`);
}
