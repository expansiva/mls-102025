/// <mls fileReference="_102025_/l2/collabMessagesTaskInfoLlm.test.ts" enhancement="_blank"/>

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

type Shows = (task: mls.msg.TaskData | undefined) => boolean;

async function loadShows(): Promise<Shows> {
    const source = readFileSync(new URL('./collabMessagesTaskInfo.ts', import.meta.url), 'utf8');
    const start = source.indexOf('function toNumber(');
    const end = source.indexOf('export function moduleScreenAddress(');
    assert.ok(start > 0 && end > start, 'statistics block of collabMessagesTaskInfo.ts not found');
    const walk = `function getAllSteps(firstStep) {
  if (!firstStep || firstStep.length < 1) return [];
  const allSteps = [];
  const queue = [...firstStep];
  while (queue.length > 0) {
    const currentStep = queue.shift();
    allSteps.push(currentStep);
    if (currentStep.nextSteps) queue.push(...currentStep.nextSteps);
    if (currentStep.interaction?.payload) queue.push(...currentStep.interaction.payload);
  }
  return allSteps;
}
`;
    const js = ts.transpileModule(walk + source.slice(start, end), {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
    }).outputText;
    const file = join(mkdtempSync(join(tmpdir(), 'task-llm-stats-')), 'llmStats.mjs');
    writeFileSync(file, js);
    const mod = await import(pathToFileURL(file).href) as { moduleTaskShowsLlmStatistics: Shows };
    return mod.moduleTaskShowsLlmStatistics;
}

function makeTask(nextSteps: mls.msg.AIPayload[]): mls.msg.TaskData {
    return {
        PK: '20261112000000.1001',
        SK: 'metadata',
        title: 'module stats',
        owner: 'user',
        team: 'unassigned',
        status: 'in progress',
        source: 'module',
        last_updated: Date.parse('2026-11-12T00:00:00.000Z'),
        last_update_log: '',
        iaCompressed: { queueBackEnd: [], queueFrontEnd: [], longMemory: {}, nextSteps },
    };
}

function moduleRoot(children: mls.msg.AIPayload[]): mls.msg.AIPayload[] {
    return [{
        type: 'module',
        stepId: 1,
        status: 'in_progress',
        interaction: null,
        nextSteps: [{
            type: 'module',
            stepId: 2,
            status: 'in_progress',
            interaction: null,
            module: { key: 'ler', kind: 'llm', passes: 1 },
            nextSteps: children,
        }],
    } as mls.msg.AIPayload];
}

test('module task statistics show the LLM block only after a call', async () => {
    const shows = await loadShows();
    const called = makeTask(moduleRoot([{
        type: 'agent',
        stepId: 3,
        status: 'completed',
        agentName: 'module',
        rags: [],
        interaction: { input: [], cost: 0.42, trace: ['x-web-search: requested'], payload: null },
        nextSteps: null,
    } as mls.msg.AIPayload]));
    const idle = makeTask(moduleRoot([]));
    assert.equal(shows(called), true);
    assert.equal(shows(idle), false);
});
