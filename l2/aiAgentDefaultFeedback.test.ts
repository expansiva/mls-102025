/// <mls fileReference="_102025_/l2/aiAgentDefaultFeedback.test.ts" enhancement="_blank" />

import assert from 'node:assert/strict';
import test from 'node:test';

import { countCollapsedRows, isBranchCompleted } from '/_102025_/l2/aiAgentDefaultFeedbackTree.js';
import {
  applyLocalStepTitle,
  displayedStepTitle,
  dropLocalTitleIfStatusChanged,
  dropLocalTitlesOnTaskChange,
} from '/_102025_/l2/aiAgentDefaultFeedbackLocalTitle.js';

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

test('ephemeral local titles apply only to the shown task and never mutate the step', () => {
  const empty = new Map();
  const other = applyLocalStepTitle(empty, 'task/shown', { taskPK: 'task/other', stepId: 4, title: 'compiling' }, 'in_progress');
  assert.equal(other, empty);

  const applied = applyLocalStepTitle(empty, 'task/shown', { taskPK: 'task/shown', stepId: 4, title: 'compiling 10 files (3s)' }, 'waiting_human_input');
  assert.notEqual(applied, empty);
  const payload = { stepId: 4, stepTitle: 'Validate l1 artifacts', status: 'waiting_human_input' as const, type: 'agent', agentName: 'agentCbValidateAll' };
  assert.equal(displayedStepTitle(payload, applied), 'compiling 10 files (3s)');
  assert.equal(payload.stepTitle, 'Validate l1 artifacts');

  const afterDurable = dropLocalTitlesOnTaskChange(applied, 'task/shown', 'task/shown');
  assert.equal(afterDurable.size, 0);
  assert.equal(displayedStepTitle(payload, afterDurable), 'Validate l1 artifacts');

  const statusChanged = dropLocalTitleIfStatusChanged(applied, 4, 'completed');
  assert.equal(displayedStepTitle({ ...payload, status: 'completed' }, statusChanged), 'Validate l1 artifacts');
});
