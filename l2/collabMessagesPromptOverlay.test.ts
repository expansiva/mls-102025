/// <mls fileReference="_102025_/l2/collabMessagesPromptOverlay.test.ts" enhancement="_blank" />

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    buildOverlaySegments,
    needsTrailingSentinel,
    overlayText,
} from '/_102025_/l2/collabMessagesPromptOverlay.js';
import { parseInlineRichText } from '/_102025_/l2/collabMessagesRichTextParser.js';

const here = dirname(fileURLToPath(import.meta.url));

// Returns the rule block opened by `opener`, up to its matching closing brace.
function lessBlock(source: string, opener: string): string {
    const start = source.indexOf(opener);
    assert.ok(start !== -1, `block not found: ${opener}`);
    let depth = 0;
    for (let i = start + opener.length - 1; i < source.length; i++) {
        if (source[i] === '{') depth++;
        if (source[i] === '}' && --depth === 0) return source.slice(start, i + 1);
    }
    throw new Error(`unbalanced block: ${opener}`);
}

// Every shape the prompt can hold. The overlay must give back each one character by character.
const inputs: string[] = [
    '',
    'plain text',
    'texto **negrito** e _italico_ aqui',
    '**bold** `code` ~~old~~',
    'abc `',
    '`',
    'abc `open code',
    '``',
    '```',
    '```ts\nconst a = 1;\n```',
    'a ** b',
    'snake_case_word and _x',
    'oi [@Maria Silva](user-123) tudo bem',
    '[@broken](',
    '@@agentHelper faça isso',
    '@Maria sem markdown',
    '#general e /deploy e ?help',
    'veja [Google](https://google.com) e https://collab.codes/x?y=1',
    'www.collab.codes',
    'linha 1\nlinha 2',
    'linha 1\n\nlinha 3',
    'termina com enter\n',
    '\n',
    '\n\n',
    '- item 1\n- item 2\n  1. sub',
    '> citação **forte**',
    'emoji 😀 e acentuação ãéíõü',
    'tab\tseparado',
    '   espaços   no   meio   ',
];

test('overlay text equals the textarea text for every input shape', () => {
    for (const input of inputs) {
        assert.equal(overlayText(buildOverlaySegments(input)), input, `overlay drifted for ${JSON.stringify(input)}`);
    }
});

test('overlay normalizes CRLF like the textarea does', () => {
    assert.equal(overlayText(buildOverlaySegments('a\r\nb\rc')), 'a\nb\nc');
});

test('overlay keeps markdown mentions as typed', () => {
    const segments = buildOverlaySegments('oi [@Maria](u1)');
    const mention = segments.find(segment => segment.kind === 'mention');
    assert.equal(mention?.text, '[@Maria](u1)');
});

test('formatted runs keep their markers as separate segments', () => {
    const kinds = buildOverlaySegments('**b**').map(segment => segment.kind);
    assert.deepEqual(kinds, ['marker', 'bold', 'marker']);
});

test('trailing sentinel only when the text ends with a line break', () => {
    assert.equal(needsTrailingSentinel('a\n'), true);
    assert.equal(needsTrailingSentinel('a\r\n'), true);
    assert.equal(needsTrailingSentinel('a\nb'), false);
    assert.equal(needsTrailingSentinel(''), false);
});

test('parser returns a lone backtick instead of dropping it', () => {
    const tokens = parseInlineRichText('abc `');
    assert.deepEqual(tokens, [
        { type: 'text', value: 'abc ' },
        { type: 'text', value: '`' },
    ]);
});

test('overlay css does not change glyph widths', () => {
    const less = readFileSync(join(here, 'collabMessagesPrompt.less'), 'utf8');
    const overlay = lessBlock(less, '.prompt-overlay {');
    assert.doesNotMatch(overlay, /font-weight:\s*(bold|bolder|[5-9]00)/, 'overlay must not use bold');
    assert.doesNotMatch(overlay, /font-style:\s*italic/, 'overlay must not use italic');
    assert.doesNotMatch(overlay, /word-break:/, 'overlay must break words like the textarea');
    assert.match(less, /textarea\s*\{[^}]*display:\s*block/, 'textarea must be display:block');
});
