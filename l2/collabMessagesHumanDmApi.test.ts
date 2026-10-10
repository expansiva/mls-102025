/// <mls fileReference="_102025_/l2/collabMessagesHumanDmApi.test.ts" enhancement="_blank" />

import test from 'node:test';
import assert from 'node:assert/strict';
import { validateHumanDmReply } from './collabMessagesHumanDmApi.js';

const A = 'user-a';
const B = 'user-b';

function thread(users: { userId: string }[]) {
	return {
		threadId: '20261010120000.001',
		name: 'dm',
		users,
		visibility: 'private',
		status: 'active',
		group: 'CRM',
		history: [],
		languages: [],
		avatar_url: '',
		createdAt: '20261010120000',
	};
}

void test('200 with the exact pair is ok', () => {
	const result = validateHumanDmReply({
		statusCode: 200,
		outcome: 'created',
		thread: thread([{ userId: B }, { userId: A }]),
	}, A, B);
	assert.equal(result.ok, true);
	if (result.ok) {
		assert.equal(result.outcome, 'created');
		assert.equal(result.thread.threadId, '20261010120000.001');
	}
});

void test('200 with a third participant fails', () => {
	const result = validateHumanDmReply({
		statusCode: 200,
		outcome: 'existing',
		thread: thread([{ userId: A }, { userId: B }, { userId: 'user-c' }]),
	}, A, B);
	assert.equal(result.ok, false);
});

void test('200 without outcome fails', () => {
	const result = validateHumanDmReply({
		statusCode: 200,
		thread: thread([{ userId: A }, { userId: B }]),
	}, A, B);
	assert.equal(result.ok, false);
});

void test('unknown action is incompatible', () => {
	const result = validateHumanDmReply({
		statusCode: 400,
		msg: 'unknown action "ensureHumanDm"',
	}, A, B);
	assert.equal(result.ok, false);
	if (!result.ok) assert.equal(result.code, 'incompatible');
});
