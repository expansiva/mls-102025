/// <mls fileReference="_102025_/l2/collabMessagesPromptOverlay.ts" enhancement="_blank" />

import { parseInlineRichText } from '/_102025_/l2/collabMessagesRichTextParser.js';
import type { RichToken } from '/_102025_/l2/collabMessagesRichTextParser.js';

// The prompt shows a transparent textarea over this overlay: the user sees the overlay but
// the caret belongs to the textarea. Joining every segment's text must give back exactly the
// textarea value, or the caret drifts away from the visible text.

export type OverlaySegmentKind =
    | 'text'
    | 'newline'
    | 'marker'
    | 'bold'
    | 'italic'
    | 'strike'
    | 'inline-code'
    | 'code-block'
    | 'mention'
    | 'agent'
    | 'channel'
    | 'command'
    | 'help'
    | 'link';

export interface OverlaySegment {
    kind: OverlaySegmentKind;
    text: string;
}

// Zero-width space drawn after a trailing line break: a final <br> alone creates no line box,
// while the textarea does show an empty last line.
export const OVERLAY_TRAILING_SENTINEL = '​';

export function buildOverlaySegments(text: string): OverlaySegment[] {
    const segments: OverlaySegment[] = [];
    // The textarea normalizes CRLF/CR to LF, so the overlay must too.
    const lines = normalizeLineBreaks(text).split('\n');

    lines.forEach((line, index) => {
        if (index > 0) segments.push({ kind: 'newline', text: '\n' });
        for (const token of parseInlineRichText(line, true)) {
            segments.push(...tokenSegments(token));
        }
    });

    return segments.filter(segment => segment.text !== '');
}

export function needsTrailingSentinel(text: string): boolean {
    return normalizeLineBreaks(text).endsWith('\n');
}

export function normalizeLineBreaks(text: string): string {
    return text.replace(/\r\n?/g, '\n');
}

export function overlayText(segments: OverlaySegment[]): string {
    return segments.map(segment => segment.text).join('');
}

function withMarkers(kind: OverlaySegmentKind, markerStart: string, value: string, markerEnd: string): OverlaySegment[] {
    return [
        { kind: 'marker', text: markerStart },
        { kind, text: value },
        { kind: 'marker', text: markerEnd },
    ];
}

function tokenSegments(token: RichToken): OverlaySegment[] {
    switch (token.type) {
        case 'text':
            return [{ kind: 'text', text: token.value }];
        case 'bold':
        case 'italic':
        case 'strike':
        case 'inline-code':
        case 'code-block':
            return withMarkers(token.type, token.markerStart, token.value, token.markerEnd);
        case 'mention':
            // Drawn as typed, not as "@Name": the textarea holds the whole markdown.
            return [{ kind: 'mention', text: `[@${token.value}](${token.userId})` }];
        case 'agent':
            return [{ kind: 'agent', text: `@@${token.value}` }];
        case 'channel':
            return [{ kind: 'channel', text: `#${token.value}` }];
        case 'command':
            return [{ kind: 'command', text: `/${token.value}` }];
        case 'help':
            return [{ kind: 'help', text: `?${token.value}` }];
        case 'link':
            return [{ kind: 'link', text: `[${token.text}](${token.url})` }];
        case 'raw-link':
            return [{ kind: 'link', text: token.url }];
        default:
            // Block tokens (heading, list, blockquote, rule) never come from the inline parser.
            return [];
    }
}
