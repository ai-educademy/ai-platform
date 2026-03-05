import fs from "fs";
import path from "path";

export interface ProgramMeta {
  slug: string;
  level: number;
  status: "active" | "coming-soon";
  color: string;
  icon: string;
  track: "ai-learning" | "craft-engineering";
  title: string;
  subtitle: string;
  description: string;
  audience: string;
  prerequisites: string;
  lessonCount: number;
  estimatedHours: number;
  topics: string[];
  outcomes: string[];
}

const programsDir = path.join(process.cwd(), "content", "programs");

export function getPrograms(): ProgramMeta[] {
  const registryPath = path.join(process.cwd(), "content", "programs.json");
  if (!fs.existsSync(registryPath)) return [];

  const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
  const programs: ProgramMeta[] = [];

  for (const entry of registry.programs) {
    const metaPath = path.join(programsDir, entry.slug, "program.json");
    if (!fs.existsSync(metaPath)) continue;

    const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    programs.push(meta as ProgramMeta);
  }

  return programs.sort((a, b) => a.level - b.level);
}

export function getProgramsByTrack(track: string): ProgramMeta[] {
  return getPrograms().filter((p) => p.track === track);
}

export function getProgram(slug: string): ProgramMeta | null {
  const metaPath = path.join(programsDir, slug, "program.json");
  if (!fs.existsSync(metaPath)) return null;

  return JSON.parse(fs.readFileSync(metaPath, "utf-8")) as ProgramMeta;
}

export function getActivePrograms(): ProgramMeta[] {
  return getPrograms().filter((p) => p.status === "active");
}
