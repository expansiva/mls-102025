/// <mls fileReference="_102025_/l2/collabMessagesHelper.ts" enhancement="_blank" />

import {
    msgGetUserUpdate,
    msgUpdateUserDetails,
    msgAddMessage,
    cbeAddOrUpdateOrgValue,
    msgAddThread,
    msgAddParticipantToThread
} from '/_102025_/l2/shared/api.js';

import * as msg from '/_102025_/l2/shared/interfaces.js';


/// **collab_i18n_start** 
const message_pt = {
    updatedToday: 'atualizado hoje',
    updated: 'atualizado',
    on: 'em',
    days: 'dias',
    day: 'dia',
    ago: 'atrás',
    jan: 'Jan',
    feb: 'Fev',
    mar: 'Mar',
    apr: 'Abr',
    may: 'Mai',
    june: 'Jun',
    july: 'Jul',
    aug: 'Ago',
    sept: 'Set',
    oct: 'Out',
    nov: 'Nov',
    dec: 'Dez',
}

const message_en = {
    updatedToday: 'updated today',
    updated: 'updated',
    on: 'on',
    days: 'days',
    day: 'day',
    ago: 'ago',
    jan: 'Jan',
    feb: 'Feb',
    mar: 'Mar',
    apr: 'Apr',
    may: 'May',
    june: 'June',
    july: 'July',
    aug: 'Aug',
    sept: 'Sept',
    oct: 'Oct',
    nov: 'Nov',
    dec: 'Dec',
}

type MessageType = typeof message_en;

const messages: { [key: string]: MessageType } = {
    'en': message_en,
    'pt': message_pt
}
/// **collab_i18n_end**

const lang = getMessageKey(messages)
const i18n: MessageType = messages[lang];

import { loadAgent, executeBeforePrompt } from '/_102029_/l2/aiAgentOrchestration.js';

import {
    notifyMessageSendChange,
    notifyThreadChange,
    notifyThreadCreate,
} from '/_102025_/l2/collabMessagesEvents.js';

import { addThread, listThreads, updateThread } from '/_102025_/l2/collabMessagesIndexedDB.js';

const LS_KEY_OLD = 'collabChatPreferences';
const LOCAL_STORAGE_KEY = 'serviceCollabMessages';
export const AGENTDEFAULT = 'agentPlanner1';

export const defaultThreadImage = "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

export async function registerToken() {
	const token = await mls.events.getFCMTokenForBackend();
	if (token === null) {
		saveNotificationPreferences('denied');
		return token;
	}

	const lastToken = loadNotificationToken();
	if (lastToken === token) return token;

	saveNotificationToken(token);

	try {
		const deviceId = crypto.randomUUID();
        saveNotificationDeviceId(deviceId);
        
		const userResult = await msgGetUserUpdate({ userId: "" });
		if (!userResult.success || !userResult.response?.user) {
			throw new Error(userResult.error || 'Failed to fetch user data');
		}

		const user = userResult.response.user;

		const updateResult = await msgUpdateUserDetails({
			userId: user.userId,
			avatar_url: user.avatar_url,
			name: user.name,
			status: user.status,
			deviceId,
			notificationToken: token
		});

		if (!updateResult.success) {
			throw new Error(updateResult.error || 'Failed to update user details');
		}

		saveNotificationPreferences('granted');
		return token;

	} catch (err: any) {
		throw new Error('Error on register token: ' + err.message);
	}
}

export async function addMessage(threadId: string, messageContent: string, contextToBot?: mls.bots.ToolsBeforeSendMessage) {

	const userId = getUserId() || '';
	if (!userId) throw new Error('Invalid user id');

	const context = getTemporaryContext(threadId, userId, messageContent);

	if (!messageContent.startsWith('@@')) {

		const result = await msgAddMessage({
			content: messageContent,
			threadId,
			userId,
			contextToBot
		});

		if (!result.success || !result.response?.message) {
			throw new Error(result.error || 'Failed to send message');
		}

		notifyMessageSendChange({
			message: result.response.message,
			task: undefined,
			isTest: false
		});

		return;
	}

	const agentName = extractAgentName(messageContent) || AGENTDEFAULT;
	const moduleAgent = await loadAgent(agentName);
	if (!moduleAgent) throw new Error('Invalid Agent');

	await executeBeforePrompt(moduleAgent, context);
	return context;
}

export async function getArgsToBots(): Promise<Record<string, any>> {
    const data = {
        project: mls.actualProject
    }
    return data
}

