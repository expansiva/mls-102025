/// <mls shortName="collabMessagesSyncNotifications" project="102025" enhancement="_100554_enhancementLit" />

import { getUserId, loadNotificationDeviceId, loadNotificationPreferencesAudio } from "/_102025_/l2/collabMessagesHelper.js";
import { getThread, updateThread, getMessage, addMessages, getAllThreads, addThread } from '/_102025_/l2/collabMessagesIndexedDB.js';
import { notifyThreadChange } from '/_100554_/l2/aiAgentHelper.js';
import { setFavicon } from '/_100554_/l2/collabInit.js';

export const threadSyncMap = new Map<string, boolean>();
let hasNotificationMessages: boolean = false;
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export function removeThreadFromSync(threadId: string) {
    threadSyncMap.delete(threadId);
}

export async function checkIfNotificationUnread(): Promise<boolean> {

    const threads = await getAllThreads();
    let hasPendingMessages: boolean = false;
    for (let thread of threads) {
        if (thread.unreadCount && thread.unreadCount > 0) {
            hasPendingMessages = true;
            break;
        }
    }
    return hasPendingMessages;
}

export async function listenToThreadEvents() {

    const notificationSound = new Audio('./l3/_100529_/audio/collabNotification.mp3');
    notificationSound.preload = 'auto';
    notificationSound.volume = 1;

    navigator.serviceWorker.addEventListener('message', async (event) => {
        if ((mls as any).isTraceNotification) console.info(`[NOTIFICATION] Received`)
        if ((mls as any).isTraceNotification) console.info(`[NOTIFICATION] Data`, event?.data)
        const id = event.data.id;
        if ((mls as any).isTraceNotification) console.info(`[NOTIFICATION] : sendACK id: ${id}`);
        await mls.stor.cache.sendACK(id);
        await enqueueThreadForSync(event.data?.data?.threadId);

        let isThreadOpened: boolean = false;
        if (mls.services['102025_serviceCollabMessages_left']) {
            const chat = mls.services['102025_serviceCollabMessages_left'].querySelector('collab-messages-chat-102025');
            const actualThreadId = chat?.actualThread?.thread?.threadId;
            if (actualThreadId === event.data?.data?.threadId) {
                isThreadOpened = true;
            }
        }

        if (!isThreadOpened || (isThreadOpened && document.visibilityState === 'hidden') && hasNotificationMessages) {
            setFavicon(true);
            mls.services['102025_serviceCollabMessages_left']?.toogleBadge(true, '_102025_serviceCollabMessages');
            const audioEnabled = loadNotificationPreferencesAudio();
            if (audioEnabled) {
                notificationSound.currentTime = 0;
                notificationSound.play().catch(err => console.warn('Erro on play notification audio:', err));
            }
        }

        hasNotificationMessages = false;


    });

    if ((mls as any).isTraceNotification) console.info('[NOTIFICATION] : sendRequestMissed');
    await mls.stor.cache.sendRequestMissed();

}

function enqueueThreadForSync(threadId: string) {
    threadSyncMap.set(threadId, true);
    return scheduleNextSync();
}

async function scheduleNextSync() {
    if (syncTimeout || threadSyncMap.size === 0) return;

    syncTimeout = setTimeout(async () => {
        syncTimeout = null;

        const [threadId] = threadSyncMap.entries().next().value;
        threadSyncMap.delete(threadId);

        try {
            if ((mls as any).isTraceNotification) console.info(`[NOTIFICATION] : refreshThread : ${threadId}`);
            await getThreadUpdateInBackground(threadId);

        } catch (err) {
            console.error(`Erro ao sincronizar thread ${threadId}`, err);
        }

        return scheduleNextSync();
    }, 500);
}

export async function getThreadUpdateInBackground(threadId: string): Promise<void> {
    const userId = getUserId();
    const deviceId = loadNotificationDeviceId();
    if (!userId) throw new Error('Invalid user id');
    let threadDB = await getThread(threadId);
    const lastOrderAt = threadDB?.lastSync || new Date('2000-01-01').toISOString();

    try {
        const response = await mls.api.msgGetThreadUpdate({
            threadId,
            userId,
            lastOrderAt,
            deviceId: deviceId || undefined
        });

        if ((mls as any).isTraceNotification) console.info(`[NOTIFICATION] : getThreadUpdateInBackground threadsPending: ${response.threadsPending}`);

        if (response.threadsPending) {
            for (let threadsPending of response.threadsPending) {
                await enqueueThreadForSync(threadsPending);
            }
        }

        if (!response.messages || response.messages.length === 0) return;

        const lastMessage = response.messages[response.messages.length - 1];
        const lastUnreadCount = threadDB && threadDB.unreadCount ? threadDB.unreadCount : 0;

        if (!threadDB) threadDB = await addThread(response.thread);
        const thread = await updateThread(
            threadId,
            response.thread,
            lastMessage.content,
            lastMessage.createAt,
            response.messages.length + lastUnreadCount,
            lastMessage.createAt,

        );

        const newMessages: mls.msg.MessagePerformanceCache[] = [];
        for await (let mm of response.messages) {
            const messageId = `${mm.threadId}/${mm.createAt}`
            const messageOld = await getMessage(messageId);
            const tempMessage: mls.msg.MessagePerformanceCache = { ...mm, footers: messageOld?.footers || [] };
            newMessages.push(tempMessage);
        }
        await addMessages(newMessages);
        notifyThreadChange(thread);
        hasNotificationMessages = true;


    } catch (err: any) {
        throw new Error(err.message)
    }
}