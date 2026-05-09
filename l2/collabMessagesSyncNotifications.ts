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
	updateMessage
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

export function removeThreadFromSync(threadId: string) {
	threadSyncMap.delete(threadId);
}

export function clearThreadNotification(threadId: string) {
	pendingNotificationThreads.delete(threadId);
	if (pendingNotificationThreads.size === 0) {
		hasNotificationMessages = false;
	}
}

export function clearTaskNotification(taskId: string) {
	pendingTaskRoomNotifications.delete(taskId);
	if (pendingNotificationThreads.size === 0 && pendingTaskRoomNotifications.size === 0) {
		hasNotificationMessages = false;
	}
}

export function hasThreadNotificationPending(threadId: string): boolean {
	return pendingNotificationThreads.has(threadId);
}

export function hasTaskNotificationPending(taskId: string): boolean {
	return pendingTaskRoomNotifications.has(taskId);
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
	messageId = parts[1];

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
		const result = await msgGetMessage({
			messageId: `${threadId}/${messageId}`,
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

		if (statusChanged && !hasMessagesToCache) {
			const thread = await updateThread(
				threadId,
				response.thread,
				'',
				'',
				1,
				getCompactUTC()
			);

			notifyThreadChange(thread);
			hasNotificationMessages = true;
			await showThreadNotificationIfNeeded(getNotificationTarget(response.thread));
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
			newMessagesFiltered.length + lastUnreadCount,
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

		notifyThreadChange(thread);

		await showThreadNotificationIfNeeded(getNotificationTarget(response.thread));

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

async function showThreadNotificationIfNeeded(target: { threadId: string; taskId?: string }) {
	const { threadId, taskId } = target;
	if (!shouldShowThreadNotification(threadId)) {
		clearThreadNotification(threadId);
		if (taskId) clearTaskNotification(taskId);
		return;
	}

	pendingNotificationThreads.add(threadId);
	if (taskId) pendingTaskRoomNotifications.add(taskId);
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
