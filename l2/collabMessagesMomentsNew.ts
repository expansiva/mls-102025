/// <mls fileReference="_102025_/l2/collabMessagesMomentsNew.ts" enhancement="_102027_/l2/enhancementLit" />

import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import { getUserId, loadNotificationDeviceId } from '/_102025_/l2/collabMessagesHelper.js';
import { msgEnsureMomentsRoom, msgSetMomentsReaders } from '/_102025_/l2/collabMessagesMomentsApi.js';
import { msgAddMessage, msgGetUsers } from '/_102025_/l2/shared/api.js';
import type { ResponseGetUsers } from '/_102036_/l2/shared/interfaces.js';

import '/_102025_/l2/collabMessagesPrompt.js';

/// **collab_i18n_start**
const message_pt = {
    loading: 'Carregando...',
    readers: 'Leitores',
    saveReaders: 'Salvar leitores',
    readersSaved: 'Leitores atualizados.',
    publishError: 'Não foi possível publicar.',
    roomError: 'Não foi possível abrir a sala de moments.',
    empty: 'Escreva algo para publicar.',
}

const message_en = {
    loading: 'Loading...',
    readers: 'Readers',
    saveReaders: 'Save readers',
    readersSaved: 'Readers updated.',
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
    @state() private users: ResponseGetUsers['users'] = [];
    @state() private selected = new Set<string>();
    @state() private loading = true;
    @state() private saving = false;
    @state() private error = '';
    @state() private notice = '';

    private initialReaders = new Set<string>();

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
            const [room, people] = await Promise.all([
                msgEnsureMomentsRoom({ userId }),
                msgGetUsers({ status: 'active', prefixName: '', userId }),
            ]);
            if (!room.ok || !room.response.thread) {
                console.error(room.ok ? this.msg.roomError : room.error);
                this.error = room.ok ? this.msg.roomError : room.error;
                return;
            }
            this.threadId = room.response.thread.threadId;
            const readers = new Set(
                room.response.thread.users.map((user) => user.userId).filter((id) => id !== userId)
            );
            this.initialReaders = readers;
            this.selected = new Set(readers);
            if (!people.success || !people.response?.users) {
                console.error(people.error);
                this.users = [];
            } else {
                this.users = people.response.users.filter((user) => user.userId !== userId);
            }
        } catch (err) {
            console.error(err);
            this.error = err instanceof Error ? err.message : this.msg.roomError;
        } finally {
            this.loading = false;
        }
    }

    private toggleReader(userId: string) {
        const next = new Set(this.selected);
        if (next.has(userId)) next.delete(userId);
        else next.add(userId);
        this.selected = next;
    }

    private async saveReaders() {
        const userId = this.currentUserId();
        if (!userId || this.saving) return;
        const add = [...this.selected].filter((id) => !this.initialReaders.has(id));
        const remove = [...this.initialReaders].filter((id) => !this.selected.has(id));
        this.saving = true;
        this.notice = '';
        this.error = '';
        try {
            const result = await msgSetMomentsReaders({ userId, add, remove });
            if (!result.ok) {
                console.error(result.error);
                this.error = result.error;
                return;
            }
            this.initialReaders = new Set(this.selected);
            this.notice = this.msg.readersSaved;
        } catch (err) {
            console.error(err);
            this.error = err instanceof Error ? err.message : this.msg.roomError;
        } finally {
            this.saving = false;
        }
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
                <section class="moments-readers">
                    <h3>${this.msg.readers}</h3>
                    ${this.notice ? html`<p class="moments-new-notice">${this.notice}</p>` : ''}
                    <ul>
                        ${this.users.map((user) => html`
                            <li>
                                <label>
                                    <input
                                        type="checkbox"
                                        .checked=${this.selected.has(user.userId)}
                                        @change=${() => this.toggleReader(user.userId)}
                                    >
                                    <span>${user.name}</span>
                                </label>
                            </li>
                        `)}
                    </ul>
                    <button type="button" ?disabled=${this.saving} @click=${() => { void this.saveReaders(); }}>
                        ${this.msg.saveReaders}
                    </button>
                </section>
            </div>
        `;
    }
}
