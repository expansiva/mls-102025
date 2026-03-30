/// <mls fileReference="_102025_/l2/collabMessages.ts" enhancement="_102027_/l2/enhancementLit" /> 

import { html, ifDefined, nothing } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { environment } from '/_102036_/l2/environmentContract.js';

import * as msg from '/_102025_/l2/shared/interfaces.js';

import {
    listThreads,
    addThread,
    listUsers,
    updateUsers,
    getThread,
    cleanupThreads,
    listPoolings,
    getTask,
    getMessage,
    deletePooling,
    getAllThreads
} from '/_102025_/l2/collabMessagesIndexedDB.js';

import {
    saveLastTab,
    loadLastTab,
    saveUserId,
    saveLastAlertTime,
    loadLastAlertTime,
    changeFavIcon
} from "/_102025_/l2/collabMessagesHelper.js";
import { checkIfNotificationUnread } from '/_102025_/l2/collabMessagesSyncNotifications.js';
import { msgGetUserUpdate, msgGetThreadUpdates } from '/_102025_/l2/shared/api.js';

import { ICollabMessageEvent } from '/_102025_/l2/collabMessagesEvents.js';
import { CollabLitElement } from '/_102029_/l2/collabLitElement.js';
import { collab_crm, collab_tasks, collab_connect, collab_moments, collab_gear, collab_bell_slash, collab_xmark } from '/_102025_/l2/collabMessagesIcons.js';

import '/_102025_/l2/collabMessagesAdd.js';
import '/_102025_/l2/collabMessagesChat.js';
import '/_102025_/l2/collabMessagesTasks.js';
import '/_102025_/l2/collabMessagesApps.js';
import '/_102025_/l2/collabMessagesMoments.js';
import '/_102025_/l2/collabMessagesSettings.js';
import '/_102025_/l2/collabMessagesFindtask.js';
import '/_102025_/l2/collabMessagesTabMenu.js'

/// **collab_i18n_start** 
const message_pt = {
    loading: 'Carregando...',
    crm: 'CRM',
    tasks: 'Tasks',
    docs: 'Docs',
    connect: 'Conectar',
    alertMsgTitle: 'Ative as notificações',
    alertMsgBody: 'Para não perder mensagens importantes, permita notificações no navegador.',
    moments: 'Moments',
    apps: 'Apps',
    setttins: 'Configurações'

}

const message_en = {
    loading: 'Loading...',
    crm: 'CRM',
    tasks: 'Tasks',
    docs: 'Docs',
    connect: 'Connect',
    alertMsgTitle: 'Enable notifications',
    alertMsgBody: 'To avoid missing important messages, allow notifications in your browser.',
    moments: 'Moments',
    apps: 'Apps',
    setttins: 'Settings'

}

type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = {
    'en': message_en,
    'pt': message_pt
}
/// **collab_i18n_end**

@customElement('collab-messages-102025')
export class CollabMessages extends CollabLitElement {

    private msg: MessageType = messages['en'];

    @property() dataLocal: IDataLocal = { lastTab: 'CRM' };
    @property() activeTab: ITabType = 'CRM';
    @property() activeScenerie: IScenery = 'tabs';

    @state() isLoadingThread: boolean = false;
    @state() userPerfil: msg.User | undefined;
    @state() userThreads: IThreadData = {}
    @state() showNotificationAlert: boolean = false;

    @state() threadToOpen: string = '';
    @state() taskToOpen: string = '';
    @state() lastLevel: number = -1;
    @state() modeMenu: string = 'default';

    private groupSelected: ITabType = 'CRM';

    private menuItems = [
        { id: 'CRM', icon: collab_crm, label: this.msg.crm, type: 'tab' },
        { id: 'TASK', icon: collab_tasks, label: this.msg.tasks, type: 'tab' },
        { id: 'CONNECT', icon: collab_connect, label: this.msg.connect, type: 'tab' },
        { id: 'MOMENTS', icon: collab_moments, label: this.msg.moments, type: 'tab', active: true },
        { id: 'SETTINGS', icon: collab_gear, label: this.msg.setttins, type: 'button' }
    ];

