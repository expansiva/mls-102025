/// <mls fileReference="_102025_/l2/collabMessagesNoraConfirm.ts" enhancement="_blank" />

/** Set by the cm on the Nora message that is waiting for a yes or a no. */
export type NoraMessageConfirm = {
    expiresAt: string;
    answered?: boolean;
};

/** Buttons exist only while the confirmation is still waiting. */
export type NoraConfirmButtons = 'pending' | 'answered' | 'expired';

export function noraConfirmButtons(
    confirm: NoraMessageConfirm | undefined,
    nowMs: number,
): NoraConfirmButtons | undefined {
    if (!confirm?.expiresAt) return undefined;
    if (confirm.answered) return 'answered';
    const expiresAt = Date.parse(confirm.expiresAt);
    if (!Number.isFinite(expiresAt)) return undefined;
    if (nowMs >= expiresAt) return 'expired';
    return 'pending';
}
