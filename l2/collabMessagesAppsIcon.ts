/// <mls fileReference="_102025_/l2/collabMessagesAppsIcon.ts" enhancement="_blank" />

import { isSafeMenuIconSvg } from '/_102036_/l2/inlineSvg.js';

const warnedNames = new Set<string>();

let artworkPromise: Promise<(name: string) => string | undefined> | undefined;

export function menuIconSvg(name: string, artwork: (name: string) => string | undefined): string | undefined {
    if (name === '') return undefined;
    const drawing = artwork(name);
    if (drawing === undefined) {
        if (!warnedNames.has(name)) {
            warnedNames.add(name);
            console.warn(`[appsMenu] unknown Lucide icon: ${name}`);
        }
        return undefined;
    }
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawing}</svg>`;
}

/**
 * The drawing of a menu entry: its own SVG (`iconSvg`) when it passes the inline-SVG rule, otherwise
 * the Lucide `icon`. The rule runs again here, where the markup is inlined: whoever inlines has the
 * last word, whatever the menu builder already checked. A rule-abiding root has no width/height, so
 * the size is set on it here.
 */
export function menuEntryIconSvg(
    entry: { icon?: string; iconSvg?: string },
    artwork: (name: string) => string | undefined,
): string | undefined {
    const own = typeof entry.iconSvg === 'string' ? entry.iconSvg.trim() : '';
    if (own) {
        if (isSafeMenuIconSvg(own)) return own.replace(/^<svg/iu, '<svg width="18" height="18" aria-hidden="true"');
        if (!warnedNames.has(own)) {
            warnedNames.add(own);
            console.warn('[appsMenu] unsafe iconSvg ignored');
        }
    }
    return menuIconSvg(entry.icon ?? '', artwork);
}

export function loadLucideArtwork(): Promise<(name: string) => string | undefined> {
    artworkPromise ??= import('/_102036_/l2/lucideArtwork.js').then(mod => mod.lucideArtwork);
    return artworkPromise;
}
