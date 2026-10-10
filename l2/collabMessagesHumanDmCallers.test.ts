/// <mls fileReference="_102025_/l2/collabMessagesHumanDmCallers.test.ts" enhancement="_blank" />

import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));

function layerSources(): { name: string; text: string }[] {
	return readdirSync(dir)
		.filter((name) => name.endsWith('.ts') && !name.endsWith('.defs.ts') && !name.endsWith('.test.ts'))
		.map((name) => ({ name, text: readFileSync(join(dir, name), 'utf8') }));
}

function countOf(text: string, needle: string): number {
	let count = 0;
	let from = 0;
	while (from < text.length) {
		const at = text.indexOf(needle, from);
		if (at < 0) break;
		count++;
		from = at + needle.length;
	}
	return count;
}

/** Drop one `function name(` body so the agent builder is not scanned as a human DM. */
function withoutFunction(text: string, name: string): string {
	const start = text.search(new RegExp(`function\\s+${name}\\s*\\(`));
	if (start < 0) return text;
	const open = text.indexOf('{', start);
	if (open < 0) return text;
	let depth = 0;
	for (let i = open; i < text.length; i++) {
		if (text[i] === '{') depth++;
		else if (text[i] === '}') {
			depth--;
			if (depth === 0) return text.slice(0, start) + text.slice(i + 1);
		}
	}
	return text.slice(0, start);
}

void test('createThreadDM is only the helper definition and one agent call', () => {
	const files = layerSources();
	assert.ok(files.length > 0, 'no layer sources');
	const problems: string[] = [];
	for (const file of files) {
		const total = countOf(file.text, 'createThreadDM(');
		if (file.name === 'collabMessagesHelper.ts') {
			const definitions = countOf(file.text, 'function createThreadDM(');
			if (definitions !== 1 || total !== definitions) {
				problems.push(`${file.name}: ${total} createThreadDM( of which ${definitions} definitions`);
			}
		} else if (file.name === 'collabMessagesAdd.ts') {
			if (total > 1) problems.push(`${file.name}: ${total} createThreadDM( (max 1 agent call)`);
		} else if (total > 0) {
			problems.push(`${file.name}: ${total} createThreadDM(`);
		}
	}
	assert.deepEqual(problems, []);
});

void test('addUserInThread and msgAddParticipant do not assemble a human DM', () => {
	const problems: string[] = [];
	for (const file of layerSources()) {
		const buildsHumanDm = file.text.includes('ensureHumanDmThread');
		if (!buildsHumanDm) continue;
		const outsideAgentBuilder = withoutFunction(file.text, 'createThreadDM');
		for (const token of ['addUserInThread(', 'msgAddParticipant(', 'msgAddParticipantToThread(']) {
			if (outsideAgentBuilder.includes(token)) {
				problems.push(`${file.name}: ${token} outside createThreadDM`);
			}
		}
	}
	assert.deepEqual(problems, []);
});
