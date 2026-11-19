/// <mls fileReference="_102025_/l2/collabMessagesThreadGone.test.ts" enhancement="_blank"/>

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { post, setThreadNotFoundHandler, threadNotFoundIdInMessage } from '/_102025_/l2/shared/api.js';
import { deleteThread } from '/_102025_/l2/collabMessagesIndexedDB.js';
import { dropGoneThread } from '/_102025_/l2/collabMessagesHelper.js';

/** A cm that answers every request with this 409 (or other status/message). */
function installFakeCm(status: number, msgText: string): number[] {
    const times: number[] = [];
    (globalThis as { fetch?: unknown }).fetch = async () => {
        times.push(times.length);
        return { status, statusText: 'x', json: async () => ({ statusCode: status, msg: msgText }) };
    };
    return times;
}

const request = (threadId: string) => ({ action: 'getThreadUpdate', userId: 'u1', threadId }) as never;
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 5));

void test('front_03 s2 (a): a 409 "Thread not found: X" calls the handler with X (from the message), and the error goes up as it is', async () => {
    const sent = installFakeCm(409, 'Thread not found: 20250828125713.1000');
    const seen: string[] = [];
    setThreadNotFoundHandler(async (id) => { seen.push(id); });
    // the body names another room: the id comes from the message
    await assert.rejects(post(request('other-room')), (error: Error & { statusCode?: number }) => error.statusCode === 409 && error.message.includes('Thread not found: 20250828125713.1000'));
    await tick();
    assert.deepEqual(seen, ['20250828125713.1000']);
    assert.equal(sent.length, 1, 'the request is not repeated');
});

void test('front_03 s2 (b): two 409 for the same room run the handler once; another room runs it again', async () => {
    installFakeCm(409, 'Thread not found: room-A');
    const seen: string[] = [];
    setThreadNotFoundHandler(async (id) => { seen.push(id); });
    await assert.rejects(post(request('room-A')));
    await assert.rejects(post(request('room-A')));
    installFakeCm(409, 'Thread not found: room-B');
    await assert.rejects(post(request('room-B')));
    await tick();
    assert.deepEqual(seen, ['room-A', 'room-B']);
});

void test('front_03 s2 (c): another 409, or "Thread not found" with another status, does not call the handler', async () => {
    const seen: string[] = [];
    setThreadNotFoundHandler(async (id) => { seen.push(id); });
    installFakeCm(409, 'User is not a member of the thread');
    await assert.rejects(post(request('room-A')));
    installFakeCm(404, 'Thread not found: room-A');
    await assert.rejects(post(request('room-A')));
    installFakeCm(500, 'Thread not found: room-A');
    await assert.rejects(post(request('room-A')));
    await tick();
    assert.deepEqual(seen, []);
});

void test('front_03 s2: a failing handler is logged and the original error still goes up', async () => {
    installFakeCm(409, 'Thread not found: room-F');
    setThreadNotFoundHandler(async () => { throw new Error('idb down'); });
    const lines: string[] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => { lines.push(args.map(String).join(' ')); };
    try {
        await assert.rejects(post(request('room-F')), /Thread not found: room-F/);
        await tick();
    } finally {
        console.error = original;
    }
    assert.ok(lines.some((line) => line.includes('room-F') && line.includes('idb down')), 'the failure is logged');
});

void test('front_03 s2 (d): the handler removes the messages and the room of X and leaves the others', async () => {
    const messages = new Map<string, string[]>([['X', ['m1', 'm2']], ['Y', ['m3']]]);
    const rooms = new Set<string>(['X', 'Y']);
    const order: string[] = [];
    const warnings: string[] = [];
    const original = console.warn;
    console.warn = (...args: unknown[]) => { warnings.push(args.map(String).join(' ')); };
    try {
        await dropGoneThread('X', {
            deleteMessages: async (id) => { order.push('messages'); messages.delete(id); },
            deleteRoom: async (id) => { order.push('room'); rooms.delete(id); },
        });
    } finally {
        console.warn = original;
    }
    assert.deepEqual([...messages.keys()], ['Y']);
    assert.deepEqual([...rooms], ['Y']);
    assert.deepEqual(order, ['messages', 'room']);
    assert.equal(warnings.length, 1, 'one warning says what was dropped and why');
    assert.match(warnings[0] as string, /X/);
});

void test('front_03 s2: deleteThread removes one room from the local database', async () => {
    const deleted: string[] = [];
    const db = {
        objectStoreNames: ['threads'],
        transaction: (name: string) => {
            const tx: { oncomplete?: () => void; objectStore: (n: string) => object } = {
                objectStore: () => ({ delete: (id: string) => { deleted.push(`${name}:${id}`); } }),
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
    await deleteThread('X');
    assert.deepEqual(deleted, ['threads:X']);
});

void test('front_03 s2 (e): a room with unread messages and no 409 stays: the handler runs only for "Thread not found"', async () => {
    const seen: string[] = [];
    setThreadNotFoundHandler(async (id) => { seen.push(id); });
    (globalThis as { fetch?: unknown }).fetch = async () => ({ status: 200, json: async () => ({ statusCode: 200, thread: { threadId: 'Y', unreadCount: 7 } }) });
    const answer = await post<{ thread: { threadId: string } }>(request('Y'));
    await tick();
    assert.equal(answer.thread.threadId, 'Y');
    assert.deepEqual(seen, []);
    assert.equal(threadNotFoundIdInMessage('DomainError: Thread not found: Y'), 'Y');
    assert.equal(threadNotFoundIdInMessage('Failed to fetch thread updates'), undefined);
});

void test('front_03 s2: opening a room the cm does not know ends in the error state of the screen, not in an unhandled promise; the handler is registered at load', () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    const chat = readFileSync(join(dir, 'collabMessagesChat.ts'), 'utf8');
    assert.match(chat, /this\.threadErrorMsg = err\.message \|\| 'Error on read thread';\s*if \(threadNotFoundIdInMessage\(err\?\.message\)\) \{[^}]*return;/);
    const helper = readFileSync(join(dir, 'collabMessagesHelper.ts'), 'utf8');
    assert.match(helper, /setThreadNotFoundHandler\(\(threadId\) => dropGoneThread\(threadId\)\);/);
});
