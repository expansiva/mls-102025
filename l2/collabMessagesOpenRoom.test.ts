/// <mls fileReference="_102025_/l2/collabMessagesOpenRoom.test.ts" enhancement="_blank" />

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

type OpenAttrs = (group: string, threadToOpen: string, taskToOpen: string) => {
    threadToOpen: string | undefined;
    taskToOpen: string | undefined;
};

async function loadChatOpenAttributes(): Promise<OpenAttrs> {
    const source = readFileSync(new URL('./collabMessages.ts', import.meta.url), 'utf8');
    const start = source.indexOf('export function chatOpenAttributes(');
    const end = source.indexOf("@customElement('collab-messages-102025')");
    assert.ok(start > 0 && end > start, 'chatOpenAttributes block not found');
    const js = ts.transpileModule(source.slice(start, end), {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
    }).outputText;
    const file = join(mkdtempSync(join(tmpdir(), 'open-room-')), 'chatOpenAttributes.mjs');
    writeFileSync(file, js);
    const mod = await import(pathToFileURL(file).href) as { chatOpenAttributes: OpenAttrs };
    return mod.chatOpenAttributes;
}

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

test('CONNECT forwards threadToOpen and taskToOpen', async () => {
    const chatOpenAttributes = await loadChatOpenAttributes();
    assert.deepEqual(chatOpenAttributes('CONNECT', 'th-1', 'task-1'), {
        threadToOpen: 'th-1',
        taskToOpen: 'task-1',
    });
    assert.deepEqual(chatOpenAttributes('CONNECT', '', ''), {
        threadToOpen: undefined,
        taskToOpen: undefined,
    });
    const body = methodBody(source, 'renderConnect');
    assert.match(body, /threadToOpen=\$\{ifDefined\(this\.threadToOpen \|\| undefined\)\}/);
    assert.match(body, /taskToOpen=\$\{ifDefined\(this\.taskToOpen \|\| undefined\)\}/);
});

test('CRM forwards threadToOpen and taskToOpen', async () => {
    const chatOpenAttributes = await loadChatOpenAttributes();
    assert.deepEqual(chatOpenAttributes('CRM', 'th-crm', 'task-crm'), {
        threadToOpen: 'th-crm',
        taskToOpen: 'task-crm',
    });
    const body = methodBody(source, 'renderCRM');
    assert.match(body, /threadToOpen=\$\{ifDefined\(this\.threadToOpen \|\| undefined\)\}/);
    assert.match(body, /taskToOpen=\$\{ifDefined\(this\.taskToOpen \|\| undefined\)\}/);
});
