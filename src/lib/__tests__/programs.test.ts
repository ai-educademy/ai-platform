import { describe, it, expect } from 'vitest';
import { getPrograms, getProgramsByTrack, getProgram, getTracks } from '@/lib/programs';

describe('getPrograms', () => {
  it('returns all programs sorted by level', () => {
    const programs = getPrograms();
    expect(programs.length).toBeGreaterThan(0);

    for (let i = 1; i < programs.length; i++) {
      expect(programs[i].level).toBeGreaterThanOrEqual(programs[i - 1].level);
    }
  });

  it('each program has required metadata fields', () => {
    const programs = getPrograms();
    for (const p of programs) {
      expect(p).toHaveProperty('slug');
      expect(p).toHaveProperty('level');
      expect(p).toHaveProperty('color');
      expect(p).toHaveProperty('icon');
      expect(p).toHaveProperty('track');
      expect(p).toHaveProperty('estimatedHours');
      expect(typeof p.slug).toBe('string');
      expect(typeof p.level).toBe('number');
      expect(typeof p.estimatedHours).toBe('number');
    }
  });

  it('includes known programs', () => {
    const programs = getPrograms();
    const slugs = programs.map((p) => p.slug);
    expect(slugs).toContain('ai-seeds');
    expect(slugs).toContain('ai-sprouts');
  });
});

describe('getProgramsByTrack', () => {
  it('returns only programs belonging to the given track', () => {
    const aiLearning = getProgramsByTrack('ai-learning');
    expect(aiLearning.length).toBeGreaterThan(0);
    for (const p of aiLearning) {
      expect(p.track).toBe('ai-learning');
    }
  });

  it('returns programs for craft-engineering track', () => {
    const craft = getProgramsByTrack('craft-engineering');
    expect(craft.length).toBeGreaterThan(0);
    for (const p of craft) {
      expect(p.track).toBe('craft-engineering');
    }
  });

  it('returns empty array for unknown track', () => {
    const unknown = getProgramsByTrack('nonexistent-track');
    expect(unknown).toEqual([]);
  });

  it('returns results sorted by level', () => {
    const programs = getProgramsByTrack('ai-learning');
    for (let i = 1; i < programs.length; i++) {
      expect(programs[i].level).toBeGreaterThanOrEqual(programs[i - 1].level);
    }
  });
});

describe('getProgram', () => {
  it('returns a program by slug', () => {
    const program = getProgram('ai-seeds');
    expect(program).not.toBeNull();
    expect(program!.slug).toBe('ai-seeds');
    expect(program!.level).toBe(1);
    expect(program!.track).toBe('ai-learning');
  });

  it('returns null for unknown slug', () => {
    const program = getProgram('nonexistent-program');
    expect(program).toBeNull();
  });

  it('returns correct metadata for a craft-engineering program', () => {
    const program = getProgram('ai-sketch');
    expect(program).not.toBeNull();
    expect(program!.track).toBe('craft-engineering');
    expect(program!.icon).toBe('✏️');
  });
});

describe('getTracks', () => {
  it('returns all tracks', () => {
    const tracks = getTracks();
    expect(tracks.length).toBeGreaterThan(0);
  });

  it('each track has slug, icon, and programs array', () => {
    const tracks = getTracks();
    for (const track of tracks) {
      expect(track).toHaveProperty('slug');
      expect(track).toHaveProperty('icon');
      expect(track).toHaveProperty('programs');
      expect(Array.isArray(track.programs)).toBe(true);
      expect(track.programs.length).toBeGreaterThan(0);
    }
  });

  it('includes known tracks', () => {
    const tracks = getTracks();
    const slugs = tracks.map((t) => t.slug);
    expect(slugs).toContain('ai-learning');
    expect(slugs).toContain('craft-engineering');
  });
});
