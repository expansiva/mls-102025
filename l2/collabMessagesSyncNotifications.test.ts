/// <mls fileReference="_102025_/l2/collabMessagesSyncNotifications.test.ts" enhancement="_blank" />

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { setEnvironment } from '/_102036_/l2/environmentContract.js';
import {
    loadLastAlertTime,
    loadNotificationPreferences,
    saveLastAlertTime,
    saveNotificationDeviceId,
    saveNotificationPreferences,
} from '/_102025_/l2/collabMessagesHelper.js';
import {
    acceptNotificationOffer,
    consumeSystemNotificationShown,
    dismissNotificationOffer,
    getNotificationOffer,
    applyNotificationTraceFromStorage,
    initNotifications,
    listenToThreadEvents,
    markSystemNotificationShown,
    resetNotificationSession,
    setNotificationSoundForTests,
    shouldPlayPageNotificationSound,
    startPageNotificationSound,
    unlockNotificationSound,
} from '/_102025_/l2/collabMessagesSyncNotifications.js';

const here = dirname(fileURLToPath(import.meta.url));
const LS_KEY = 'serviceCollabMessages';

type MlsHolder = { mls?: { events?: unknown; stor?: unknown } };

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

function withPushCapability(fn: () => Promise<void>): Promise<void> {
    const holder = globalThis as MlsHolder;
    const previous = holder.mls;
    holder.mls = {
        ...(previous ?? {}),
        events: { getPushSubscriptionForBackend: async () => null },
    };
    return fn().finally(() => {
        if (previous === undefined) delete holder.mls;
        else holder.mls = previous;
    });
}

function withoutPushCapability(fn: () => Promise<void>): Promise<void> {
    const holder = globalThis as MlsHolder;
    const previous = holder.mls;
    holder.mls = { ...(previous ?? {}), events: {} };
    return fn().finally(() => {
        if (previous === undefined) delete holder.mls;
        else holder.mls = previous;
    });
}

function installServiceWorkerSpy(): { messages: number; restore: () => void } {
    const holder = globalThis as { navigator?: Navigator };
    const previous = holder.navigator;
    let messages = 0;
    Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        writable: true,
        value: {
            ...(previous as object | undefined),
            serviceWorker: {
                addEventListener: (type: string) => {
                    if (type === 'message') messages += 1;
                },
            },
        },
    });
    return {
        get messages() { return messages; },
        restore() {
            if (previous === undefined) {
                delete (globalThis as { navigator?: Navigator }).navigator;
            } else {
                Object.defineProperty(globalThis, 'navigator', {
                    configurable: true,
                    writable: true,
                    value: previous,
                });
            }
        },
    };
}

function countingNotifications() {
    let registerCalls = 0;
    let missed = 0;
    setEnvironment({
        notifications: {
            getPushSubscriptionForBackend: async () => {
                registerCalls += 1;
                return null;
            },
            getNotifySoundUrl: async () => null,
            sendRequestMissed: async () => { missed += 1; },
            sendACK: async () => undefined,
        },
    });
    return {
        get registerCalls() { return registerCalls; },
        get missed() { return missed; },
    };
}

