/// <mls fileReference="_102025_/l2/aiAgentDefaultFeedback.test.ts" enhancement="_blank" />

import assert from 'node:assert/strict';
import test from 'node:test';

import { countCollapsedRows, isBranchCompleted } from '/_102025_/l2/aiAgentDefaultFeedbackTree.js';

function step(
  stepId: number,
  status: mls.msg.AIStepStatus,
  type: mls.msg.AIPayload['type'] = 'agent',
  nextSteps: mls.msg.AIPayload[] = [],
): mls.msg.AIPayload {
  if (type === 'result') return { type, stepId, status, nextSteps, result: '', interaction: null };
  if (type === 'clarification') return { type, stepId, status, nextSteps, json: '', interaction: null };
  return { type: 'agent', stepId, status, nextSteps, agentName: 'test', rags: [], interaction: null };
}

test('completed transparent nodes do not inflate a collapsed branch count', () => {
  const leaf = step(3, 'completed');
  const transparent = step(2, 'completed', 'result', [leaf]);
  const branch = step(1, 'completed', 'agent', [transparent]);

  assert.equal(isBranchCompleted(branch), true);
  assert.equal(countCollapsedRows(branch), 1);
});

test('a failed descendant prevents automatic collapse while retaining its visible row count', () => {
  const complete = step(2, 'completed');
  const failed = step(3, 'failed');
  const branch = step(1, 'completed', 'agent', [complete, failed]);

  assert.equal(isBranchCompleted(branch), false);
  assert.equal(countCollapsedRows(branch), 2);
});
