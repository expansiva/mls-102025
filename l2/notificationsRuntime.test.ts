/// <mls fileReference="_102025_/l2/notificationsRuntime.test.ts" enhancement="_blank" />

import assert from 'node:assert/strict';
import test from 'node:test';

import {
    hasPushSubscriptionCapability,
    notificationsRuntime,
} from '/_102025_/l2/notificationsRuntime.js';

type MlsHolder = { mls?: { events?: unknown; stor?: unknown } };

function withMls<T>(mls: MlsHolder['mls'] | undefined, fn: () => Promise<T>): Promise<T> {
    const holder = globalThis as MlsHolder;
    const previous = holder.mls;
    if (mls === undefined) delete holder.mls;
    else holder.mls = mls;
    return fn().finally(() => {
        if (previous === undefined) delete holder.mls;
        else holder.mls = previous;
    });
}

test('without mls.events, notificationsRuntime returns unavailable and does not throw', async () => {
    await withMls(undefined, async () => {
        assert.equal(hasPushSubscriptionCapability(), false);
        await assert.doesNotReject(() => notificationsRuntime.getPushSubscriptionForBackend());
        assert.equal(await notificationsRuntime.getPushSubscriptionForBackend(), undefined);
        await assert.doesNotReject(() => notificationsRuntime.sendACK('id'));
        await assert.doesNotReject(() => notificationsRuntime.sendRequestMissed());
        assert.equal(typeof (await notificationsRuntime.getNotifySoundUrl()), 'string');
    });

    await withMls({}, async () => {
        assert.equal(hasPushSubscriptionCapability(), false);
        assert.equal(await notificationsRuntime.getPushSubscriptionForBackend(), undefined);
    });
});

test('T6: getNotifySoundUrl returns the absolute l3 assets path, never l2/audio or a relative studio url', async () => {
    const url = await notificationsRuntime.getNotifySoundUrl();
    assert.equal(url, '/_102025_/l3/assets/collabNotification.wav');
    assert.equal(url?.startsWith('/'), true);
    assert.match(url ?? '', /\/l3\/assets\//);
    assert.doesNotMatch(url ?? '', /l2\/audio/);
    assert.doesNotMatch(url ?? '', /(?:^\.\/)|(?:\/l3\/_100529_)/);
});

test('with mls.events.getPushSubscriptionForBackend, notificationsRuntime forwards the subscription', async () => {
    const subscription = { endpoint: 'https://push.example/ep', keys: { p256dh: 'p', auth: 'a' } };
    const acks: string[] = [];
    let missed = 0;
    await withMls({
        events: { getPushSubscriptionForBackend: async () => subscription },
        stor: {
            cache: {
                sendACK: async (id: string) => { acks.push(id); },
                sendRequestMissed: async () => { missed += 1; },
            },
        },
    }, async () => {
        assert.equal(hasPushSubscriptionCapability(), true);
        assert.deepEqual(await notificationsRuntime.getPushSubscriptionForBackend(), subscription);
        await notificationsRuntime.sendACK('n1');
        await notificationsRuntime.sendRequestMissed();
        assert.deepEqual(acks, ['n1']);
        assert.equal(missed, 1);
    });
});