function setup(): { counts: ReturnType<typeof countingNotifications>; sw: ReturnType<typeof installServiceWorkerSpy> } {
    resetNotificationSession();
    installMemoryStorage();
    if (!(globalThis as { window?: unknown }).window) {
        (globalThis as { window?: unknown }).window = globalThis;
    }
    const counts = countingNotifications();
    const sw = installServiceWorkerSpy();
    return { counts, sw };
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

function withVisibleDocument(fn: () => Promise<void>): Promise<void> {
    const doc = globalThis.document as unknown as {
        visibilityState?: string;
        addEventListener?: typeof document.addEventListener;
        removeEventListener?: typeof document.removeEventListener;
    };
    const prevState = doc.visibilityState;
    const prevAdd = doc.addEventListener;
    const prevRemove = doc.removeEventListener;
    doc.visibilityState = 'visible';
    doc.addEventListener = (() => undefined) as typeof document.addEventListener;
    doc.removeEventListener = (() => undefined) as typeof document.removeEventListener;
    return fn().finally(() => {
        resetNotificationSession();
        if (prevState === undefined) delete doc.visibilityState;
        else doc.visibilityState = prevState;
        if (prevAdd) doc.addEventListener = prevAdd;
        else delete doc.addEventListener;
        if (prevRemove) doc.removeEventListener = prevRemove;
        else delete doc.removeEventListener;
    });
}

function countingHeartbeatTimers(): { get count(): number; restore: () => void } {
    const original = globalThis.setInterval;
    let count = 0;
    (globalThis as { setInterval: typeof setInterval }).setInterval = ((handler: TimerHandler, ms?: number) => {
        if (ms === 60_000) count += 1;
        return 0 as unknown as ReturnType<typeof setInterval>;
    }) as typeof setInterval;
    return {
        get count() { return count; },
        restore() { globalThis.setInterval = original; },
    };
}

function countingHeartbeatPosts(): { get actions(): unknown[]; restore: () => void } {
    const original = globalThis.fetch;
    const actions: unknown[] = [];
    globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
        const body = init?.body ? JSON.parse(String(init.body)) : null;
        actions.push(body);
        return { status: 200, json: async () => ({ statusCode: 200 }) } as Response;
    }) as typeof fetch;
    return {
        get actions() { return actions; },
        restore() {
            if (original) globalThis.fetch = original;
            else delete (globalThis as { fetch?: typeof fetch }).fetch;
        },
    };
}

test('T1: two initNotifications in one session plus Enable call registerToken once', async () => {
    const { counts, sw } = setup();
    try {
        await withPushCapability(async () => {
            await withPermission('default', async () => {
                await initNotifications();
                await initNotifications();
                assert.equal(counts.registerCalls, 0);
                assert.equal(getNotificationOffer(), 'offer');
                await acceptNotificationOffer();
                assert.equal(counts.registerCalls, 1);
                await acceptNotificationOffer();
                assert.equal(counts.registerCalls, 1);
            });
        });
    } finally {
        sw.restore();
        setEnvironment({});
    }
});

test('T2: permission granted listens and does not register or show the offer', async () => {
    const { counts, sw } = setup();
    try {
        await withPushCapability(async () => {
            await withPermission('granted', async () => {
                await initNotifications();
                await initNotifications();
                assert.equal(counts.registerCalls, 0);
                assert.equal(getNotificationOffer(), 'none');
                assert.equal(sw.messages, 1);
                assert.equal(counts.missed, 1);
            });
        });
    } finally {
        sw.restore();
        setEnvironment({});
    }
});

test('T2b: permission default shows the offer and does not register until Enable', async () => {
    const { counts, sw } = setup();
    try {
        await withPushCapability(async () => {
            await withPermission('default', async () => {
                await initNotifications();
                assert.equal(getNotificationOffer(), 'offer');
                assert.equal(counts.registerCalls, 0);
                assert.equal(sw.messages, 0);
                await acceptNotificationOffer();
                assert.equal(counts.registerCalls, 1);
                assert.equal(getNotificationOffer(), 'none');
            });
        });
    } finally {
        sw.restore();
        setEnvironment({});
    }
});

test('T2c: closing the offer does not persist denied; offer returns after the weekly window', async () => {
    const { counts, sw } = setup();
    try {
        await withPushCapability(async () => {
            await withPermission('default', async () => {
                await initNotifications();
                assert.equal(getNotificationOffer(), 'offer');
                dismissNotificationOffer();
                assert.equal(getNotificationOffer(), 'none');
                assert.equal(loadNotificationPreferences(), null);
                assert.equal(typeof loadLastAlertTime(), 'number');
                assert.equal(counts.registerCalls, 0);

                resetNotificationSession();
                await initNotifications();
                assert.equal(getNotificationOffer(), 'none', 'same week must not re-offer');

                saveLastAlertTime(Date.now() - 8 * 24 * 60 * 60 * 1000);
                resetNotificationSession();
                await initNotifications();
                assert.equal(getNotificationOffer(), 'offer');
            });
        });
    } finally {
        sw.restore();
        setEnvironment({});
    }
});

