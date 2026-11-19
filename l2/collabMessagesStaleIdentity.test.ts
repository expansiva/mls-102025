/// <mls fileReference="_102025_/l2/collabMessagesStaleIdentity.test.ts" enhancement="_blank"/>

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { post, setIdentityRefusedHandler } from '/_102025_/l2/shared/api.js';
import { adoptUserId, getUserId, loadNotificationToken, loadNotificationTokenUserId, replaceStaleIdentity, saveNotificationToken, saveUserId } from '/_102025_/l2/collabMessagesHelper.js';

const REFUSED = 'userId does not match authenticated user';
const STORES = ['threads', 'poolings', 'users', 'tasks', 'messages'];

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

/** A local chat database that only records which stores were cleared. */
function installFakeIndexedDb(): string[] {
    const cleared: string[] = [];
    const db = {
        objectStoreNames: STORES,
        transaction: () => {
            const tx: { oncomplete?: () => void; objectStore: (name: string) => { clear: () => void } } = {
                objectStore: (name: string) => ({ clear: () => { cleared.push(name); } }),
            };
            setTimeout(() => tx.oncomplete?.(), 0);
            return tx;
        },
    };
    (globalThis as { indexedDB?: unknown }).indexedDB = {
        open: () => {
            const request: { result?: unknown; onsuccess?: () => void } = {};
            setTimeout(() => { request.result = db; request.onsuccess?.(); }, 0);
            return request;
        },
    };
    return cleared;
}

type Sent = { action: string; userId?: string };

/** A cm that answers for one person: another `userId` in the body is refused (403); an empty one gets the id of the person. */
function installFakeCm(personId: string, opts: { refuseAlways?: boolean; otherForbidden?: boolean } = {}): Sent[] {
    const sent: Sent[] = [];
    (globalThis as { fetch?: unknown }).fetch = async (_url: string, init: { body: string }) => {
        const body = JSON.parse(init.body) as Sent;
        sent.push(body);
        const reply = (status: number, data: object) => ({ status, statusText: 'x', json: async () => ({ statusCode: status, ...data }) });
        if (opts.otherForbidden) return reply(403, { msg: 'only your own conversation' });
        if (opts.refuseAlways) return reply(403, { msg: REFUSED });
        if (body.userId === '') return reply(200, { user: { userId: personId } });
        if (body.userId !== undefined && body.userId !== personId) return reply(403, { msg: REFUSED });
        return reply(200, { echoedUserId: body.userId });
    };
    return sent;
}

const request = (userId: string) => ({ action: 'getThreadUpdate', userId }) as never;

void test('a refused identity calls the handler once, repeats the request with the new id and returns its answer', async () => {
    installMemoryStorage();
    const sent = installFakeCm('new-id');
    let calls = 0;
    setIdentityRefusedHandler(async () => { calls += 1; return 'new-id'; });
    const answer = await post<{ echoedUserId: string }>(request('old-id'));
    assert.equal(calls, 1);
    assert.equal(answer.echoedUserId, 'new-id');
    assert.deepEqual(sent.map((s) => s.userId), ['old-id', 'new-id']);
});

void test('two calls refused together share one swap', async () => {
    installMemoryStorage();
    installFakeCm('new-id');
    let calls = 0;
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => { release = resolve; });
    setIdentityRefusedHandler(async () => { calls += 1; await gate; return 'new-id'; });
    const first = post<{ echoedUserId: string }>(request('old-id'));
    const second = post<{ echoedUserId: string }>({ action: 'getUserUpdate', userId: 'old-id' } as never);
    await new Promise((resolve) => setTimeout(resolve, 10));
    release();
    const [a, b] = await Promise.all([first, second]);
    assert.equal(calls, 1);
    assert.equal(a.echoedUserId, 'new-id');
    assert.equal(b.echoedUserId, 'new-id');
    // a call refused a moment after the swap, still with the old id, reuses it
    const late = await post<{ echoedUserId: string }>(request('old-id'));
    assert.equal(late.echoedUserId, 'new-id');
    assert.equal(calls, 1);
});

void test('a second refusal is the error, without a loop', async () => {
    installMemoryStorage();
    const sent = installFakeCm('new-id', { refuseAlways: true });
    let calls = 0;
    setIdentityRefusedHandler(async () => { calls += 1; return 'new-id'; });
    await assert.rejects(post(request('old-id')), (error: Error & { statusCode?: number }) => error.statusCode === 403 && error.message.includes(REFUSED));
    assert.equal(calls, 1);
    assert.equal(sent.length, 2, 'one try and one repeat');
});

