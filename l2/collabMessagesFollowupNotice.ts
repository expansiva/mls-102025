/// <mls fileReference="_102025_/l2/collabMessagesFollowupNotice.ts" enhancement="_blank" />

export type FollowupNoticeState = { visible: boolean; lastCount: number };
export type FollowupNoticeEvent = 'open' | 'count' | 'userScroll';

export function nextFollowupNotice(
    state: FollowupNoticeState,
    event: FollowupNoticeEvent,
    count: number
): FollowupNoticeState {
    if (event === 'open') return { visible: count > 0, lastCount: count };
    if (event === 'userScroll') return { visible: false, lastCount: state.lastCount };
    return {
        visible: count === 0 ? false : state.visible || count > state.lastCount,
        lastCount: count
    };
}