test('stale local denied with permission still default is offered again', async () => {
    const { counts, sw } = setup();
    try {
        saveNotificationPreferences('denied');
        await withPushCapability(async () => {
            await withPermission('default', async () => {
                await initNotifications();
                assert.equal(getNotificationOffer(), 'offer');
                assert.equal(counts.registerCalls, 0);
            });
        });
    } finally {
        sw.restore();
        setEnvironment({});
    }
});

test('T3: permission denied does not register and does not listen', async () => {
    const { counts, sw } = setup();
    try {
        await withPushCapability(async () => {
            await withPermission('denied', async () => {
                await initNotifications();
                assert.equal(counts.registerCalls, 0);
                assert.equal(sw.messages, 0);
                assert.equal(counts.missed, 0);
                assert.equal(getNotificationOffer(), 'none');
            });
        });
    } finally {
        sw.restore();
        setEnvironment({});
    }
});

test('T4: missing mls.events does not persist denied and retries', async () => {
    const { sw } = setup();
    let polls = 0;
    const original = globalThis.setTimeout;
    (globalThis as { setTimeout: typeof setTimeout }).setTimeout = ((handler: TimerHandler) => {
        polls += 1;
        if (typeof handler === 'function') handler();
        return 0 as unknown as ReturnType<typeof setTimeout>;
    }) as typeof setTimeout;
    try {
        await withoutPushCapability(async () => {
            await withPermission('default', async () => {
                await initNotifications();
                assert.equal(loadNotificationPreferences(), null);
                assert.equal(localStorage.getItem(LS_KEY), null);
                assert.equal(getNotificationOffer(), 'none');
                const afterFirst = polls;
                assert.ok(afterFirst > 0);
                await initNotifications();
                assert.ok(polls > afterFirst);
                assert.equal(loadNotificationPreferences(), null);
            });
        });
    } finally {
        globalThis.setTimeout = original;
        sw.restore();
        setEnvironment({});
    }
});

test('T5: Studio no longer owns listenToThreadEvents or registerToken', () => {
    const studioRoot = join(here, '../../mls-102020');
    const hits: string[] = [];

    function walk(dir: string) {
        for (const name of readdirSync(dir)) {
            if (name === 'node_modules' || name === '.git') continue;
            const full = join(dir, name);
            if (statSync(full).isDirectory()) {
                walk(full);
                continue;
            }
            if (!/\.(ts|js)$/.test(name)) continue;
            const text = readFileSync(full, 'utf8');
            if (/listenToThreadEvents|registerToken/.test(text)) hits.push(full);
        }
    }

    walk(studioRoot);
    assert.deepEqual(hits, []);
});

test('chat no longer offers notification after opening a room', () => {
    const source = readFileSync(join(here, 'collabMessagesChat.ts'), 'utf8');
    assert.doesNotMatch(source, /checkForRegisterNotification/);
    assert.doesNotMatch(source, /alreadyCheckForRegisterToken/);
    assert.doesNotMatch(source, /registerToken/);
});

