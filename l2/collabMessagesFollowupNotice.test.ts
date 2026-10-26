/// <mls fileReference="_102025_/l2/collabMessagesFollowupNotice.test.ts" enhancement="_blank"/>

import test from 'node:test';
import assert from 'node:assert/strict';
import { nextFollowupNotice, type FollowupNoticeState } from '/_102025_/l2/collabMessagesFollowupNotice.js';

const hidden = (lastCount: number): FollowupNoticeState => ({ visible: false, lastCount });

test('follow-up notice shows on open only when count is above zero', () => {
    assert.deepEqual(nextFollowupNotice(hidden(0), 'open', 0), { visible: false, lastCount: 0 });
    assert.deepEqual(nextFollowupNotice(hidden(0), 'open', 3), { visible: true, lastCount: 3 });
});

test('user scroll hides the notice and keeps the last count', () => {
    assert.deepEqual(nextFollowupNotice({ visible: true, lastCount: 3 }, 'userScroll', 3), { visible: false, lastCount: 3 });
});

test('count shows the notice again only when the total increases', () => {
    const hiddenAt3 = nextFollowupNotice({ visible: true, lastCount: 3 }, 'userScroll', 3);
    assert.deepEqual(nextFollowupNotice(hiddenAt3, 'count', 3), { visible: false, lastCount: 3 });
    assert.deepEqual(nextFollowupNotice(hiddenAt3, 'count', 4), { visible: true, lastCount: 4 });

    const dropped = nextFollowupNotice({ visible: false, lastCount: 4 }, 'count', 2);
    assert.deepEqual(dropped, { visible: false, lastCount: 2 });
    assert.deepEqual(nextFollowupNotice(dropped, 'count', 3), { visible: true, lastCount: 3 });
    assert.deepEqual(nextFollowupNotice({ visible: true, lastCount: 3 }, 'count', 0), { visible: false, lastCount: 0 });
});
