/// <mls fileReference="_102025_/l2/collabMessagesSyncNotifications.ts" enhancement="_102027_/l2/enhancementLit" />

import {
	getUserId,
	loadNotificationDeviceId,
	loadNotificationPreferences,
	loadNotificationPreferencesAudio,
	loadLastAlertTime,
	registerToken,
	saveLastAlertTime,
	saveNotificationDeviceId,
} from "/_102025_/l2/collabMessagesHelper.js";
import {
	hasPushSubscriptionCapability,
	MLS_LIB_RETRIES,
	MLS_LIB_RETRY_MS,
} from '/_102025_/l2/notificationsRuntime.js';
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

import { dispatchThreadOpen, notifyThreadChange, notifyMessageChange, notifyThreadNotification } from '/_102025_/l2/collabMessagesEvents.js';
import { changeFavIcon } from '/_102025_/l2/collabMessagesHelper.js';
import { msgGetMessage, msgGetThreadUpdates, post } from '/_102025_/l2/shared/api.js';
import { environment } from '/_102036_/l2/environmentContract.js';

import * as msg from '/_102025_/l2/shared/interfaces.js';

const TRACE_LS_KEY = 'collabTraceNotification';

export function isNotificationTraceEnabled(): boolean {
	try {
		if (typeof window !== 'undefined' && (window as any).isTraceNotification) return true;
		return typeof localStorage !== 'undefined' && localStorage.getItem(TRACE_LS_KEY) === 'true';
	} catch {
		return false;
	}
}

export function traceNotification(event: string, fields?: { reference?: string; [key: string]: unknown }): void {
	if (!isNotificationTraceEnabled()) return;
	if (fields?.reference !== undefined) console.info(`[NOTIFICATION] ${event}`, fields.reference, fields);
	else console.info(`[NOTIFICATION] ${event}`, fields ?? '');
}

function tellServiceWorkerNotificationTrace(enabled: boolean): void {
	const payload = { type: 'collab-trace-notification', enabled };
	const sw = (globalThis as { navigator?: Navigator }).navigator?.serviceWorker as ServiceWorkerContainer | undefined;
	if (!sw) return;
	try {
		sw.controller?.postMessage(payload);
	} catch {
		// no controller yet
	}
	void sw.ready?.then((reg) => { reg.active?.postMessage(payload); }).catch(() => undefined);
}

/** Boot: localStorage.collabTraceNotification === 'true' liga o trace sem rebuild. */
export function applyNotificationTraceFromStorage(): boolean {
	try {
		if (typeof localStorage !== 'undefined' && localStorage.getItem(TRACE_LS_KEY) === 'true') {
			(window as any).isTraceNotification = true;
			tellServiceWorkerNotificationTrace(true);
		}
	} catch {
		// private mode / missing storage
	}
	return isNotificationTraceEnabled();
}

export const threadSyncMap = new Map<string, boolean>();
let hasNotificationMessages: boolean = false;
let syncTimeout: ReturnType<typeof setTimeout> | null = null;
let notificationSound: HTMLAudioElement | null = null;
let soundLoadAttempted = false;
let notificationSoundUnlocked = false;
const SOUND_UNLOCK_EVENTS = ['click', 'keydown', 'touchstart'] as const;
let soundUnlockHandler: ((event: Event) => void) | null = null;
const pendingNotificationThreads = new Set<string>();
/** Counts of OS notifications the SW already showed, keyed by threadId. One aviso per message. */
const systemNotificationShownByThread = new Map<string, number>();
const pendingTaskRoomNotifications = new Set<string>();
const pendingTaskRoomParentThreads = new Map<string, string>();

type NotificationTarget = {
	threadId: string;
	sourceThreadId: string;
	taskId?: string;
};

export function removeThreadFromSync(threadId: string) {
	threadSyncMap.delete(threadId);
}

export function clearThreadNotification(threadId: string) {
	clearPendingThreadNotification(threadId);
	void refreshNotificationIndicator();
}

export function clearTaskNotification(taskId: string) {
	const parentThreadId = clearPendingTaskNotification(taskId);
	void refreshNotificationIndicator();
	if (parentThreadId) void notifyThreadChangeById(parentThreadId);
}

function clearPendingThreadNotification(threadId: string) {
	const hasTaskRoomNotification = Array.from(pendingTaskRoomParentThreads.values()).some((parentThreadId) => parentThreadId === threadId);
	if (hasTaskRoomNotification) return;
	pendingNotificationThreads.delete(threadId);
}