export async function getBotsContext(thread: msg.Thread, prompt: string, context: msg.ExecutionContext): Promise<Record<string, any>> {

    const argsToBot = await getArgsToBots();
    const botsVarsBefore = mls.bots.getBotContextVarsBeforeMessageSend(thread, prompt);
    const botsVarsBefore2 = mls.bots.getBotContextVarsBeforeMessageSend2(botsVarsBefore, argsToBot);
    const auxContextToBot: Record<string, any>[] = []
    for await (let bot of botsVarsBefore2) {
        try {
            const moduleBot = await loadAgent(bot.toolName);
            if (moduleBot && moduleBot.beforeBot && typeof moduleBot.beforeBot === 'function') {
                const argsBot: Record<string, any> = await moduleBot.beforeBot(context, prompt, botsVarsBefore2)
                auxContextToBot.push(argsBot);
            }
        } catch (err: any) {
            console.error(err.message);
            continue;
        }

    }

    const merged = auxContextToBot.reduce((acc, curr) => {
        return { ...acc, ...curr }
    }, {})

    return merged;
}



export function saveNotificationDeviceId(deviceId: string) {
    let dataLocal: CollabMessagesLS | undefined = loadLocalStorage();
    if (!dataLocal) dataLocal = { deviceId }
    else dataLocal.deviceId = deviceId;
    saveLocalStorage(dataLocal);
}

export function loadNotificationDeviceId(): string | null {
    const lsData = loadLocalStorage();
    if (lsData && lsData.deviceId) return lsData.deviceId;
    return null;
}

export function saveNotificationToken(tokenFCM: string) {
    let dataLocal: CollabMessagesLS | undefined = loadLocalStorage();
    if (!dataLocal) dataLocal = { tokenFCM }
    else dataLocal.tokenFCM = tokenFCM;
    saveLocalStorage(dataLocal);
}

export function loadNotificationToken(): string | null {
    const lsData = loadLocalStorage();
    if (lsData && lsData.tokenFCM) return lsData.tokenFCM;
    return null;
}

export function saveNotificationPreferences(notificationPreference: NotificationPermission) {
    let dataLocal: CollabMessagesLS | undefined = loadLocalStorage();
    if (!dataLocal) dataLocal = { notificationPreference }
    else dataLocal.notificationPreference = notificationPreference;
    saveLocalStorage(dataLocal);
}

export function loadNotificationPreferences(): NotificationPermission | null {
    const lsData = loadLocalStorage();
    if (lsData && lsData.notificationPreference) return lsData.notificationPreference;
    return null;
}

export function saveNotificationPreferencesAudio(enable: boolean) {
    let dataLocal: CollabMessagesLS | undefined = loadLocalStorage();
    if (!dataLocal) dataLocal = { notificationAudio: enable }
    else dataLocal.notificationAudio = enable;
    saveLocalStorage(dataLocal);
}

export function loadNotificationPreferencesAudio(): boolean {
    const lsData = loadLocalStorage();
    if (lsData && lsData.notificationAudio) return lsData.notificationAudio;
    return true;
}

export function saveLastAlertTime(time: number) {
    let dataLocal: CollabMessagesLS | undefined = loadLocalStorage();
    if (!dataLocal) dataLocal = { lastNotificationAlertTime: time }
    else dataLocal.lastNotificationAlertTime = time;
    saveLocalStorage(dataLocal);
}

export function loadLastAlertTime(): number | undefined {
    const lsData = loadLocalStorage();
    if (lsData && lsData.lastNotificationAlertTime) return lsData.lastNotificationAlertTime;
    return undefined;
}

export function saveLastTab(lastTab: string) {
    let dataLocal: CollabMessagesLS | undefined = loadLocalStorage();
    if (!dataLocal) dataLocal = { lastTab }
    else dataLocal.lastTab = lastTab;
    saveLocalStorage(dataLocal);
}

export function loadLastTab(): string {
    const lsData = loadLocalStorage();
    if (lsData && lsData.lastTab) return lsData.lastTab;
    return 'CRM';
}

export function saveUserId(userId: string) {
    let dataLocal: CollabMessagesLS | undefined = loadLocalStorage();
    if (!dataLocal) dataLocal = { userId };
    else dataLocal.userId = userId;
    saveLocalStorage(dataLocal);
}

