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

