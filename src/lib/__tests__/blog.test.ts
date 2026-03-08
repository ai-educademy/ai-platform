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
        else if (val.startsWith('[')) {
          try { data[key.trim()] = JSON.parse(val); } catch { data[key.trim()] = val; }
        } else data[key.trim()] = val;
      }
    });
    return { data, content: match[2] };
  }),
}));

import { getBlogPosts, getBlogPost, getAllBlogSlugs } from '@/lib/blog';

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

describe('getBlogPosts', () => {
  it('returns published blog posts sorted by date descending', () => {
    const cwd = process.cwd();
    const enDir = `${cwd}/content/blog/en`;

    setupFiles(
      {
        [`${enDir}/post-a.mdx`]:
          '---\ntitle: Post A\ndescription: A desc\ndate: 2024-01-01\nauthor: Author\ntags: ["ai"]\npublished: true\n---\nContent A',
        [`${enDir}/post-b.mdx`]:
          '---\ntitle: Post B\ndescription: B desc\ndate: 2024-06-01\nauthor: Author\ntags: ["ml"]\npublished: true\n---\nContent B',
      },
      { [enDir]: ['post-a.mdx', 'post-b.mdx'] },
    );

    const posts = getBlogPosts('en');
    expect(posts).toHaveLength(2);
    expect(posts[0].slug).toBe('post-b');
    expect(posts[1].slug).toBe('post-a');
  });

  it('filters out unpublished posts', () => {
    const cwd = process.cwd();
    const enDir = `${cwd}/content/blog/en`;

    setupFiles(
      {
        [`${enDir}/draft.mdx`]:
          '---\ntitle: Draft\ndescription: draft\ndate: 2024-01-01\nauthor: Me\ntags: []\npublished: false\n---\nDraft',
        [`${enDir}/live.mdx`]:
          '---\ntitle: Live\ndescription: live\ndate: 2024-01-01\nauthor: Me\ntags: []\npublished: true\n---\nLive',
      },
      { [enDir]: ['draft.mdx', 'live.mdx'] },
    );

    const posts = getBlogPosts('en');
    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe('live');
  });

  it('returns empty array when blog directory does not exist', () => {
    const posts = getBlogPosts('en');
    expect(posts).toEqual([]);
  });

  it('merges locale-specific posts with English posts', () => {
    const cwd = process.cwd();
    const enDir = `${cwd}/content/blog/en`;
    const frDir = `${cwd}/content/blog/fr`;

    setupFiles(
      {
        [`${enDir}/common.mdx`]:
          '---\ntitle: Common EN\ndescription: d\ndate: 2024-01-01\nauthor: A\ntags: []\npublished: true\n---\nEN',
        [`${frDir}/common.mdx`]:
          '---\ntitle: Common FR\ndescription: d\ndate: 2024-01-01\nauthor: A\ntags: []\npublished: true\n---\nFR',
      },
      {
        [enDir]: ['common.mdx'],
        [frDir]: ['common.mdx'],
      },
    );

    const posts = getBlogPosts('fr');
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('Common FR');
  });
});

describe('getBlogPost', () => {
  it('returns a single blog post by slug', () => {
    const cwd = process.cwd();
    const enDir = `${cwd}/content/blog/en`;

    setupFiles(
      {
        [`${enDir}/hello.mdx`]:
          '---\ntitle: Hello\ndescription: desc\ndate: 2024-03-01\nauthor: Me\ntags: ["intro"]\npublished: true\n---\nHello World',
      },
      { [enDir]: ['hello.mdx'] },
    );

    const post = getBlogPost('hello', 'en');
    expect(post).not.toBeNull();
    expect(post!.title).toBe('Hello');
    expect(post!.content).toContain('Hello World');
  });

  it('returns null for a missing slug', () => {
    const post = getBlogPost('nonexistent', 'en');
    expect(post).toBeNull();
  });

  it('falls back to English when locale file is missing', () => {
    const cwd = process.cwd();
    const enDir = `${cwd}/content/blog/en`;

    setupFiles(
      {
        [`${enDir}/fallback.mdx`]:
          '---\ntitle: Fallback EN\ndescription: d\ndate: 2024-01-01\nauthor: A\ntags: []\npublished: true\n---\nEN content',
      },
      { [enDir]: ['fallback.mdx'] },
    );

    const post = getBlogPost('fallback', 'fr');
    expect(post).not.toBeNull();
    expect(post!.title).toBe('Fallback EN');
  });
});

describe('getAllBlogSlugs', () => {
  it('returns all slugs from the English blog directory', () => {
    const cwd = process.cwd();
    const enDir = `${cwd}/content/blog/en`;

    setupFiles({}, { [enDir]: ['post-1.mdx', 'post-2.mdx', 'readme.txt'] });

    const slugs = getAllBlogSlugs();
    expect(slugs).toEqual(['post-1', 'post-2']);
  });

  it('returns empty array when directory does not exist', () => {
    const slugs = getAllBlogSlugs();
    expect(slugs).toEqual([]);
  });
});