function clearPendingTaskNotification(taskId: string): string | undefined {
	const parentThreadId = pendingTaskRoomParentThreads.get(taskId);
	pendingTaskRoomNotifications.delete(taskId);
	pendingTaskRoomParentThreads.delete(taskId);
	if (parentThreadId) {
		const hasOtherTaskNotification = Array.from(pendingTaskRoomParentThreads.values()).some((threadId) => threadId === parentThreadId);
		if (!hasOtherTaskNotification) pendingNotificationThreads.delete(parentThreadId);
	}
	return parentThreadId;
}

function clearPendingNotificationTarget(target: NotificationTarget): string | undefined {
	clearPendingThreadNotification(target.threadId);
	if (target.taskId) return clearPendingTaskNotification(target.taskId);
	return undefined;
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
	notificationTarget?: NotificationTarget
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
	if (notificationTarget?.taskId && notificationTarget.threadId !== threadId) {
		void notifyThreadChangeById(notificationTarget.threadId);
	}

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
	const parentThreadsToNotify = new Set<string>();
	for (let thread of threads) {
		if (thread.unreadCount && thread.unreadCount > 0) {
			const parentThreadId = hydratePendingTaskRoomNotification(thread);
			if (parentThreadId) parentThreadsToNotify.add(parentThreadId);
			hasPendingMessages = true;
		}
	}
	for (const parentThreadId of parentThreadsToNotify) {
		void notifyThreadChangeById(parentThreadId);
	}
	return hasPendingMessages;
}

function hydratePendingTaskRoomNotification(thread: msg.ThreadPerformanceCache): string | undefined {
	if (thread.kind !== 'task-room' || !thread.taskRoom?.parentThreadId || !thread.taskRoom.taskId) return undefined;
	pendingNotificationThreads.add(thread.taskRoom.parentThreadId);
	pendingTaskRoomNotifications.add(thread.taskRoom.taskId);
	pendingTaskRoomParentThreads.set(thread.taskRoom.taskId, thread.taskRoom.parentThreadId);
	return thread.taskRoom.parentThreadId;
}