    async connectedCallback() {
        super.connectedCallback();
        this.dataLocal.lastTab = loadLastTab() as ITabType;
        this.setEvents();
    }

    disconnectedCallback() {
        this.removeEvents();
    }

    async updated(changedProperties: Map<PropertyKey, unknown>) {
        super.updated(changedProperties);

        if (changedProperties.has('activeTab') && ['CRM', 'TASK', 'DOCS', 'CONNECT', 'APPS'].includes(this.activeTab)) {

            if (!this.userPerfil) {
                this.userPerfil = await this.getUser();
                saveUserId(this.userPerfil.userId);
                await cleanupThreads(this.userPerfil.threads);
            }

            await this.getThreadFromLocalDB();
            this.updateThreads();
        }

        if (changedProperties.has('dataLocal')) {
            if (this.activeTab !== 'Loading') this.activeTab = this.dataLocal.lastTab;
        }


    }


    async firstUpdated(changedProperties: Map<PropertyKey, unknown>) {
        super.firstUpdated(changedProperties);
        this.modeMenu = environment.config.getMenuMode();
        if (!this.activeTab) this.activeTab = this.dataLocal.lastTab;
        this.checkNotificationPermission();
        this.startPendentsPoolingsIfNeeded();
        this.checkNotificationPending();
    }

    render() {
        const lang = this.getMessageKey(messages);
        this.msg = messages[lang];
        return html`
            ${this.renderHeader()}
            ${this.renderTabs()}
        `;
    }

    private checkNotificationPermission() {

        if (typeof Notification === "undefined" || Notification.permission !== "denied") {
            return;
        }
        const lastShown = Number(loadLastAlertTime() || 0);
        const now = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;

        if (!lastShown || (now - lastShown) > oneWeek) {
            this.showNotificationAlert = true;
            saveLastAlertTime(now);
        }
    }

    private async startPendentsPoolingsIfNeeded() {
        const pendingsTasks = await listPoolings();
        if (!pendingsTasks || pendingsTasks.length === 0) return;

        for (let taskPending of pendingsTasks) {
            const task = await getTask(taskPending.taskId);
            if (!task || !task.messageid_created) continue;
            const message = await getMessage(task.messageid_created);
            if (!message) continue;
            try {
                const context: msg.ExecutionContext = { message, task, isTest: false };
                // await continuePoolingTask(context);
            } catch (err) {
                deletePooling(task.PK);
            }
        }
    }

    private async onThreadChange(e: Event) {
        const customEvent = e as CustomEvent;
        const thread = customEvent.detail as msg.Thread;
        if (this.userThreads[thread.threadId]) {
            this.userThreads[thread.threadId].thread = thread;
        } else {
            await this.updateUsersThread(thread);
        }

        if (this.groupSelected !== 'CONNECT') {
            this.checkNotificationPending();
        }
    }

    private async onThreadOpen(e: Event) {
        const customEvent = e as CustomEvent;
        const data = customEvent.detail as ICollabMessageEvent;
        if (!data.threadId) return;
        const thread = await getThread(data.threadId);
        if (!thread) return;
        if (data.taskId) this.taskToOpen = data.taskId;

        this.threadToOpen = thread.threadId;
        const group = thread.group;
        if (group !== this.activeTab) this.activeTab = group as ITabType;

    }

    private setEvents() {
        window.addEventListener('thread-change', this.onThreadChange.bind(this));
        window.addEventListener('thread-create', this.onThreadCreate);
        window.addEventListener('thread-open', this.onThreadOpen.bind(this));

    }

    private removeEvents() {
        window.removeEventListener('thread-create', this.onThreadCreate);
        window.removeEventListener('thread-change', this.onThreadChange.bind(this));
        window.removeEventListener('thread-open', this.onThreadOpen.bind(this));

    }

    renderHeader() {

        if (this.modeMenu === 'custom') return nothing;
        return html`
          <collab-messages-tab-menu-102025
            style="width: 375px;"
            .items=${this.menuItems}
            activeId="${this.activeTab}"
            @tab-change=${(e: CustomEvent) => { this.onTabChange(e) }}
            @button-click=${(e: CustomEvent) => { this.onButtonClick(e) }}
        ></collab-messages-tab-menu-102025>`
    }

