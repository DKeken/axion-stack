module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Новая функциональность
        'fix', // Исправление ошибки
        'docs', // Документация
        'style', // Форматирование
        'refactor', // Рефакторинг
        'perf', // Производительность
        'test', // Тесты
        'build', // Система сборки
        'ci', // CI/CD
        'chore', // Обслуживание
        'revert', // Откат изменений
      ],
    ],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
  },
};
