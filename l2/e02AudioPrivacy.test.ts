/// <mls fileReference="_102025_/l2/e02AudioPrivacy.test.ts" enhancement="_blank" />

import test from 'node:test';
import assert from 'node:assert/strict';
import { clearE02PrivateCacheOnAccessError, type E02PrivateViewCache } from './e02AudioPrivacy.js';

const filled = (): E02PrivateViewCache<{ transcript: string; interpretation: string }> => ({
  audioUrl: 'https://private.invalid/signed-audio',
  processingId: 'audio-private-1',
  processing: { transcript: '<private transcript>', interpretation: '<private interpretation>' },
  correctionDraft: '<private correction>',
  interpretationRequest: '<private request>',
  selectedVersion: 7,
  feedback: '<private feedback>',
});

for (const statusCode of [403, 404]) {
  void test(`${statusCode} clears a fully populated private audio cache`, () => {
    const result = clearE02PrivateCacheOnAccessError({ statusCode }, filled());

    assert.equal(result.revoked, true);
    assert.deepEqual(result.cache, {
      audioUrl: '', processingId: '', processing: undefined, correctionDraft: '',
      interpretationRequest: '', selectedVersion: null, feedback: '',
    });
  });
}

void test('non-revocation failures keep private state available for correction or retry', () => {
  const state = filled();
  const result = clearE02PrivateCacheOnAccessError({ statusCode: 500 }, state);

  assert.equal(result.revoked, false);
  assert.equal(result.cache, state);
});
