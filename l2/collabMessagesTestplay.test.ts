/// <mls fileReference="_102025_/l2/collabMessagesTestplay.test.ts" enhancement="_blank" />

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { setEnvironment } from '/_102036_/l2/environmentContract.js';
import {
    isHelpCommand,
    isTestplayCommand,
    resetNotificationSession,
    runNotificationTestplay,
    setNotificationSoundForTests,
} from '/_102025_/l2/collabMessagesSyncNotifications.js';

const here = dirname(fileURLToPath(import.meta.url));

function installMemoryStorage(): void {
    const store = new Map<string, string>();
    (globalThis as { localStorage?: Storage }).localStorage = {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => { store.set(key, value); },
        removeItem: (key: string) => { store.delete(key); },
        clear: () => store.clear(),
        key: (index: number) => [...store.keys()][index] ?? null,
        get length() { return store.size; },
    } as Storage;
}

function withPermission(permission: NotificationPermission, fn: () => Promise<void>): Promise<void> {
    const holder = globalThis as { Notification?: { permission: NotificationPermission } };
    const previous = holder.Notification;
    holder.Notification = { permission };
    return fn().finally(() => {
        if (previous === undefined) delete holder.Notification;
        else holder.Notification = previous;
    });
}

function stubSoundUrl(url: string | null): void {
    setEnvironment({
        notifications: {
            getPushSubscriptionForBackend: async () => null,
            getNotifySoundUrl: async () => url,
            sendRequestMissed: async () => undefined,
            sendACK: async () => undefined,
        },
    });
}

function stubQuerySelector(result: Element | null): () => void {
    const doc = globalThis.document as unknown as { querySelector?: typeof document.querySelector };
    const prev = doc.querySelector;
    doc.querySelector = (() => result) as typeof document.querySelector;
    return () => {
        if (prev) doc.querySelector = prev;
        else delete doc.querySelector;
    };
}

function stubFetch(status: number, contentType: string): () => void {
    const original = globalThis.fetch;
    globalThis.fetch = (async () => ({
        status,
        headers: { get: (name: string) => name.toLowerCase() === 'content-type' ? contentType : null },
    })) as typeof fetch;
    return () => {
        if (original) globalThis.fetch = original;
        else delete (globalThis as { fetch?: typeof fetch }).fetch;
    };
}

