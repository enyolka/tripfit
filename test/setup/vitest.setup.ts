import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with testing-library matchers
expect.extend(matchers);

// Automatically clean up after each test
afterEach(() => {
  cleanup();
});

// Global mock setup can be added here
// For example:
// vi.mock('next/router', () => require('next-router-mock'));

// To mock fetch if needed:
// global.fetch = vi.fn();

// Setting up locals.supabase mock
vi.mock('astro', () => {
  return {
    locals: {
      supabase: {}
    }
  };
});