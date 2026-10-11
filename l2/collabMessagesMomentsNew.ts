/// <mls fileReference="_102025_/l2/collabMessagesMomentsNew.ts" enhancement="_102027_/l2/enhancementLit" />

import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import { getUserId, loadNotificationDeviceId } from '/_102025_/l2/collabMessagesHelper.js';
import { msgEnsureMomentsRoom, msgSetMomentsAudience, msgSetMomentsReaders } from '/_102025_/l2/collabMessagesMomentsApi.js';
import type { MomentsAudience, MomentsUserOption } from '/_102025_/l2/collabMessagesMomentsApi.js';
import { msgAddMessage, msgGetUsers } from '/_102025_/l2/shared/api.js';

import '/_102025_/l2/collabMessagesPrompt.js';

/// **collab_i18n_start**
const message_pt = {
    loading: 'Carregando...',
    readers: 'Leitores',
    readersAll: 'Leitores: todos',
    everyone: 'Todos (inclui quem entrar depois)',
    saveReaders: 'Salvar leitores',
    readersSaved: 'Leitores atualizados.',
    publishError: 'Não foi possível publicar.',
    roomError: 'Não foi possível abrir a sala de moments.',
    empty: 'Escreva algo para publicar.',
}

const message_en = {
    loading: 'Loading...',
    readers: 'Readers',
    readersAll: 'Readers: everyone',
    everyone: 'Everyone (includes people who join later)',
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
    @state() private users: MomentsUserOption[] = [];
    @state() private selected = new Set<string>();
    @state() private audience: MomentsAudience = 'selected';
    @state() private everyone = false;
    @state() private readersOpen = false;
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
            this.audience = room.response.audience === 'all' ? 'all' : 'selected';
            this.everyone = this.audience === 'all';
            const readers = new Set(
                room.response.thread.users.map((user) => user.userId).filter((id) => id !== userId)
            );
            this.initialReaders = readers;
            this.selected = new Set(readers);
            if (!people.success || !people.response?.users) {
                console.error(people.error);
                this.users = [];
            } else {
                const listed = people.response.users as MomentsUserOption[];
                this.users = listed.filter((user) => user.userId !== userId && !user.isAgent);
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

    private onReadersToggle(event: Event) {
        this.readersOpen = (event.currentTarget as HTMLDetailsElement).open;
    }

    private readersSummary(): string {
        if (this.audience === 'all') return this.msg.readersAll;
        return `${this.msg.readers}: ${this.initialReaders.size}`;
    }

    private async saveReaders() {
        const userId = this.currentUserId();
        if (!userId || this.saving) return;
        this.saving = true;
        this.notice = '';
        this.error = '';
        try {
            const audience: MomentsAudience = this.everyone ? 'all' : 'selected';
            const marked = await msgSetMomentsAudience({ userId, audience });
            if (!marked.ok) {
                console.error(marked.error);
                this.error = marked.error;
                return;
            }
            if (audience === 'selected') {
                const add = [...this.selected].filter((id) => !this.initialReaders.has(id));
                const remove = [...this.initialReaders].filter((id) => !this.selected.has(id));
                const result = await msgSetMomentsReaders({ userId, add, remove });
                if (!result.ok) {
                    console.error(result.error);
                    this.error = result.error;
                    return;
                }
                this.initialReaders = new Set(this.selected);
            }
            this.audience = audience;
            this.readersOpen = false;
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
                ${this.notice ? html`<p class="moments-new-notice">${this.notice}</p>` : ''}
                <details
                    class="moments-readers"
                    .open=${this.readersOpen}
                    @toggle=${(event: Event) => this.onReadersToggle(event)}
                >
                    <summary>${this.readersSummary()}</summary>
                    <label class="moments-everyone">
                        <input
                            type="checkbox"
                            .checked=${this.everyone}
                            @change=${(event: Event) => {
                                this.everyone = (event.currentTarget as HTMLInputElement).checked;
                            }}
                        >
                        <span>${this.msg.everyone}</span>
                    </label>
                    <ul>
                        ${this.users.map((user) => html`
                            <li>
                                <label>
                                    <input
                                        type="checkbox"
                                        .checked=${this.selected.has(user.userId)}
                                        ?disabled=${this.everyone}
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
                </details>
            </div>
        `;
    }
}
