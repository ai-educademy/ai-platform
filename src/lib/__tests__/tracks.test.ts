import { describe, it, expect } from 'vitest';
import { getTracks, getTrack } from '@/lib/tracks';

describe('getTracks', () => {
  it('returns all available tracks', () => {
    const tracks = getTracks();
    expect(tracks.length).toBeGreaterThan(0);
  });

  it('each track has the correct structure', () => {
    const tracks = getTracks();
    for (const track of tracks) {
      expect(typeof track.slug).toBe('string');
      expect(track.slug.length).toBeGreaterThan(0);
      expect(typeof track.icon).toBe('string');
      expect(Array.isArray(track.programs)).toBe(true);
    }
  });

  it('contains ai-learning and craft-engineering tracks', () => {
    const tracks = getTracks();
    const slugs = tracks.map((t) => t.slug);
    expect(slugs).toContain('ai-learning');
    expect(slugs).toContain('craft-engineering');
  });

  it('ai-learning track includes expected programs', () => {
    const tracks = getTracks();
    const aiLearning = tracks.find((t) => t.slug === 'ai-learning');
    expect(aiLearning).toBeDefined();
    expect(aiLearning!.programs).toContain('ai-seeds');
    expect(aiLearning!.programs).toContain('ai-forest');
  });

  it('craft-engineering track includes expected programs', () => {
    const tracks = getTracks();
    const craft = tracks.find((t) => t.slug === 'craft-engineering');
    expect(craft).toBeDefined();
    expect(craft!.programs).toContain('ai-sketch');
    expect(craft!.programs).toContain('ai-masterpiece');
  });
});

describe('getTrack', () => {
  it('returns a track by slug', () => {
    const track = getTrack('ai-learning');
    expect(track).not.toBeNull();
    expect(track!.slug).toBe('ai-learning');
    expect(track!.icon).toBe('🌳');
  });

  it('returns null for unknown slug', () => {
    const track = getTrack('nonexistent-track');
    expect(track).toBeNull();
  });

  it('returned track has programs array', () => {
    const track = getTrack('craft-engineering');
    expect(track).not.toBeNull();
    expect(Array.isArray(track!.programs)).toBe(true);
    expect(track!.programs.length).toBeGreaterThan(0);
  });
});
