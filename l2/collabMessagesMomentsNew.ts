/// <mls fileReference="_102025_/l2/collabMessagesMomentsNew.ts" enhancement="_102027_/l2/enhancementLit" />

import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import { getUserId, loadNotificationDeviceId } from '/_102025_/l2/collabMessagesHelper.js';
import { msgEnsureMomentsRoom } from '/_102025_/l2/collabMessagesMomentsApi.js';
import type { MomentsAudience } from '/_102025_/l2/collabMessagesMomentsApi.js';
import { msgAddMessage } from '/_102025_/l2/shared/api.js';

import '/_102025_/l2/collabMessagesPrompt.js';

/// **collab_i18n_start**
const message_pt = {
    loading: 'Carregando...',
    audienceAll: 'Público: todos',
    audienceCount: 'Público: N pessoas',
    changeAudience: 'alterar',
    publishError: 'Não foi possível publicar.',
    roomError: 'Não foi possível abrir a sala de moments.',
    empty: 'Escreva algo para publicar.',
}

const message_en = {
    loading: 'Loading...',
    audienceAll: 'Audience: everyone',
    audienceCount: 'Audience: N people',
    changeAudience: 'change',
    publishError: 'Could not publish.',
    roomError: 'Could not open the moments room.',
    empty: 'Write something to publish.',
}

type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = {
    'en': message_en,
    'pt': message_pt
}
/// **collab_i18n_end**

@customElement('collab-messages-moments-new-102025')
export class CollabMessagesMomentsNew102025 extends StateLitElement {

    private msg: MessageType = messages['en'];

    @property({ type: String }) userId = '';

    @state() private threadId = '';
    @state() private audience: MomentsAudience = 'selected';
    @state() private readerCount = 0;
    @state() private loading = true;
    @state() private error = '';

    override firstUpdated() {
        void this.open();
    }

    private currentUserId(): string {
        return this.userId || getUserId() || '';
    }

    private async open() {
        const userId = this.currentUserId();
        this.loading = true;
        this.error = '';
        if (!userId) {
            this.loading = false;
            this.error = this.msg.roomError;
            return;
        }
        try {
            const room = await msgEnsureMomentsRoom({ userId });
            if (!room.ok || !room.response.thread) {
                console.error(room.ok ? this.msg.roomError : room.error);
                this.error = room.ok ? this.msg.roomError : room.error;
                return;
            }
            this.threadId = room.response.thread.threadId;
            this.audience = room.response.audience === 'all' ? 'all' : 'selected';
            this.readerCount = room.response.thread.users.filter((user) => user.userId !== userId).length;
        } catch (err) {
            console.error(err);
            this.error = err instanceof Error ? err.message : this.msg.roomError;
        } finally {
            this.loading = false;
        }
    }

    private audienceSummary(): string {
        if (this.audience === 'all') return this.msg.audienceAll;
        return this.msg.audienceCount.replace('N', String(this.readerCount));
    }

    private openSettings() {
        this.dispatchEvent(new CustomEvent('moments-open-settings', { bubbles: true }));
    }

    private async onSend(value: string) {
        const content = value.trim();
        const userId = this.currentUserId();
        this.error = '';
        if (!content) {
            this.error = this.msg.empty;
            return;
        }
        if (!userId || !this.threadId) {
            this.error = this.msg.roomError;
            return;
        }
        try {
            const result = await msgAddMessage({
                content,
                threadId: this.threadId,
                userId,
                senderDeviceId: loadNotificationDeviceId() || undefined,
            });
            if (!result.success || !result.response?.message) {
                const cause = result.error || this.msg.publishError;
                console.error(cause);
                this.error = cause;
                return;
            }
            this.dispatchEvent(new CustomEvent('moments-published', { bubbles: true }));
        } catch (err) {
            console.error(err);
            this.error = err instanceof Error ? err.message : this.msg.publishError;
        }
    }

    override render() {
        const lang = this.getMessageKey(messages);
        this.msg = messages[lang];
        if (this.loading) return html`<p class="moments-new-status">${this.msg.loading}</p>`;
        return html`
            <div class="moments-new-editor">
                ${this.error ? html`<p class="moments-new-error">${this.error}</p>` : ''}
                <collab-messages-prompt-102025
                    enableRichPreview="true"
                    allowAttachments="false"
                    submitOnEnter="false"
                    threadId=${this.threadId}
                    .onSend=${(value: string) => { void this.onSend(value); }}
                ></collab-messages-prompt-102025>
                <p class="moments-audience">
                    <span>${this.audienceSummary()}</span>
                    <button type="button" @click=${() => this.openSettings()}>${this.msg.changeAudience}</button>
                </p>
            </div>
        `;
    }
}
