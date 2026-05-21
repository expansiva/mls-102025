/// <mls fileReference="_102025_/l2/collabMessagesTaskRoom.ts" enhancement="_102027_/l2/enhancementLit" />

import { html, nothing } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import { msgAddMessage, msgEnsureTaskRoom, msgGetThreadUpdates } from '/_102025_/l2/shared/api.js';
import * as msg from '/_102025_/l2/shared/interfaces.js';
import { IMessage, IThreadInfo, loadNotificationDeviceId, getUserId as getCurrentUserId } from '/_102025_/l2/collabMessagesHelper.js';
import { addMessage, addMessages, addThread, getMessagesByThreadId, getThread, getCompactUTC, updateThread, updateUsers } from '/_102025_/l2/collabMessagesIndexedDB.js';
import { clearTaskNotification, markThreadReadLocally } from '/_102025_/l2/collabMessagesSyncNotifications.js';

import '/_102025_/l2/collabMessagesChatMessage.js';
import '/_102025_/l2/collabMessagesPrompt.js';

@customElement('collab-messages-task-room-102025')
export class CollabMessagesTaskRoom extends StateLitElement {

    @property() task: msg.TaskData | undefined;
    @property() message: msg.Message | undefined;
    @property() userId: string | undefined;

    @state() private roomThread: msg.Thread | undefined;
    @state() private roomUsers: msg.User[] = [];
    @state() private messages: msg.Message[] = [];
    @state() private loading = false;
    @state() private error = '';
    @state() private showScrollToBottom = false;
    @query('.task-room-messages') private messagesContainer?: HTMLElement;

