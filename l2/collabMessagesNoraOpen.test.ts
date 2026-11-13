/// <mls fileReference="_102025_/l2/collabMessagesNoraOpen.test.ts" enhancement="_blank"/>

import test from 'node:test';
import assert from 'node:assert/strict';
import { noraMessageScreenAddress } from './collabMessagesNoraOpen.ts';

test('a Nora message with a record address builds the same screen url', () => {
    assert.equal(
        noraMessageScreenAddress({ page: 'orders/edit', recordParam: 'id', recordId: 'rec-1' }),
        'orders/edit?id=rec-1',
    );
    assert.equal(
        noraMessageScreenAddress({ page: 'orders/edit', recordParam: 'id', recordId: 'a b&c' }),
        'orders/edit?id=a%20b%26c',
    );
    assert.equal(noraMessageScreenAddress({ page: 'orders/list' }), 'orders/list');
});

test('a Nora message without a page address has no open button target', () => {
    assert.equal(noraMessageScreenAddress(undefined), undefined);
    assert.equal(noraMessageScreenAddress({}), undefined);
    assert.equal(noraMessageScreenAddress({ page: '' }), undefined);
    assert.equal(noraMessageScreenAddress({ recordParam: 'id', recordId: 'rec-1' }), undefined);
});
