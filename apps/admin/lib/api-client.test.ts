import { describe, expect, it } from 'vitest';

import { getApiUrl } from './api-client';

describe('getApiUrl', () => {
  it('prefers the configured public API base URL', () => {
    const previous = process.env.NEXT_PUBLIC_API_BASE;
    process.env.NEXT_PUBLIC_API_BASE = 'https://api.example.test/schoolos';

    try {
      expect(getApiUrl('/students')).toBe('https://api.example.test/schoolos/students');
    } finally {
      if (previous === undefined) {
        delete process.env.NEXT_PUBLIC_API_BASE;
      } else {
        process.env.NEXT_PUBLIC_API_BASE = previous;
      }
    }
  });
});
