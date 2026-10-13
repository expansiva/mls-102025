/// <mls fileReference="_102025_/l2/collabMessagesMomentsUnread.ts" enhancement="_blank"/>

import { getAllThreads } from '/_102036_/l2/collabMessagesIndexedDB.js';
import { hasThreadNotificationPending, markThreadReadLocally } from '/_102025_/l2/collabMessagesSyncNotifications.js';

export const OPEN_TAB_EVENT = 'collab-messages-open-tab';

type MomentsUnreadThread = {
  threadId: string;
  group?: string;
  unreadCount?: number;
};

export function isUnreadMomentsThread(thread: MomentsUnreadThread, isPending: (threadId: string) => boolean): boolean {
  if ((thread.group as string) !== 'MOMENTS') return false;
  return (thread.unreadCount ?? 0) > 0 || isPending(thread.threadId);
}

export async function hasUnreadMoments(): Promise<boolean> {
  const threads = await getAllThreads();
  return threads.some((thread) => isUnreadMomentsThread(thread, hasThreadNotificationPending));
}

export async function markMomentsSeen(): Promise<void> {
  try {
    const threads = await getAllThreads();
    for (const thread of threads) {
      if (!isUnreadMomentsThread(thread, hasThreadNotificationPending)) continue;
      try {
        await markThreadReadLocally(thread.threadId);
      } catch (error) {
        console.error(error);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

export function requestOpenTab(tab: string): void {
  const scopeWindow = window?.top ? window.top : window;
  const event = new CustomEvent(OPEN_TAB_EVENT, {
    detail: { tab },
    bubbles: true,
    composed: true
  });
  scopeWindow.dispatchEvent(event);
}
