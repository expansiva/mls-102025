/// <mls fileReference="_102025_/l2/collabMessagesHelper.test.ts" enhancement="_blank"/>

import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setEnvironment } from '/_102036_/l2/environmentContract.js';
import {
    addMessage,
    changeFavIcon,
    loadNotificationDeviceId,
    loadNotificationPreferences,
    registerToken,
    saveNotificationDeviceId,
    saveUserId,
} from '/_102025_/l2/collabMessagesHelper.js';
import { notificationsRuntime } from '/_102025_/l2/notificationsRuntime.js';

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'collabMessagesHelper.ts'), 'utf8');

test('collabMessagesHelper has no local getMessageKey and imports it from libCommom', () => {
    const localCopy = ['function', 'getMessageKey'].join(' ');
    assert.equal(source.includes(localCopy), false, 'local getMessageKey copy must be gone');
    assert.match(
        source,
        /import\s*\{\s*getMessageKey\s*\}\s*from\s*['"]\/_102029_\/l2\/libCommom\.js['"]/,
        'must import getMessageKey from /_102029_/l2/libCommom.js',
    );
    assert.match(source, /\bconst lang = getMessageKey\(messages\)/, 'top-level call must remain');
});

test('registerToken sends subscription and stores endpoint as local identity', () => {
    assert.match(source, /environment\.notifications\.getPushSubscriptionForBackend\(\)/);
    assert.doesNotMatch(source, /getFCMTokenForBackend/);
    assert.doesNotMatch(source, /notificationToken/);
    assert.match(source, /saveNotificationToken\(subscription\.endpoint\)/);
    assert.match(source, /lastToken === subscription\.endpoint/);
    assert.match(
        source,
        /msgUpdateUserDetails\(\{[\s\S]*?\bsubscription\b[\s\S]*?\}\)/,
        'msgUpdateUserDetails must send subscription, not notificationToken',
    );
    assert.match(
        source,
        /const deviceId = loadNotificationDeviceId\(\) \|\| crypto\.randomUUID\(\)/,
        'registerToken must reuse the persisted deviceId',
    );
});

const LS_KEY = 'serviceCollabMessages';

function installMemoryStorage(): Map<string, string> {
    const store = new Map<string, string>();
    (globalThis as { localStorage?: Storage }).localStorage = {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => { store.set(key, value); },
        removeItem: (key: string) => { store.delete(key); },
        clear: () => store.clear(),
        key: (index: number) => [...store.keys()][index] ?? null,
        get length() { return store.size; },
    } as Storage;
    return store;
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

function withImmediateTimeout(fn: () => Promise<void>): Promise<void> {
    const original = globalThis.setTimeout;
    (globalThis as { setTimeout: typeof setTimeout }).setTimeout = ((handler: TimerHandler) => {
        if (typeof handler === 'function') handler();
        return 0 as unknown as ReturnType<typeof setTimeout>;
    }) as typeof setTimeout;
    return fn().finally(() => {
        globalThis.setTimeout = original;
    });
}

test('registerToken does not persist denied when the capability is absent', async () => {
    installMemoryStorage();
    setEnvironment({ notifications: notificationsRuntime });
    await withPermission('default', async () => {
        await withImmediateTimeout(async () => {
            const result = await registerToken();
            assert.equal(result, null);
            assert.equal(loadNotificationPreferences(), null);
            assert.equal(localStorage.getItem(LS_KEY), null);
        });
    });
    setEnvironment({});
});

test('T5: registerToken called twice reuses the persisted deviceId', async () => {
    installMemoryStorage();
    const persisted = 'persisted-device-id';
    saveNotificationDeviceId(persisted);

    let call = 0;
    const captured: string[] = [];
    setEnvironment({
        notifications: {
            getPushSubscriptionForBackend: async () => {
                call += 1;
                return {
                    endpoint: `https://push.example/e${call}`,
                    keys: { p256dh: 'p', auth: 'a' },
                };
            },
            getNotifySoundUrl: async () => null,
            sendRequestMissed: async () => undefined,
            sendACK: async () => undefined,
        },
    });

    const original = globalThis.fetch;
    globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
        const body = init?.body ? JSON.parse(String(init.body)) : null;
        if (body?.action === 'getUserUpdate') {
            return {
                status: 200,
                json: async () => ({
                    statusCode: 200,
                    user: { userId: 'u1', name: 'U', status: 'active', avatar_url: '' },
                }),
            } as Response;
        }
        if (body?.action === 'updateUserDetails') {
            captured.push(body.deviceId);
            return { status: 200, json: async () => ({ statusCode: 200 }) } as Response;
        }
        return { status: 200, json: async () => ({ statusCode: 200 }) } as Response;
    }) as typeof fetch;

    try {
        await registerToken();
        await registerToken();
        assert.deepEqual(captured, [persisted, persisted]);
        assert.equal(loadNotificationDeviceId(), persisted);
    } finally {
        if (original) globalThis.fetch = original;
        else delete (globalThis as { fetch?: typeof fetch }).fetch;
        setEnvironment({});
    }
});

function walkTs(dir: string): string[] {
    const out: string[] = [];
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
        if (ent.name.endsWith('.test.ts')) continue;
        const p = join(dir, ent.name);
        if (ent.isDirectory()) out.push(...walkTs(p));
        else if (ent.name.endsWith('.ts')) out.push(p);
    }
    return out;
}

