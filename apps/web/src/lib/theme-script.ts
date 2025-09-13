/**
 * Blocking script для установки темы до рендеринга React.
 * Предотвращает мерцание за счет синхронного применения темы.
 */
export const themeScript = `
(function() {
  try {
    // Получаем сохраненную тему из localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Функция для определения системной темы
    function getSystemTheme() {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    
    // Определяем финальную тему
    let theme;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      theme = savedTheme;
    } else if (savedTheme === 'system' || !savedTheme) {
      theme = getSystemTheme();
    } else {
      theme = 'light'; // fallback
    }
    
    // Применяем тему к html элементу
    const html = document.documentElement;
    
    // Удаляем все классы темы
    html.classList.remove('light', 'dark');
    
    // Добавляем нужный класс
    html.classList.add(theme);
    
    // Устанавливаем data-theme атрибут для CSS
    html.setAttribute('data-theme', theme);
    
    // Устанавливаем CSS переменную для логотипа
    html.style.setProperty('--logo-display-light', theme === 'light' ? 'block' : 'none');
    html.style.setProperty('--logo-display-dark', theme === 'dark' ? 'block' : 'none');
    
  } catch (e) {
    // При ошибке устанавливаем светлую тему
    document.documentElement.classList.add('light');
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.setProperty('--logo-display-light', 'block');
    document.documentElement.style.setProperty('--logo-display-dark', 'none');
  }
})();
`;
