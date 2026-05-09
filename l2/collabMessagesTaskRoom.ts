/// <mls fileReference="_102025_/l2/collabMessagesTaskRoom.ts" enhancement="_102027_/l2/enhancementLit" />

import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import { msgAddMessage, msgEnsureTaskRoom, msgGetThreadUpdates } from '/_102025_/l2/shared/api.js';
import * as msg from '/_102025_/l2/shared/interfaces.js';
import { IMessage, IThreadInfo } from '/_102025_/l2/collabMessagesHelper.js';

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

    private ensuredKey = '';

    async updated(changedProperties: Map<PropertyKey, unknown>) {
        if (changedProperties.has('task') || changedProperties.has('message') || changedProperties.has('userId')) {
            await this.ensureRoom();
        }
    }

    render() {
        if (!this.task) return html`<div class="task-room-empty">No task.</div>`;
        if (this.error) return html`<div class="task-room-error">${this.error}</div>`;
        if (this.loading && !this.roomThread) return html`<div class="task-room-loading">Loading...</div>`;
        if (!this.roomThread) return nothing;

        const userId = this.getUserId();
        const actualThread: IThreadInfo = {
            thread: this.roomThread,
            users: this.roomUsers,
            messages: this.messages
        };

        return html`
            <div class="task-room">
                <div class="task-room-messages">
                    ${this.messages.map((item, index) => html`
                        <collab-messages-chat-message-102025
                            .message=${this.toMessageView(item, index)}
                            .actualThread=${actualThread}
                            .usersAvaliables=${this.roomUsers}
                            .userId=${userId}
                        ></collab-messages-chat-message-102025>
                    `)}
                </div>
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

    private async ensureRoom() {
        if (!this.task) return;
        const userId = this.getUserId();
        const parentThreadId = this.getParentThreadId();
        if (!userId || !parentThreadId) {
            this.error = 'Missing parent thread or user for task room.';
            return;
        }

        const key = this.getEnsureKey(userId, parentThreadId, this.task);
        if (this.roomThread && this.ensuredKey === key) return;
        if (this.loading && this.ensuredKey === key) return;
        this.ensuredKey = key;

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
        this.ensuredKey = this.getEnsureKey(userId, parentThreadId, result.response.task);
        await this.loadMessages();
    }

    private async loadMessages() {
        const userId = this.getUserId();
        if (!this.roomThread || !userId) return;

        const result = await msgGetThreadUpdates({
            threadId: this.roomThread.threadId,
            userId,
            lastOrderAt: '20000101000000.0000'
        });

        if (!result.success || !result.response) {
            this.error = result.error || 'Could not load task room messages.';
            return;
        }

        this.roomThread = result.response.thread || this.roomThread;
        this.roomUsers = result.response.users || [];
        this.messages = result.response.messages || [];
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

        this.messages = [...this.messages, result.response.message];
    }

    private getUserId() {
        return this.userId || this.message?.senderId || '';
    }

    private getParentThreadId() {
        return this.task?.taskRoom?.parentThreadId || this.message?.threadId || '';
    }

    private getEnsureKey(userId: string, parentThreadId: string, task: msg.TaskData) {
        return `${task.PK}|${userId}|${parentThreadId}|${task.taskRoom?.threadId || ''}`;
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
