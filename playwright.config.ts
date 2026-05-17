import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config();

const isCI = !!process.env.CI;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './projects/laji/test',
  timeout: 4 * 60 * 1000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: isCI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'line',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    permissions: ['geolocation'],
    geolocation: { latitude: 60.1714275534955, longitude: 24.93126046426308 }, // fmnh geolocation
    locale: 'fi',
    actionTimeout: 60 * 1000
  },
  expect: {
    timeout: 60 * 1000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    // Angular's CI dev server is running through Vite/esbuild. Disabling prebundling
    // avoids the esbuild service deadlock that can prevent Playwright from starting.
    command: isCI
      ? 'npm run ng-high-memory -- serve laji --configuration=local --prebundle=false'
      : 'npm start',
    url: 'http://localhost:3000',
    timeout: 10 * 60 * 1000,
    reuseExistingServer: !isCI,
  },
});