    private ensuredKey = '';
    private lastRenderedMessageCount = 0;
    private didInitialScroll = false;

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('thread-change', this.onThreadChange);
        window.addEventListener('message-change', this.onMessageChange);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('thread-change', this.onThreadChange);
        window.removeEventListener('message-change', this.onMessageChange);
    }

    async updated(changedProperties: Map<PropertyKey, unknown>) {
        if (changedProperties.has('task') || changedProperties.has('message') || changedProperties.has('userId')) {
            await this.ensureRoom();
        }
        if (changedProperties.has('messages')) {
            await this.updateComplete;
            const el = this.messagesContainer;
            if (!el) return;

            if (!this.didInitialScroll && this.messages.length > 0) {
                // §3.1: scroll to bottom on first load regardless of prior scroll position
                this.didInitialScroll = true;
                await this.scrollMessagesToBottom();
                this.lastRenderedMessageCount = this.messages.length;
                return;
            }

            const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
            const grew = this.messages.length > this.lastRenderedMessageCount;

            if (grew) {
                const lastMsg = this.messages[this.messages.length - 1];
                const userId = this.getUserId();
                // §3.2: sender's own messages always pin viewport to bottom
                if (lastMsg && userId && lastMsg.senderId === userId) {
                    await this.scrollMessagesToBottom();
                } else if (!isAtBottom) {
                    this.showScrollToBottom = true;
                }
            }
            this.lastRenderedMessageCount = this.messages.length;
        }
    }

    render() {
        if (!this.task) return html`<div class="task-room-empty">No task.</div>`;
        if (this.error) return html`<div class="task-room-error">${this.error}</div>`;
        if (this.loading && !this.roomThread) return html`<div class="task-room-loading">Loading...</div>`;
        if (!this.roomThread) return nothing;

        const userId = this.getUserId();
        const displayMessages = this.messages.map((item, index) => this.toMessageView(item, index));
        const actualThread: IThreadInfo = {
            thread: this.roomThread,
            users: this.roomUsers,
            messages: displayMessages
        };

        return html`
            <div class="task-room">
                <div class="task-room-messages" @scroll=${this.onMessagesScroll}>
                    ${displayMessages.map((item) => html`
                        <collab-messages-chat-message-102025
                            .message=${item}
                            .actualThread=${actualThread}
                            .usersAvaliables=${this.roomUsers}
                            .userId=${userId}
                        ></collab-messages-chat-message-102025>
                    `)}
                </div>
                ${this.showScrollToBottom ? html`
                    <button class="task-room-scroll-nav" @click=${this.scrollToBottom} title="Go to latest message">
                        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                            <g transform="rotate(180 12 12)" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M7 14l5-5 5 5"></path>
                                <path d="M7 19l5-5 5 5"></path>
                            </g>
                        </svg>
                    </button>
                ` : nothing}
                <collab-messages-prompt-102025
                    .threadId=${this.roomThread.threadId}
                    .userId=${userId}
                    placeholder="Message task room"
                    .onSend=${(content: string, options: { replyTo?: string }) => this.sendMessage(content, options)}
                    acceptAutoCompleteUser="true"
                    enableRichPreview="true"
                ></collab-messages-prompt-102025>
            </div>
        `;
    }

    private onMessagesScroll() {
        const el = this.messagesContainer;
        if (!el) return;
        const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
        this.showScrollToBottom = !isAtBottom;
    }

    private scrollToBottom = async () => {
        const el = this.messagesContainer;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        this.showScrollToBottom = false;
    }

    private async scrollMessagesToBottom() {
        await this.updateComplete;
        const el = this.messagesContainer;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
        this.showScrollToBottom = false;
    }

    private async ensureRoom() {
        if (!this.task) return;
        const userId = this.getUserId();
        const parentThreadId = this.getParentThreadId();
        if (!userId || !parentThreadId) {
            this.error = 'Missing parent thread or user for task room.';
            return;
        }
        if (!this.canUseTaskRoom(this.task)) {
            this.error = 'This task does not have a task room.';
            return;
        }
        this.error = '';

        const knownThreadId = this.task.taskRoom?.threadId;
        if (knownThreadId) {
            const localThread = await getThread(knownThreadId);
            if (localThread?.users?.some(user => user.userId === userId)) {
                await this.openKnownRoom(knownThreadId, userId, localThread);
                return;
            }
            await this.ensureRoomOnServer(userId, parentThreadId);
            return;
        }

        await this.ensureRoomOnServer(userId, parentThreadId);
    }

    private async ensureRoomOnServer(userId: string, parentThreadId: string) {
        if (!this.task) return;
        const key = this.getEnsureKey(userId, parentThreadId, this.task);
        if (this.roomThread && this.ensuredKey === key) return;
        if (this.loading && this.ensuredKey === key) return;
        this.ensuredKey = key;
        this.didInitialScroll = false;

        this.loading = true;
        this.error = '';
        const result = await msgEnsureTaskRoom({
            userId,
            taskId: this.task.PK,
            parentThreadId
        });
        this.loading = false;

        if (!result.success || !result.response) {
            this.error = result.error || 'Could not open task room.';
            return;
        }

        this.task = result.response.task;
        this.roomThread = result.response.thread;
        await this.cacheRoomThread(result.response.thread, '20000101000000.0000');
        this.ensuredKey = this.getEnsureKey(userId, parentThreadId, result.response.task);
        await this.loadLocalMessages();
        await this.syncMessages();
    }

    private async openKnownRoom(threadId: string, userId: string, knownThread?: msg.ThreadPerformanceCache) {
        const key = `${threadId}|${userId}`;
        if (this.roomThread?.threadId === threadId && this.ensuredKey === key) return;
        this.ensuredKey = key;
        this.didInitialScroll = false;

        const localThread = knownThread || await getThread(threadId);
        if (localThread) {
            this.roomThread = localThread;
            await this.loadLocalMessages();
        } else {
            this.roomThread = {
                threadId,
                name: this.task?.title || 'Task room',
                users: [],
                visibility: 'private',
                status: 'active',
                group: 'TASK',
                history: [],
                languages: [],
                avatar_url: '',
                createdAt: '',
                kind: 'task-room',
                taskRoom: {
                    taskId: this.task?.PK || '',
                    parentThreadId: this.getParentThreadId(),
                    workflowType: this.task?.taskRoom?.workflowType || 'dynamicWorkflow'
                }
            };
        }

        await this.syncMessages();
    }

    private async syncMessages() {
        const userId = this.getUserId();
        if (!this.roomThread || !userId) return;
        const localThread = await getThread(this.roomThread.threadId);
        const lastOrderAt = this.getLastOrderAt(localThread);
        const deviceId = loadNotificationDeviceId();

        const result = await msgGetThreadUpdates({
            threadId: this.roomThread.threadId,
            userId,
            lastOrderAt,
            deviceId: deviceId || undefined
        });

        if (!result.success || !result.response) {
            this.error = result.error || 'Could not load task room messages.';
            return;
        }

        this.roomThread = result.response.thread || this.roomThread;
        this.roomUsers = result.response.users || [];
        await this.cacheRoomThread(this.roomThread, this.getResponseLastOrderAt(result.response.messages, lastOrderAt));
        if (this.roomUsers.length) await updateUsers(this.roomUsers);
        if (result.response.messages?.length) {
            await addMessages(result.response.messages.map(message => ({ ...message, footers: [] })));
        }
        await this.loadLocalMessages();
    }

    private async loadLocalMessages() {
        if (!this.roomThread) return;
        const messages = await getMessagesByThreadId(this.roomThread.threadId, 100, 0);
        this.messages = messages.sort((a, b) => a.orderAt.localeCompare(b.orderAt));
        await this.markRoomReadLocally();
    }

    private async markRoomReadLocally() {
        if (!this.roomThread?.threadId || !this.task?.PK) return;

        const localThread = await getThread(this.roomThread.threadId);
        if (!localThread?.unreadCount) {
            clearTaskNotification(this.task.PK);
            return;
        }

        const lastMessage = this.messages.at(-1);
        const updatedThread = await markThreadReadLocally(
            this.roomThread.threadId,
            lastMessage?.createAt,
            {
                threadId: this.getParentThreadId(),
                sourceThreadId: this.roomThread.threadId,
                taskId: this.task.PK
            }
        );
        if (updatedThread) this.roomThread = updatedThread;
    }

    private async sendMessage(content: string, options: { replyTo?: string }) {
        const userId = this.getUserId();
        if (!this.roomThread || !userId || !content.trim()) return;

        const result = await msgAddMessage({
            userId,
            threadId: this.roomThread.threadId,
            content,
            replyTo: options.replyTo
        });

        if (!result.success || !result.response) {
            this.error = result.error || 'Could not send task room message.';
            return;
        }

        await addMessage({ ...result.response.message, footers: [] });
        if (this.roomThread) {
            await this.cacheRoomThread(
                this.roomThread,
                result.response.message.createAt,
                `${result.response.message.senderId}:${result.response.message.content}`,
                result.response.message.createAt
            );
        }
        this.messages = [...this.messages, result.response.message];
        await this.scrollMessagesToBottom();
    }

    private async cacheRoomThread(thread: msg.Thread, lastSync: string, lastMessage: string = '', lastMessageTime: string = '') {
        const existing = await getThread(thread.threadId);
        if (existing) {
            this.roomThread = await updateThread(
                thread.threadId,
                thread,
                lastMessage || existing.lastMessage || '',
                lastMessageTime || existing.lastMessageTime || '',
                existing.unreadCount || 0,
                lastSync
            );
            return;
        }
        this.roomThread = await addThread(thread);
        if (lastSync || lastMessage || lastMessageTime) {
            this.roomThread = await updateThread(thread.threadId, thread, lastMessage, lastMessageTime, 0, lastSync);
        }
    }

    private getLastOrderAt(thread: msg.ThreadPerformanceCache | undefined) {
        if (thread?.lastSync) return thread.lastSync;
        const lastMessage = this.messages[this.messages.length - 1];
        if (lastMessage?.createAt) return lastMessage.createAt;
        return '20000101000000.0000';
    }

    private getResponseLastOrderAt(messages: msg.Message[] | undefined, fallback: string) {
        if (!messages?.length) return fallback || getCompactUTC();
        return messages[messages.length - 1].createAt;
    }

    private onThreadChange = async (e: Event) => {
        const thread = (e as CustomEvent).detail as msg.Thread;
        if (!this.roomThread || thread.threadId !== this.roomThread.threadId) return;
        this.roomThread = { ...this.roomThread, ...thread };
        await this.loadLocalMessages();
    };

    private onMessageChange = async (e: Event) => {
        const message = (e as CustomEvent).detail as msg.Message;
        if (!this.roomThread || message.threadId !== this.roomThread.threadId) return;
        await this.loadLocalMessages();
    };

    private getUserId() {
        return this.userId || getCurrentUserId() || this.message?.senderId || '';
    }

    private getParentThreadId() {
        return this.task?.taskRoom?.parentThreadId || this.message?.threadId || '';
    }

    private getEnsureKey(userId: string, parentThreadId: string, task: msg.TaskData) {
        return `${task.PK}|${userId}|${parentThreadId}|${task.taskRoom?.threadId || ''}`;
    }

    private canUseTaskRoom(task: msg.TaskData) {
        if (task.taskRoom?.threadId || task.taskRoom?.workflowType) return true;
        const firstStep = task.iaCompressed?.nextSteps?.[0] as { type?: string } | undefined;
        return firstStep?.type === 'staticWorkflow' || firstStep?.type === 'dynamicWorkflow';
    }

    private toMessageView(message: msg.Message, index: number): IMessage {
        const previous = this.messages[index - 1];
        const {
            taskId,
            taskTitle,
            taskStatus,
            taskResults,
            taskResultsTranslated,
            taskTitleTranslated,
            ...messageWithoutTaskCard
        } = message;
        return {
            ...messageWithoutTaskCard,
            isSame: !!previous && previous.senderId === message.senderId,
            footers: []
        };
    }
}
