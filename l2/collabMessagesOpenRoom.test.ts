/// <mls fileReference="_102025_/l2/collabMessagesOpenRoom.test.ts" enhancement="_blank" />

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function methodBody(source: string, name: string): string {
    const start = source.indexOf(`\n    ${name}() {`);
    assert.ok(start > 0, `${name} not found`);
    const brace = source.indexOf('{', start);
    let depth = 0;
    for (let i = brace; i < source.length; i++) {
        if (source[i] === '{') depth++;
        else if (source[i] === '}') {
            depth--;
            if (depth === 0) return source.slice(start, i + 1);
        }
    }
    throw new Error(`${name} body not closed`);
}

const source = readFileSync(new URL('./collabMessages.ts', import.meta.url), 'utf8');

test('CONNECT forwards threadToOpen and taskToOpen', () => {
    const body = methodBody(source, 'renderConnect');
    assert.match(body, /threadToOpen=\$\{ifDefined\(this\.threadToOpen \|\| undefined\)\}/);
    assert.match(body, /taskToOpen=\$\{ifDefined\(this\.taskToOpen \|\| undefined\)\}/);
});

test('CRM forwards threadToOpen and taskToOpen (a CRM room opened by notice or address must open, not stop at the list)', () => {
    const body = methodBody(source, 'renderCRM');
    assert.match(body, /threadToOpen=\$\{ifDefined\(this\.threadToOpen \|\| undefined\)\}/);
    assert.match(body, /taskToOpen=\$\{ifDefined\(this\.taskToOpen \|\| undefined\)\}/);
});
