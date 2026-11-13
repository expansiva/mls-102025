/// <mls fileReference="_102025_/l2/collabMessagesNoraConfirm.test.ts" enhancement="_blank"/>

import test from 'node:test';
import assert from 'node:assert/strict';
import { noraConfirmButtons } from './collabMessagesNoraConfirm.ts';

const now = Date.parse('2026-11-13T12:00:00.000Z');

test('a pending Nora confirmation still shows the yes and no buttons', () => {
    assert.equal(
        noraConfirmButtons({ expiresAt: '2026-11-13T12:10:00.000Z' }, now),
        'pending',
    );
});

test('an answered Nora confirmation hides the buttons', () => {
    assert.equal(
        noraConfirmButtons({ expiresAt: '2026-11-13T12:10:00.000Z', answered: true }, now),
        'answered',
    );
});

test('an expired Nora confirmation hides the buttons', () => {
    assert.equal(
        noraConfirmButtons({ expiresAt: '2026-11-13T11:50:00.000Z' }, now),
        'expired',
    );
    assert.equal(noraConfirmButtons({ expiresAt: '2026-11-13T12:00:00.000Z' }, now), 'expired');
    assert.equal(noraConfirmButtons(undefined, now), undefined);
    assert.equal(noraConfirmButtons({ expiresAt: '' }, now), undefined);
});
