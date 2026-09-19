// hooks/useFadeAnimation.ts
// One-shot fade-in hook — eliminates the `useRef(new Animated.Value(...))
// + useEffect(timing)` boilerplate for the mount-fade pattern.
//
// `useNativeDriver` is `!isWeb` because native animation offloading is
// free on iOS/Android but janks on React Native Web.

import { useRef, useEffect, useCallback } from 'react';
import { Animated, Easing } from 'react-native';
import { isWeb } from '../utils';
import { DURATION } from '../constants';
import { useReducedMotion } from './useAnimation';

/**
 * Options for fade animation
 */
export interface FadeAnimationOptions {
  /** Animation duration in ms (default: 300) */
  duration?: number;
  /** Delay before animation starts in ms (default: 0) */
  delay?: number;
  /** Initial opacity value (default: 0) */
  initialOpacity?: number;
  /** Final opacity value (default: 1) */
  finalOpacity?: number;
  /** Whether to animate on mount (default: true) */
  animateOnMount?: boolean;
  /** Easing function (default: ease-out) */
  easing?: (value: number) => number;
}

/**
 * Return type for useFadeIn hook
 */
export interface UseFadeInReturn {
  /** Animated opacity value */
  opacity: Animated.Value;
  /** Style object with opacity */
  style: { opacity: Animated.Value };
  /** Start the fade in animation manually */
  fadeIn: () => void;
  /** Reset to initial opacity */
  reset: () => void;
  /** Animated value for chaining */
  animatedValue: Animated.Value;
}

/**
 * Hook for fade-in animations
 *
 * Replaces the common pattern:
 * ```tsx
 * // Before:
 * const opacity = useRef(new Animated.Value(0)).current;
 * useEffect(() => {
 *   Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: !isWeb }).start();
 * }, []);
 *
 * // After:
 * const { style } = useFadeIn();
 * return <Animated.View style={style}>...</Animated.View>;
 * ```
 */
export function useFadeIn(options: FadeAnimationOptions = {}): UseFadeInReturn {
  const {
    duration = DURATION.default,
    delay = 0,
    initialOpacity = 0,
    finalOpacity = 1,
    animateOnMount = true,
    easing = Easing.out(Easing.ease),
  } = options;

  const opacity = useRef(new Animated.Value(initialOpacity)).current;
  const reduced = useReducedMotion();

  const fadeIn = useCallback(() => {
    // Reduced motion still fades (opacity is the content), just shorter —
    // the FadeIn convention (≤200ms).
    const animation = Animated.timing(opacity, {
      toValue: finalOpacity,
      duration: reduced ? Math.min(duration, 200) : duration,
      delay,
      easing,
      useNativeDriver: !isWeb,
    });
    animation.start();
    return animation;
  }, [opacity, duration, delay, easing, finalOpacity, reduced]);

  const reset = useCallback(() => {
    opacity.setValue(initialOpacity);
  }, [opacity, initialOpacity]);

  useEffect(() => {
    if (animateOnMount) {
      fadeIn();
    }
  }, [animateOnMount, fadeIn]);

  return {
    opacity,
    style: { opacity },
    fadeIn,
    reset,
    animatedValue: opacity,
  };
}

export default useFadeIn;
