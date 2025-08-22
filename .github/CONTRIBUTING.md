# Руководство по внесению вклада

## Conventional Commits

Мы используем [Conventional Commits](https://www.conventionalcommits.org/) для
автоматической генерации changelog и релизов.

### Формат коммитов

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Типы коммитов

- `feat`: Новая функциональность
- `fix`: Исправление ошибки
- `docs`: Изменения в документации
- `style`: Изменения форматирования, отступов и т.д.
- `refactor`: Рефакторинг кода
- `perf`: Улучшения производительности
- `test`: Добавление или изменение тестов
- `build`: Изменения в системе сборки
- `ci`: Изменения в CI/CD
- `chore`: Обновления зависимостей и другие технические изменения

### Примеры

#### Новая функция (patch)

```bash
feat: add user authentication system
feat(auth): implement JWT token validation
```

#### Исправление ошибки (patch)

```bash
fix: resolve memory leak in user service
fix(api): handle null values in response
```

#### Breaking change (major)

```bash
feat!: change API response format

BREAKING CHANGE: The API response now returns data in a different format.
```

### Автоматические релизы

При пуше в ветку `main`:

1. Анализируются коммиты с последнего релиза
2. Определяется тип релиза (major/minor/patch)
3. Генерируется новая версия
4. Создается changelog
5. Публикуется GitHub Release
6. Обновляется package.json

### Правила версионирования

- `fix:` → patch (1.0.0 → 1.0.1)
- `feat:` → minor (1.0.0 → 1.1.0)
- `BREAKING CHANGE:` → major (1.0.0 → 2.0.0)

### Локальное тестирование релиза

```bash
# Проверить какой релиз будет создан
bun run release:dry
```
