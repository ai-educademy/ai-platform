import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockExistsSync = vi.fn();
const mockReaddirSync = vi.fn();
const mockReadFileSync = vi.fn();

vi.mock('fs', () => ({
  default: {
    existsSync: (...args: unknown[]) => mockExistsSync(...args),
    readdirSync: (...args: unknown[]) => mockReaddirSync(...args),
    readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
  },
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
  readdirSync: (...args: unknown[]) => mockReaddirSync(...args),
  readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
}));

vi.mock('gray-matter', () => ({
  default: vi.fn((raw: string) => {
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { data: {}, content: raw };
    const data: Record<string, unknown> = {};
    match[1].split('\n').forEach((line) => {
      const [key, ...rest] = line.split(':');
      if (key && rest.length) {
        const val = rest.join(':').trim();
        if (val === 'true') data[key.trim()] = true;
        else if (val === 'false') data[key.trim()] = false;
        else if (/^\d+$/.test(val)) data[key.trim()] = parseInt(val, 10);
        else data[key.trim()] = val;
      }
    });
    return { data, content: match[2] };
  }),
}));

import { getLessons, getLesson } from '@/lib/lessons';

let files: Record<string, string> = {};
let dirs: Record<string, string[]> = {};

function setupFiles(fileMap: Record<string, string>, dirMap: Record<string, string[]>) {
  files = fileMap;
  dirs = dirMap;
  mockExistsSync.mockImplementation((p: string) => p in dirs || p in files);
  mockReaddirSync.mockImplementation((p: string) => dirs[p] || []);
  mockReadFileSync.mockImplementation((p: string) => files[p] || '');
}

beforeEach(() => {
  vi.clearAllMocks();
  files = {};
  dirs = {};
  mockExistsSync.mockReturnValue(false);
  mockReaddirSync.mockReturnValue([]);
  mockReadFileSync.mockReturnValue('');
});

describe('getLessons', () => {
  it('returns lessons sorted by order', () => {
    const cwd = process.cwd();
    const enDir = `${cwd}/content/programs/ai-seeds/lessons/en`;

    setupFiles(
      {
        [`${enDir}/intro.mdx`]:
          '---\ntitle: Introduction\ndescription: Intro\norder: 2\ndifficulty: beginner\nduration: 10\nicon: 📚\npublished: true\n---\nIntro content',
        [`${enDir}/basics.mdx`]:
          '---\ntitle: Basics\ndescription: Basics\norder: 1\ndifficulty: beginner\nduration: 15\nicon: 🔤\npublished: true\n---\nBasics content',
      },
      { [enDir]: ['intro.mdx', 'basics.mdx'] },
    );

    const lessons = getLessons('ai-seeds', 'en');
    expect(lessons).toHaveLength(2);
    expect(lessons[0].slug).toBe('basics');
    expect(lessons[0].order).toBe(1);
    expect(lessons[1].slug).toBe('intro');
    expect(lessons[1].order).toBe(2);
  });

  it('filters out unpublished lessons', () => {
    const cwd = process.cwd();
    const enDir = `${cwd}/content/programs/ai-seeds/lessons/en`;

    setupFiles(
      {
        [`${enDir}/visible.mdx`]:
          '---\ntitle: Visible\ndescription: d\norder: 1\ndifficulty: beginner\nduration: 5\nicon: 📚\npublished: true\n---\nContent',
        [`${enDir}/hidden.mdx`]:
          '---\ntitle: Hidden\ndescription: d\norder: 2\ndifficulty: beginner\nduration: 5\nicon: 📚\npublished: false\n---\nContent',
      },
      { [enDir]: ['visible.mdx', 'hidden.mdx'] },
    );

    const lessons = getLessons('ai-seeds', 'en');
    expect(lessons).toHaveLength(1);
    expect(lessons[0].slug).toBe('visible');
  });

  it('returns empty array for missing program directory', () => {
    const lessons = getLessons('nonexistent-program', 'en');
    expect(lessons).toEqual([]);
  });

  it('includes correct metadata fields', () => {
    const cwd = process.cwd();
    const enDir = `${cwd}/content/programs/ai-seeds/lessons/en`;

    setupFiles(
      {
        [`${enDir}/meta.mdx`]:
          '---\ntitle: Meta Lesson\ndescription: A lesson with metadata\norder: 1\ndifficulty: intermediate\nduration: 20\nicon: 🧪\npublished: true\n---\nContent',
      },
      { [enDir]: ['meta.mdx'] },
    );

    const lessons = getLessons('ai-seeds', 'en');
    expect(lessons[0]).toMatchObject({
      slug: 'meta',
      title: 'Meta Lesson',
      description: 'A lesson with metadata',
      order: 1,
      difficulty: 'intermediate',
      duration: 20,
      icon: '🧪',
      published: true,
    });
  });

  it('merges locale-specific lessons with English', () => {
    const cwd = process.cwd();
    const enDir = `${cwd}/content/programs/ai-seeds/lessons/en`;
    const frDir = `${cwd}/content/programs/ai-seeds/lessons/fr`;

    setupFiles(
      {
        [`${enDir}/lesson1.mdx`]:
          '---\ntitle: Lesson 1 EN\ndescription: d\norder: 1\ndifficulty: beginner\nduration: 10\nicon: 📚\npublished: true\n---\nEN',
        [`${frDir}/lesson1.mdx`]:
          '---\ntitle: Leçon 1 FR\ndescription: d\norder: 1\ndifficulty: beginner\nduration: 10\nicon: 📚\npublished: true\n---\nFR',
      },
      {
        [enDir]: ['lesson1.mdx'],
        [frDir]: ['lesson1.mdx'],
      },
    );

    const lessons = getLessons('ai-seeds', 'fr');
    expect(lessons).toHaveLength(1);
    expect(lessons[0].title).toBe('Leçon 1 FR');
  });
});

describe('getLesson', () => {
  it('returns a single lesson with content', () => {
    const cwd = process.cwd();
    const enDir = `${cwd}/content/programs/ai-seeds/lessons/en`;

    setupFiles(
      {
        [`${enDir}/intro.mdx`]:
          '---\ntitle: Introduction\ndescription: Learn the basics\norder: 1\ndifficulty: beginner\nduration: 10\nicon: 📚\npublished: true\n---\n# Welcome\nThis is the intro.',
      },
      { [enDir]: ['intro.mdx'] },
    );

    const lesson = getLesson('ai-seeds', 'en', 'intro');
    expect(lesson).not.toBeNull();
    expect(lesson!.title).toBe('Introduction');
    expect(lesson!.content).toContain('# Welcome');
  });

  it('returns null for a missing lesson slug', () => {
    const lesson = getLesson('ai-seeds', 'en', 'missing-lesson');
    expect(lesson).toBeNull();
  });

  it('falls back to English when locale file is missing', () => {
    const cwd = process.cwd();
    const enDir = `${cwd}/content/programs/ai-seeds/lessons/en`;

    setupFiles(
      {
        [`${enDir}/fallback.mdx`]:
          '---\ntitle: Fallback EN\ndescription: d\norder: 1\ndifficulty: beginner\nduration: 5\nicon: 📚\npublished: true\n---\nEN content',
      },
      { [enDir]: ['fallback.mdx'] },
    );

    const lesson = getLesson('ai-seeds', 'fr', 'fallback');
    expect(lesson).not.toBeNull();
    expect(lesson!.title).toBe('Fallback EN');
  });
});