async function notifyThreadChangeById(threadId: string) {
	const thread = await getThread(threadId);
	if (thread) notifyThreadChange(thread);
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type NotificationOffer = 'none' | 'offer';

let sessionChecked = false;
let inFlight: Promise<void> | null = null;
let acceptedThisSession = false;
let listeningToThreadEvents = false;
let notificationOffer: NotificationOffer = 'none';

export function getNotificationOffer(): NotificationOffer {
	return notificationOffer;
}

export function resetNotificationSession(): void {
	sessionChecked = false;
	inFlight = null;
	acceptedThisSession = false;
	listeningToThreadEvents = false;
	notificationOffer = 'none';
	systemNotificationShownByThread.clear();
	stopPresenceHeartbeat();
	unbindSoundUnlock();
	notificationSound = null;
	soundLoadAttempted = false;
	notificationSoundUnlocked = false;
	if (typeof window !== 'undefined') delete (window as any).isTraceNotification;
}

function unbindSoundUnlock(): void {
	if (!soundUnlockHandler || typeof document === 'undefined' || typeof document.removeEventListener !== 'function') {
		soundUnlockHandler = null;
		return;
	}
	const opts: AddEventListenerOptions = { capture: true };
	for (const type of SOUND_UNLOCK_EVENTS) {
		document.removeEventListener(type, soundUnlockHandler, opts);
	}
	soundUnlockHandler = null;
}

function tryUnlockNotificationSound(): void {
	const el = notificationSound;
	if (!el) return;
	try {
		el.muted = true;
		const playing = el.play();
		el.pause();
		el.currentTime = 0;
		el.muted = false;
		void playing.then(() => { notificationSoundUnlocked = true; }).catch(() => undefined);
	} catch {
		// gesture unlock is best-effort
	}
}

/** Idempotent. Binds click/keydown/touchstart once so later programmatic play() is allowed. */
export function unlockNotificationSound(): void {
	if (soundUnlockHandler) return;
	if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return;
	const handler = () => { tryUnlockNotificationSound(); };
	soundUnlockHandler = handler;
	const opts: AddEventListenerOptions = { once: true, capture: true };
	for (const type of SOUND_UNLOCK_EVENTS) {
		document.addEventListener(type, handler, opts);
	}
}

export function setNotificationSoundForTests(el: HTMLAudioElement | null): void {
	notificationSound = el;
}

export function isTestplayCommand(value: string): boolean {
	const t = value.trim();
	return t === '/testplay' || t.startsWith('/testplay ');
}

export function isNotificationSoundUnlocked(): boolean {
	return notificationSoundUnlocked;
}

async function playTestplaySound(): Promise<string> {
	await ensureNotificationSound();
	const el = notificationSound;
	if (!el) return 'sound: blocked (no-sound)';
	try {
		el.currentTime = 0;
	} catch {
		// some test fakes have no currentTime setter
	}
	try {
		await el.play();
		traceNotification('sound.played', { reference: 'testplay' });
		return 'sound: played';
	} catch (err: unknown) {
		const name = err instanceof Error ? err.name : 'Error';
		traceNotification('sound.blocked', { reference: 'testplay', reason: 'play-failed', name });
		return `sound: blocked (${name})`;
	}
}

async function reportTestplayBadge(): Promise<string> {
	const link = typeof document !== 'undefined' ? document.querySelector("[rel~='icon']") : null;
	await changeFavIcon(true);
	return link ? 'badge: on' : 'badge: skipped (no-icon-link)';
}

async function reportTestplayNotification(): Promise<string> {
	if (typeof Notification === 'undefined' || Notification.permission === 'default') {
		return 'notification: permission default';
	}
	if (Notification.permission === 'denied') {
		return 'notification: permission denied';
	}
	const sw = (globalThis as { navigator?: Navigator }).navigator?.serviceWorker;
	if (!sw || typeof sw.ready?.then !== 'function') {
		return 'notification: no service worker';
	}
	try {
		const reg = await sw.ready;
		if (!reg || typeof reg.showNotification !== 'function') {
			return 'notification: no service worker';
		}
		await reg.showNotification('collab-messages', { body: '/testplay', tag: 'collab-testplay' });
		return 'notification: shown';
	} catch {
		return 'notification: no service worker';
	}
}

async function reportTestplaySoundFile(): Promise<string> {
	const url = await environment.notifications.getNotifySoundUrl();
	if (!url) return 'sound-file: (none)';
	const probe = async (method: string) => {
		const res = await fetch(url, { method });
		const contentType = res.headers?.get?.('content-type') || '';
		return { status: res.status, contentType };
	};
	try {
		const head = await probe('HEAD');
		return `sound-file: ${url} status ${head.status} content-type ${head.contentType || '(none)'}`;
	} catch {
		try {
			const get = await probe('GET');
			return `sound-file: ${url} status ${get.status} content-type ${get.contentType || '(none)'}`;
		} catch (err: unknown) {
			const name = err instanceof Error ? err.name : 'Error';
			return `sound-file: ${url} status ${name} content-type (none)`;
		}
	}
}

/** Local diagnostic: sound + badge + OS notification, no network, no addMessage. */
export async function runNotificationTestplay(): Promise<string> {
	const lines = [
		`unlocked: ${notificationSoundUnlocked ? 'true' : 'false'}`,
		await playTestplaySound(),
		await reportTestplayBadge(),
		await reportTestplayNotification(),
		await reportTestplaySoundFile(),
		'both: sound and notification (explicit /testplay)',
	];
	return lines.join('\n');
}

export function startPageNotificationSound(threadId: string, reference: string): void {
	if (!notificationSound) return;
	notificationSound.currentTime = 0;
	notificationSound.play()
		.then(() => { traceNotification('sound.played', { reference, threadId }); })
		.catch((err: unknown) => {
			const name = err instanceof Error ? err.name : undefined;
			traceNotification('sound.blocked', { reference, threadId, reason: 'play-failed', name });
			console.warn('Erro on play notification audio:', err);
		});
}

export function markSystemNotificationShown(threadId: string): void {
	if (!threadId) return;
	systemNotificationShownByThread.set(threadId, (systemNotificationShownByThread.get(threadId) ?? 0) + 1);
}

export function consumeSystemNotificationShown(threadId: string): boolean {
	const n = systemNotificationShownByThread.get(threadId) ?? 0;
	if (n <= 0) return false;
	if (n === 1) systemNotificationShownByThread.delete(threadId);
	else systemNotificationShownByThread.set(threadId, n - 1);
	return true;
}

/** One aviso per message: if the SW showed the OS notification, the page does not play too. */
export function shouldPlayPageNotificationSound(opts: {
	audioEnabled: boolean;
	hasSound: boolean;
	systemNotificationShown: boolean;
}): boolean {
	return opts.audioEnabled && opts.hasSound && !opts.systemNotificationShown;
}

async function waitForPushCapability(): Promise<boolean> {
	if (hasPushSubscriptionCapability()) return true;
	let left = MLS_LIB_RETRIES;
	while (left > 0) {
		left -= 1;
		await new Promise<void>((resolve) => setTimeout(resolve, MLS_LIB_RETRY_MS));
		if (hasPushSubscriptionCapability()) return true;
	}
	return hasPushSubscriptionCapability();
}

function isWithinWeeklyAlertWindow(): boolean {
	const lastShown = Number(loadLastAlertTime() || 0);
	if (!lastShown) return false;
	return (Date.now() - lastShown) <= ONE_WEEK_MS;
}

async function ensureNotificationSound(): Promise<void> {
	if (notificationSound || soundLoadAttempted) return;
	soundLoadAttempted = true;
	try {
		notificationSound = await getNotificationSound();
	} catch {
		notificationSound = null;
	}
}

/** Idempotent. Called by the collab-messages root once the user is known (post-login). */
export async function initNotifications(): Promise<void> {
	applyNotificationTraceFromStorage();
	// Presence owner: this function (post-login). Not listenToThreadEvents —
	// being online is "logged in"; receiving push is "permission granted".
	startPresenceHeartbeat();
	await ensureNotificationSound();
	unlockNotificationSound();
	if (sessionChecked) return;
	if (inFlight) return inFlight;
	inFlight = initNotificationsOnce();
	try {
		await inFlight;
	} finally {
		inFlight = null;
	}
}

async function initNotificationsOnce(): Promise<void> {
	const ready = await waitForPushCapability();
	if (!ready) return;

	sessionChecked = true;

	if (typeof Notification === 'undefined') return;

	const permission = Notification.permission;
	const pref = loadNotificationPreferences();

	if (permission === 'granted' || pref === 'granted') {
		try {
			await listenToThreadEvents();
		} catch (err: any) {
			console.error('Error on listen notifications' + err.message);
		}
		return;
	}

	if (permission === 'denied') return;

	if (isWithinWeeklyAlertWindow()) return;
	notificationOffer = 'offer';
}

export async function acceptNotificationOffer(): Promise<void> {
	notificationOffer = 'none';
	if (acceptedThisSession) return;
	acceptedThisSession = true;
	const subscription = await registerToken();
	if (subscription) {
		await listenToThreadEvents();
	}
}

export function dismissNotificationOffer(): void {
	notificationOffer = 'none';
	saveLastAlertTime(Date.now());
}

export async function listenToThreadEvents() {
	if (listeningToThreadEvents) return;
	listeningToThreadEvents = true;

	try {
		await ensureNotificationSound();
		unlockNotificationSound();

		navigator.serviceWorker.addEventListener('message', async (event) => {

			const incomingReference = event.data?.data?.reference as string | undefined;
			traceNotification('push.received', { reference: incomingReference });

			if (event.data?.type === 'system-notification-shown') {
				const threadId = event.data.data?.threadId || String(event.data.data?.reference || '').split(':')[0];
				if (threadId) markSystemNotificationShown(threadId);
				traceNotification('push.shown', { reference: incomingReference, threadId });
				return;
			}

			const id = event.data?.id;
			if (id) {
				traceNotification('push.ack', { reference: incomingReference, id });
				await environment.notifications.sendACK(id);
			}

			const reference = event.data?.data?.reference;
			if (!reference) return;
			let threadId: string = '';

			const parts = reference.split(':');
			const typeNotification = parts.length === 2 ? 'message-update' : 'thread-update';
			threadId = parts[0];

			await enqueueThreadForSync(reference);
			if (event.data?.data?.open && threadId) {
				dispatchThreadOpen(threadId);
			}
			if ((window as any).isTraceNotification) {
				console.info(`[NOTIFICATION] : queued ${typeNotification} ${threadId}`);
			}


		});

		if ((window as any).isTraceNotification) console.info('[NOTIFICATION] : sendRequestMissed');
		await environment.notifications.sendRequestMissed();
	} catch (err) {
		listeningToThreadEvents = false;
		throw err;
	}

}

const HEARTBEAT_MS = 60_000;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let heartbeatVisibilityBound = false;

function startPresenceHeartbeat(): void {
	if (typeof document === 'undefined' || typeof document.visibilityState !== 'string') return;
	if (heartbeatVisibilityBound) return;
	heartbeatVisibilityBound = true;
	document.addEventListener('visibilitychange', onHeartbeatVisibility);
	syncHeartbeatInterval();
}

function stopPresenceHeartbeat(): void {
	if (heartbeatTimer !== null) {
		clearInterval(heartbeatTimer);
		heartbeatTimer = null;
	}
	if (heartbeatVisibilityBound && typeof document !== 'undefined') {
		document.removeEventListener('visibilitychange', onHeartbeatVisibility);
		heartbeatVisibilityBound = false;
	}
}

function onHeartbeatVisibility(): void {
	syncHeartbeatInterval();
}

function syncHeartbeatInterval(): void {
	const visible = typeof document !== 'undefined' && document.visibilityState === 'visible';
	if (visible) {
		if (heartbeatTimer === null) {
			void beatOnce();
			heartbeatTimer = setInterval(() => { void beatOnce(); }, HEARTBEAT_MS);
		}
	} else if (heartbeatTimer !== null) {
		clearInterval(heartbeatTimer);
		heartbeatTimer = null;
	}
}

async function beatOnce(): Promise<void> {
	if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
	const userId = getUserId();
	if (!userId) return;
	let deviceId = loadNotificationDeviceId();
	if (!deviceId) {
		deviceId = crypto.randomUUID();
		saveNotificationDeviceId(deviceId);
	}
	try {
		const res = await post<{ statusCode: number; pending?: string[] }>({
			action: 'heartbeat',
			userId,
			deviceId,
		} as msg.RequestBase);
		if (!res.pending) return;
		for (const reference of res.pending) {
			enqueueThreadForSync(reference);
		}
	} catch {
		// safety net — network failure is silent
	}
}

function enqueueThreadForSync(reference: string) {
	traceNotification('sync.enqueued', { reference });
	threadSyncMap.set(reference, true);
	return scheduleNextSync();
}

async function scheduleNextSync() {
	if (syncTimeout || threadSyncMap.size === 0) return;

	syncTimeout = setTimeout(async () => {
		syncTimeout = null;

		const entry = threadSyncMap.entries().next().value;
		if (!entry) return;
		const [reference] = entry;
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
		const isNotificationTargetVisible = isNotificationTargetOpenedAndVisible(notificationTarget);

		if (statusChanged && !hasMessagesToCache) {
			const thread = await updateThread(
				threadId,
				response.thread,
				'',
				'',
				isNotificationTargetVisible ? 0 : 1,
				getCompactUTC()
			);

			notifyThreadChange(thread);
			if (isNotificationTargetVisible) {
				const parentThreadId = clearPendingNotificationTarget(notificationTarget);
				if (parentThreadId) void notifyThreadChangeById(parentThreadId);
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
			isNotificationTargetVisible ? 0 : newMessagesFiltered.length + lastUnreadCount,
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

		if (isNotificationTargetVisible) {
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

function getNotificationTarget(thread: msg.Thread): NotificationTarget {
	if (thread.kind === 'task-room' && thread.taskRoom?.parentThreadId) {
		return {
			threadId: thread.taskRoom.parentThreadId,
			sourceThreadId: thread.threadId,
			taskId: thread.taskRoom.taskId
		};
	}

	return { threadId: thread.threadId, sourceThreadId: thread.threadId };
}

function clearNotificationTarget(target: NotificationTarget) {
	const parentThreadId = clearPendingNotificationTarget(target);
	void refreshNotificationIndicator();
	if (parentThreadId) void notifyThreadChangeById(parentThreadId);
}

async function shouldNotifyByThreadPreference(
	target: NotificationTarget,
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

function isTaskRoomOpenedAndVisible(threadId: string): boolean {
	if (document.visibilityState === 'hidden') return false;

	const search = (root: ParentNode): boolean => {
		const taskRooms = Array.from(root.querySelectorAll?.('collab-messages-task-room-102025') || []) as any[];
		if (taskRooms.some((taskRoom) => taskRoom.roomThread?.threadId === threadId || taskRoom.task?.taskRoom?.threadId === threadId)) return true;

		const elements = Array.from(root.querySelectorAll?.('*') || []) as Element[];
		for (const element of elements) {
			if (element.shadowRoot && search(element.shadowRoot)) return true;
		}
		return false;
	};

	return search(document);
}

function isNotificationTargetOpenedAndVisible(target: NotificationTarget): boolean {
	if (target.taskId) return isTaskRoomOpenedAndVisible(target.sourceThreadId);
	return isThreadOpenedAndVisible(target.threadId);
}

async function showThreadNotificationIfNeeded(target: NotificationTarget) {
	const { threadId, taskId } = target;
	if (isNotificationTargetOpenedAndVisible(target)) {
		clearNotificationTarget(target);
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
	const skipSound = consumeSystemNotificationShown(threadId);
	const soundReference = target.sourceThreadId;
	if (shouldPlayPageNotificationSound({
		audioEnabled,
		hasSound: !!notificationSound,
		systemNotificationShown: skipSound,
	}) && notificationSound) {
		startPageNotificationSound(threadId, soundReference);
	} else if (skipSound) {
		traceNotification('sound.blocked', { reference: soundReference, threadId, reason: 'system-shown' });
	} else if (!audioEnabled) {
		traceNotification('sound.blocked', { reference: soundReference, threadId, reason: 'audio-disabled' });
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
