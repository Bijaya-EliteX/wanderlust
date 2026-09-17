import { describe, it, expect } from '@jest/globals';
import { validCategories, HTTP_STATUS, RESPONSE_MESSAGES, REDIS_KEYS, REDIS_PREFIX } from '../../../utils/constants.js';

describe('constants - pure unit tests (no DB, no mocks)', () => {
  it('validCategories should contain expected values', () => {
    expect(validCategories).toEqual(['Travel', 'Nature', 'City', 'Adventure', 'Beaches', 'Landmarks', 'Mountains']);
    expect(validCategories.length).toBe(7);
  });

  it('HTTP_STATUS should have correct codes', () => {
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.CREATED).toBe(201);
    expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
    expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
    expect(HTTP_STATUS.FORBIDDEN).toBe(403);
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
  });

  it('RESPONSE_MESSAGES should be defined', () => {
    expect(RESPONSE_MESSAGES.COMMON.REQUIRED_FIELDS).toBe('All fields are required.');
    expect(RESPONSE_MESSAGES.POSTS.INVALID_IMAGE_URL).toContain('.jpg');
    expect(RESPONSE_MESSAGES.POSTS.MAX_CATEGORIES).toContain('three categories');
    expect(RESPONSE_MESSAGES.POSTS.NOT_FOUND).toBe('Post not found');
  });

  it('REDIS_KEYS and PREFIX should be correct', () => {
    expect(REDIS_KEYS.ALL_POSTS).toBe('all-posts');
    expect(REDIS_KEYS.FEATURED_POSTS).toBe('featured-posts');
    expect(REDIS_KEYS.LATEST_POSTS).toBe('latest-posts');
    expect(REDIS_PREFIX).toBe('post-cache');
  });
});
