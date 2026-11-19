/// <mls fileReference="_102025_/l2/collabMessagesPromptMention.test.ts" enhancement="_blank" />

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildUserSuggestions, mentionablePeople } from '/_102025_/l2/collabMessagesPromptMention.js';

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
    assert.match(prompt, /serializeUserMentions\(finalText, \[\.\.\.this\.mentionPeople, \.\.\.this\.callableAgents\]\)/);
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

// front_04: the mention only sees who is in the room.
const chatMessage = readFileSync(join(here, 'collabMessagesChatMessage.ts'), 'utf8');
const local = [
    { userId: 'old-lucas', name: 'Lucas' },
    { userId: 'new-lucas', name: 'Lucas' },
    { userId: 'ana', name: 'Ana' },
];

test('front_04: an old user with the name of one in the room is not offered (the send and the edit serialize only this list)', () => {
    const people = mentionablePeople(local, ['new-lucas', 'ana']);
    assert.deepEqual(people.map((user) => user.userId), ['new-lucas', 'ana']);
    assert.deepEqual(buildUserSuggestions(people, [], 'lu').map((item) => item.userId), ['new-lucas']);
});

test('front_04: with no room the list is whole; a room without the user leaves nobody; the callable stays', () => {
    assert.deepEqual(mentionablePeople(local, undefined).map((user) => user.userId), ['old-lucas', 'new-lucas', 'ana']);
    assert.deepEqual(mentionablePeople(local, []), []);
    const agents = [{ userId: 'a1', name: 'Agente' }];
    assert.deepEqual(buildUserSuggestions(mentionablePeople(local, ['ana']), agents, '').map((item) => item.userId), ['ana', 'a1']);
});

test('front_04: the field reads the room at each opening of the list and at the send; the edit uses the room too', () => {
    assert.match(prompt, /const room = await getThread\(this\.threadId\?\.trim\(\) \|\| ''\);\s*this\.mentionPeople = mentionablePeople\(this\.allUsersValids, room\?\.users\.map/);
    assert.match(prompt, /this\.refreshPeopleOnOpen\(\);/);
    assert.match(prompt, /await this\.getUsers\(\);[\s\S]{0,120}console\.error\([^)]*\);[\s\S]{0,40}\}\s*\}\s*finalText = serializeUserMentions/);
    assert.match(prompt, /buildUserSuggestions\(this\.mentionPeople,/);
    assert.match(chatMessage, /serializeUserMentions\(this\.editContent\.trim\(\), mentionablePeople\(this\.usersAvaliables, this\.actualThread\?\.thread\.users\.map/);
    assert.match(chatMessage, /deserializeUserMentions\(message\.content \|\| '', this\.usersAvaliables\)/);
});