export function getUserId(): string | null {
    const savedOld = localStorage.getItem('collabMessages_userId');
    if (savedOld) {
        saveUserId(savedOld);
        localStorage.removeItem('collabMessages_userId');
    }
    const lsData = loadLocalStorage();
    if (lsData && lsData.userId) return lsData.userId;
    return null;
}

export function loadChatPreferences(): IChatPreferences {
    const savedOld = localStorage.getItem(LS_KEY_OLD);
    if (savedOld) {
        try {
            const data = JSON.parse(savedOld);
            saveChatPreferences(data);
            localStorage.removeItem(LS_KEY_OLD);
        } catch (e) {
            localStorage.removeItem(LS_KEY_OLD);
            console.warn('Invalid preferences in localStorage');
        }
    }

    const lsData = loadLocalStorage();
    if (lsData && lsData.chatPreferences) return lsData.chatPreferences;
    return loadDefaultPreferences();
}

export function saveChatPreferences(chatPreferences: IChatPreferences) {
    let dataLocal: CollabMessagesLS | undefined = loadLocalStorage();
    if (!dataLocal) {
        dataLocal = { chatPreferences }
    } else {
        dataLocal.chatPreferences = chatPreferences;
    }
    saveLocalStorage(dataLocal);
}

export function getOrgDetails(orgIndex: number) {
    const actualOrgName = Object.keys(mls.stor.orgs)[orgIndex];
    const actualOrgDetails = mls.stor.orgs[actualOrgName];
    return actualOrgDetails;
}

export function loadOpenClawIntegrations(): IOpenClawIntegration[] {

    if (mls.l5.actualOrg === undefined) return [];
    const actualOrgDetails = getOrgDetails(mls.l5.actualOrg);
    if (!actualOrgDetails || !actualOrgDetails.value) return [];
    try {
        const data = JSON.parse(actualOrgDetails.value);
        return data.integrations || []

    } catch (err: any) {
        throw new Error(err.message)
    }

}

export async function saveOpenClawIntegrations(integrations: IOpenClawIntegration[]) {

	if (mls.l5.actualOrg === undefined) throw new Error(`Invalid org actual: ${mls.l5.actualOrg}`);

	const actualOrgDetails = getOrgDetails(mls.l5.actualOrg);
	if (!actualOrgDetails) throw new Error(`Invalid org details: ${mls.l5.actualOrg}`);

	try {
		let data: any = {};

		if (actualOrgDetails.value) {
			data = JSON.parse(actualOrgDetails.value);
		}

		data = { ...data, integrations };

		const result = await cbeAddOrUpdateOrgValue(
			actualOrgDetails.sett.name,
			JSON.stringify(data)
		);

		if (!result.success) {
			throw new Error(result.error || 'Failed to save integrations');
		}

	} catch (err: any) {
		throw new Error(err.message);
	}
}

function saveLocalStorage(data: CollabMessagesLS) {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Erro ao salvar no localStorage:', e);
    }
}

function loadLocalStorage() {

    let dataLocal: CollabMessagesLS | undefined;
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) dataLocal = JSON.parse(stored);
        return dataLocal;
    } catch (e) {
        console.error('Erro ao carregar do localStorage:', e);
    }
}

function loadDefaultPreferences(): IChatPreferences {
    return {
        language: document.documentElement?.lang?.split('-')?.shift() || 'en',
        translationMode: 'icon',
        threadMaintenance: ''
    }
}

function extractAgentName(str: string) {
    const match = str.match(/^@@([a-zA-Z]+)/);
    if (!match) return undefined;
    const name = match[1];
    if (name.toLowerCase().startsWith('agent')) {
        return name;
    }
    return 'agent' + name[0].toUpperCase() + name.slice(1);
}

export async function checkThreadAlreadyExist(threadName: string) {
    const userId = getUserId();
    if (!userId) throw new Error('No find user id');


}

export async function getDmThreadByUsers(userId1: string, userId2: string): Promise<msg.ThreadPerformanceCache | undefined> {

    const allThreads = await listThreads();

    return allThreads.find(thread => {
        if (!thread.name.startsWith('@')) return false;
        if (thread.users.length !== 2) return false;

        const userIds = thread.users.map(u => u.userId);
        return userIds.includes(userId1) && userIds.includes(userId2);
    });
}

