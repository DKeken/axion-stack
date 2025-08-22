import { type Page } from '@playwright/test';

interface TestContext {
  vars: Record<string, any>;
}

interface Events {
  emit: (event: string, metric: string, value: number) => void;
}

export = {
  config: {
    target: 'http://localhost:5173',
    phases: [
      { duration: 60, arrivalRate: 1, name: 'Warmup' },
      { duration: 120, arrivalRate: 2, name: 'Load test' },
      { duration: 60, arrivalRate: 1, name: 'Cooldown' },
    ],
    engines: {
      playwright: {
        aggregateByName: true,
        launchOptions: { headless: true },
      },
    },
    plugins: {
      expect: {},
      'publish-metrics': [
        {
          type: 'prometheus-pushgateway',
          config: {
            pushgateway: process.env.PROMETHEUS_PUSHGATEWAY_URL || 'http://localhost:9091',
            jobName: 'axion-stack-auth-tests',
            instance: 'playwright-tests',
          },
        },
      ],
    },
  },
  scenarios: [
    {
      name: 'Authentication Flow Test',
      weight: 70,
      engine: 'playwright',
      testFunction: async (page: Page, context: TestContext, events: Events) => {
        const startTime = Date.now();

        try {
          await page.goto('/auth/login');
          const navigationTime = Date.now() - startTime;
          events.emit('histogram', 'axion.auth.navigation_time', navigationTime);

          await page.waitForSelector('form', { timeout: 10000 });
          const formLoadTime = Date.now() - startTime;
          events.emit('histogram', 'axion.auth.form_load_time', formLoadTime);

          const username = process.env.AUTH_USERNAME || 'admin@axion.dev';
          const password = process.env.AUTH_PASSWORD || 'admin123';

          await page.fill('input[type="email"]', username);
          await page.fill('input[type="password"]', password);

          const submitStartTime = Date.now();
          await page.click('button[type="submit"]');

          try {
            await page.waitForURL('/', { timeout: 10000 });
            const authTime = Date.now() - submitStartTime;
            events.emit('histogram', 'axion.auth.login_time', authTime);
            events.emit('counter', 'axion.auth.login.success', 1);

            const bodyText = await page.locator('body').textContent();
            if (!bodyText?.includes('login')) {
              events.emit('counter', 'axion.auth.verification.success', 1);
            } else {
              events.emit('counter', 'axion.auth.verification.failure', 1);
            }
          } catch (_navError) {
            events.emit('counter', 'axion.auth.login.failure', 1);

            const errorElement = page.locator('[role="alert"], .error, .alert-danger').first();
            if (await errorElement.isVisible()) {
              events.emit('counter', 'axion.auth.login.error_shown', 1);
            }

            throw new Error('Login failed or navigation timeout');
          }
        } catch (error) {
          events.emit('counter', 'axion.auth.errors', 1);
          throw error;
        }
      },
    },
    {
      name: 'Login Page Load Test',
      weight: 30,
      engine: 'playwright',
      testFunction: async (page: Page, context: TestContext, events: Events) => {
        const startTime = Date.now();

        try {
          await page.goto('/auth/login');
          await page.waitForLoadState('networkidle', { timeout: 10000 });

          const loadTime = Date.now() - startTime;
          events.emit('histogram', 'axion.auth.login_page_load_time', loadTime);

          const form = page.locator('form');
          const emailInput = page.locator('input[type="email"]');
          const passwordInput = page.locator('input[type="password"]');
          const submitButton = page.locator('button[type="submit"]');

          if (
            (await form.isVisible()) &&
            (await emailInput.isVisible()) &&
            (await passwordInput.isVisible()) &&
            (await submitButton.isVisible())
          ) {
            events.emit('counter', 'axion.auth.login_page.complete', 1);
          } else {
            events.emit('counter', 'axion.auth.login_page.incomplete', 1);
          }
        } catch (error) {
          events.emit('counter', 'axion.auth.login_page.errors', 1);
          throw error;
        }
      },
    },
  ],
};
