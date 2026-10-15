/// <mls fileReference="_102025_/l2/collabMessagesReadState.ts" enhancement="_blank"/>

export function readUpdateNeeded(s: {
  unreadCount: number;
  storedReadTime: string;
  newReadTime?: string;
  pending: boolean;
}): boolean {
  return s.unreadCount > 0 || s.pending || (!!s.newReadTime && s.newReadTime > s.storedReadTime);
}

export function shouldMarkOpenThreadRead(s: {
  hasOpenThread: boolean;
  pageVisible: boolean;
  inDetails: boolean;
  reason: 'message' | 'visible' | 'systemScroll' | 'leave';
}): boolean {
  if (!s.hasOpenThread || !s.inDetails) return false;
  if (s.reason === 'leave') return true;
  return s.pageVisible;
}