test('initNotifications itself never calls registerToken', () => {
    const source = readFileSync(join(here, 'collabMessagesSyncNotifications.ts'), 'utf8');
    const start = source.indexOf('export async function initNotifications');
    const end = source.indexOf('export async function acceptNotificationOffer');
    assert.ok(start >= 0 && end > start);
    const body = source.slice(start, end);
    assert.doesNotMatch(body, /registerToken\(/);
    const root = readFileSync(join(here, 'collabMessages.ts'), 'utf8');
    const userIdx = root.indexOf('this.userPerfil = await this.getUser()');
    const initIdx = root.indexOf('void initNotifications()');
    assert.ok(userIdx >= 0 && initIdx > userIdx);
});

test('not16 T1: missing push capability still starts the presence heartbeat', async () => {
    const { sw } = setup();
    const timers = countingHeartbeatTimers();
    try {
        await withImmediateTimeout(async () => {
            await withoutPushCapability(async () => {
                await withPermission('default', async () => {
                    await withVisibleDocument(async () => {
                        await initNotifications();
                        assert.equal(timers.count, 1);
                        assert.equal(getNotificationOffer(), 'none');
                    });
                });
            });
        });
    } finally {
        timers.restore();
        sw.restore();
        setEnvironment({});
    }
});

test('not16 T2: permission denied still starts the heartbeat and writes no preference', async () => {
    const { sw } = setup();
    const timers = countingHeartbeatTimers();
    try {
        await withPushCapability(async () => {
            await withPermission('denied', async () => {
                await withVisibleDocument(async () => {
                    await initNotifications();
                    assert.equal(timers.count, 1);
                    assert.equal(loadNotificationPreferences(), null);
                    assert.equal(getNotificationOffer(), 'none');
                });
            });
        });
    } finally {
        timers.restore();
        sw.restore();
        setEnvironment({});
    }
});

test('not16 T3: pending offer starts the heartbeat before Enable', async () => {
    const { counts, sw } = setup();
    const timers = countingHeartbeatTimers();
    try {
        await withPushCapability(async () => {
            await withPermission('default', async () => {
                await withVisibleDocument(async () => {
                    await initNotifications();
                    assert.equal(getNotificationOffer(), 'offer');
                    assert.equal(timers.count, 1);
                    assert.equal(counts.registerCalls, 0);
                });
            });
        });
    } finally {
        timers.restore();
        sw.restore();
        setEnvironment({});
    }
});

test('not16 T4: granted starts the heartbeat once even if listenToThreadEvents also runs', async () => {
    const { sw } = setup();
    const timers = countingHeartbeatTimers();
    try {
        await withPushCapability(async () => {
            await withPermission('granted', async () => {
                await withVisibleDocument(async () => {
                    await initNotifications();
                    await listenToThreadEvents();
                    assert.equal(timers.count, 1);
                });
            });
        });
    } finally {
        timers.restore();
        sw.restore();
        setEnvironment({});
    }
});

test('not16 T5: beatOnce does not call the heartbeat action without userId', async () => {
    const { sw } = setup();
    const timers = countingHeartbeatTimers();
    const posts = countingHeartbeatPosts();
    try {
        saveNotificationDeviceId('device-without-user');
        await withPushCapability(async () => {
            await withPermission('granted', async () => {
                await withVisibleDocument(async () => {
                    await initNotifications();
                    assert.equal(timers.count, 1);
                    assert.equal(posts.actions.filter((body) => (body as { action?: string })?.action === 'heartbeat').length, 0);
                });
            });
        });
    } finally {
        posts.restore();
        timers.restore();
        sw.restore();
        setEnvironment({});
    }
});

test('T6: page does not play sound when the system notification was shown', () => {
    resetNotificationSession();
    try {
        assert.equal(shouldPlayPageNotificationSound({
            audioEnabled: true,
            hasSound: true,
            systemNotificationShown: false,
        }), true);
        markSystemNotificationShown('thread-1');
        assert.equal(shouldPlayPageNotificationSound({
            audioEnabled: true,
            hasSound: true,
            systemNotificationShown: consumeSystemNotificationShown('thread-1'),
        }), false);
        assert.equal(consumeSystemNotificationShown('thread-1'), false);
        const source = readFileSync(join(here, 'collabMessagesSyncNotifications.ts'), 'utf8');
        assert.match(source, /shouldPlayPageNotificationSound/);
        assert.match(source, /system-notification-shown/);
        assert.match(source, /consumeSystemNotificationShown/);
    } finally {
        resetNotificationSession();
    }
});

test('not25 T1: unlockNotificationSound twice binds click/keydown/touchstart once', () => {
    resetNotificationSession();
    const bound: Array<{ type: string; opts: AddEventListenerOptions | boolean | undefined }> = [];
    const doc = globalThis.document as unknown as {
        addEventListener?: typeof document.addEventListener;
        removeEventListener?: typeof document.removeEventListener;
    };
    const prevAdd = doc.addEventListener;
    const prevRemove = doc.removeEventListener;
    doc.addEventListener = ((type: string, _handler: EventListenerOrEventListenerObject, opts?: AddEventListenerOptions | boolean) => {
        bound.push({ type, opts: opts as AddEventListenerOptions });
    }) as typeof document.addEventListener;
    doc.removeEventListener = (() => undefined) as typeof document.removeEventListener;
    try {
        unlockNotificationSound();
        unlockNotificationSound();
        assert.deepEqual(bound.map((row) => row.type), ['click', 'keydown', 'touchstart']);
        for (const row of bound) {
            assert.equal((row.opts as AddEventListenerOptions).once, true);
            assert.equal((row.opts as AddEventListenerOptions).capture, true);
        }
    } finally {
        resetNotificationSession();
        if (prevAdd) doc.addEventListener = prevAdd;
        else delete doc.addEventListener;
        if (prevRemove) doc.removeEventListener = prevRemove;
        else delete doc.removeEventListener;
    }
});

test('not25 T2: after the gesture, play() runs on the sound element', async () => {
    resetNotificationSession();
    const calls: string[] = [];
    const fake = {
        muted: false,
        currentTime: 1,
        play: async () => { calls.push('play'); },
        pause: () => { calls.push('pause'); },
    } as unknown as HTMLAudioElement;
    setNotificationSoundForTests(fake);
    let gesture: EventListener | undefined;
    const doc = globalThis.document as unknown as {
        addEventListener?: typeof document.addEventListener;
        removeEventListener?: typeof document.removeEventListener;
    };
    const prevAdd = doc.addEventListener;
    const prevRemove = doc.removeEventListener;
    doc.addEventListener = ((type: string, handler: EventListenerOrEventListenerObject) => {
        if (type === 'click') gesture = handler as EventListener;
    }) as typeof document.addEventListener;
    doc.removeEventListener = (() => undefined) as typeof document.removeEventListener;
    try {
        unlockNotificationSound();
        assert.ok(gesture);
        gesture!(new Event('click'));
        assert.ok(calls.includes('play'));
        assert.ok(calls.includes('pause'));
        assert.equal(fake.currentTime, 0);
    } finally {
        resetNotificationSession();
        if (prevAdd) doc.addEventListener = prevAdd;
        else delete doc.addEventListener;
        if (prevRemove) doc.removeEventListener = prevRemove;
        else delete doc.removeEventListener;
    }
});

test('not25 T3: play() NotAllowedError traces sound.blocked without throwing', async () => {
    resetNotificationSession();
    if (!(globalThis as { window?: unknown }).window) {
        (globalThis as { window?: unknown }).window = globalThis;
    }
    (window as { isTraceNotification?: boolean }).isTraceNotification = true;
    const err = Object.assign(new Error('play() failed because the user didn\'t interact with the document first'), {
        name: 'NotAllowedError',
    });
    const fake = {
        currentTime: 0,
        play: async () => { throw err; },
    } as unknown as HTMLAudioElement;
    setNotificationSoundForTests(fake);
    const logs: unknown[][] = [];
    const origInfo = console.info;
    const origWarn = console.warn;
    console.info = ((...args: unknown[]) => { logs.push(args); }) as typeof console.info;
    console.warn = (() => undefined) as typeof console.warn;
    try {
        startPageNotificationSound('thread-1', 'thread-1:msg');
        await Promise.resolve();
        await Promise.resolve();
        const blocked = logs.find((row) => String(row[0]).includes('sound.blocked'));
        assert.ok(blocked, `expected sound.blocked in ${JSON.stringify(logs)}`);
        const fields = blocked.find((item) => item && typeof item === 'object' && 'name' in (item as object)) as { name?: string };
        assert.equal(fields?.name, 'NotAllowedError');
    } finally {
        console.info = origInfo;
        console.warn = origWarn;
        resetNotificationSession();
    }
});

test('T7: localStorage.collabTraceNotification = true enables trace without rebuild', async () => {
    const { sw } = setup();
    try {
        await withPushCapability(async () => {
            await withPermission('denied', async () => {
                assert.notEqual((window as { isTraceNotification?: boolean }).isTraceNotification, true);
                localStorage.setItem('collabTraceNotification', 'true');
                assert.equal(applyNotificationTraceFromStorage(), true);
                assert.equal((window as { isTraceNotification?: boolean }).isTraceNotification, true);
                delete (window as { isTraceNotification?: boolean }).isTraceNotification;
                await initNotifications();
                assert.equal((window as { isTraceNotification?: boolean }).isTraceNotification, true);
            });
        });
    } finally {
        sw.restore();
        setEnvironment({});
        resetNotificationSession();
    }
});

