import { type Page } from '@playwright/test';

interface TestContext {
  vars: Record<string, unknown>;
}

interface Events {
  emit: (event: string, metric: string, value: number) => void;
}

// Get metric prefix from environment or use default
const METRIC_PREFIX = process.env.RABBITMQ_QUEUE_PREFIX || 'axion';

// Helper function to create metric names
function createMetricName(category: string, name: string): string {
  return `${METRIC_PREFIX}.${category}.${name}`;
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
      testFunction: async (page: Page, _context: TestContext, events: Events) => {
        const startTime = Date.now();

        try {
          await page.goto('/auth/login');
          const navigationTime = Date.now() - startTime;
          events.emit('histogram', createMetricName('auth', 'navigation_time'), navigationTime);

          await page.waitForSelector('form', { timeout: 10000 });
          const formLoadTime = Date.now() - startTime;
          events.emit('histogram', createMetricName('auth', 'form_load_time'), formLoadTime);

          const defaultUsername = `admin@${METRIC_PREFIX}.dev`;
          const username = process.env.AUTH_USERNAME || defaultUsername;
          const password = process.env.AUTH_PASSWORD || 'admin123';

          await page.fill('input[type="email"]', username);
          await page.fill('input[type="password"]', password);

          const submitStartTime = Date.now();
          await page.click('button[type="submit"]');

          try {
            await page.waitForURL('/', { timeout: 10000 });
            const authTime = Date.now() - submitStartTime;
            events.emit('histogram', createMetricName('auth', 'login_time'), authTime);
            events.emit('counter', createMetricName('auth', 'login.success'), 1);

            const bodyText = await page.locator('body').textContent();
            if (!bodyText?.includes('login')) {
              events.emit('counter', createMetricName('auth', 'verification.success'), 1);
            } else {
              events.emit('counter', createMetricName('auth', 'verification.failure'), 1);
            }
          } catch (_navError) {
            events.emit('counter', createMetricName('auth', 'login.failure'), 1);

            const errorElement = page.locator('[role="alert"], .error, .alert-danger').first();
            if (await errorElement.isVisible()) {
              events.emit('counter', createMetricName('auth', 'login.error_shown'), 1);
            }

            throw new Error('Login failed or navigation timeout');
          }
        } catch (error) {
          events.emit('counter', createMetricName('auth', 'errors'), 1);
          throw error;
        }
      },
    },
    {
      name: 'Login Page Load Test',
      weight: 30,
      engine: 'playwright',
      testFunction: async (page: Page, _context: TestContext, events: Events) => {
        const startTime = Date.now();

        try {
          await page.goto('/auth/login');
          await page.waitForLoadState('networkidle', { timeout: 10000 });

          const loadTime = Date.now() - startTime;
          events.emit('histogram', createMetricName('auth', 'login_page_load_time'), loadTime);

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
            events.emit('counter', createMetricName('auth', 'login_page.complete'), 1);
          } else {
            events.emit('counter', createMetricName('auth', 'login_page.incomplete'), 1);
          }
        } catch (error) {
          events.emit('counter', createMetricName('auth', 'login_page.errors'), 1);
          throw error;
        }
      },
    },
  ],
};