    renderTabs() {
        switch (this.activeTab) {
            case 'CRM':
                return this.renderCRM();
            case 'TASK':
                return this.renderTasks()
            case 'MOMENTS':
                return this.renderMoments();
            case 'APPS':
                return this.renderApps();
            case 'CONNECT':
                return this.renderConnect();
            case 'SETTINGS':
                return this.renderSettings();
            case 'Loading':
                return html`${this.msg.loading}`
            default:
                return html``;
        }
    }

    renderAlert() {
        if (!this.showNotificationAlert) return html``
        return html`  
            <div class="alert-notification">
                ${collab_bell_slash}
                <div>
                    <strong>${this.msg.alertMsgTitle}</strong><br>
                    ${this.msg.alertMsgBody}
                <div>
                
                <button @click=${this.onAlertClose}>${collab_xmark}</button>
            </div>
        `
    }

    private onAlertClose() {
        this.showNotificationAlert = false;
    }

    renderCRM() {
        this.groupSelected = 'CRM';
        // this.execCoachMarks('CRM');
        return html`
        ${this.renderAlert()}
        <collab-messages-chat-102025 
            .isLoadingThread= ${this.isLoadingThread}
            group="CRM"
            .userThreads=${{
                CRM: Object.keys(this.userThreads)
                    .filter((key) => this.userThreads[key].thread.group === 'CRM')
                    .map((key) => this.userThreads[key])
            }} 
            .allThreads=${Object.keys(this.userThreads).map((key) => this.userThreads[key].thread)}
            
            userId=${this.userPerfil?.userId} 
        ></collab-messages-chat-102025>`
    }

    renderTasks() {
        this.groupSelected = 'TASK';
        // this.execCoachMarks('Tasks');
        return html`<collab-messages-tasks-102025></collab-messages-tasks-102025>`
    }

    renderMoments() {
        this.groupSelected = 'MOMENTS';
        // this.execCoachMarks('Moments');
        return html`<collab-messages-moments-102025 ></collab-messages-moments-102025>`
    }

    renderApps() {
        this.groupSelected = 'APPS';
        // this.execCoachMarks('Apps');
        return html`<collab-messages-apps-102025 ></collab-messages-apps-102025>`
    }

    renderSettings() {
        this.groupSelected = 'SETTINGS';
        return html`<collab-messages-settings-102025 ></collab-messages-settings-102025>`
    }


    renderConnect() {

        this.groupSelected = 'CONNECT';
        // this.execCoachMarks('Connect');
        return html`
        ${this.renderAlert()}
        <collab-messages-chat-102025 
            class=${this.modeMenu}
            .isLoadingThread= ${this.isLoadingThread}
            group="CONNECT"
            .userThreads=${{
                CONNECT: Object.keys(this.userThreads)
                    .filter((key) => this.userThreads[key].thread.group === 'CONNECT')
                    .map((key) => this.userThreads[key])
            }}
            .allThreads=${Object.keys(this.userThreads).map((key) => this.userThreads[key].thread)}
            threadToOpen=${ifDefined(this.threadToOpen || undefined)}
            taskToOpen=${ifDefined(this.taskToOpen || undefined)}

            userId=${this.userPerfil?.userId} 
        ></collab-messages-chat-102025>`
    }

    private async getUser(): Promise<msg.User> {
        try {
            const result = await msgGetUserUpdate({ userId: "" });

            if (!result.success || !result.response?.user) {
                throw new Error(result.error || 'Failed to fetch user');
            }

            return result.response.user;

        } catch (err: any) {
            throw new Error(
                err?.message || 'Unexpected error while fetching user'
            );
        }
    }

