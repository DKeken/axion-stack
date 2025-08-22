import { useEffect, useState } from 'react';

/**
 * Hook для отслеживания состояния гидратации клиентского приложения.
 * Возвращает true после первого рендера на клиенте, false - во время SSR.
 *
 * Используется для предотвращения несоответствий между серверным и клиентским рендерингом.
 */
export function useHydration(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
