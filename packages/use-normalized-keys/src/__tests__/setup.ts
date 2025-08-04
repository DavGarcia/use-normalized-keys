// Vitest setup file
// This file runs before each test file

import '@testing-library/jest-dom';

// Mock navigator.platform for platform detection tests
Object.defineProperty(window.navigator, 'platform', {
  writable: true,
  configurable: true,
  value: 'Linux',
});

// Mock navigator.userAgent
Object.defineProperty(window.navigator, 'userAgent', {
  writable: true,
  configurable: true,
  value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
});

// Add custom matchers if needed
expect.extend({
  toBeNormalizedKey(received: any, expected: string) {
    const pass = received?.key === expected;
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received?.key} not to be normalized as ${expected}`
          : `expected ${received?.key} to be normalized as ${expected}`,
    };
  },
});

// Declare custom matchers for TypeScript
declare global {
  namespace Vi {
    interface Assertion {
      toBeNormalizedKey(expected: string): void;
    }
  }
}