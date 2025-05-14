import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

export default defineConfig({
  testDir: './test/e2e',  timeout: 60000, // Increased from 30s to 60s for slower environments
  expect: {
    timeout: 10000, // Increased from 5s to 10s
    toHaveScreenshot: {
      maxDiffPixels: 50,
    },
  },
  globalSetup: './test/e2e/setup/auth.setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: {
      mode: 'on',
      fullPage: true,
    },
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});