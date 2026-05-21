/// <mls fileReference="_102025_/l2/collabMessagesSyncNotifications.ts" enhancement="_102027_/l2/enhancementLit" />

import { getUserId, loadNotificationDeviceId, loadNotificationPreferencesAudio } from "/_102025_/l2/collabMessagesHelper.js";
import {
	getThread,
	updateThread,
	getMessage,
	addMessages,
	getAllThreads,
	addThread,
	getCompactUTC,
	updateMessage,
	updateLastMessageReadTime
} from '/_102025_/l2/collabMessagesIndexedDB.js';

import { notifyThreadChange, notifyMessageChange, notifyThreadNotification } from '/_102025_/l2/collabMessagesEvents.js';
import { changeFavIcon } from '/_102025_/l2/collabMessagesHelper.js';
import { msgGetMessage, msgGetThreadUpdates } from '/_102025_/l2/shared/api.js';
import { environment } from '/_102036_/l2/environmentContract.js';

import * as msg from '/_102025_/l2/shared/interfaces.js';

export const threadSyncMap = new Map<string, boolean>();
let hasNotificationMessages: boolean = false;
let syncTimeout: ReturnType<typeof setTimeout> | null = null;
let notificationSound: HTMLAudioElement | null = null;
const pendingNotificationThreads = new Set<string>();
const pendingTaskRoomNotifications = new Set<string>();
const pendingTaskRoomParentThreads = new Map<string, string>();

export function removeThreadFromSync(threadId: string) {
	threadSyncMap.delete(threadId);
}

export function clearThreadNotification(threadId: string) {
	clearPendingThreadNotification(threadId);
	void refreshNotificationIndicator();
}

export function clearTaskNotification(taskId: string) {
	clearPendingTaskNotification(taskId);
	void refreshNotificationIndicator();
}

function clearPendingThreadNotification(threadId: string) {
	pendingNotificationThreads.delete(threadId);
}

function clearPendingTaskNotification(taskId: string) {
	const parentThreadId = pendingTaskRoomParentThreads.get(taskId);
	pendingTaskRoomNotifications.delete(taskId);
	pendingTaskRoomParentThreads.delete(taskId);
	if (parentThreadId) {
		const hasOtherTaskNotification = Array.from(pendingTaskRoomParentThreads.values()).some((threadId) => threadId === parentThreadId);
		if (!hasOtherTaskNotification) pendingNotificationThreads.delete(parentThreadId);
	}
}

function clearPendingNotificationTarget(target: { threadId: string; taskId?: string }) {
	clearPendingThreadNotification(target.threadId);
	if (target.taskId) clearPendingTaskNotification(target.taskId);
}

export async function refreshNotificationIndicator() {
	const hasPendingMessages = await checkIfNotificationUnread();
	hasNotificationMessages = hasPendingMessages;
	changeFavIcon(hasPendingMessages);
	notifyThreadNotification(hasPendingMessages);
}

export async function markThreadReadLocally(
	threadId: string,
	lastMessageReadTime?: string,
	notificationTarget?: { threadId: string; taskId?: string }
): Promise<msg.ThreadPerformanceCache | undefined> {
	let thread = await getThread(threadId);
	if (thread) {
		thread = await updateThread(threadId, thread, undefined, undefined, 0);
		if (lastMessageReadTime) {
			thread = await updateLastMessageReadTime(threadId, lastMessageReadTime);
		}
		notifyThreadChange(thread);
	}

	if (notificationTarget) clearPendingNotificationTarget(notificationTarget);
	else clearPendingThreadNotification(threadId);

	await refreshNotificationIndicator();
	return thread;
}

export function hasThreadNotificationPending(threadId: string): boolean {
	return pendingNotificationThreads.has(threadId);
}

export function hasTaskNotificationPending(taskId: string): boolean {
	return pendingTaskRoomNotifications.has(taskId);
}

export function getPendingTaskNotificationsForThread(threadId: string): string[] {
	const result: string[] = [];
	for (const taskId of pendingTaskRoomNotifications) {
		const parentThreadId = pendingTaskRoomParentThreads.get(taskId);
		if (parentThreadId === threadId) result.push(taskId);
	}
	return result;
}

export async function checkIfNotificationUnread(): Promise<boolean> {

	if (pendingNotificationThreads.size > 0 || pendingTaskRoomNotifications.size > 0) return true;

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

	notificationSound = await getNotificationSound();

	navigator.serviceWorker.addEventListener('message', async (event) => {

		if ((window as any).isTraceNotification) console.info(`[NOTIFICATION] Received`)
		if ((window as any).isTraceNotification) console.info(`[NOTIFICATION] Data`, event?.data)
		const id = event.data.id;
		if ((window as any).isTraceNotification) console.info(`[NOTIFICATION] : sendACK id: ${id}`);
		await environment.notifications.sendACK(id);

		const reference = event.data?.data?.reference;
		if (!reference) return;
		let threadId: string = '';

		const parts = reference.split(':');
		const typeNotification = parts.length === 2 ? 'message-update' : 'thread-update';
		threadId = parts[0];

		await enqueueThreadForSync(reference);
		if ((window as any).isTraceNotification) {
			console.info(`[NOTIFICATION] : queued ${typeNotification} ${threadId}`);
		}


	});

	if ((window as any).isTraceNotification) console.info('[NOTIFICATION] : sendRequestMissed');
	await environment.notifications.sendRequestMissed();

}