export async function createThread(
	threadName: string,
	languages: string[],
	visibility: msg.ThreadVisibility,
	avatar_url: string = ''
): Promise<msg.ThreadPerformanceCache | undefined> {

	const userId = getUserId();
	if (!userId) throw new Error('No find user id');

	try {
		const result = await msgAddThread({
			name: threadName,
			group: 'CONNECT',
			languages,
			userId,
			visibility,
			status: 'active',
			avatar_url
		});

		if (!result.success || !result.response?.thread) {
			throw new Error(result.error || 'Failed to create thread');
		}

		const thread = result.response.thread;

		const thr = await addThread(thread);
		notifyThreadCreate(thr);

		return thread;

	} catch (err: any) {
		console.error(err);
		throw new Error(err.message);
	}
}


export async function createThreadDM(
	threadName: string,
	dmUser: string,
	group: msg.ThreadGroup
) {
	const userId = getUserId();
	if (!userId) throw new Error('User not found');

	const alreadyExistThread = await getDmThreadByUsers(userId, dmUser);
	if (alreadyExistThread) {
		throw new Error('A direct message thread with this user already exists.');
	}

	try {
		// 1. Create thread
		const threadResult = await msgAddThread({
			name: threadName,
			group,
			languages: [],
			userId,
			visibility: 'private',
			status: 'active',
			avatar_url: ''
		});

		if (!threadResult.success || !threadResult.response?.thread) {
			throw new Error(threadResult.error || 'Failed to create thread');
		}

		const thread = threadResult.response.thread;

		const thr = await addThread(thread);
		notifyThreadCreate(thr);

		// 2. Add participant
		const participantResult = await msgAddParticipantToThread({
			auth: 'admin',
			userIdOrName: dmUser,
			threadId: thr.threadId,
			userId
		});

		if (participantResult.success && participantResult.response?.thread) {
			await updateThread(thread.threadId, thread);
			notifyThreadChange(participantResult.response.thread);
			return participantResult.response.thread;
		}

		// fallback
		return thread;

	} catch (err: any) {
		console.error(err);
		throw new Error(err.message || 'Failed to create DM thread');
	}
}

export function formatTimestamp(timestamp: string) {
    if (!timestamp || timestamp.length < 14) {
        return;
    }
    const year = timestamp.slice(0, 4);
    const month = timestamp.slice(4, 6);
    const day = timestamp.slice(6, 8);
    const hour = timestamp.slice(8, 10);
    const minute = timestamp.slice(10, 12);
    const second = timestamp.slice(12, 14);
    const utcDate = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
    ));

    const localYear = utcDate.getFullYear();
    const localMonth = (utcDate.getMonth() + 1).toString().padStart(2, '0');
    const localDay = utcDate.getDate().toString().padStart(2, '0');
    const localHour = utcDate.getHours().toString().padStart(2, '0');
    const localMinute = utcDate.getMinutes().toString().padStart(2, '0');
    const localSecond = utcDate.getSeconds().toString().padStart(2, '0');

    const date = `${localYear}-${localMonth}-${localDay}`;
    const time = `${localHour}:${localMinute}:${localSecond}`;
    const timeShort = `${localHour}:${localMinute}`;

    const dateFull = `${date} ${time}`;
    return { dateFull, date, time, timeShort };
}

export function getDateFormated(dt: string): string {

    let lastUpdated: string;

    const dateToday = new Date();
    const dtLastWrite = new Date(dt);
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;

    // a and b are javascript Date objects
    function dateDiffInDays(a: Date, b: Date) {
        // Discard the time and time-zone information.
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }

    const diffDays = dateDiffInDays(dtLastWrite, dateToday);
    const moreThanTwoDays = diffDays > 1;

    if (diffDays === 0) {

        lastUpdated = i18n.updatedToday;

    } else if (diffDays < 30) {

        lastUpdated = `${i18n.updated} ${diffDays} ${moreThanTwoDays ? i18n.days : i18n.day} ${i18n.ago}`;

    } else {

        const lastWriteYear = dtLastWrite.getFullYear();
        const lastWriteMounth = dtLastWrite.getMonth();
        const lastWriteDay = dtLastWrite.getDate();
        const mounthFilter: any = {
            0: i18n.jan,
            1: i18n.feb,
            2: i18n.mar,
            3: i18n.apr,
            4: i18n.may,
            5: i18n.june,
            6: i18n.july,
            7: i18n.aug,
            8: i18n.sept,
            9: i18n.oct,
            10: i18n.nov,
            11: i18n.dec,
        };

        lastUpdated = `${i18n.updated} ${i18n.on} ${lastWriteYear}, ${lastWriteDay} ${mounthFilter[lastWriteMounth]} `;

    }

    return lastUpdated;

}

