import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './tests/visual-regression',
  fullyParallel: false, // Sequential for visual consistency
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // Single worker for visual tests
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/visual-regression-results.json' }],
    ['list'],
  ],
  timeout: 60000,
  expect: {
    timeout: 30000,
  },
  use: {
    actionTimeout: 3000,
    navigationTimeout: 10000,
    screenshot: 'only-on-failure',
    video: 'off',
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'visual-regression-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
        colorScheme: 'dark',
        reducedMotion: 'reduce',
      },
      testMatch: '**/*.visual.spec.ts',
    },
    {
      name: 'visual-regression-mobile',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 },
        deviceScaleFactor: 2.625,
        colorScheme: 'dark',
        reducedMotion: 'reduce',
      },
      testMatch: '**/*.mobile.visual.spec.ts',
    },
  ],

  webServer: {
    command: 'npx http-server V6 -p 3001 --cors',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Visual regression specific settings
  updateSnapshots: process.argv.includes('--update-snapshots') ? 'all' : 'missing',
});