function enqueueThreadForSync(reference: string) {
	threadSyncMap.set(reference, true);
	return scheduleNextSync();
}

async function scheduleNextSync() {
	if (syncTimeout || threadSyncMap.size === 0) return;

	syncTimeout = setTimeout(async () => {
		syncTimeout = null;

		const [reference] = threadSyncMap.entries().next().value;
		if (!reference) return;
		threadSyncMap.delete(reference);

		try {
			if ((window as any).isTraceNotification) console.info(`[NOTIFICATION] : refreshThread : ${reference}`);
			await getThreadUpdateInBackground(reference);

		} catch (err) {
			console.error(`Error on sync thread ${reference}`, err);
		}

		return scheduleNextSync();
	}, 500);
}


// reference: threadId or threadId:messageId
export async function getThreadUpdateInBackground(reference: string): Promise<void> {

	const userId = getUserId();
	const deviceId = loadNotificationDeviceId();
	if (!userId) throw new Error('Invalid user id');

	let threadId: string = '';
	let messageId: string = '';
	const parts = reference.split(':');
	const typeNotification = parts.length === 2 ? 'message-update' : 'thread-update';
	threadId = parts[0];
	messageId = parts.slice(1).join(':');

	if (typeNotification === 'thread-update') {
		await updateThreadInBackground(threadId, userId, deviceId);
	}

	if (typeNotification === 'message-update') {
		await updateMessageInBackground(threadId, messageId, userId, deviceId);
		await updateThreadInBackground(threadId, userId, deviceId);
	}

}

async function updateMessageInBackground(
	threadId: string,
	messageId: string,
	userId: string,
	deviceId: string | null
) {
	try {
		const normalizedMessageId = normalizeMessageId(threadId, messageId);
		const result = await msgGetMessage({
			messageId: normalizedMessageId,
			threadId,
			userId
		});

		if (!result.success || !result.response?.message) {
			throw new Error(result.error || 'Failed to fetch message');
		}

		if ((window as any).isTraceNotification) {
			console.info(
				`[NOTIFICATION] : getMessageUpdateInBackground: ${result.response.message}`
			);
		}

		await updateMessage(result.response.message);
		notifyMessageChange(result.response.message);

	} catch (err: any) {
		throw new Error(err?.message || 'Unexpected error while updating message');
	}
}

function normalizeMessageId(threadId: string, messageIdOrOrderAt: string): string {
	const parts = messageIdOrOrderAt.split('/').filter(Boolean);
	const orderAt = parts[parts.length - 1] || messageIdOrOrderAt;
	return `${threadId}/${orderAt}`;
}

async function updateThreadInBackground(
	threadId: string,
	userId: string,
	deviceId: string | null
) {
	let threadDB = await getThread(threadId);
	const lastOrderAt =
		threadDB?.lastSync || new Date('2000-01-01').toISOString();

	try {
		const result = await msgGetThreadUpdates({
			threadId,
			userId,
			lastOrderAt,
			deviceId: deviceId || undefined
		});

		if (!result.success || !result.response?.thread) {
			throw new Error(result.error || 'Failed to fetch thread update');
		}

		const response = result.response;

		if ((window as any).isTraceNotification) {
			console.info(
				`[NOTIFICATION] : getThreadUpdateInBackground threadsPending: ${response.threadsPending}`
			);
		}

		if (response.threadsPending) {
			for (let threadsPending of response.threadsPending) {
				await enqueueThreadForSync(threadsPending);
			}
		}

		const statusChanged =
			threadDB && threadDB.status !== response.thread.status;

		const newMessagesFiltered =
			response.messages?.filter(
				(message) => message.senderId !== userId
			) || [];

		const hasMessagesToCache = (response.messages?.length || 0) > 0;
		if (!statusChanged && !hasMessagesToCache) return;

		const notificationTarget = getNotificationTarget(response.thread);
		const isActiveThreadVisible = isThreadOpenedAndVisible(notificationTarget.threadId);

		if (statusChanged && !hasMessagesToCache) {
			const thread = await updateThread(
				threadId,
				response.thread,
				'',
				'',
				isActiveThreadVisible ? 0 : 1,
				getCompactUTC()
			);

			notifyThreadChange(thread);
			if (isActiveThreadVisible) {
				clearPendingNotificationTarget(notificationTarget);
				await refreshNotificationIndicator();
				return;
			}

			if (await shouldNotifyByThreadPreference(notificationTarget, [], userId)) {
				hasNotificationMessages = true;
				await showThreadNotificationIfNeeded(notificationTarget);
			} else {
				clearNotificationTarget(notificationTarget);
			}
			return;
		}

		if (!response.messages) return;

		const lastMessage =
			response.messages[response.messages.length - 1];

		const lastUnreadCount =
			threadDB && threadDB.unreadCount
				? threadDB.unreadCount
				: 0;

		if (!threadDB) {
			threadDB = await addThread(response.thread);
		}

		const lastMessageText = `${lastMessage.senderId}:${lastMessage.content}`;

		const thread = await updateThread(
			threadId,
			response.thread,
			lastMessageText,
			lastMessage.createAt,
			isActiveThreadVisible ? 0 : newMessagesFiltered.length + lastUnreadCount,
			lastMessage.createAt
		);

		const newMessages: msg.MessagePerformanceCache[] = [];

		for await (let mm of response.messages) {
			const messageId = `${mm.threadId}/${mm.createAt}`;
			const messageOld = await getMessage(messageId);

			const tempMessage: msg.MessagePerformanceCache = {
				...mm,
				footers: messageOld?.footers || []
			};

			newMessages.push(tempMessage);
		}

		await addMessages(newMessages);

		if (isActiveThreadVisible) {
			await markThreadReadLocally(threadId, lastMessage.createAt, notificationTarget);
			return;
		}

		notifyThreadChange(thread);

		if (await shouldNotifyByThreadPreference(notificationTarget, newMessagesFiltered, userId)) {
			await showThreadNotificationIfNeeded(notificationTarget);
		} else {
			clearNotificationTarget(notificationTarget);
		}

	} catch (err: any) {
		throw new Error(
			err?.message ||
			'Unexpected error while updating thread in background'
		);
	}
}