    private async updateThreads() {

        if (!this.userPerfil?.userId) {
            // this.setError('Invalid userId');
            return;
        }

        this.isLoadingThread = true;
        const userId = this.userPerfil.userId;
        const userThreads: string[] = this.userPerfil.threads;

        for await (let threadId of userThreads) {
            if (this.userThreads[threadId]) {
                continue;
            }
            const threadInfo = await this.getThreadInfo(threadId, userId);
            this.userThreads[threadId] = threadInfo;
            addThread(threadInfo.thread);
            updateUsers(threadInfo.users);
        }

        await this.searchForDeletedThreadsPending();

        this.isLoadingThread = false;
        this.requestUpdate();

    }

    private async searchForDeletedThreadsPending() {
        const allLocalThreads = await getAllThreads();
        const deletedThreadsPending = allLocalThreads.filter((thread) => thread.status === 'deleted' && thread.unreadCount && thread.unreadCount !== 0);
        for await (let thread of deletedThreadsPending) {
            this.userThreads[thread.threadId] = {
                thread,
                users: []
            };
        }
    }

    private async updateUsersThread(thread: msg.Thread) {

        if (!this.userPerfil?.userId) {
            // this.setError('Invalid userId');
            return;
        }

        const userId = this.userPerfil.userId;
        const threadInfo = await this.getThreadInfo(thread.threadId, userId);
        this.userThreads[thread.threadId] = {
            thread,
            users: threadInfo.users
        }
        addThread(thread);
        updateUsers(threadInfo.users);
        this.isLoadingThread = false;
        this.requestUpdate();

    }

    private async getThreadFromLocalDB() {

        const threads = await listThreads();
        const users = await listUsers();

        for (let thread of threads) {
            if (this.userThreads[thread.threadId]) {
                return;
            }
            const threadUsers: msg.User[] = [];
            thread.users.forEach((user) => {
                const userDB = users.find((us) => us.userId === user.userId);
                if (userDB) threadUsers.push(userDB);
            })
            this.userThreads[thread.threadId] = {
                thread: thread,
                users: threadUsers
            }
        }

    }

    private async getThreadInfo(
        threadId: string,
        userId: string
    ): Promise<IThreadInfo> {
        try {
            const result = await msgGetThreadUpdates({
                threadId,
                userId
            });

            if (!result.success || !result.response) {
                throw new Error(
                    result.error || 'Failed to fetch thread info'
                );
            }

            return result.response;

        } catch (err: any) {
            throw new Error(
                err?.message || 'Unexpected error while fetching thread info'
            );
        }
    }

    private onThreadCreate = async (e: Event) => {
        const customEvent = e as CustomEvent;
        const thread = customEvent.detail as msg.Thread;
        if (!thread) return;

        this.userThreads[thread.threadId] = {
            thread: thread,
            users: []
        };

        this.requestUpdate();
    }

    private async checkNotificationPending() {
        const hasPendingMessages = await checkIfNotificationUnread();
        if (hasPendingMessages) {
            changeFavIcon(true);
        }
    }

    private onTabChange(e: CustomEvent) {
        if (!e.detail) return;
        const id = (e.detail as any).id;
        if (!id) return;
        this.threadToOpen = '';
        this.taskToOpen = '';
        if (this.activeTab === id) {
            this.activeTab = 'Loading';
            setTimeout(() => {
                this.activeTab = id;
            }, 0)
            return;
        };
        this.activeTab = id as ITabType;
        saveLastTab(this.activeTab);

    }

    private onButtonClick(e: CustomEvent) {
        if (!e.detail) return;
        const id = (e.detail as any).id;
        if (!id) return;
        this.threadToOpen = '';
        this.taskToOpen = '';
        if (this.activeTab === id) {
            this.activeTab = 'Loading';
            setTimeout(() => {
                this.activeTab = id;
            }, 0)
            return;
        };
        this.activeTab = id as ITabType;
    }


}

interface IDataLocal {
    lastTab: ITabType
}

type IThreadData = { [key: string]: IThreadInfo }

interface IThreadInfo {
    thread: msg.Thread,
    users: msg.User[]
}

type ITabType = 'CRM' | 'TASK' | 'MOMENTS' | 'CONNECT' | 'APPS' | 'SETTINGS' | 'Add' | 'Loading';
type IScenery = 'tabs' | 'settings' | 'findTask'

