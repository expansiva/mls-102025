/// <mls fileReference="_102025_/l2/collabMessagesAppsIcon.test.ts" enhancement="_blank" />

import test from 'node:test';
import assert from 'node:assert/strict';
import { menuIconSvg } from '/_102025_/l2/collabMessagesAppsIcon.js';

const known = (name: string): string | undefined => (name === 'house' ? '<path d="M3 9"/>' : undefined);

function captureWarn(run: () => void): string[] {
    const warns: string[] = [];
    const original = console.warn;
    console.warn = (message?: unknown) => {
        warns.push(String(message));
    };
    try {
        run();
    } finally {
        console.warn = original;
    }
    return warns;
}

test('empty icon name draws nothing and does not warn', () => {
    const warns = captureWarn(() => {
        assert.equal(menuIconSvg('', known), undefined);
    });
    assert.deepEqual(warns, []);
});

test('known icon returns an svg with the artwork and currentColor stroke', () => {
    const warns = captureWarn(() => {
        const svg = menuIconSvg('house', known);
        assert.equal(typeof svg, 'string');
        assert.match(svg ?? '', /^<svg/);
        assert.match(svg ?? '', /stroke="currentColor"/);
        assert.match(svg ?? '', /<path d="M3 9"\/>/);
    });
    assert.deepEqual(warns, []);
});

test('unknown icon draws nothing and warns once', () => {
    const warns = captureWarn(() => {
        assert.equal(menuIconSvg('nao-existe', known), undefined);
        assert.equal(menuIconSvg('nao-existe', known), undefined);
    });
    assert.deepEqual(warns, ['[appsMenu] unknown Lucide icon: nao-existe']);
});