void test('another 403, an empty userId, no handler or a failing handler leave the original error', async () => {
    installMemoryStorage();
    let calls = 0;
    setIdentityRefusedHandler(async () => { calls += 1; return 'new-id'; });

    installFakeCm('new-id', { otherForbidden: true });
    await assert.rejects(post(request('old-id')), /only your own conversation/);
    assert.equal(calls, 0);

    installFakeCm('new-id', { refuseAlways: true });
    await assert.rejects(post(request('')), new RegExp(REFUSED));
    assert.equal(calls, 0, 'a request with no userId is not swapped');

    setIdentityRefusedHandler(undefined);
    await assert.rejects(post(request('old-id')), new RegExp(REFUSED));

    const errors: unknown[][] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => { errors.push(args); };
    try {
        setIdentityRefusedHandler(async () => { throw new Error('handler down'); });
        await assert.rejects(post(request('old-id')), new RegExp(REFUSED));
    } finally {
        console.error = original;
    }
    assert.ok(errors.some((args) => String(args[0]).includes('Could not replace the refused identity')), 'the failure is logged, not silent');
});

void test('after the swap the saved id is the new one, the push endpoint is gone and the local chat database is empty', async () => {
    installMemoryStorage();
    const cleared = installFakeIndexedDb();
    const sent = installFakeCm('new-id');
    saveUserId('old-id');
    saveNotificationToken('https://push.example/old-endpoint');
    setIdentityRefusedHandler(() => replaceStaleIdentity());

    const answer = await post<{ echoedUserId: string }>(request(getUserId() as string));
    assert.equal(answer.echoedUserId, 'new-id');
    assert.equal(getUserId(), 'new-id');
    assert.equal(loadNotificationToken(), null);
    assert.deepEqual([...cleared].sort(), [...STORES].sort(), 'every store was cleared');
    assert.deepEqual(sent.map((s) => s.userId), ['old-id', '', 'new-id'], 'refused, id fetched with an empty userId, repeated');
});

void test('a failure while clearing the local database does not save a half swap', async () => {
    installMemoryStorage();
    installFakeCm('new-id');
    saveUserId('old-id');
    await assert.rejects(replaceStaleIdentity(async () => { throw new Error('idb down'); }), /idb down/);
    assert.equal(getUserId(), null, 'the old id is not kept: the next ensureUserId fetches the right one');
});

// front_03 s1: the chat loaded and the cm answered with a user.
function captureConsole(method: 'warn' | 'error'): { lines: string[]; restore: () => void } {
    const lines: string[] = [];
    const original = console[method];
    console[method] = (...args: unknown[]) => { lines.push(args.map(String).join(' ')); };
    return { lines, restore: () => { console[method] = original; } };
}

void test('front_03 s1 (a): no saved id: the id is saved and the local database is left alone', async () => {
    installMemoryStorage();
    let cleared = 0;
    await adoptUserId('new-id', async () => { cleared += 1; });
    assert.equal(getUserId(), 'new-id');
    assert.equal(cleared, 0);
});

void test('front_03 s1 (b): the same id changes nothing', async () => {
    installMemoryStorage();
    saveUserId('same-id');
    saveNotificationToken('https://push.example/e', 'same-id');
    let cleared = 0;
    const warnings = captureConsole('warn');
    try {
        await adoptUserId('same-id', async () => { cleared += 1; });
    } finally {
        warnings.restore();
    }
    assert.equal(cleared, 0);
    assert.equal(getUserId(), 'same-id');
    assert.equal(loadNotificationToken(), 'https://push.example/e');
    assert.deepEqual(warnings.lines, []);
});

void test('front_03 s1 (c): another id drops the local state of the saved user, saves the new id and warns once', async () => {
    installMemoryStorage();
    saveUserId('old-id');
    saveNotificationToken('https://push.example/old', 'old-id');
    let cleared = 0;
    const warnings = captureConsole('warn');
    try {
        await adoptUserId('new-id', async () => { cleared += 1; });
    } finally {
        warnings.restore();
    }
    assert.equal(cleared, 1);
    assert.equal(getUserId(), 'new-id');
    assert.equal(loadNotificationToken(), null);
    assert.equal(loadNotificationTokenUserId(), null);
    assert.equal(warnings.lines.length, 1);
    assert.match(warnings.lines[0] as string, /new-id/);
    assert.match(warnings.lines[0] as string, /old-id/);
});

void test('front_03 s1 (d): a failure while emptying the database is logged and the new id is saved anyway', async () => {
    installMemoryStorage();
    saveUserId('old-id');
    const errors = captureConsole('error');
    const warnings = captureConsole('warn');
    try {
        await adoptUserId('new-id', async () => { throw new Error('idb down'); });
    } finally {
        errors.restore();
        warnings.restore();
    }
    assert.equal(getUserId(), 'new-id');
    assert.ok(errors.lines.some((line) => line.includes('idb down')), 'the failure is logged');
});

void test('front_03 s1: the chat adopts the user of the cm before it cleans rooms and users', () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'collabMessages.ts'), 'utf8');
    assert.match(source, /await adoptUserId\(this\.userPerfil\.userId\);\s*await cleanupThreads\(/);
    assert.doesNotMatch(source, /\bsaveUserId\(/, 'the load no longer overwrites the saved id');
});
