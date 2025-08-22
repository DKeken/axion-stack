import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/user.json' });

test.beforeEach(async ({ page }) => {
  await page.goto(`${process.env.BASE_URL}/`);
});

test('Basic authentication flow', async ({ page }) => {
  // Test that authenticated user can access protected routes
  await page.goto('/');

  // Should be able to navigate without being redirected to login
  await expect(page.locator('body')).not.toContainText('login');

  // Basic page load verification
  await expect(page.locator('body')).toBeVisible();
});
