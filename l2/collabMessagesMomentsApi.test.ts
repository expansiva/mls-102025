/// <mls fileReference="_102025_/l2/collabMessagesMomentsApi.test.ts" enhancement="_blank" />

import test from 'node:test';
import assert from 'node:assert/strict';
import { momentsStartIndex } from './collabMessagesMomentsApi.js';

void test('momentsStartIndex on an empty list is 0', () => {
	assert.equal(momentsStartIndex([]), 0);
});

void test('momentsStartIndex when every item is seen is the length', () => {
	const items = [{ seen: true }, { seen: true }, { seen: true }];
	assert.equal(momentsStartIndex(items), items.length);
});

void test('momentsStartIndex returns the first unseen item in the middle', () => {
	const items = [{ seen: true }, { seen: true }, { seen: false }, { seen: false }];
	assert.equal(momentsStartIndex(items), 2);
});
