import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  workers: 1,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    baseURL: env.uiBaseUrl,
    screenshot: 'only-on-failure',
    actionTimeout: 8_000,
  },

  // Playwright starts the mock server before tests and stops it after
  webServer: {
    command: 'npx ts-node mock-server/server.ts',
    url: 'http://localhost:4000/health',
    reuseExistingServer: true,
    stdout: 'pipe',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
