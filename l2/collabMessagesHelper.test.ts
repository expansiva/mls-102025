/// <mls fileReference="_102025_/l2/collabMessagesHelper.test.ts" enhancement="_blank"/>

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setEnvironment } from '/_102036_/l2/environmentContract.js';
import {
    loadNotificationDeviceId,
    loadNotificationPreferences,
    registerToken,
    saveNotificationDeviceId,
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
