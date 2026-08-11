function childrenOf(step: mls.msg.AIPayload): mls.msg.AIPayload[] {
  return [...(step.nextSteps || []), ...(step.interaction?.payload || [])];
}

export function isTransparentCompletedStep(step: mls.msg.AIPayload): boolean {
  return step.status === 'completed'
    && (step.type === 'flexible' || step.type === 'result' || step.type === 'clarification');
}

/** True only when a visible branch and every descendant have completed. */
export function isBranchCompleted(step: mls.msg.AIPayload): boolean {
  return step.status === 'completed'
    && countCollapsedRows(step) > 0
    && childrenOf(step).every(child => child.status === 'completed' && descendantsCompleted(child));
}

/** Counts visible descendant rows, traversing completed transparent nodes. */
export function countCollapsedRows(step: mls.msg.AIPayload): number {
  return childrenOf(step).reduce((total, child) => total + visibleRows(child), 0);
}

function descendantsCompleted(step: mls.msg.AIPayload): boolean {
  return childrenOf(step).every(child => child.status === 'completed' && descendantsCompleted(child));
}

function visibleRows(step: mls.msg.AIPayload): number {
  const descendants = countCollapsedRows(step);
  return isTransparentCompletedStep(step) ? descendants : 1 + descendants;
}
