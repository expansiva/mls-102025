/// <mls fileReference="_102025_/l2/collabMessagesTask.test.ts" enhancement="_blank"/>

import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

type IconStatus = (task: mls.msg.TaskData, userId: string) => string | undefined;
type NeedsSync = (task: mls.msg.TaskData | undefined, userId: string, hasContext: boolean, hasMessageRef: boolean) => boolean;

// Loads only the pure block of the card (collectSteps ... taskCardIconStatus), so the component's lit imports stay out.
async function loadIconStatus(): Promise<IconStatus> {
    const source = readFileSync(new URL('./collabMessagesTask.ts', import.meta.url), 'utf8');
    const start = source.indexOf('function collectSteps(');
    const end = source.indexOf('@customElement(');
    assert.ok(start > 0 && end > start, 'pure block of collabMessagesTask.ts not found');
    const js = ts.transpileModule(source.slice(start, end), {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
    }).outputText;
    const file = join(mkdtempSync(join(tmpdir(), 'task-card-')), 'taskCardIcon.mjs');
    writeFileSync(file, js);
    const mod = await import(pathToFileURL(file).href) as { taskCardIconStatus: IconStatus; taskNeedsServerSync: NeedsSync };
    return mod;
}

const VIEWER = 'user-viewer';
const OTHER = 'user-other';

function makeTask(nextSteps: mls.msg.AIPayload[], extras: Partial<mls.msg.TaskData> = {}): mls.msg.TaskData {
    return {
        PK: '20261112000000.1001',
        SK: 'metadata',
        title: 'card test',
        owner: VIEWER,
        team: 'unassigned',
        status: 'in progress',
        last_updated: Date.parse('2026-11-12T00:00:00.000Z'),
        last_update_log: '',
        iaCompressed: {
            queueBackEnd: [],
            queueFrontEnd: [],
            longMemory: {},
            nextSteps,
        },
        ...extras,
    };
}

function moduleStep(
    stepId: number,
    status: mls.msg.AIStepStatus,
    kind: mls.msg.ModuleStepKind,
    actorNow: string | null | undefined,
    nextSteps: mls.msg.AIPayload[] | null = null,
): mls.msg.AIModuleStep {
    return {
        type: 'module',
        stepId,
        status,
        interaction: null,
        nextSteps,
        module: {
            key: `step-${stepId}`,
            kind,
            ownerKind: 'person',
            next: [],
            passes: 0,
            actorNow,
        },
    };
}

function moduleTask(kind: mls.msg.ModuleStepKind, actorNow: string | null): mls.msg.TaskData {
    return makeTask([
        moduleStep(1, 'in_progress', 'mechanical', null, [
            moduleStep(2, 'in_progress', kind, actorNow),
            moduleStep(3, 'pending', 'wait', null),
        ]),
    ]);
}

describe('task card icon', { concurrency: 1 }, () => {

test('module human step with actorNow equal to the viewer shows the bell', async () => {
    const { taskCardIconStatus } = await loadIconStatus();
    assert.equal(taskCardIconStatus(moduleTask('human', VIEWER), VIEWER), 'waitingforuser');
});

test('module human step with another actorNow keeps the clock status', async () => {
    const { taskCardIconStatus } = await loadIconStatus();
    assert.equal(taskCardIconStatus(moduleTask('human', OTHER), VIEWER), 'in progress');
});

test('module wait and llm steps keep the clock status', async () => {
    const { taskCardIconStatus } = await loadIconStatus();
    assert.equal(taskCardIconStatus(moduleTask('wait', VIEWER), VIEWER), 'in progress');
    assert.equal(taskCardIconStatus(moduleTask('llm', VIEWER), VIEWER), 'in progress');
});

test('a viewer without id never gets the bell from a module step', async () => {
    const { taskCardIconStatus } = await loadIconStatus();
    assert.equal(taskCardIconStatus(moduleTask('human', ''), ''), 'in progress');
});

test('agent clarification still shows the bell', async () => {
    const { taskCardIconStatus } = await loadIconStatus();
    const task = makeTask([
        {
            type: 'agent',
            stepId: 1,
            status: 'in_progress',
            agentName: 'agentA',
            rags: [],
            interaction: {
                input: [],
                cost: 0,
                trace: [],
                payload: [{
                    type: 'clarification',
                    stepId: 2,
                    status: 'pending',
                    json: '{}',
                    interaction: null,
                    nextSteps: null,
                }],
            },
            nextSteps: null,
        },
    ]);
    assert.equal(taskCardIconStatus(task, VIEWER), 'waitingforuser');
});

});

const localTask = { status: 'in progress', owner: VIEWER } as mls.msg.TaskData;

describe('taskNeedsServerSync current decision', { concurrency: 1 }, () => {

test('missing local task does not sync', async () => {
    const { taskNeedsServerSync } = await loadIconStatus();
    assert.equal(taskNeedsServerSync(undefined, VIEWER, false, false), false);
    assert.equal(taskNeedsServerSync(undefined, OTHER, false, false), false);
});

test('in progress owner without context syncs', async () => {
    const { taskNeedsServerSync } = await loadIconStatus();
    assert.equal(taskNeedsServerSync(localTask, VIEWER, false, false), true);
});

test('owner with context, other user, or another status does not sync', async () => {
    const { taskNeedsServerSync } = await loadIconStatus();
    assert.equal(taskNeedsServerSync(localTask, VIEWER, true, false), false);
    assert.equal(taskNeedsServerSync(localTask, OTHER, false, false), false);
    assert.equal(taskNeedsServerSync({ ...localTask, status: 'done' }, VIEWER, false, false), false);
});

});

describe('taskNeedsServerSync when the task is absent and the card has a message ref', { concurrency: 1 }, () => {

test('owner and non-owner both sync', async () => {
    const { taskNeedsServerSync } = await loadIconStatus();
    assert.equal(taskNeedsServerSync(undefined, VIEWER, false, true), true);
    assert.equal(taskNeedsServerSync(undefined, OTHER, true, true), true);
});

});
