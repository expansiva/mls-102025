/// <mls fileReference="_102025_/l2/collabMessagesSettingsMoments.ts" enhancement="_102027_/l2/enhancementLit"/>

import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';

import {
    msgGetMomentsSubscriptions,
    msgSetMomentsMute,
    type MomentsSubscriptionItem,
} from '/_102025_/l2/collabMessagesMomentsApi.js';
import { msgGetUserUpdate } from '/_102025_/l2/shared/api.js';
import { collab_gear } from '/_102025_/l2/collabMessagesIcons.js';

/// **collab_i18n_start**
const message_pt = {
    title: 'Publicadores',
    hint: 'Silenciar esconde os moments deste publicador no seu feed. O publicador não é avisado.',
    mute: 'Silenciar',
    loading: 'Carregando...',
    empty: 'Ninguém publicou moments para você.',
    retry: 'Tentar de novo',
    error: 'Não foi possível carregar os publicadores.',
};

const message_en = {
    title: 'Publishers',
    hint: 'Mute hides this publisher’s moments from your feed. The publisher is not notified.',
    mute: 'Mute',
    loading: 'Loading...',
    empty: 'No one has published moments for you.',
    retry: 'Try again',
    error: 'Could not load publishers.',
};

type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = {
    'en': message_en,
    'pt': message_pt,
};
/// **collab_i18n_end**

@customElement('collab-messages-settings-moments-102025')
export class CollabMessagesSettingsMoments extends StateLitElement {

    private msg: MessageType = messages['en'];

    @state() private userId = '';
    @state() private items: MomentsSubscriptionItem[] = [];
    @state() private loading = true;
    @state() private error = '';
    @state() private pending = new Set<string>();

    async firstUpdated() {
        await this.load();
    }

    render() {
        const lang = this.getMessageKey(messages);
        this.msg = messages[lang];

        return html`
        <div class="section moments-publishers">
            <h4>${collab_gear} ${this.msg.title}</h4>
            <p class="hint">${this.msg.hint}</p>
            ${this.loading ? html`<div>${this.msg.loading}</div>` : ''}
            ${this.error ? html`
                <p class="saving-error">${this.error}</p>
                <button type="button" @click=${() => { void this.load(); }}>${this.msg.retry}</button>
            ` : ''}
            ${!this.loading && !this.error && this.items.length === 0
                ? html`<p class="empty">${this.msg.empty}</p>`
                : ''}
            <ul class="publisher-list">
                ${this.items.map((item) => html`
                    <li class="publisher-row">
                        ${item.publisher.avatar_url
                            ? html`<img class="avatar" src=${item.publisher.avatar_url} alt="">`
                            : html`<span class="avatar"></span>`}
                        <span class="name">${item.publisher.name}</span>
                        <label class="mute">
                            <input
                                type="checkbox"
                                .checked=${item.muted}
                                ?disabled=${this.pending.has(item.threadId)}
                                @change=${(ev: Event) => { void this.onMute(item, (ev.target as HTMLInputElement).checked); }}
                            >
                            ${this.msg.mute}
                        </label>
                    </li>
                `)}
            </ul>
        </div>
        `;
    }

    private async load() {
        this.loading = true;
        this.error = '';
        try {
            if (!this.userId) {
                const userResult = await msgGetUserUpdate({ userId: '' });
                if (!userResult.success || !userResult.response?.user?.userId) {
                    throw new Error(userResult.error || 'Failed to fetch user');
                }
                this.userId = userResult.response.user.userId;
            }
            const result = await msgGetMomentsSubscriptions({ userId: this.userId });
            if (!result.ok) {
                console.error(result.error);
                this.error = result.error || this.msg.error;
                this.items = [];
                return;
            }
            this.items = result.response.items ?? [];
        } catch (err) {
            console.error(err);
            this.error = err instanceof Error ? err.message : this.msg.error;
            this.items = [];
        } finally {
            this.loading = false;
        }
    }

    private async onMute(item: MomentsSubscriptionItem, muted: boolean) {
        const previous = item.muted;
        this.items = this.items.map((row) => row.threadId === item.threadId ? { ...row, muted } : row);
        this.pending = new Set(this.pending).add(item.threadId);
        try {
            const result = await msgSetMomentsMute({ userId: this.userId, threadId: item.threadId, muted });
            if (!result.ok) {
                console.error(result.error);
                this.items = this.items.map((row) => row.threadId === item.threadId ? { ...row, muted: previous } : row);
                this.error = result.error;
            }
        } catch (err) {
            console.error(err);
            this.items = this.items.map((row) => row.threadId === item.threadId ? { ...row, muted: previous } : row);
            this.error = err instanceof Error ? err.message : this.msg.error;
        } finally {
            const next = new Set(this.pending);
            next.delete(item.threadId);
            this.pending = next;
        }
    }
}
