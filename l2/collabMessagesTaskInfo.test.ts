/// <mls fileReference="_102025_/l2/collabMessagesTaskInfo.test.ts" enhancement="_blank" />

import type { ICANTest, ICANIntegration } from '/_102025_/l2/tsTestAST.js';
import { buildTaskStatistics } from '/_102025_/l2/collabMessagesTaskInfo.js';

export const integrations: ICANIntegration[] = [];
export const tests: ICANTest[] = [
    { functionName: 'testBuildTaskStatisticsFromJsonStringTrace', params: [{}] },
    { functionName: 'testBuildTaskStatisticsCountsFallbacksAndErrors', params: [{}] },
    { functionName: 'testBuildTaskStatisticsFromStructuredTraceObject', params: [{}] },
    { functionName: 'testBuildTaskStatisticsCountsUntracedInteractionCost', params: [{}] },
];

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) throw new Error(message);
}

function assertClose(actual: number, expected: number, message: string) {
    if (Math.abs(actual - expected) > 0.0001) {
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
}

function makeTask(nextSteps: any[]): mls.msg.TaskData {
    return {
        PK: '20260704043239.1001',
        SK: 'metadata',
        title: 'stats test',
        owner: 'user',
        team: 'unassigned',
        status: 'done',
        last_updated: Date.parse('2026-07-04T04:33:00.000Z'),
        last_update_log: '',
        iaCompressed: {
            queueBackEnd: [],
            queueFrontEnd: [],
            longMemory: {},
            nextSteps
        }
    };
}

export function testBuildTaskStatisticsFromJsonStringTrace() {
    const trace = JSON.stringify({
        title: 'Processing with args: closeShift',
        ok: true,
        trace: [
            'starting at 2026-07-04T04:32:39.384Z',
            "provider: openrouter model:z-ai/glm-5.2 alias:codehigh stage:primary user:'u' inputTokens:2601 outputTokens:1288 cost:$0.0098 llmTime: 00:00:12.933",
            'finished at 2026-07-04T04:32:52.319Z'
        ]
    });

    const stats = buildTaskStatistics(makeTask([
        {
            type: 'agent',
            stepId: 1,
            status: 'completed',
            agentName: 'agentA',
            rags: [],
            interaction: { input: [], cost: 0.0098, trace: [trace], payload: null },
            nextSteps: null
        }
    ]));

    assert(stats.llmCalls === 1, 'Expected one LLM call');
    assert(stats.inputTokens === 2601, 'Expected input tokens from trace');
    assert(stats.outputTokens === 1288, 'Expected output tokens from trace');
    assert(stats.models[0].model === 'z-ai/glm-5.2', 'Expected model from trace');
    assert(stats.models[0].alias === 'codehigh', 'Expected alias from trace');
    assert(stats.jsonTraceRecords === 1, 'Expected JSON trace record');
    assert(stats.totalExecutionMs === 12935, 'Expected wall-clock execution time');
    assertClose(stats.totalCost, 0.0098, 'Expected trace cost');
}

export function testBuildTaskStatisticsCountsFallbacksAndErrors() {
    const trace = JSON.stringify({
        title: 'Processing with args: retry',
        ok: false,
        trace: [
            'starting at 2026-07-04T04:32:00.000Z',
            'error: primary provider failed',
            'provider: openrouter model:test-model alias:codehigh stage:fallback inputTokens:10 outputTokens:20 cost:$0.0300 llmTime: 00:00:01.500',
            'finished at 2026-07-04T04:32:02.000Z'
        ]
    });

    const stats = buildTaskStatistics(makeTask([
        {
            type: 'agent',
            stepId: 2,
            status: 'failed',
            agentName: 'agentB',
            rags: [],
            interaction: { input: [], cost: 0.03, trace: [trace], payload: null },
            nextSteps: null
        }
    ]));

    assert(stats.failedSteps === 1, 'Expected failed step count');
    assert(stats.fallbackCount === 1, 'Expected fallback call count');
    assert(stats.errorCount >= 2, 'Expected ok=false plus error line');
    assert(stats.models[0].stage === 'fallback', 'Expected fallback stage in model stats');
}

export function testBuildTaskStatisticsFromStructuredTraceObject() {
    const stats = buildTaskStatistics(makeTask([
        {
            type: 'agent',
            stepId: 3,
            status: 'completed',
            agentName: 'agentC',
            rags: [],
            interaction: {
                input: [],
                cost: 0.0123,
                trace: [{
                    title: 'structured call',
                    ok: true,
                    provider: 'openrouter',
                    model: 'structured-model',
                    alias: 'codepro',
                    stage: 'primary',
                    inputTokens: 111,
                    outputTokens: 222,
                    cost: 0.0123,
                    llmTime: '00:00:02.250',
                    startedAt: '2026-07-04T04:32:10.000Z',
                    finishedAt: '2026-07-04T04:32:13.000Z'
                }],
                payload: null
            },
            nextSteps: null
        }
    ]));

    assert(stats.llmCalls === 1, 'Expected structured trace call');
    assert(stats.inputTokens === 111, 'Expected structured input tokens');
    assert(stats.outputTokens === 222, 'Expected structured output tokens');
    assert(stats.totalLlmMs === 2250, 'Expected structured LLM time');
    assert(stats.totalExecutionMs === 3000, 'Expected structured wall time');
    assert(stats.models[0].model === 'structured-model', 'Expected structured model');
}

export function testBuildTaskStatisticsCountsUntracedInteractionCost() {
    const stats = buildTaskStatistics(makeTask([
        {
            type: 'agent',
            stepId: 4,
            status: 'completed',
            agentName: 'agentWithoutTrace',
            rags: [],
            interaction: { input: [], cost: 0.0174, trace: [], payload: null },
            nextSteps: null
        }
    ]));

    assert(stats.llmCalls === 1, 'Expected one synthetic untraced call');
    assert(stats.models[0].model === 'untraced interaction', 'Expected untraced model bucket');
    assertClose(stats.totalCost, 0.0174, 'Expected untraced interaction cost');
}
