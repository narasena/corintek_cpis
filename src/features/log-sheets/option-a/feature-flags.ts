export const FEATURE_FLAGS = {
  OPTION_A_MOBILE_LAYOUT: true,
} as const;

export type TFeatureFlag = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(flag: TFeatureFlag): boolean {
  return FEATURE_FLAGS[flag] === true;
}
