/* ─── types ─── */
export interface TrackData {
  slug: string;
  icon: string;
  title: string;
  desc: string;
  tagline: string;
  brand?: string;
}

export interface LessonData {
  slug: string;
  title: string;
  icon: string;
  duration: number;
}

export interface ProgramData {
  slug: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  level: number;
  hasLessons: boolean;
  estimatedHours: number;
  topics: string[];
  lessonCount: number;
  firstLessonSlug?: string;
  lessons: LessonData[];
  isPremium: boolean;
}

export interface ProgramsI18n {
  title: string;
  subtitle: string;
  startLearning: string;
  comingSoon: string;
  hours: string;
  level: string;
  viewAll: string;
  levelLabels: Record<string, string>;
  statsTracksLabel: string;
  statsProgramsLabel: string;
  statsLessonsLabel: string;
  lessonsCount: string;
  moreLessons: string;
  showLess: string;
  searchPlaceholder: string;
  noResults: string;
  allTracks: string;
  free?: string;
  pro?: string;
}

export interface Props {
  tracks: TrackData[];
  programsByTrack: Record<string, ProgramData[]>;
  basePath: string;
  t: ProgramsI18n;
}
