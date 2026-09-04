/// <mls fileReference="_102025_/l2/requestMonacoLoad.test.ts" enhancement="_blank" />

import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { requestMonacoLoad } from '/_102025_/l2/requestMonacoLoad.js';

type HostWindow = { monacoReady?: Promise<void> };

function withWindow<T>(win: HostWindow, fn: () => Promise<T>): Promise<T> {
    const g = globalThis as unknown as { window: HostWindow | undefined };
    const prev = g.window;
    g.window = win;
    return fn().finally(() => {
        g.window = prev;
    });
}

function fireOnlyMls(fire: (...args: unknown[]) => Promise<void>) {
    return { events: { fire: fire as never } };
}

test('without a listener, rejects and does not create monacoReady', async () => {
    const fires: unknown[][] = [];
    const win: HostWindow = {};
    await withWindow(win, async () => {
        await assert.rejects(
            () => requestMonacoLoad(fireOnlyMls(async (...args) => { fires.push(args); })),
            /no host listened for LoadMonaco/,
        );
    });
    assert.equal('monacoReady' in win, false);
    assert.deepEqual(fires, [[2, 'LoadMonaco', 'loadMonaco', 0]]);
});

test('awaits the host-created monacoReady and does not create it', async () => {
    let resolveReady: (() => void) | undefined;
    const win: HostWindow = {};
    await withWindow(win, async () => {
        const mls = fireOnlyMls(async () => {
            win.monacoReady = new Promise<void>((resolve) => { resolveReady = resolve; });
        });
        const pending = requestMonacoLoad(mls);
        assert.equal(typeof resolveReady, 'function', 'host must create monacoReady during fire');
        resolveReady!();
        await pending;
    });
});

test('a hanging monacoReady times out instead of blocking the tab', async () => {
    const win: HostWindow = {};
    await withWindow(win, async () => {
        const mls = fireOnlyMls(async () => {
            win.monacoReady = new Promise<void>(() => { /* never resolves */ });
        });
        await assert.rejects(() => requestMonacoLoad(mls, 20), /monacoReady timed out/);
    });
});

test('mls.events.fire unavailable rejects without touching monacoReady', async () => {
    const win: HostWindow = {};
    await withWindow(win, async () => {
        await assert.rejects(() => requestMonacoLoad({}), /mls.events.fire unavailable/);
    });
    assert.equal('monacoReady' in win, false);
});

const PROJECT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOST_MARK = '_' + '102033' + '_';

function walkTs(dir: string, acc: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
        if (name === '.generated') continue;
        const p = join(dir, name);
        if (statSync(p).isDirectory()) walkTs(p, acc);
        else if (name.endsWith('.ts')) acc.push(p);
    }
    return acc;
}

test('mls-102025 must not import the 102033 host', () => {
    const hits = walkTs(PROJECT)
        .filter((file) => readFileSync(file, 'utf8').includes(HOST_MARK))
        .map((file) => relative(PROJECT, file));
    assert.deepEqual(hits, []);
});
