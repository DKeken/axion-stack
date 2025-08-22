import * as fs from 'node:fs';
import path from 'path';

import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env') });

// Define auth file path
const authFile = path.join(__dirname, 'playwright/.auth/user.json');

// Ensure the auth directory exists
fs.mkdirSync(path.dirname(authFile), { recursive: true });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'dot' : [['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:5173/',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Ignore HTTPS errors to fix certificate validation issues */
    ignoreHTTPSErrors: true,

    /* Standard timeouts for Axion Stack */
    navigationTimeout: 30000, // 30 секунд для навигации
    actionTimeout: 15000, // 15 секунд для действий
  },

  /* Global timeout for all tests */
  timeout: 30000, // 30 seconds per test

  /* Configure projects for major browsers */
  projects: [
    // Setup project - it will run auth.setup.ts before all tests
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use prepared auth state
        storageState: authFile,
      },
      dependencies: ['setup'],
    },

    /* {
			name: 'firefox',
			use: {
				...devices['Desktop Firefox'],
				// Use prepared auth state
				storageState: authFile,
			},
			dependencies: ['setup'],
		},

		{
			name: 'webkit',
			use: {
				...devices['Desktop Safari'],
				// Use prepared auth state
				storageState: authFile,
			},
			dependencies: ['setup'],
		}, */

    /* Test against mobile viewports. */
    /* {
			name: 'Mobile Chrome',
			use: {
				...devices['Pixel 5'],
				// Use prepared auth state
				storageState: authFile,
			},
			dependencies: ['setup'],
		}, */
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
  ],
});
