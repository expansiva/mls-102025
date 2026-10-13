/// <mls fileReference="_102025_/l2/collabMessagesMomentsUnread.test.ts" enhancement="_blank" />

import assert from 'node:assert/strict';
import test from 'node:test';

import { isUnreadMomentsThread } from '/_102025_/l2/collabMessagesMomentsUnread.js';

const neverPending = () => false;

test('isUnreadMomentsThread: Moments com não lidas, só pendente, zerado, e CONNECT com não lidas', () => {
	assert.equal(
		isUnreadMomentsThread({ threadId: 'moments-unread', group: 'MOMENTS', unreadCount: 2 }, neverPending),
		true
	);
	assert.equal(
		isUnreadMomentsThread({ threadId: 'moments-pending', group: 'MOMENTS', unreadCount: 0 }, (threadId) => threadId === 'moments-pending'),
		true
	);
	assert.equal(
		isUnreadMomentsThread({ threadId: 'moments-seen', group: 'MOMENTS', unreadCount: 0 }, neverPending),
		false
	);
	assert.equal(
		isUnreadMomentsThread({ threadId: 'connect-unread', group: 'CONNECT', unreadCount: 4 }, () => true),
		false
	);
});
