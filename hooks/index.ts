// hooks/index.ts
// Barrel export for hooks. Cross-folder imports go through here
// (`@hooks/...`). Domain hooks are added by consumers.

export { usePlatformAnimation } from './usePlatformAnimation';
export type { UsePlatformAnimationReturn } from './usePlatformAnimation';
export { useReducedMotion, checkReducedMotionPreference, default as useAnimation } from './useAnimation';
export { useFadeSlide } from './useFadeSlide';
export type { UseFadeSlideOptions, UseFadeSlideReturn } from './useFadeSlide';
export { useAndroidChromeBlurFix } from './useAndroidChromeBlurFix';
export type { UseAndroidChromeBlurFixReturn } from './useAndroidChromeBlurFix';
export { useMounted } from './useMounted';
export { usePrevious } from './usePrevious';
export { usePwaPrompt } from './usePwaPrompt';
export type { UsePwaPromptResult, PwaPlatform } from './usePwaPrompt';
export { useAnimatedCounter } from './useAnimatedCounter';
export { useFadeIn } from './useFadeAnimation';
export type {
  FadeAnimationOptions,
  UseFadeInReturn,
} from './useFadeAnimation';
export { useScaleIn, usePopIn } from './useScaleAnimation';
export type {
  ScaleAnimationOptions,
  UseScaleInReturn,
  UsePopInOptions,
  UsePopInReturn,
} from './useScaleAnimation';
export { useContainerQuery } from './useContainerQuery';
export type { ContainerMeasurement } from './useContainerQuery';
export { useShake } from './useShakeAnimation';
export type { ShakeAnimationOptions, UseShakeReturn } from './useShakeAnimation';
export { useTranslateY } from './useTranslateAnimation';
export type {
  TranslateAnimationOptions,
  UseTranslateYReturn,
} from './useTranslateAnimation';
export {
  useContainerVariant,
  computeContainerVariant,
  DEFAULT_VARIANT_THRESHOLDS,
  VARIANT_PRESETS,
} from './useContainerVariant';
export type {
  ContainerVariant,
  VariantThresholds,
  VariantHeights,
  VariantConfig,
} from './useContainerVariant';
export { useAuthNavigation } from './useAuthNavigation';
export { useShimmer } from './useShimmer';
export type { UseShimmerOptions } from './useShimmer';
export { useActivityGridLayout, computeActivityGridLayout } from './useActivityGridLayout';
export type {
  ActivityGridLayout,
  ActivityGridLayoutInput,
  ActivityGridLayoutMode,
} from './useActivityGridLayout';
export { useCopyForAi } from './useCopyForAi';
export type { UseCopyForAiResult } from './useCopyForAi';
