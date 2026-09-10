/// <mls fileReference="_102025_/l2/collabMessagesEvents.ts" enhancement="_blank"/>

import * as msg from '/_102025_/l2/shared/interfaces.js';

export function notifyMessageSendChange(context: msg.ExecutionContext): void {
  const scopeWindow = window?.top ? window.top : window;
  const event = new CustomEvent('message-send', {
    detail: { context },
    bubbles: true,
    composed: true
  });
  scopeWindow.dispatchEvent(event);
}

export function notifyTaskChange(context: msg.ExecutionContext, oldContextCreateAt?: string): void {
  const scopeWindow = window?.top ? window.top : window;
  const event = new CustomEvent('task-change', {
    detail: { context, oldContextCreateAt },
    bubbles: true,
    composed: true
  });
  scopeWindow.dispatchEvent(event);
}

/** Ephemeral step title on the client. No server, store, or intents. */
export const STEP_TITLE_LOCAL_EVENT = 'step-title-local';
export const LOCAL_STEP_TITLE_MIN_MS = 500;

export interface LocalStepTitleDetail {
  taskPK: string;
  stepId: number;
  title: string;
}

type LocalStepTitleThrottle = { at: number; title: string };

const localStepTitleLastEmit = new Map<string, LocalStepTitleThrottle>();

/** Pure tick decision: at most one event per step per ~500ms, drop a repeated same title. */
export function shouldEmitLocalStepTitle(
  last: LocalStepTitleThrottle | undefined,
  now: number,
  title: string,
  minIntervalMs: number = LOCAL_STEP_TITLE_MIN_MS,
): boolean {
  if (!title) return false;
  if (!last) return true;
  if (last.title === title) return false;
  if (now - last.at < minIntervalMs) return false;
  return true;
}

export function getLocalStepTitleEventScope(): Window | undefined {
  try {
    if (typeof window === 'undefined') return undefined;
    return window.top ?? window;
  } catch {
    return undefined;
  }
}

/**
 * Paint a step title in the open task UI. Fail-soft: no window (headless/CLI) is a silent no-op;
 * any throw is swallowed — an ornament must never kill a run.
 */
export function changeLocalStepTitle(taskPK: string, stepId: number, title: string): void {
  try {
    if (!taskPK || !title) return;
    const scopeWindow = getLocalStepTitleEventScope();
    if (!scopeWindow) return;
    const key = `${taskPK}:${stepId}`;
    const now = Date.now();
    const last = localStepTitleLastEmit.get(key);
    if (!shouldEmitLocalStepTitle(last, now, title)) return;
    localStepTitleLastEmit.set(key, { at: now, title });
    scopeWindow.dispatchEvent(new CustomEvent(STEP_TITLE_LOCAL_EVENT, {
      detail: { taskPK, stepId, title } satisfies LocalStepTitleDetail,
      bubbles: true,
      composed: true,
    }));
  } catch {
    /* fail-soft */
  }
}

/** Main-thread tick while a worker/await holds. No-op (and no timer) without window. */
export function startLocalStepTitleTick(
  taskPK: string,
  stepId: number,
  makeTitle: (elapsedSec: number) => string,
  intervalMs: number = LOCAL_STEP_TITLE_MIN_MS,
): () => void {
  try {
    if (!getLocalStepTitleEventScope()) return () => {};
    const startedAt = Date.now();
    const tick = (): void => {
      changeLocalStepTitle(taskPK, stepId, makeTitle(Math.floor((Date.now() - startedAt) / 1000)));
    };
    tick();
    const id = setInterval(tick, intervalMs);
    let stopped = false;
    return () => {
      if (stopped) return;
      stopped = true;
      try { clearInterval(id); } catch { /* fail-soft */ }
    };
  } catch {
    return () => {};
  }
}

export function notifyTaskCompleted(context: msg.ExecutionContext, result?: string): void {
  const scopeWindow = window?.top ? window.top : window;
  const event = new CustomEvent('task-completed', {
    detail: { context, result },
    bubbles: true,
    composed: true
  });
  scopeWindow.dispatchEvent(event);
}

export function notifyThreadChange(thread: msg.Thread): void {
  const scopeWindow = window?.top ? window.top : window;
  const event = new CustomEvent('thread-change', {
    detail: thread,
    bubbles: true,
    composed: true
  });
  scopeWindow.dispatchEvent(event);
}

export function notifyMessageChange(message: msg.Message): void {
  const scopeWindow = window?.top ? window.top : window;
  const event = new CustomEvent('message-change', {
    detail: message,
    bubbles: true,
    composed: true
  });
  scopeWindow.dispatchEvent(event);
}

export function notifyThreadNotification(show: boolean): void {
  const scopeWindow = window?.top ? window.top : window;
  const event = new CustomEvent('thread-notification', {
    detail: show,
    bubbles: true,
    composed: true
  });
  scopeWindow.dispatchEvent(event);
}



export function notifyThreadCreate(thread: msg.Thread): void {
  const scopeWindow = window?.top ? window.top : window;
  const event = new CustomEvent('thread-create', {
    detail: thread,
    bubbles: true,
    composed: true
  });
  scopeWindow.dispatchEvent(event);
}

export function dispatchDetailsTaskClose(taskId: string): void {
  const scopeWindow = window?.top ? window.top : window;
  const event = new CustomEvent('task-details-close', {
    detail: taskId,
    bubbles: true,
    composed: true
  });
  scopeWindow.dispatchEvent(event);
}

export function dispatchDetailsTaskClick(messageId: string, taskId: string, task: msg.TaskData, message: msg.MessagePerformanceCache): void {
  const scopeWindow = window?.top ? window.top : window;
  const event = new CustomEvent('task-details-click', {
    detail: { messageId, taskId, task, message },
    bubbles: true,
    composed: true
  });
  scopeWindow.dispatchEvent(event);
}


export function dispatchThreadOpen(threadId: string, taskId?: string): void {
  const scopeWindow = window?.top ? window.top : window;
  const event = new CustomEvent('thread-open', {
    detail: { taskId, threadId },
    bubbles: true,
    composed: true
  });
  scopeWindow.dispatchEvent(event);
}

/** Existing share-link format from createMessageLink: `#message/{threadId}` or `#message/{threadId}/{messageId}`. */
export function threadOpenFromHash(hash: string): { threadId: string; messageId?: string } | undefined {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const match = raw.match(/^message\/([^/]+)(?:\/([^/]+))?$/);
  if (!match || !match[1]) return undefined;
  const threadId = decodeURIComponent(match[1]);
  if (!threadId) return undefined;
  const messageId = match[2] ? decodeURIComponent(match[2]) : undefined;
  return messageId ? { threadId, messageId } : { threadId };
}

export function notifyTaskMetaChanged(payload: { taskId: string; taskTitle: string; threadId: string }): void {
  const scopeWindow = window?.top ? window.top : window;
  const event = new CustomEvent('task-meta-changed', {
    detail: payload,
    bubbles: true,
    composed: true
  });
  scopeWindow.dispatchEvent(event);
}

export interface ICollabMessageEvent {
  threadId: string,
  taskId?: string,
}