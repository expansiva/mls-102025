/// <mls fileReference="_102025_/l2/collabMessagesReadState.test.ts" enhancement="_blank" />

import assert from 'node:assert/strict';
import test from 'node:test';

import { readUpdateNeeded, shouldMarkOpenThreadRead } from '/_102025_/l2/collabMessagesReadState.js';

test('readUpdateNeeded is false when count is zero, nothing pending, and time is the same', () => {
  assert.equal(
    readUpdateNeeded({ unreadCount: 0, storedReadTime: '20261015120000', newReadTime: '20261015120000', pending: false }),
    false,
  );
});

test('readUpdateNeeded is true when unreadCount is 1', () => {
  assert.equal(
    readUpdateNeeded({ unreadCount: 1, storedReadTime: '20261015120000', pending: false }),
    true,
  );
});

test('readUpdateNeeded is true when only pending', () => {
  assert.equal(
    readUpdateNeeded({ unreadCount: 0, storedReadTime: '20261015120000', pending: true }),
    true,
  );
});

test('readUpdateNeeded is true when newReadTime is newer', () => {
  assert.equal(
    readUpdateNeeded({ unreadCount: 0, storedReadTime: '20261015120000', newReadTime: '20261015120001', pending: false }),
    true,
  );
});

test('readUpdateNeeded is false when newReadTime is equal or older', () => {
  assert.equal(
    readUpdateNeeded({ unreadCount: 0, storedReadTime: '20261015120000', newReadTime: '20261015120000', pending: false }),
    false,
  );
  assert.equal(
    readUpdateNeeded({ unreadCount: 0, storedReadTime: '20261015120000', newReadTime: '20261015115959', pending: false }),
    false,
  );
});


const reasons = ['message', 'visible', 'systemScroll', 'leave'] as const;

test('shouldMarkOpenThreadRead marks an open details thread when visible, and on leave even if hidden', () => {
  for (const reason of reasons) {
    for (const pageVisible of [true, false]) {
      const expected = reason === 'leave' || pageVisible;
      assert.equal(
        shouldMarkOpenThreadRead({ hasOpenThread: true, pageVisible, inDetails: true, reason }),
        expected,
        `${reason} visible=${pageVisible}`,
      );
    }
  }
});

test('shouldMarkOpenThreadRead stays false without an open thread or outside the messages screen', () => {
  for (const reason of reasons) {
    for (const pageVisible of [true, false]) {
      assert.equal(
        shouldMarkOpenThreadRead({ hasOpenThread: false, pageVisible, inDetails: true, reason }),
        false,
        `no thread ${reason}`,
      );
      assert.equal(
        shouldMarkOpenThreadRead({ hasOpenThread: true, pageVisible, inDetails: false, reason }),
        false,
        `not details ${reason}`,
      );
    }
  }
});
