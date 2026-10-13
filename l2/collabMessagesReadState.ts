/// <mls fileReference="_102025_/l2/collabMessagesReadState.ts" enhancement="_blank"/>

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
