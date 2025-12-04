/// <mls shortName="collabMessagesHelper" project="102025" enhancement="_blank" />

import {
    getTemporaryContext,
    notifyMessageSendChange,
    notifyThreadChange,
    notifyThreadCreate,
    getAgentInstanceByName
} from '/_100554_/l2/aiAgentHelper.js';

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

        const userResponse = await mls.api.msgGetUserUpdate({ userId: "" });
        await mls.api.msgUpdateUserDetails({
            userId: userResponse.user.userId,
            avatar_url: userResponse.user.avatar_url,
            name: userResponse.user.name,
            status: userResponse.user.status,
            deviceId,
            notificationToken: token
        });

        saveNotificationPreferences('granted');
        return token;
    } catch (err: any) {
        throw new Error('Error on register token' + err.message);
    }

}

export async function addMessage(threadId: string, messageContent: string, contextToBot?: mls.bots.ToolsBeforeSendMessage) {

    const userId = getUserId() || '';
    if (!userId) throw new Error('Invalid user id');
    const context = getTemporaryContext(threadId, userId, messageContent);

    if (!messageContent.startsWith('@@')) {
        const params: mls.msg.RequestAddMessage = {
            action: 'addMessage',
            content: messageContent,
            threadId: threadId,
            userId: userId,
            contextToBot: contextToBot
        };
        const res = await mls.api.msgAddMessage(params);
        notifyMessageSendChange({ message: res.message, task: undefined })
        return;
    }

    const agentName = extractAgentName(messageContent) || AGENTDEFAULT;

    const moduleAgent = await getAgentInstanceByName(agentName);
    if(!moduleAgent) throw new Error('Invalid Agent')
    await moduleAgent.beforePrompt(context);
    return context;

}

export async function getArgsToBots(): Promise<Record<string, any>> {
    const data = {
        project: mls.actualProject
    }
    return data
}

export async function getBotsContext(thread: mls.msg.Thread, prompt: string, context: mls.msg.ExecutionContext): Promise<Record<string, any>> {

    const argsToBot = await getArgsToBots();
    const botsVarsBefore = mls.bots.getBotContextVarsBeforeMessageSend(thread, prompt);
    const botsVarsBefore2 = mls.bots.getBotContextVarsBeforeMessageSend2(botsVarsBefore, argsToBot);
    const auxContextToBot: Record<string, any>[] = []
    for await (let bot of botsVarsBefore2) {
        try {
            const moduleBot = await getAgentInstanceByName(bot.toolName);
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

export async function getDmThreadByUsers(userId1: string, userId2: string): Promise<mls.msg.ThreadPerformanceCache | undefined> {

    const allThreads = await listThreads();

    return allThreads.find(thread => {
        if (!thread.name.startsWith('@')) return false;
        if (thread.users.length !== 2) return false;

        const userIds = thread.users.map(u => u.userId);
        return userIds.includes(userId1) && userIds.includes(userId2);
    });
}


export async function createThread(threadName: string, languages: string[], visibility: mls.msg.ThreadVisibility, avatar_url: string = ''): Promise<mls.msg.ThreadPerformanceCache | undefined> {

    const userId = getUserId();
    if (!userId) throw new Error('No find user id');
    const params: mls.msg.RequestAddThread = {
        action: 'addThread',
        name: threadName,
        group: 'CONNECT',
        languages,
        userId,
        visibility,
        status: 'active',
        avatar_url
    };

    try {
        const response = await mls.api.msgAddThread(params);
        if (response.thread) {
            const thr = await addThread(response.thread);
            notifyThreadCreate(thr);
            return response.thread;
        }
    } catch (err: any) {
        console.error(err);
        throw new Error(err.message);
    }
}

export async function createThreadDM(threadName: string, dmUser: string, group: mls.msg.ThreadGroup) {

    const userId = getUserId();
    if (!userId) throw new Error('No find user id');

    const alreadyExistThread = await getDmThreadByUsers(userId, dmUser);
    if (alreadyExistThread) throw new Error('A direct message thread with this user already exists.')

    const params: mls.msg.RequestAddThread = {
        action: 'addThread',
        name: threadName,
        group,
        languages: [],
        userId,
        visibility: 'private',
        status: 'active',
        avatar_url: ''
    };

    try {
        const response = await mls.api.msgAddThread(params);
        if (response.thread) {
            const thr = await addThread(response.thread);
            notifyThreadCreate(thr);

            const responseAddUsuer = await mls.api.msgAddUserInThread({
                auth: 'admin',
                userIdOrName: dmUser,
                threadId: thr.threadId,
                userId: userId,
            });

            if (responseAddUsuer.thread) {
                await updateThread(response.thread.threadId, response.thread);
                notifyThreadChange(responseAddUsuer.thread);
                return responseAddUsuer.thread;
            }

            return response.thread;
        }
    } catch (err: any) {
        console.error(err);
        throw new Error(err.message);
    }
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

