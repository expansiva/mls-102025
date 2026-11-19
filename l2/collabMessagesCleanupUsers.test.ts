/// <mls fileReference="_102025_/l2/collabMessagesCleanupUsers.test.ts" enhancement="_blank"/>

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupUsers, usersToRemove } from '/_102025_/l2/collabMessagesIndexedDB.js';

const user = (userId: string) => ({ userId });
const room = (ids: string[], agents: string[] = []) => ({ users: ids.map(user), openClawAgents: agents.map((collabUserId) => ({ collabUserId })) });

void test('front_02 (a): a user of a local room stays', () => {
    assert.deepEqual(usersToRemove([room(['me', 'ana'])], [user('me'), user('ana')], ['me']), []);
});

void test('front_02 (b): the own user stays even with no room', () => {
    assert.deepEqual(usersToRemove([room(['ana'])], [user('me'), user('ana')], ['me']), []);
});

void test('front_02 (c): a user in no local room is removed', () => {
    assert.deepEqual(usersToRemove([room(['me', 'ana'])], [user('me'), user('ana'), user('gone')], ['me']), ['gone']);
});

void test('front_02 (d): the user of an agent bound to a room stays', () => {
    assert.deepEqual(usersToRemove([room(['me'], ['agent-user'])], [user('me'), user('agent-user'), user('other-agent')], ['me']), ['other-agent']);
});

void test('front_02 (e): a member of a room deleted with unread messages stays (the room is still in the store)', () => {
    const deletedWithUnread = { ...room(['ana-old']), status: 'deleted', unreadCount: 3 };
    assert.deepEqual(usersToRemove([room(['me']), deletedWithUnread], [user('me'), user('ana-old')], ['me']), []);
});

void test('front_02 (f): no local room at all removes nothing', () => {
    assert.deepEqual(usersToRemove([], [user('me'), user('ana')], ['me']), []);
});

void test('front_02 (g): no id to keep removes nothing', () => {
    assert.deepEqual(usersToRemove([room(['ana'])], [user('me'), user('gone')], []), []);
    assert.deepEqual(usersToRemove([room(['ana'])], [user('me'), user('gone')], ['']), []);
});

void test('front_02 (h): the case of the browser of the owner: 16 users, rooms only with today\'s 5, the 11 old ones go', () => {
    const today = ['20261119100000.1000', '20261119100001.1000', '20261119100002.1000', '20261119100003.1000', '20261119100004.1000'];
    const old = Array.from({ length: 11 }, (_, i) => `20250828${String(i).padStart(6, '0')}.1000`);
    const rooms = [room(today.slice(0, 3)), room(today.slice(2))];
    const removed = usersToRemove(rooms, [...old, ...today].map(user), [today[0] as string]);
    assert.deepEqual([...removed].sort(), [...old].sort());
});

void test('front_02: a room without users or agents (older shape) does not break the decision', () => {
    assert.deepEqual(usersToRemove([{}, room(['me'])], [user('me'), user('gone')], ['me']), ['gone']);
});

/** A local chat database in memory: `getAll` and `delete` per store; a delete of an id in `failOn` aborts. */
function installFakeIndexedDb(data: { threads: object[]; users: Array<{ userId: string }> }, failOn: string[] = []): { users: () => string[] } {
    const stores: Record<string, Map<string, object>> = {
        threads: new Map(data.threads.map((thread, i) => [String(i), thread])),
        users: new Map(data.users.map((u) => [u.userId, u])),
    };
    const db = {
        objectStoreNames: Object.keys(stores),
        transaction: (name: string) => {
            const tx: { oncomplete?: () => void; onabort?: () => void; onerror?: () => void; objectStore: (n: string) => object } = {
                objectStore: () => ({
                    getAll: () => {
                        const request: { result?: unknown; onsuccess?: () => void } = {};
                        setTimeout(() => { request.result = [...(stores[name] as Map<string, object>).values()]; request.onsuccess?.(); }, 0);
                        return request;
                    },
                    delete: (id: string) => {
                        setTimeout(() => {
                            if (failOn.includes(id)) { tx.onabort?.(); return; }
                            (stores[name] as Map<string, object>).delete(id);
                            tx.oncomplete?.();
                        }, 0);
                    },
                }),
            };
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
    return { users: () => [...(stores.users as Map<string, object>).keys()].sort() };
}

void test('front_02: cleanupUsers deletes the ones that decision names and keeps the rest; one failure is a warning and the next is tried', async () => {
    const local = installFakeIndexedDb(
        { threads: [room(['me', 'ana'])], users: [user('me'), user('ana'), user('gone1'), user('gone2'), user('gone3')] },
        ['gone2'],
    );
    const warnings: unknown[][] = [];
    const original = console.warn;
    console.warn = (...args: unknown[]) => { warnings.push(args); };
    try {
        await cleanupUsers(['me']);
    } finally {
        console.warn = original;
    }
    assert.deepEqual(local.users(), ['ana', 'gone2', 'me']);
    assert.ok(warnings.some((args) => String(args[0]).includes('gone2')), 'the failure names the user');
});

void test('front_02: cleanupUsers with no local room deletes nothing', async () => {
    const local = installFakeIndexedDb({ threads: [], users: [user('me'), user('gone')] });
    await cleanupUsers(['me']);
    assert.deepEqual(local.users(), ['gone', 'me']);
});

void test('front_02: the chat runs cleanupUsers after cleanupThreads, inside the same try, and a failure of it does not stop the chat from opening', () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'collabMessages.ts'), 'utf8');
    assert.match(source, /await cleanupThreads\(this\.userPerfil\.threads\);\s*try \{\s*await cleanupUsers\(\[this\.userPerfil\.userId\]\);\s*\} catch \(\w+: unknown\) \{[^}]*console\.error\(/);
});
