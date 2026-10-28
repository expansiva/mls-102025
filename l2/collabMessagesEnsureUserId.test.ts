/// <mls fileReference="_102025_/l2/collabMessagesEnsureUserId.test.ts" enhancement="_blank"/>

import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureUserId, getUserId, saveUserId } from '/_102025_/l2/collabMessagesHelper.js';

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

test('ensureUserId returns the saved id without calling fetchUser', async () => {
    installMemoryStorage();
    saveUserId('user-saved');
    let calls = 0;
    const id = await ensureUserId(async () => {
        calls += 1;
        return 'other';
    });
    assert.equal(id, 'user-saved');
    assert.equal(calls, 0);
    assert.equal(getUserId(), 'user-saved');
});

test('ensureUserId fetches once, saves, and getUserId returns the id', async () => {
    installMemoryStorage();
    let calls = 0;
    const id = await ensureUserId(async () => {
        calls += 1;
        return 'user-new';
    });
    assert.equal(calls, 1);
    assert.equal(id, 'user-new');
    assert.equal(getUserId(), 'user-new');
});

test('ensureUserId shares one fetch across simultaneous calls', async () => {
    installMemoryStorage();
    let calls = 0;
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const fetchUser = async () => {
        calls += 1;
        await gate;
        return 'user-shared';
    };
    const first = ensureUserId(fetchUser);
    const second = ensureUserId(fetchUser);
    release();
    const [idA, idB] = await Promise.all([first, second]);
    assert.equal(calls, 1);
    assert.equal(idA, 'user-shared');
    assert.equal(idB, 'user-shared');
    assert.equal(getUserId(), 'user-shared');
});

test('ensureUserId throws and the next call tries again', async () => {
    installMemoryStorage();
    let calls = 0;
    await assert.rejects(
        () => ensureUserId(async () => {
            calls += 1;
            throw new Error('network down');
        }),
        (err: unknown) => {
            assert.ok(err instanceof Error);
            assert.equal(err.message, 'collab_messages_user_unavailable: network down');
            return true;
        },
    );
    const id = await ensureUserId(async () => {
        calls += 1;
        return 'user-retry';
    });
    assert.equal(calls, 2);
    assert.equal(id, 'user-retry');
    assert.equal(getUserId(), 'user-retry');
});
