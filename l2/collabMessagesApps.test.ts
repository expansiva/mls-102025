/// <mls fileReference="_102025_/l2/collabMessagesApps.test.ts" enhancement="_blank"/>

import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import type { CollabProgramMenu } from '/_102036_/l2/environmentContract.js';

type Listener = () => void;

type AppsModule = {
    CollabMessagesApps: new () => {
        connectedCallback(): void;
        disconnectedCallback(): void;
        menuModules: CollabProgramMenu[];
    };
    SITES_MENU_CHANGED: string;
};

function menu(name: string): CollabProgramMenu {
    return { name } as CollabProgramMenu;
}

function installApps(getProgramMenu: () => Promise<CollabProgramMenu[]>) {
    (globalThis as { __appsEnvironment?: unknown }).__appsEnvironment = {
        apps: { getProgramMenu, openProgram: async () => undefined },
    };
}

function installEvents() {
    const added: { levels: unknown; types: string[]; listener: Listener }[] = [];
    const removed: Listener[] = [];
    const g = globalThis as { mls?: { events?: unknown } };
    const previous = g.mls;
    g.mls = {
        events: {
            addEventListener: (levels: unknown, types: string[], listener: Listener) => {
                added.push({ levels, types, listener });
            },
            removeEventListener: (_levels: unknown, _types: unknown, listener: Listener) => {
                removed.push(listener);
            },
        },
    };
    return { added, removed, restore: () => { g.mls = previous; } };
}

async function loadApps(): Promise<AppsModule> {
    const source = readFileSync(new URL('./collabMessagesApps.ts', import.meta.url), 'utf8')
        .replace(/import[\s\S]*?collabMessagesAppsMenu\.js';\s*/, '')
        .replace(/@customElement\([^)]*\)\s*/, '')
        .replace(/@state\(\)\s*/, '');
    const header = [
        'class CollabLitElement { connectedCallback() {} disconnectedCallback() {} firstUpdated() {} }',
        'const html = () => undefined;',
        'const environment = new Proxy({}, { get: (_t, key) => globalThis.__appsEnvironment[key] });',
    ].join('\n');
    const js = ts.transpileModule(header + '\n' + source, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
    }).outputText;
    const file = join(mkdtempSync(join(tmpdir(), 'apps-menu-')), 'collabMessagesApps.mjs');
    writeFileSync(file, js);
    return import(pathToFileURL(file).href) as Promise<AppsModule>;
}

describe('apps menu listens for SitesMenuChanged', { concurrency: 1 }, () => {

test('subscribes to SitesMenuChanged while connected', async () => {
    const { CollabMessagesApps, SITES_MENU_CHANGED } = await loadApps();
    const events = installEvents();
    installApps(async () => [menu('a')]);
    const el = new CollabMessagesApps();
    el.connectedCallback();
    assert.equal(events.added.length, 1);
    assert.deepEqual(events.added[0].types, [SITES_MENU_CHANGED]);
    assert.deepEqual(events.added[0].levels, [0, 1, 2, 3, 4, 5, 6, 7]);
    el.disconnectedCallback();
    assert.deepEqual(events.removed, [events.added[0].listener]);
    events.restore();
});

test('the listener loads the menu again', async () => {
    const { CollabMessagesApps } = await loadApps();
    const events = installEvents();
    const served = [[menu('a')], [menu('b')]];
    let calls = 0;
    installApps(async () => served[calls++] ?? [menu('missing')]);
    const el = new CollabMessagesApps();
    el.connectedCallback();
    events.added[0].listener();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(calls, 1);
    assert.equal((el.menuModules[0] as { name: string }).name, 'a');
    events.added[0].listener();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(calls, 2);
    assert.equal((el.menuModules[0] as { name: string }).name, 'b');
    el.disconnectedCallback();
    events.restore();
});

test('three fires during a slow load run at most two fetches', async () => {
    const { CollabMessagesApps } = await loadApps();
    const events = installEvents();
    let calls = 0;
    let release: (value: CollabProgramMenu[]) => void = () => undefined;
    installApps(() => {
        calls += 1;
        if (calls === 1) return new Promise((resolve) => { release = resolve; });
        return Promise.resolve([menu('next')]);
    });
    const el = new CollabMessagesApps();
    el.connectedCallback();
    events.added[0].listener();
    events.added[0].listener();
    events.added[0].listener();
    assert.equal(calls, 1);
    release([menu('slow')]);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(calls, 2);
    assert.equal((el.menuModules[0] as { name: string }).name, 'next');
    el.disconnectedCallback();
    events.restore();
});

test('connects when mls.events is missing', async () => {
    const { CollabMessagesApps } = await loadApps();
    const g = globalThis as { mls?: { events?: unknown } };
    const previous = g.mls;
    g.mls = { events: {} };
    installApps(async () => []);
    const el = new CollabMessagesApps();
    el.connectedCallback();
    el.disconnectedCallback();
    g.mls = previous;
});

});
