/// <mls fileReference="_102025_/l2/collabMessagesAppsIcon.ts" enhancement="_blank" />

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

export function loadLucideArtwork(): Promise<(name: string) => string | undefined> {
    artworkPromise ??= import('/_102036_/l2/lucideArtwork.js').then(mod => mod.lucideArtwork);
    return artworkPromise;
}
