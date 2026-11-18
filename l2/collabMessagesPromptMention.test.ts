/// <mls fileReference="_102025_/l2/collabMessagesPromptMention.test.ts" enhancement="_blank" />

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildUserSuggestions } from '/_102025_/l2/collabMessagesPromptMention.js';

const people = [{ userId: 'u1', name: 'Ana Paula' }, { userId: 'u2', name: 'Bruno' }];
const agents = [{ userId: 'a1', name: 'Ana' }, { userId: 'a2', name: 'Carla' }, { userId: 'u2', name: 'Bruno' }];

test('the callable agents come after the people, each one marked', () => {
    const list = buildUserSuggestions(people, agents, '');
    assert.deepEqual(list.map((item) => [item.userId, item.callable]), [['u1', false], ['u2', false], ['a1', true], ['a2', true]]);
});

test('the typed text filters people and agents, in any case', () => {
    assert.deepEqual(buildUserSuggestions(people, agents, 'an').map((item) => item.userId), ['u1', 'a1']);
    assert.deepEqual(buildUserSuggestions(people, agents, 'CA').map((item) => item.userId), ['a2']);
    assert.deepEqual(buildUserSuggestions(people, agents, 'zz'), []);
});

test('an agent already among the people is not repeated; with no agents the list is the people', () => {
    assert.equal(buildUserSuggestions(people, agents, 'br').length, 1);
    assert.deepEqual(buildUserSuggestions(people, [], '').map((item) => item.userId), ['u1', 'u2']);
});

const here = dirname(fileURLToPath(import.meta.url));
const prompt = readFileSync(join(here, 'collabMessagesPrompt.ts'), 'utf8');
const chat = readFileSync(join(here, 'collabMessagesChat.ts'), 'utf8');
const taskRoom = readFileSync(join(here, 'collabMessagesTaskRoom.ts'), 'utf8');

test('the chosen agent is written as the mention the cm understands: the send serializes with the agents too', () => {
    assert.match(prompt, /serializeUserMentions\(finalText, \[\.\.\.this\.allUsersValids, \.\.\.this\.callableAgents\]\)/);
    assert.match(prompt, /`\$1\[@\$\{user\.name\}\]\(\$\{user\.userId\}\)`/);
});

test('the callable agents are asked once, when the list opens, and a failure is logged', () => {
    assert.match(prompt, /msgGetUsers\(\{[^}]*callableOnly: true/s);
    assert.match(prompt, /console\.error\(/);
    assert.equal((prompt.match(/msgGetUsers\(/g) ?? []).length, 1);
});

test('only the chat turns the callable agents on; the task room does not', () => {
    assert.match(chat, /acceptAutoCompleteCallableAgents="true"/);
    assert.doesNotMatch(taskRoom, /acceptAutoCompleteCallableAgents/);
});
