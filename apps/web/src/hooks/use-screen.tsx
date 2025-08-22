import { useState } from 'react';

import { useDebounceCallback } from './use-debounce-callback';
import { useEventListener } from './use-event-listener';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

interface UseScreenOptions<InitializeWithValue extends boolean | undefined> {
  initializeWithValue: InitializeWithValue;
  debounceDelay?: number;
}

const IS_SERVER = typeof window === 'undefined';

export function useScreen(options: UseScreenOptions<false>): Screen | undefined;
export function useScreen(options?: Partial<UseScreenOptions<true>>): Screen;
export function useScreen(options: Partial<UseScreenOptions<boolean>> = {}): Screen | undefined {
  let { initializeWithValue = true } = options;
  if (IS_SERVER) {
    initializeWithValue = false;
  }

  const readScreen = () => {
    if (IS_SERVER) {
      return undefined;
    }
    return window.screen;
  };

  const [screen, setScreen] = useState<Screen | undefined>(() => {
    if (initializeWithValue) {
      return readScreen();
    }
    return undefined;
  });

  const debouncedSetScreen = useDebounceCallback(setScreen, options.debounceDelay);

  function handleSize() {
    const newScreen = readScreen();
    const setSize = options.debounceDelay ? debouncedSetScreen : setScreen;

    if (newScreen) {
      const { width, height, availHeight, availWidth, colorDepth, orientation, pixelDepth } =
        newScreen;

      setSize({
        width,
        height,
        availHeight,
        availWidth,
        colorDepth,
        orientation,
        pixelDepth,
      });
    }
  }

  useEventListener('resize', handleSize);

  useIsomorphicLayoutEffect(() => {
    handleSize();
  }, []);

  return screen;
}

export type { UseScreenOptions };
