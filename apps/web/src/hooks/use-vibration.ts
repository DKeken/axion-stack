import { useCallback, useEffect, useState } from 'react';

import {
  areVibrationsEnabled,
  isVibrationSupported,
  stopVibration,
  type VibrationPatterns,
  vibrate,
  vibratePattern,
} from '~/utils/vibration';

export interface UseVibrationReturn {
  /** Trigger vibration with custom pattern */
  vibrate: (pattern?: number | number[]) => void;
  /** Trigger predefined vibration pattern */
  vibratePattern: (patternName: keyof VibrationPatterns) => void;
  /** Stop ongoing vibration */
  stop: () => void;
  /** Check if vibration is supported */
  isSupported: boolean;
  /** Check if vibrations are enabled */
  isEnabled: boolean;
  /** Vibrate on success */
  success: () => void;
  /** Vibrate on error */
  error: () => void;
  /** Vibrate on warning */
  warning: () => void;
  /** Short vibration */
  short: () => void;
  /** Medium vibration */
  medium: () => void;
  /** Long vibration */
  long: () => void;
}

/**
 * Hook for handling device vibration
 * @example
 * const { vibrate, success, isSupported } = useVibration();
 *
 * // Custom vibration
 * vibrate([200, 100, 200]);
 *
 * // Predefined patterns
 * success(); // Success pattern
 * error();   // Error pattern
 */
export const useVibration = (): UseVibrationReturn => {
  // Use state for SSR safety and to react to preference changes
  const [isSupportedState, setIsSupportedState] = useState<boolean>(false);
  const [isEnabledState, setIsEnabledState] = useState<boolean>(false);

  useEffect(() => {
    // Initialize on client
    setIsSupportedState(isVibrationSupported());
    setIsEnabledState(areVibrationsEnabled());

    // Track reduced motion changes to recompute enabled state
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleChange = () => setIsEnabledState(areVibrationsEnabled());

      // Modern browsers prefer addEventListener
      try {
        mediaQuery.addEventListener('change', handleChange);
      } catch {
        // Fallback for Safari
        mediaQuery.addListener(handleChange);
      }

      return () => {
        try {
          mediaQuery.removeEventListener('change', handleChange);
        } catch {
          mediaQuery.removeListener(handleChange);
        }
      };
    }

    return undefined;
  }, []);

  const vibrateHandler = useCallback((pattern?: number | number[]) => {
    vibrate(pattern);
  }, []);

  const vibratePatternHandler = useCallback((patternName: keyof VibrationPatterns) => {
    vibratePattern(patternName);
  }, []);

  const stopHandler = useCallback(() => {
    stopVibration();
  }, []);

  // Shortcuts for common patterns
  const success = useCallback(() => vibratePattern('success'), []);
  const error = useCallback(() => vibratePattern('error'), []);
  const warning = useCallback(() => vibratePattern('warning'), []);
  const short = useCallback(() => vibratePattern('short'), []);
  const medium = useCallback(() => vibratePattern('medium'), []);
  const long = useCallback(() => vibratePattern('long'), []);

  return {
    vibrate: vibrateHandler,
    vibratePattern: vibratePatternHandler,
    stop: stopHandler,
    isSupported: isSupportedState,
    isEnabled: isEnabledState,
    success,
    error,
    warning,
    short,
    medium,
    long,
  };
};
