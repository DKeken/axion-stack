/**
 * Utility functions for device vibration using Web Vibration API
 * Compatible with modern mobile browsers
 */

export interface VibrationPatterns {
  // Короткая вибрация
  short: 100;
  // Средняя вибрация
  medium: 200;
  // Длинная вибрация
  long: 400;
  // Двойной тап
  doubleTap: [100, 100, 100];
  // Уведомление (успех)
  success: [200, 100, 200];
  // Уведомление (ошибка)
  error: [100, 50, 100, 50, 300];
  // Уведомление (предупреждение)
  warning: [200, 100, 200, 100, 200];
  // SOS паттерн в морзе
  sos: [100, 30, 100, 30, 100, 30, 200, 30, 200, 30, 200, 30, 100, 30, 100, 30, 100];
}

export const VIBRATION_PATTERNS: VibrationPatterns = {
  short: 100,
  medium: 200,
  long: 400,
  doubleTap: [100, 100, 100],
  success: [200, 100, 200],
  error: [100, 50, 100, 50, 300],
  warning: [200, 100, 200, 100, 200],
  sos: [100, 30, 100, 30, 100, 30, 200, 30, 200, 30, 200, 30, 100, 30, 100, 30, 100],
};

/**
 * Whether user prefers reduced motion
 */
const isReducedMotionPreferred = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

/**
 * Check if device supports vibration
 */
export const isVibrationSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  // Some environments may not define navigator
  if (typeof navigator === 'undefined') return false;
  return 'vibrate' in navigator && typeof navigator.vibrate === 'function';
};

/**
 * Trigger device vibration
 * @param pattern - Vibration pattern (number or array of numbers)
 */
export const vibrate = (pattern: number | number[] = VIBRATION_PATTERNS.medium): void => {
  if (!areVibrationsEnabled()) return;

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.warn('Vibration failed:', error);
  }
};

/**
 * Stop ongoing vibration
 */
export const stopVibration = (): void => {
  if (!isVibrationSupported()) return;

  try {
    navigator.vibrate(0);
  } catch (error) {
    console.warn('Stop vibration failed:', error);
  }
};

/**
 * Trigger predefined vibration pattern
 * @param patternName - Name of the predefined pattern
 */
export const vibratePattern = (patternName: keyof VibrationPatterns): void => {
  vibrate(VIBRATION_PATTERNS[patternName]);
};

/**
 * Create a custom vibration pattern
 * @param durations - Array of vibration durations and pauses
 * @example createVibrationPattern([200, 100, 200]) // vibrate 200ms, pause 100ms, vibrate 200ms
 */
export const createVibrationPattern = (durations: number[]): number[] => {
  return durations;
};

/**
 * Check if vibrations are enabled in user preferences
 * (Note: This only checks if the API is available, not user system settings)
 */
export const areVibrationsEnabled = (): boolean =>
  isVibrationSupported() && !isReducedMotionPreferred();
