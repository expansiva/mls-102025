/// <mls fileReference="_102025_/l2/collabMessagesChatWindow.ts" enhancement="_blank"/>

import type * as msg from '/_102025_/l2/shared/interfaces.js';

export function sliceWindowFromTarget(
    sorted: msg.MessagePerformanceCache[],
    targetIndex: number,
    limit: number
): { messages: msg.MessagePerformanceCache[]; hasMoreAfter: boolean } {
    const startIndex = targetIndex >= 0 ? targetIndex : 0;
    return {
        messages: sorted.slice(startIndex, startIndex + limit),
        hasMoreAfter: sorted.length > startIndex + limit,
    };
}

export function pickMessagesAfter(
    all: msg.MessagePerformanceCache[],
    lastOrderAt: string,
    loadedKeys: ReadonlySet<string>,
    limit: number
): { messages: msg.MessagePerformanceCache[]; hasMoreAfter: boolean } {
    const newer = all
        .filter(message => (message.orderAt || message.createAt) > lastOrderAt)
        .filter(message => !loadedKeys.has(`${message.threadId}/${message.orderAt || message.createAt}`))
        .sort((a, b) => (a.orderAt || a.createAt).localeCompare(b.orderAt || b.createAt));
    return {
        messages: newer.slice(0, limit),
        hasMoreAfter: newer.length > limit,
    };
}
