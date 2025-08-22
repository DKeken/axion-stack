# Load Testing for Axion Stack

Нагрузочные тесты для проекта Axion Stack с использованием Artillery +
Playwright.

## Структура тестов

### 📊 `smoke-test.ts`

**Цель**: Быстрая проверка основной функциональности

- **Нагрузка**: 1 пользователь, 30 секунд
- **Метрики**: Время загрузки страниц, доступность навигации
- **Использование**: CI/CD пайплайны, быстрые проверки

### 🔐 `auth-load.ts`

**Цель**: Нагрузочное тестирование системы аутентификации

- **Нагрузка**: 1-2 пользователя, 4 минуты (warmup → load → cooldown)
- **Сценарии**:
  - Полный поток аутентификации (70%)
  - Загрузка страницы логина (30%)
- **Метрики**: Время логина, успешность аутентификации, ошибки форм

### ⚡ `stress-test.ts`

**Цель**: Тестирование системы под высокой нагрузкой

- **Нагрузка**: 1-10 пользователей, 9 минут
- **Сценарии**:
  - Смешанные операции (60%)
  - Быстрая навигация (40%)
- **Метрики**: Время отклика при пиковой нагрузке, стабильность системы

### 🎯 `combined-load.ts`

**Цель**: Комплексное тестирование всех функций системы

- **Нагрузка**: 1-6 пользователей, 7 минут
- **Сценарии**:
  - Полный пользовательский путь (50%)
  - Проверки API здоровья (25%)
  - Тесты производительности страниц (25%)
- **Метрики**: Полный цикл взаимодействия, производительность, API мониторинг

## 🚀 Команды запуска

```bash
# Основные тесты
npm run load:smoke      # Быстрая проверка (30 сек)
npm run load:auth       # Тесты аутентификации (4 мин)
npm run load:stress     # Стресс тесты (9 мин)
npm run load:combined   # Комплексные тесты (7 мин)

# Отчеты
npm run load:report     # Генерация отчета
```

## 📈 Интеграция с Prometheus

Все тесты автоматически отправляют метрики в Prometheus Pushgateway:

```bash
# Метрики отправляются на:
PROMETHEUS_PUSHGATEWAY_URL=http://localhost:9091

# Примеры метрик:
axion_smoke_page_load_time          # Время загрузки страниц
axion_auth_login_time               # Время аутентификации
axion_stress_response_time          # Время отклика под нагрузкой
axion_journey_total_time            # Полное время пользовательского пути
axion_perf_first_contentful_paint   # Метрики производительности браузера
```

## ⚙️ Настройка

### Переменные окружения (.env):

```bash
BASE_URL=http://localhost:5173                    # Frontend URL
GATEWAY_URL=http://localhost:3000/api            # Gateway API
AUTH_USERNAME=admin@axion.dev                    # Тестовые данные
AUTH_PASSWORD=admin123
PROMETHEUS_PUSHGATEWAY_URL=http://localhost:9091  # Метрики
```

### Фазы нагрузки:

- **Warmup**: Постепенный разогрев системы
- **Load/Peak**: Основная нагрузка
- **Cooldown**: Плавное завершение

## 📋 Мониторинг результатов

### Ключевые показатели:

- **Response Time**: Время отклика операций (< 2s норма)
- **Success Rate**: Процент успешных операций (> 95%)
- **Error Rate**: Количество ошибок (< 5%)
- **Throughput**: Количество операций в секунду

### Grafana Dashboard:

Метрики доступны в Grafana через Prometheus:

- `rate(axion_*_total[5m])` - RPS
- `histogram_quantile(0.95, axion_*_time)` - 95th percentile времени отклика
- `increase(axion_*_errors_total[5m])` - Количество ошибок

## 🛠️ Разработка тестов

### Структура теста:

```typescript
export = {
  config: {
    target: 'http://localhost:5173',
    phases: [
      /* фазы нагрузки */
    ],
    engines: {
      playwright: {
        /* настройки */
      },
    },
    plugins: {
      /* интеграции */
    },
  },
  scenarios: [
    {
      name: 'Test Scenario',
      weight: 100,
      engine: 'playwright',
      testFunction: async (
        page: Page,
        context: TestContext,
        events: Events
      ) => {
        // Логика теста
        events.emit('histogram', 'metric_name', value);
        events.emit('counter', 'counter_name', 1);
      },
    },
  ],
};
```

### Лучшие практики:

- Используйте реалистичные таймауты (3-10s)
- Собирайте метрики на каждом этапе
- Обрабатывайте ошибки gracefully
- Тестируйте постепенно (smoke → load → stress)
- Мониторьте инфраструктуру во время тестов

## 🔧 Troubleshooting

**Проблема**: Таймауты при высокой нагрузке **Решение**: Увеличьте таймауты или
снизьте arrivalRate

**Проблема**: Метрики не отправляются  
**Решение**: Проверьте PROMETHEUS_PUSHGATEWAY_URL

**Проблема**: Высокий error rate **Решение**: Проверьте логи приложения и базы
данных