function getNotificationTarget(thread: msg.Thread): { threadId: string; taskId?: string } {
	if (thread.kind === 'task-room' && thread.taskRoom?.parentThreadId) {
		return {
			threadId: thread.taskRoom.parentThreadId,
			taskId: thread.taskRoom.taskId
		};
	}

	return { threadId: thread.threadId };
}

function clearNotificationTarget(target: { threadId: string; taskId?: string }) {
	clearPendingNotificationTarget(target);
	void refreshNotificationIndicator();
}

async function shouldNotifyByThreadPreference(
	target: { threadId: string; taskId?: string },
	messages: msg.Message[],
	userId: string
): Promise<boolean> {
	const parentThread = await getThread(target.threadId);
	const notification = parentThread?.users?.find(user => user.userId === userId)?.notification || 'all';
	if (notification === 'all') return true;
	if (notification === 'never') return false;
	return messages.some(message => hasUserMention(message.content || '', userId));
}

function hasUserMention(messageContent: string, userId: string): boolean {
	const escapedUserId = userId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return new RegExp(`\\[@[^\\]]+\\]\\(${escapedUserId}\\)`).test(messageContent);
}

function getActiveChat(): any {
	const search = (root: ParentNode): any => {
		const chat = root.querySelector?.('collab-messages-chat-102025') as any;
		if (chat) return chat;

		const elements = Array.from(root.querySelectorAll?.('*') || []) as Element[];
		for (const element of elements) {
			if (element.shadowRoot) {
				const found = search(element.shadowRoot);
				if (found) return found;
			}
		}
	};

	return search(document);
}

function shouldShowThreadNotification(threadId: string): boolean {
	const chat = getActiveChat();
	const actualThreadId = chat?.actualThread?.thread?.threadId;
	const isThreadOpened = actualThreadId === threadId;
	return !isThreadOpened || document.visibilityState === 'hidden';
}

function isThreadOpenedAndVisible(threadId: string): boolean {
	return !shouldShowThreadNotification(threadId);
}

async function showThreadNotificationIfNeeded(target: { threadId: string; taskId?: string }) {
	const { threadId, taskId } = target;
	if (!shouldShowThreadNotification(threadId)) {
		clearThreadNotification(threadId);
		if (taskId) clearTaskNotification(taskId);
		return;
	}

	pendingNotificationThreads.add(threadId);
	if (taskId) {
		pendingTaskRoomNotifications.add(taskId);
		pendingTaskRoomParentThreads.set(taskId, threadId);
	}
	hasNotificationMessages = true;
	const parentThread = await getThread(threadId);
	if (parentThread) notifyThreadChange(parentThread);
	changeFavIcon(true);
	notifyThreadNotification(true);

	const audioEnabled = loadNotificationPreferencesAudio();
	if (audioEnabled && notificationSound) {
		notificationSound.currentTime = 0;
		notificationSound.play().catch(err => console.warn('Erro on play notification audio:', err));
	}
}

async function getNotificationSound() {
	const notifySoundUrl = await environment.notifications.getNotifySoundUrl();
	let notificationSound: HTMLAudioElement | null = null;

	if (notifySoundUrl) {
		notificationSound = new Audio(notifySoundUrl);
		notificationSound.preload = 'auto';
		notificationSound.volume = 1;
	}

	return notificationSound;

}
