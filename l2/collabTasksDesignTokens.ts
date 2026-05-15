/// <mls fileReference="_102025_/l2/collabTasksDesignTokens.ts" enhancement="_blank"/>

/**
 * Tasks design tokens.
 *
 * This is a TypeScript barrel for the companion `collabTasksDesignTokens.less`
 * file, which exposes a shared set of CSS variables (`--ct-*`) consumed by all
 * tasks components: board, my-tasks, card, settings, theme picker, etc.
 *
 * The tokens are declared at `:root` so they cascade everywhere — making them
 * available to other mls-102025 components that wish to adopt them later
 * without forcing a refactor today.
 *
 * Import this module from any tasks component to ensure the stylesheet is
 * pulled in by the enhancement loader.
 */

// JS-side aliases for the few tokens that components need to read at runtime
// (e.g. for image scrim defaults, status accent strings used in inline styles).
// Keep this list short — prefer reading via CSS variables when possible.

export const CT_STATUS_ACCENT = {
  todo:           '#185fa5',
  'in progress':  '#854f0b',
  paused:         '#6b7280',
  done:           '#3b6d11',
  failed:         '#a32d2d',
} as const;

export const CT_TAG_ACCENT = {
  bug:      '#a32d2d',
  feature:  '#185fa5',
  business: '#854f0b',
  process:  '#085041',
  neutral:  '#5f5e5a',
} as const;

export type CtStatusKey = keyof typeof CT_STATUS_ACCENT;
export type CtTagKey    = keyof typeof CT_TAG_ACCENT;