test('T1: local commands do not call msgAddMessage', () => {
    assert.equal(isHelpCommand('/help'), true);
    assert.equal(isHelpCommand('  /help  '), true);
    assert.equal(isHelpCommand('/help extra'), true);
    assert.equal(isHelpCommand('hello'), false);
    assert.equal(isHelpCommand('/helper'), false);

    assert.equal(isTestplayCommand('/testplay'), true);
    assert.equal(isTestplayCommand('  /testplay  '), true);
    assert.equal(isTestplayCommand('/testplay extra'), true);
    assert.equal(isTestplayCommand('hello'), false);
    assert.equal(isTestplayCommand('/testplayground'), false);

    const src = readFileSync(join(here, 'collabMessagesChat.ts'), 'utf8');
    const start = src.indexOf('private async handleSend');
    const end = src.indexOf('private handlePromptResize');
    assert.ok(start >= 0 && end > start, 'handleSend not found');
    const body = src.slice(start, end);
    assert.match(body, /isHelpCommand\(/);
    assert.match(body, /localCommandsHelp/);
    assert.match(body, /isTestplayCommand\(/);
    assert.match(body, /runNotificationTestplay\(/);
    assert.doesNotMatch(body, /msgAddMessage/);
    const helpIntercept = body.indexOf('isHelpCommand');
    const testplayIntercept = body.indexOf('isTestplayCommand');
    const send = body.indexOf('this.addMessage');
    assert.ok(helpIntercept >= 0 && send > helpIntercept, 'help must return before addMessage');
    assert.ok(testplayIntercept >= 0 && send > testplayIntercept, 'testplay must return before addMessage');
    assert.match(body.slice(helpIntercept, testplayIntercept), /return;/);
    assert.match(body.slice(testplayIntercept, send), /return;/);
});

test('T2: play() resolving reports sound: played; NotAllowedError reports blocked', async () => {
    installMemoryStorage();
    if (!(globalThis as { window?: unknown }).window) {
        (globalThis as { window?: unknown }).window = globalThis;
    }
    resetNotificationSession();
    stubSoundUrl('/sound.wav');
    const restoreQuery = stubQuerySelector(null);
    const restoreFetch = stubFetch(200, 'audio/wav');
    try {
        await withPermission('denied', async () => {
            setNotificationSoundForTests({
                currentTime: 0,
                play: async () => undefined,
            } as unknown as HTMLAudioElement);
            const played = await runNotificationTestplay();
            assert.match(played, /^sound: played$/m);

            const err = Object.assign(new Error('play() failed'), { name: 'NotAllowedError' });
            setNotificationSoundForTests({
                currentTime: 0,
                play: async () => { throw err; },
            } as unknown as HTMLAudioElement);
            const blocked = await runNotificationTestplay();
            assert.match(blocked, /^sound: blocked \(NotAllowedError\)$/m);
        });
    } finally {
        restoreQuery();
        restoreFetch();
        resetNotificationSession();
        setEnvironment({});
    }
});

test('T3: without icon link reports badge: skipped (no-icon-link)', async () => {
    installMemoryStorage();
    if (!(globalThis as { window?: unknown }).window) {
        (globalThis as { window?: unknown }).window = globalThis;
    }
    resetNotificationSession();
    stubSoundUrl('/sound.wav');
    setNotificationSoundForTests({
        currentTime: 0,
        play: async () => undefined,
    } as unknown as HTMLAudioElement);
    const restoreQuery = stubQuerySelector(null);
    const restoreFetch = stubFetch(200, 'audio/wav');
    try {
        await withPermission('denied', async () => {
            const report = await runNotificationTestplay();
            assert.match(report, /^badge: skipped \(no-icon-link\)$/m);
        });
    } finally {
        restoreQuery();
        restoreFetch();
        resetNotificationSession();
        setEnvironment({});
    }
});

test('T4: sound-file line reports the URL status from a fake fetch', async () => {
    installMemoryStorage();
    if (!(globalThis as { window?: unknown }).window) {
        (globalThis as { window?: unknown }).window = globalThis;
    }
    resetNotificationSession();
    stubSoundUrl('/_102025_/l3/assets/collabNotification.wav');
    setNotificationSoundForTests({
        currentTime: 0,
        play: async () => undefined,
    } as unknown as HTMLAudioElement);
    const restoreQuery = stubQuerySelector(null);
    const restoreFetch = stubFetch(418, 'audio/wav');
    try {
        await withPermission('denied', async () => {
            const report = await runNotificationTestplay();
            assert.match(
                report,
                /^sound-file: \/_102025_\/l3\/assets\/collabNotification\.wav status 418 content-type audio\/wav$/m,
            );
        });
    } finally {
        restoreQuery();
        restoreFetch();
        resetNotificationSession();
        setEnvironment({});
    }
});

test('T5: testplay report is in English', async () => {
    installMemoryStorage();
    if (!(globalThis as { window?: unknown }).window) {
        (globalThis as { window?: unknown }).window = globalThis;
    }
    resetNotificationSession();
    stubSoundUrl('/sound.wav');
    setNotificationSoundForTests({
        currentTime: 0,
        play: async () => undefined,
    } as unknown as HTMLAudioElement);
    const restoreQuery = stubQuerySelector(null);
    const restoreFetch = stubFetch(200, 'audio/wav');
    try {
        await withPermission('default', async () => {
            const report = await runNotificationTestplay();
            assert.match(report, /^unlocked: (true|false)$/m);
            assert.match(report, /^sound: /m);
            assert.match(report, /^badge: /m);
            assert.match(report, /^notification: permission default$/m);
            assert.match(report, /^sound-file: /m);
            assert.match(report, /^both: sound and notification \(explicit \/testplay\)$/m);
            assert.doesNotMatch(report, /destravado|bloqueado|permissão|arquivo|notificação|ícone/i);
        });
    } finally {
        restoreQuery();
        restoreFetch();
        resetNotificationSession();
        setEnvironment({});
    }
});
