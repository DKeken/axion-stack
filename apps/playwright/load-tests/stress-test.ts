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
      { duration: 60, arrivalRate: 1, name: 'Initial load' },
      { duration: 120, arrivalRate: 5, name: 'Ramp up' },
      { duration: 180, arrivalRate: 10, name: 'Peak load' },
      { duration: 120, arrivalRate: 2, name: 'Cool down' },
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
            jobName: 'axion-stack-stress-tests',
            instance: 'playwright-tests',
          },
        },
      ],
    },
  },
  scenarios: [
    {
      name: 'Mixed Operations Stress Test',
      weight: 60,
      engine: 'playwright',
      testFunction: async (page: Page, context: TestContext, events: Events) => {
        const startTime = Date.now();

        try {
          const scenarios = ['home_page', 'auth_page', 'api_health'];
          const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

          switch (scenario) {
            case 'home_page':
              await page.goto('/');
              await page.waitForLoadState('networkidle', { timeout: 5000 });
              events.emit('counter', 'axion.stress.home_page.requests', 1);
              break;

            case 'auth_page':
              await page.goto('/auth/login');
              await page.waitForSelector('form', { timeout: 5000 });
              events.emit('counter', 'axion.stress.auth_page.requests', 1);
              break;

            case 'api_health':
              await page.goto('/');
              await page.waitForLoadState('networkidle', { timeout: 5000 });
              events.emit('counter', 'axion.stress.api_health.requests', 1);
              break;
          }

          const responseTime = Date.now() - startTime;
          events.emit('histogram', `axion.stress.${scenario}.response_time`, responseTime);
          events.emit('counter', `axion.stress.${scenario}.success`, 1);
        } catch (error) {
          events.emit('counter', 'axion.stress.errors', 1);
          throw error;
        }
      },
    },
    {
      name: 'Rapid Navigation Test',
      weight: 40,
      engine: 'playwright',
      testFunction: async (page: Page, context: TestContext, events: Events) => {
        const startTime = Date.now();

        try {
          const pages = ['/', '/auth/login', '/auth/register'];

          for (const url of pages) {
            const navStart = Date.now();
            await page.goto(url);
            await page.waitForLoadState('domcontentloaded', { timeout: 3000 });

            const navTime = Date.now() - navStart;
            events.emit('histogram', 'axion.stress.rapid_nav.page_time', navTime);
          }

          const totalTime = Date.now() - startTime;
          events.emit('histogram', 'axion.stress.rapid_nav.total_time', totalTime);
          events.emit('counter', 'axion.stress.rapid_nav.success', 1);
        } catch (error) {
          events.emit('counter', 'axion.stress.rapid_nav.errors', 1);
          throw error;
        }
      },
    },
  ],
};
