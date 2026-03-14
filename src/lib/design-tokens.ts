/**
 * Design Tokens - CPIS Design System Foundation
 * 
 * Centralized design tokens for typography, spacing, touch targets, and animations.
 * Use these tokens to maintain consistency across all modules.
 * 
 * Reference: docs/UI_AUDIT.md - UX-201
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine clsx and tailwind-merge for consistent class handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// TYPOGRAPHY TOKENS
// ============================================

export const typography = {
  /** Page title - use once per page */
  h1: 'text-3xl font-bold tracking-tight',
  /** Section title */
  h2: 'text-2xl font-semibold tracking-tight',
  /** Subsection or card title */
  h3: 'text-xl font-medium',
  /** Default body text */
  body: 'text-base',
  /** Secondary/caption text */
  caption: 'text-sm text-muted-foreground',
} as const;

// ============================================
// SPACING TOKENS
// ============================================

export const spacing = {
  /** Tight spacing - lists, compact sections */
  compact: 'space-y-4',
  /** Default spacing - most common */
  default: 'space-y-6',
  /** Generous spacing - major sections */
  spacious: 'space-y-8',
} as const;

// ============================================
// TOUCH TARGET TOKENS
// ============================================

export const touchTarget = {
  /** Minimum 44px touch target per WCAG/Apple HIG */
  minimum: 'min-h-[44px] min-w-[44px]',
  /** Minimum with padding for icons */
  icon: 'h-6 w-6 min-h-[44px] min-w-[44px]',
} as const;

// ============================================
// ANIMATION TOKENS
// ============================================

export const animation = {
  /** Micro-interactions - buttons, toggles */
  fast: 'duration-150',
  /** Standard UI transitions */
  normal: 'duration-200',
  /** Page/section transitions */
  slow: 'duration-300',
} as const;

// ============================================
// CARD TOKENS
// ============================================

export const cardPadding = {
  /** Compact card - dense information */
  compact: 'p-4',
  /** Default card spacing */
  default: 'p-6',
} as const;

// ============================================
// FOCUS STYLES
// ============================================

export const focusStyles = {
  /** Default focus ring */
  default: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  /** Subtle focus for less critical elements */
  subtle: 'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1',
} as const;

// ============================================
// UTILITY COMPOSITIONS
// ============================================

/**
 * Standard page header composition
 */
export const pageHeader = {
  wrapper: 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
  title: typography.h2,
  actions: 'flex gap-2',
} as const;

/**
 * Standard card composition  
 */
export const card = {
  base: 'rounded-lg border bg-card text-card-foreground shadow-sm',
  padding: cardPadding.default,
} as const;

/**
 * Interactive element base styles
 */
export const interactive = {
  base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:focusStyles.default disabled:pointer-events-none disabled:opacity-50',
  button: `${touchTarget.minimum} ${animation.normal}`,
} as const;
