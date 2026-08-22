/// <mls fileReference="_102025_/l2/aiAgentDefaultFeedbackLocalTitle.ts" enhancement="_blank" />

export interface LocalStepTitleEntry {
  title: string;
  status?: string;
}

export type LocalStepTitles = Map<number, LocalStepTitleEntry>;

export function applyLocalStepTitle(
  current: LocalStepTitles,
  shownTaskPK: string | undefined,
  event: { taskPK?: string; stepId?: number; title?: string },
  stepStatus?: string,
): LocalStepTitles {
  if (!shownTaskPK || event.taskPK !== shownTaskPK) return current;
  if (typeof event.stepId !== 'number' || !event.title) return current;
  const prev = current.get(event.stepId);
  if (prev && prev.title === event.title && prev.status === stepStatus) return current;
  const next = new Map(current);
  next.set(event.stepId, { title: event.title, status: stepStatus });
  return next;
}

export function dropLocalTitlesOnTaskChange(
  current: LocalStepTitles,
  shownTaskPK: string | undefined,
  eventTaskPK: string | undefined,
): LocalStepTitles {
  if (!shownTaskPK || eventTaskPK !== shownTaskPK) return current;
  if (current.size === 0) return current;
  return new Map();
}

export function dropLocalTitleIfStatusChanged(
  current: LocalStepTitles,
  stepId: number,
  status: string | undefined,
): LocalStepTitles {
  const entry = current.get(stepId);
  if (!entry) return current;
  if (entry.status === undefined || entry.status === status) return current;
  const next = new Map(current);
  next.delete(stepId);
  return next;
}

export function displayedStepTitle(
  step: {
    stepId: number;
    stepTitle?: string;
    status?: string;
    type?: string;
    agentName?: string;
    toolName?: string;
  },
  local: LocalStepTitles,
): string {
  const entry = local.get(step.stepId);
  if (entry && (entry.status === undefined || entry.status === step.status)) return entry.title;
  return step.stepTitle || step.agentName || step.toolName || step.type || 'step';
}
