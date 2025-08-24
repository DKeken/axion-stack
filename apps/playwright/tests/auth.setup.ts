import * as fs from 'node:fs';
import * as path from 'node:path';

import { test as setup, expect } from '@playwright/test';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

// Ensure the auth directory exists
fs.mkdirSync(path.dirname(authFile), { recursive: true });

setup('authenticate', async ({ page }) => {
  // Navigate to the login page
  await page.goto('/auth/login');

  // Wait for login form to appear
  await page.locator('form').waitFor({ state: 'visible', timeout: 30000 });

  // Fill in the login form for Axion Stack
  const defaultUsername = `admin@${process.env.RABBITMQ_QUEUE_PREFIX || 'axion'}.dev`;
  await page.fill('input[type="email"]', process.env.AUTH_USERNAME || defaultUsername);
  await page.fill('input[type="password"]', process.env.AUTH_PASSWORD || 'admin123');

  // Click the login button
  await page.click('button[type="submit"]');

  // Wait for navigation to complete and URL to change to '/'
  await page.waitForURL('/', { timeout: 15000 });

  // Wait for navigation and check that we've successfully logged in
  await expect(page.locator('body')).not.toContainText('login', { timeout: 15000 });

  // Store the authentication state to be used in tests
  await page.context().storageState({ path: authFile });
});
