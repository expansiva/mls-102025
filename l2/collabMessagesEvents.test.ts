/// <mls fileReference="_102025_/l2/collabMessagesEvents.test.ts" enhancement="_blank" />

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  changeLocalStepTitle,
  LOCAL_STEP_TITLE_MIN_MS,
  shouldEmitLocalStepTitle,
  startLocalStepTitleTick,
  STEP_TITLE_LOCAL_EVENT,
  threadOpenFromHash,
} from '/_102025_/l2/collabMessagesEvents.js';

test('threadOpenFromHash reads the existing #message/{threadId}/{messageId} route', () => {
  assert.deepEqual(threadOpenFromHash('#message/thread-1/msg-9'), { threadId: 'thread-1', messageId: 'msg-9' });
  assert.deepEqual(threadOpenFromHash('message/thread-1'), { threadId: 'thread-1' });
  assert.equal(threadOpenFromHash('#other'), undefined);
  assert.equal(threadOpenFromHash(''), undefined);
});

test('shouldEmitLocalStepTitle: first title emits, same text is dropped, interval gates a new text', () => {
  assert.equal(shouldEmitLocalStepTitle(undefined, 1000, 'compiling 10 files (0s)'), true);
  assert.equal(shouldEmitLocalStepTitle({ at: 1000, title: 'a' }, 1100, 'a'), false);
  assert.equal(shouldEmitLocalStepTitle({ at: 1000, title: 'a' }, 1100, 'b'), false);
  assert.equal(shouldEmitLocalStepTitle({ at: 1000, title: 'a' }, 1000 + LOCAL_STEP_TITLE_MIN_MS, 'b'), true);
  assert.equal(shouldEmitLocalStepTitle({ at: 1000, title: 'a' }, 2000, ''), false);
});

test('changeLocalStepTitle is a silent no-op without window', () => {
  const previous = (globalThis as { window?: unknown }).window;
  delete (globalThis as { window?: unknown }).window;
  try {
    assert.equal(typeof (globalThis as { window?: unknown }).window, 'undefined');
    assert.doesNotThrow(() => changeLocalStepTitle('task/1', 7, 'compiling'));
    assert.doesNotThrow(() => startLocalStepTitleTick('task/1', 7, (sec) => `${sec}s`)());
  } finally {
    if (previous !== undefined) (globalThis as { window?: unknown }).window = previous;
  }
});

test('changeLocalStepTitle dispatches step-title-local and swallows dispatcher throws', () => {
  const events: Array<{ type: string; detail: unknown }> = [];
  const fakeTop = {
    dispatchEvent(event: Event): boolean {
      events.push({ type: event.type, detail: (event as CustomEvent).detail });
      return true;
    },
  };
  const previous = (globalThis as { window?: unknown }).window;
  (globalThis as { window?: unknown }).window = { top: fakeTop };
  try {
    changeLocalStepTitle('task/pk-a', 3, 'Validate l1 artifacts — compiling 10 files (0s)');
    changeLocalStepTitle('task/pk-a', 3, 'Validate l1 artifacts — compiling 10 files (0s)');
    assert.equal(events.length, 1);
    assert.equal(events[0].type, STEP_TITLE_LOCAL_EVENT);
    assert.deepEqual(events[0].detail, {
      taskPK: 'task/pk-a',
      stepId: 3,
      title: 'Validate l1 artifacts — compiling 10 files (0s)',
    });

    fakeTop.dispatchEvent = () => { throw new Error('dispatch must not kill the run'); };
    assert.doesNotThrow(() => changeLocalStepTitle('task/pk-b', 1, 'other'));
  } finally {
    if (previous === undefined) delete (globalThis as { window?: unknown }).window;
    else (globalThis as { window?: unknown }).window = previous;
  }
});
