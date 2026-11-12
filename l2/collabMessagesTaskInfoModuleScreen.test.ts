/// <mls fileReference="_102025_/l2/collabMessagesTaskInfoModuleScreen.test.ts" enhancement="_blank"/>

import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

type ProgramItem = { title: string; icon: string; url: string; pageName: string };
type ScreenFns = {
    moduleScreenAddress: (task: mls.msg.TaskData | undefined, userId: string) => string | undefined;
    openModuleScreenProgram: (
        address: string | undefined,
        openProgram: ((item: ProgramItem) => Promise<void>) | undefined,
    ) => Promise<void>;
};

// Loads only the pure screen helpers, so the component's lit imports stay out.
async function loadScreenFns(): Promise<ScreenFns> {
    const source = readFileSync(new URL('./collabMessagesTaskInfo.ts', import.meta.url), 'utf8');
    const start = source.indexOf('export function moduleScreenAddress(');
    const end = source.indexOf("@customElement('collab-messages-task-info-102025')");
    assert.ok(start > 0 && end > start, 'pure block of collabMessagesTaskInfo.ts not found');
    const js = ts.transpileModule(source.slice(start, end), {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
    }).outputText;
    const file = join(mkdtempSync(join(tmpdir(), 'task-screen-')), 'moduleScreen.mjs');
    writeFileSync(file, js);
    return await import(pathToFileURL(file).href) as ScreenFns;
}

const VIEWER = 'user-viewer';
const OTHER = 'user-other';

function makeTask(
    kind: mls.msg.ModuleStepKind,
    actorNow: string | null,
    params: Record<string, string> | undefined,
    recordId = 'rec-1',
): mls.msg.TaskData {
    const current: mls.msg.AIModuleStep = {
        type: 'module',
        stepId: 2,
        status: 'in_progress',
        interaction: null,
        nextSteps: null,
        module: {
            key: 'act',
            kind,
            ownerKind: 'person',
            next: [],
            passes: 0,
            actorNow,
            params,
        },
    };
    return {
        PK: '20261112000000.1001',
        SK: 'metadata',
        title: 'screen test',
        owner: VIEWER,
        team: 'unassigned',
        status: 'in progress',
        last_updated: Date.parse('2026-11-12T00:00:00.000Z'),
        last_update_log: '',
        module: {
            ref: {
                project: 'p',
                module: 'm',
                entity: 'e',
                recordId,
                processId: 'proc',
                workflowVersion: null,
            },
            origin: { kind: 'screen' },
            owner: VIEWER,
            revision: 1,
            room: { mode: 'person' },
            moduleTitle: 'Module',
            history: [],
        },
        iaCompressed: {
            queueBackEnd: [],
            queueFrontEnd: [],
            longMemory: {},
            nextSteps: [{
                type: 'module',
                stepId: 1,
                status: 'in_progress',
                interaction: null,
                nextSteps: [current],
                module: {
                    key: 'root',
                    kind: 'mechanical',
                    ownerKind: 'module',
                    next: [],
                    passes: 0,
                    actorNow: null,
                },
            }],
        },
    };
}

describe('module screen from task details', { concurrency: 1 }, () => {

test('the address exists only for the viewer on a human step with a page', async () => {
    const { moduleScreenAddress } = await loadScreenFns();
    const page = { page: 'orders/edit', recordParam: 'id' };
    assert.equal(moduleScreenAddress(makeTask('human', VIEWER, page), VIEWER), 'orders/edit?id=rec-1');
    assert.equal(moduleScreenAddress(makeTask('human', OTHER, page), VIEWER), undefined);
    assert.equal(moduleScreenAddress(makeTask('human', VIEWER, page), ''), undefined);
    assert.equal(moduleScreenAddress(makeTask('wait', VIEWER, page), VIEWER), undefined);
    assert.equal(moduleScreenAddress(makeTask('llm', VIEWER, page), VIEWER), undefined);
});

test('opening the screen calls openProgram once with the address', async () => {
    const { moduleScreenAddress, openModuleScreenProgram } = await loadScreenFns();
    const task = makeTask('human', VIEWER, { page: 'orders/edit', recordParam: 'id' });
    const calls: ProgramItem[] = [];
    await openModuleScreenProgram(moduleScreenAddress(task, VIEWER), async (item) => {
        calls.push(item);
    });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'orders/edit?id=rec-1');
});

test('a recordId with a special character is encoded in the address', async () => {
    const { moduleScreenAddress } = await loadScreenFns();
    const task = makeTask('human', VIEWER, { page: 'orders/edit', recordParam: 'id' }, 'a b&c');
    assert.equal(moduleScreenAddress(task, VIEWER), 'orders/edit?id=a%20b%26c');
});

test('a module task without params.page has no screen address', async () => {
    const { moduleScreenAddress } = await loadScreenFns();
    assert.equal(moduleScreenAddress(makeTask('human', VIEWER, undefined), VIEWER), undefined);
    assert.equal(moduleScreenAddress(makeTask('human', VIEWER, { recordParam: 'id' }), VIEWER), undefined);
    const pageOnly = moduleScreenAddress(makeTask('human', VIEWER, { page: 'orders/list' }), VIEWER);
    assert.equal(pageOnly, 'orders/list');
});

});
