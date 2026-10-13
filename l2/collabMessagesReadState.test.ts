/// <mls fileReference="_102025_/l2/collabMessagesReadState.test.ts" enhancement="_blank" />

import assert from 'node:assert/strict';
import test from 'node:test';

import { shouldMarkOpenThreadRead } from '/_102025_/l2/collabMessagesReadState.js';

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
