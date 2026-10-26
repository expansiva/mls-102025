/// <mls fileReference="_102025_/l2/collabMessagesChatWindow.test.ts" enhancement="_blank"/>

import test from 'node:test';
import assert from 'node:assert/strict';
import type * as msg from '/_102025_/l2/shared/interfaces.js';
import { pickMessagesAfter, sliceWindowFromTarget } from '/_102025_/l2/collabMessagesChatWindow.js';

function messageAt(index: number): msg.MessagePerformanceCache {
    const orderAt = String(index).padStart(4, '0');
    return {
        threadId: 'room',
        orderAt,
        createAt: orderAt,
        footers: [],
    } as msg.MessagePerformanceCache;
}

function messages(count: number): msg.MessagePerformanceCache[] {
    return Array.from({ length: count }, (_, index) => messageAt(index + 1));
}

function orders(list: msg.MessagePerformanceCache[]): string[] {
    return list.map(message => message.orderAt || message.createAt);
}

test('sliceWindowFromTarget keeps 50 messages after the target and reports the remainder', () => {
    const sorted = messages(120);
    const fromTenth = sliceWindowFromTarget(sorted, 9, 50);
    assert.equal(fromTenth.messages.length, 50);
    assert.deepEqual(orders(fromTenth.messages), orders(sorted.slice(9, 59)));
    assert.equal(fromTenth.hasMoreAfter, true);

    const fromHundredth = sliceWindowFromTarget(sorted, 99, 50);
    assert.equal(fromHundredth.messages.length, 21);
    assert.deepEqual(orders(fromHundredth.messages), orders(sorted.slice(99)));
    assert.equal(fromHundredth.hasMoreAfter, false);
});

test('pickMessagesAfter returns the next page in ascending order and skips loaded keys', () => {
    const all = messages(120);
    const after59 = pickMessagesAfter(all, all[58].orderAt || all[58].createAt, new Set(), 50);
    assert.equal(after59.messages.length, 50);
    assert.deepEqual(orders(after59.messages), orders(all.slice(59, 109)));
    assert.equal(after59.hasMoreAfter, true);

    const after109 = pickMessagesAfter(all, all[108].orderAt || all[108].createAt, new Set(), 50);
    assert.equal(after109.messages.length, 11);
    assert.deepEqual(orders(after109.messages), orders(all.slice(109)));
    assert.equal(after109.hasMoreAfter, false);

    const loaded = new Set([`${all[59].threadId}/${all[59].orderAt || all[59].createAt}`]);
    const skipping = pickMessagesAfter(all, all[58].orderAt || all[58].createAt, loaded, 50);
    assert.equal(skipping.messages.some(message => message.orderAt === all[59].orderAt), false);
    assert.equal(skipping.messages[0].orderAt, all[60].orderAt);
    assert.equal(skipping.messages.length, 50);
    assert.equal(skipping.hasMoreAfter, true);

    const shuffled = [...all].reverse();
    const fromShuffled = pickMessagesAfter(shuffled, all[58].orderAt || all[58].createAt, new Set(), 50);
    assert.deepEqual(orders(fromShuffled.messages), orders(after59.messages));
    assert.equal(fromShuffled.hasMoreAfter, after59.hasMoreAfter);
});