test('T5: every msgAddMessage in 102025 l2 sends senderDeviceId from loadNotificationDeviceId', () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    let calls = 0;
    for (const file of walkTs(dir)) {
        const src = readFileSync(file, 'utf8');
        const matches = src.split('msgAddMessage(').length - 1;
        if (matches === 0) continue;
        calls += matches;
        assert.match(
            src,
            /senderDeviceId:\s*loadNotificationDeviceId\(\)/,
            `${file} calls msgAddMessage without senderDeviceId: loadNotificationDeviceId()`,
        );
    }
    assert.ok(calls >= 4, `expected at least 4 msgAddMessage calls, got ${calls}`);
});

test('T5: addMessage body carries senderDeviceId equal to loadNotificationDeviceId()', async () => {
    installMemoryStorage();
    saveUserId('u1');
    saveNotificationDeviceId('device-from-ls');
    let captured: { action?: string; senderDeviceId?: string } | undefined;
    const original = globalThis.fetch;
    globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
        captured = JSON.parse(String(init?.body));
        return {
            status: 200,
            json: async () => ({
                statusCode: 200,
                message: { threadId: 't1', createAt: '1', content: 'hi', senderId: 'u1' },
            }),
        } as Response;
    }) as typeof fetch;
    try {
        await addMessage('t1', 'hello').catch(() => undefined);
        assert.equal(captured?.action, 'addMessage');
        assert.equal(captured?.senderDeviceId, loadNotificationDeviceId());
        assert.equal(captured?.senderDeviceId, 'device-from-ls');
    } finally {
        if (original) globalThis.fetch = original;
        else delete (globalThis as { fetch?: typeof fetch }).fetch;
    }
});

test('not25 T4: changeFavIcon without icon link traces badge.skipped and returns', async () => {
    installMemoryStorage();
    if (!(globalThis as { window?: unknown }).window) {
        (globalThis as { window?: unknown }).window = globalThis;
    }
    (window as { isTraceNotification?: boolean }).isTraceNotification = true;
    const doc = globalThis.document as unknown as { querySelector?: typeof document.querySelector };
    const prevQuery = doc.querySelector;
    doc.querySelector = (() => null) as typeof document.querySelector;
    const logs: unknown[][] = [];
    const origInfo = console.info;
    console.info = ((...args: unknown[]) => { logs.push(args); }) as typeof console.info;
    try {
        await changeFavIcon(true);
        const skipped = logs.find((row) => String(row[0]).includes('badge.skipped'));
        assert.ok(skipped, `expected badge.skipped in ${JSON.stringify(logs)}`);
        assert.equal((skipped[1] as { reason?: string }).reason, 'no-icon-link');
    } finally {
        console.info = origInfo;
        delete (window as { isTraceNotification?: boolean }).isTraceNotification;
        if (prevQuery) doc.querySelector = prevQuery;
        else delete doc.querySelector;
    }
});

test('not25 T5: changeFavIcon(true) writes data:image/png and false restores original', async () => {
    const originalHref = '/assets/favicon.png';
    const link = {
        href: originalHref,
        dataset: {} as Record<string, string>,
    };
    const doc = globalThis.document as unknown as {
        querySelector?: typeof document.querySelector;
        createElement?: typeof document.createElement;
    };
    const prevQuery = doc.querySelector;
    const prevCreate = doc.createElement;
    doc.querySelector = ((selector: string) => {
        if (selector.includes('icon')) return link as unknown as HTMLLinkElement;
        return null;
    }) as typeof document.querySelector;
    doc.createElement = ((tag: string) => {
        if (tag === 'canvas') {
            return {
                width: 0,
                height: 0,
                getContext: () => ({
                    drawImage: () => undefined,
                    beginPath: () => undefined,
                    arc: () => undefined,
                    fill: () => undefined,
                    stroke: () => undefined,
                    fillStyle: '',
                    strokeStyle: '',
                    lineWidth: 0,
                }),
                toDataURL: () => 'data:image/png;base64,AAA',
            } as unknown as HTMLCanvasElement;
        }
        return {} as HTMLElement;
    }) as typeof document.createElement;
    class FakeImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        crossOrigin = '';
        set src(_value: string) { queueMicrotask(() => this.onload?.()); }
    }
    const prevImage = (globalThis as { Image?: typeof Image }).Image;
    (globalThis as { Image: typeof Image }).Image = FakeImage as unknown as typeof Image;
    try {
        await changeFavIcon(true);
        assert.equal(link.href, 'data:image/png;base64,AAA');
        assert.equal(link.dataset.original, originalHref);
        await changeFavIcon(false);
        assert.equal(link.href, originalHref);
    } finally {
        if (prevImage) (globalThis as { Image: typeof Image }).Image = prevImage;
        else delete (globalThis as { Image?: typeof Image }).Image;
        if (prevQuery) doc.querySelector = prevQuery;
        else delete doc.querySelector;
        if (prevCreate) doc.createElement = prevCreate;
        else delete doc.createElement;
    }
});

test('registerToken persists denied only when Notification.permission is denied', async () => {
    installMemoryStorage();
    setEnvironment({
        notifications: {
            getPushSubscriptionForBackend: async () => null,
            getNotifySoundUrl: async () => null,
            sendRequestMissed: async () => undefined,
            sendACK: async () => undefined,
        },
    });
    await withPermission('denied', async () => {
        const result = await registerToken();
        assert.equal(result, null);
        assert.equal(loadNotificationPreferences(), 'denied');
    });
    setEnvironment({});
});
