/// <mls fileReference="_102025_/l2/collabMessagesAppsIcon.test.ts" enhancement="_blank" />

import test from 'node:test';
import assert from 'node:assert/strict';
import { menuEntryIconSvg, menuIconSvg } from '/_102025_/l2/collabMessagesAppsIcon.js';

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

test('menuEntryIconSvg: a safe iconSvg wins over the Lucide name and gets its size on the root', () => {
    const own = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12h18"/></svg>';
    const svg = menuEntryIconSvg({ icon: 'house', iconSvg: own }, known);
    assert.equal(svg?.startsWith('<svg width="18" height="18" aria-hidden="true" viewBox="0 0 24 24"'), true);
    assert.equal(svg?.includes('M3 12h18'), true);
});

test('menuEntryIconSvg: an unsafe iconSvg is ignored (warned) and the Lucide icon is drawn', () => {
    const warns = captureWarn(() => {
        const svg = menuEntryIconSvg({ icon: 'house', iconSvg: '<svg viewBox="0 0 24 24"><script>x()</script></svg>' }, known);
        assert.equal(svg?.includes('<path d="M3 9"/>'), true);
    });
    assert.equal(warns.some((warn) => warn.includes('unsafe iconSvg ignored')), true);
});

test('menuEntryIconSvg: without iconSvg it is the Lucide icon; with neither, nothing', () => {
    assert.equal(menuEntryIconSvg({ icon: 'house' }, known)?.includes('<path d="M3 9"/>'), true);
    assert.equal(menuEntryIconSvg({ icon: '' }, known), undefined);
});
