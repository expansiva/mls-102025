/// <mls fileReference="_102025_/l2/notificationsRuntime.ts" enhancement="_blank" />
// Capability, not host: the same object serves Studio and the runtime VM.
// Missing mls.* is a state, not an error — same values the contract default
// returns, except getPushSubscriptionForBackend yields `undefined` while the
// capability does not exist yet (so registerToken does not persist 'denied').

import type { CollabMessagesEnvironment } from '/_102036_/l2/environmentContract.js';
import type { PushSubscriptionData } from '/_102036_/l2/shared/interfaces.js';

/** Bounded poll matching the runtime shell mls-lib load window (~20s at 300ms). */
export const MLS_LIB_RETRY_MS = 300;
export const MLS_LIB_RETRIES = 67;

type MlsBag = {
    events?: {
        getPushSubscriptionForBackend?: () => Promise<PushSubscriptionData | null>;
    };
    stor?: {
        cache?: {
            sendACK?: (id: string) => Promise<void>;
            sendRequestMissed?: () => Promise<void>;
        };
    };
};

function getMls(): MlsBag | undefined {
    return (globalThis as { mls?: MlsBag }).mls;
}

export function hasPushSubscriptionCapability(): boolean {
    return typeof getMls()?.events?.getPushSubscriptionForBackend === 'function';
}

export function isNotificationPermissionDenied(): boolean {
    return typeof Notification !== 'undefined' && Notification.permission === 'denied';
}

async function getPushSubscriptionForBackend(): Promise<PushSubscriptionData | null | undefined> {
    const fn = getMls()?.events?.getPushSubscriptionForBackend;
    if (typeof fn !== 'function') return undefined;
    return fn();
}

async function getNotifySoundUrl(): Promise<string | null> {
    return '/_102025_/l3/assets/collabNotification.wav';
}

async function sendRequestMissed(): Promise<void> {
    const fn = getMls()?.stor?.cache?.sendRequestMissed;
    if (typeof fn !== 'function') return;
    return fn();
}

async function sendACK(id: string): Promise<void> {
    const fn = getMls()?.stor?.cache?.sendACK;
    if (typeof fn !== 'function') return;
    return fn(id);
}

export const notificationsRuntime = {
    getPushSubscriptionForBackend,
    getNotifySoundUrl,
    sendRequestMissed,
    sendACK,
} as NonNullable<CollabMessagesEnvironment['notifications']>;