export const getTemporaryContext = (threadId: string, userId: string, prompt: string): msg.ExecutionContext => {
    // create temporary context

    const now = new Date();
    const formattedDate = now.getFullYear().toString()
        + String(now.getMonth() + 1).padStart(2, '0')
        + String(now.getDate()).padStart(2, '0')
        + String(now.getHours() + 3).padStart(2, '0')
        + String(now.getMinutes()).padStart(2, '0')
        + String(now.getSeconds()).padStart(2, '0')
        + "." + Math.floor(1000 + Math.random() * 9000);

    const context: msg.ExecutionContext = {
        task: undefined,
        message: {
            threadId: threadId,
            orderAt: "",
            createAt: formattedDate,
            senderId: userId,
            content: prompt.trim(),
        },
        isTest: false
    };
    return context;
};

export function generateUUIDv7(): string {
    const timestamp = Date.now();
    const timestampHex = timestamp.toString(16).padStart(12, '0');
    const randomBytes = new Uint8Array(10);
    crypto.getRandomValues(randomBytes);
    randomBytes[0] = (randomBytes[0] & 0x0f) | 0x70;
    randomBytes[2] = (randomBytes[2] & 0x3f) | 0x80;
    const randomHex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${timestampHex.slice(0, 8)}-${timestampHex.slice(8, 12)}-${randomHex.slice(0, 4)}-${randomHex.slice(4, 8)}-${randomHex.slice(8, 20)}`;
}

export function generateAgentAvatar(name: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const bgColor = colors[colorIndex];
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="${bgColor}"/><text x="40" y="40" font-family="Arial" font-size="28" fill="white" text-anchor="middle" dy=".35em">${initials}</text></svg>`)}`;
}

export async function changeFavIcon(notification: boolean) {

    const link: HTMLLinkElement | null = document.querySelector("[rel~='icon']");
    if (!link) return;

    if (!notification) {
        link.href = link.dataset.original || link.href;
        return;
    }

    if (!link.dataset.original) {
        link.dataset.original = link.href;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.src = link.dataset.original;

    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
    });

    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, size, size);
    const radius = size * 0.2;

    ctx.beginPath();
    ctx.arc(size - radius, radius, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#FF0000";
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#FFF";
    ctx.stroke();

    const newIcon = canvas.toDataURL("image/png");

    link.href = newIcon;
}

function getMessageKey(messages: any): string {
    const keys = Object.keys(messages);
    if (!keys || keys.length < 1) throw new Error('Error Message not valid for international');
    const firstKey = keys[0];
    const lang = (document.documentElement.lang || '').toLowerCase();
    if (!lang) return firstKey;
    if (messages.hasOwnProperty(lang)) return lang;
    const similarLang = keys.find((key: string) => lang.substring(0, 2) === key);
    if (similarLang) return similarLang;
    return firstKey;
}


export type TranslateMode = "none" | "icon" | "text" | "iconText" | "trace"

export interface IChatPreferences {
    translationMode: TranslateMode
    language: string,
    threadMaintenance: string
}

export interface CollabMessagesLS {
    lastTab?: string,
    chatPreferences?: IChatPreferences,
    userId?: string,
    tokenFCM?: string,
    deviceId?: string,
    notificationPreference?: NotificationPermission
    notificationAudio?: boolean,
    lastNotificationAlertTime?: number

}

export interface ICollabMessageEvent {
    type: 'thread-open',
    threadId?: string,
    taskId?: string,
}

export interface IMessage extends msg.MessagePerformanceCache {
    context?: msg.ExecutionContext,
    lastChanged?: number,
    isSame?: boolean,
    isLoading?: boolean,
    isFailed?: boolean,
    isFailedError?: string,
}

export interface IThreadInfo {
    thread: msg.ThreadPerformanceCache,
    threadsPending?: string[],
    users: msg.User[],
    hasMore?: boolean | undefined,
    messages?: msg.Message[] | undefined
}

// Interfaces para Integrações
export interface IOpenClawAgent {
    id: string;
    name: string;
    avatarUrl: string;
    senderId: string;
    createdAt: string;
}

export interface IOpenClawIntegration {
    id: string;
    name: string;
    url: string;
    bearerToken: string;
    agents: IOpenClawAgent[];
    createdAt: string;
}