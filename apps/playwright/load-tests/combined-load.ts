import { type Page } from '@playwright/test';

interface TestContext {
  vars: Record<string, unknown>;
}

interface Events {
  emit: (event: string, metric: string, value: number) => void;
}

interface PerformanceData {
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
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
      { duration: 60, arrivalRate: 1, name: 'Warmup phase' },
      { duration: 180, arrivalRate: 3, name: 'Normal load' },
      { duration: 120, arrivalRate: 6, name: 'Peak load' },
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
            jobName: 'axion-stack-combined-tests',
            instance: 'playwright-tests',
          },
        },
      ],
    },
  },
  scenarios: [
    {
      name: 'Full User Journey',
      weight: 50,
      engine: 'playwright',
      testFunction: async (page: Page, _context: TestContext, events: Events) => {
        const journeyStart = Date.now();

        try {
          await page.goto('/');
          await page.waitForLoadState('networkidle', { timeout: 10000 });
          events.emit('counter', createMetricName('journey', 'home_visit'), 1);

          await page.goto('/auth/login');
          await page.waitForSelector('form', { timeout: 10000 });
          events.emit('counter', createMetricName('journey', 'login_visit'), 1);

          const defaultUsername = `admin@${METRIC_PREFIX}.dev`;
          await page.fill('input[type="email"]', process.env.AUTH_USERNAME || defaultUsername);
          await page.fill('input[type="password"]', process.env.AUTH_PASSWORD || 'admin123');

          const loginStart = Date.now();
          await page.click('button[type="submit"]');

          try {
            await page.waitForURL('/', { timeout: 10000 });
            const loginTime = Date.now() - loginStart;
            events.emit('histogram', createMetricName('journey', 'login_time'), loginTime);
            events.emit('counter', createMetricName('journey', 'login_success'), 1);
          } catch (_loginError) {
            events.emit('counter', createMetricName('journey', 'login_failure'), 1);
          }

          const totalJourneyTime = Date.now() - journeyStart;
          events.emit('histogram', createMetricName('journey', 'total_time'), totalJourneyTime);
        } catch (error) {
          events.emit('counter', createMetricName('journey', 'errors'), 1);
          throw error;
        }
      },
    },
    {
      name: 'API Health Checks',
      weight: 25,
      engine: 'playwright',
      testFunction: async (page: Page, _context: TestContext, events: Events) => {
        const startTime = Date.now();

        try {
          let apiCalls = 0;
          let apiErrors = 0;

          page.on('response', (response) => {
            if (response.url().includes('/api/')) {
              apiCalls++;
              if (response.status() >= 400) {
                apiErrors++;
              }
            }
          });

          await page.goto('/');
          await page.waitForLoadState('networkidle', { timeout: 10000 });

          events.emit('counter', createMetricName('api', 'calls_detected'), apiCalls);
          events.emit('counter', createMetricName('api', 'errors_detected'), apiErrors);

          const healthCheckTime = Date.now() - startTime;
          events.emit('histogram', createMetricName('api', 'health_check_time'), healthCheckTime);
        } catch (error) {
          events.emit('counter', createMetricName('api', 'health_errors'), 1);
          throw error;
        }
      },
    },
    {
      name: 'Page Performance Test',
      weight: 25,
      engine: 'playwright',
      testFunction: async (page: Page, _context: TestContext, events: Events) => {
        try {
          await page.addInitScript(() => {
            window.addEventListener('load', () => {
              setTimeout(() => {
                const navigation = performance.getEntriesByType(
                  'navigation'
                )[0] as PerformanceNavigationTiming;
                if (navigation) {
                  (
                    window as unknown as Window & { performanceData: PerformanceData }
                  ).performanceData = {
                    domContentLoaded:
                      navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                    firstPaint:
                      performance
                        .getEntriesByType('paint')
                        .find((entry) => entry.name === 'first-paint')?.startTime || 0,
                    firstContentfulPaint:
                      performance
                        .getEntriesByType('paint')
                        .find((entry) => entry.name === 'first-contentful-paint')?.startTime || 0,
                  };
                }
              }, 1000);
            });
          });

          await page.goto('/');
          await page.waitForLoadState('networkidle', { timeout: 10000 });

          const perfData = await page.evaluate(
            () =>
              (window as unknown as Window & { performanceData: PerformanceData }).performanceData
          );

          if (perfData) {
            events.emit(
              'histogram',
              createMetricName('perf', 'dom_content_loaded'),
              perfData.domContentLoaded
            );
            events.emit(
              'histogram',
              createMetricName('perf', 'load_complete'),
              perfData.loadComplete
            );
            events.emit('histogram', createMetricName('perf', 'first_paint'), perfData.firstPaint);
            events.emit(
              'histogram',
              createMetricName('perf', 'first_contentful_paint'),
              perfData.firstContentfulPaint
            );
          }

          events.emit('counter', createMetricName('perf', 'measurements_collected'), 1);
        } catch (error) {
          events.emit('counter', createMetricName('perf', 'measurement_errors'), 1);
          throw error;
        }
      },
    },
  ],
};
