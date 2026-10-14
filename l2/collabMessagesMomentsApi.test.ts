/// <mls fileReference="_102025_/l2/collabMessagesMomentsApi.test.ts" enhancement="_blank" />

import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMomentDate, mergeMural, momentsStartIndex, oldestOrderAt, type MomentsFeedItem } from './collabMessagesMomentsApi.js';

function feedItem(threadId: string, orderAt: string, seen: boolean): MomentsFeedItem {
	return {
		threadId,
		publisher: { userId: 'u', name: 'n', avatar_url: '' },
		message: { orderAt } as MomentsFeedItem['message'],
		seen,
	};
}

void test('momentsStartIndex on an empty list is 0', () => {
	assert.equal(momentsStartIndex([]), 0);
});

void test('momentsStartIndex when every item is seen is the length', () => {
	const items = [{ seen: true }, { seen: true }, { seen: true }];
	assert.equal(momentsStartIndex(items), items.length);
});

void test('formatMomentDate converts compact UTC into the reader timezone and locale', () => {
	const createAt = '20261013170000.1000';
	const saoPaulo = formatMomentDate(createAt, 'pt-BR', 'America/Sao_Paulo');
	assert.match(saoPaulo, /13\/10\/2026/);
	assert.match(saoPaulo, /14:00/);
	assert.match(formatMomentDate(createAt, 'pt-BR', 'UTC'), /17:00/);
	const american = formatMomentDate(createAt, 'en-US', 'UTC');
	assert.match(american, /10\/13\/26/);
	assert.match(american, /5:00\s*PM/);
});

void test('formatMomentDate returns an invalid createAt unchanged', () => {
	assert.equal(formatMomentDate('not-a-date', 'pt-BR', 'UTC'), 'not-a-date');
	assert.equal(formatMomentDate('20261013', 'en-US'), '20261013');
});

void test('momentsStartIndex returns the first unseen item in the middle', () => {
	const items = [{ seen: true }, { seen: true }, { seen: false }, { seen: false }];
	assert.equal(momentsStartIndex(items), 2);
});

void test('mergeMural orders newest first, drops duplicates and keeps the incoming version', () => {
	const current = [
		feedItem('room-a', '20261014120000.1', false),
		feedItem('room-b', '20261014100000.1', false),
	];
	const incoming = [
		feedItem('room-a', '20261014120000.1', true),
		feedItem('room-a', '20261014090000.1', false),
	];
	const merged = mergeMural(current, incoming);
	assert.deepEqual(merged.map((item) => `${item.threadId}/${item.message.orderAt}/${item.seen}`), [
		'room-a/20261014120000.1/true',
		'room-b/20261014100000.1/false',
		'room-a/20261014090000.1/false',
	]);
});

void test('oldestOrderAt is the smallest orderAt', () => {
	assert.equal(oldestOrderAt([]), undefined);
	assert.equal(oldestOrderAt([
		feedItem('room-a', '20261014120000.2', true),
		feedItem('room-b', '20261014120000.1', true),
		feedItem('room-a', '20261013080000.1', true),
	]), '20261013080000.1');
});
