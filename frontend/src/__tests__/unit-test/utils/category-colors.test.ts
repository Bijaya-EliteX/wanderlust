import { describe, it, expect } from 'vitest';
import { categories, getCategoryColors } from '@/utils/category-colors';

describe('category-colors - pure unit tests (no API, no mocks)', () => {
  it('categories should contain all defined categories', () => {
    expect(categories).toEqual(['Travel', 'Nature', 'City', 'Adventure', 'Beaches', 'Landmarks']);
    expect(categories.length).toBe(6);
  });

  it('getCategoryColors should return correct tuple for known category', () => {
    expect(getCategoryColors('Travel')).toEqual(['bg-pink-200 dark:bg-pink-900', 'bg-pink-500/80']);
    expect(getCategoryColors('Nature')).toEqual(['bg-green-200 dark:bg-green-900', 'bg-green-500/80']);
    expect(getCategoryColors('City')).toEqual(['bg-yellow-200 dark:bg-yellow-900', 'bg-yellow-500/80']);
  });

  it('getCategoryColors should return fallback for unknown category', () => {
    expect(getCategoryColors('Unknown')).toEqual(['bg-cyan-200 dark:bg-cyan-900', 'bg-cyan-500/80']);
    expect(getCategoryColors('')).toEqual(['bg-cyan-200 dark:bg-cyan-900', 'bg-cyan-500/80']);
  });

  it('getCategoryColors should return tuple of 2 strings', () => {
    const result = getCategoryColors('Adventure');
    expect(result).toHaveLength(2);
    expect(typeof result[0]).toBe('string');
    expect(typeof result[1]).toBe('string');
  });
});
