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
      {
        duration: 30,
        arrivalRate: 1,
        name: 'Smoke test phase',
      },
    ],
    engines: {
      playwright: {
        aggregateByName: true,
        launchOptions: {
          headless: true,
        },
      },
    },
    plugins: {
      expect: {},
      'publish-metrics': [
        {
          type: 'prometheus-pushgateway',
          config: {
            pushgateway: process.env.PROMETHEUS_PUSHGATEWAY_URL || 'http://localhost:9091',
            jobName: 'axion-stack-smoke-tests',
            instance: 'playwright-tests',
          },
        },
      ],
    },
  },
  scenarios: [
    {
      name: 'Axion Stack Smoke Test',
      engine: 'playwright',
      testFunction: async (page: Page, context: TestContext, events: Events) => {
        const startTime = Date.now();

        try {
          await page.goto('/');
          await page.waitForLoadState('networkidle', { timeout: 10000 });

          const loadTime = Date.now() - startTime;
          events.emit('histogram', 'axion.smoke.page_load_time', loadTime);

          const body = page.locator('body');
          if (await body.isVisible()) {
            events.emit('counter', 'axion.smoke.page_load.success', 1);
          } else {
            events.emit('counter', 'axion.smoke.page_load.failure', 1);
            throw new Error('Page body not visible');
          }

          const nav = page.locator('nav, header, [role="navigation"]').first();
          if (await nav.isVisible()) {
            events.emit('counter', 'axion.smoke.navigation.found', 1);
          }
        } catch (error) {
          events.emit('counter', 'axion.smoke.errors', 1);
          throw error;
        }
      },
    },
  ],
};
