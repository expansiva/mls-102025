/// <mls fileReference="_102025_/l2/collabMessagesSettingsMoments.ts" enhancement="_102027_/l2/enhancementLit"/>

import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';

import {
    msgEnsureMomentsRoom,
    msgGetMomentsSubscriptions,
    msgSetMomentsAudience,
    msgSetMomentsMute,
    msgSetMomentsReaders,
    type MomentsAudience,
    type MomentsSubscriptionItem,
    type MomentsUserOption,
} from '/_102025_/l2/collabMessagesMomentsApi.js';
import { msgGetUserUpdate, msgGetUsers } from '/_102025_/l2/shared/api.js';
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
    audienceTitle: 'Meu público',
    audienceHint: 'A lista abaixo muda para todas as mensagens enviadas e a enviar.',
    audienceAll: 'Todos (inclui quem entrar depois)',
    audienceSummaryAll: 'Público: todos',
    audienceSummaryCount: 'Público: N pessoas',
    audienceError: 'Não foi possível gravar o público.',
    audienceLoadError: 'Não foi possível carregar o público.',
    reader: 'Leitor',
};

const message_en = {
    title: 'Publishers',
    hint: 'Mute hides this publisher’s moments from your feed. The publisher is not notified.',
    mute: 'Mute',
    loading: 'Loading...',
    empty: 'No one has published moments for you.',
    retry: 'Try again',
    error: 'Could not load publishers.',
    audienceTitle: 'My audience',
    audienceHint: 'The list below applies to every message sent and to be sent.',
    audienceAll: 'Everyone (includes people who join later)',
    audienceSummaryAll: 'Audience: everyone',
    audienceSummaryCount: 'Audience: N people',
    audienceError: 'Could not save the audience.',
    audienceLoadError: 'Could not load the audience.',
    reader: 'Reader',
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

    @state() private audience: MomentsAudience = 'selected';
    @state() private readers = new Set<string>();
    @state() private humans: MomentsUserOption[] = [];
    @state() private audienceLoading = true;
    @state() private audienceError = '';
    @state() private audienceLoadFailed = false;
    @state() private audiencePending = new Set<string>();

    async firstUpdated() {
        await Promise.all([this.load(), this.loadAudience()]);
    }

    render() {
        const lang = this.getMessageKey(messages);
        this.msg = messages[lang];

        return html`
        <div class="section moments-audience">
            <h4>${collab_gear} ${this.msg.audienceTitle} <span class="summary">${this.audienceSummary()}</span></h4>
            <p class="hint">${this.msg.audienceHint}</p>
            ${this.audienceLoading ? html`<div>${this.msg.loading}</div>` : ''}
            ${this.audienceError ? html`<p class="saving-error">${this.audienceError}</p>` : ''}
            ${!this.audienceLoading && this.audienceLoadFailed ? html`
                <button type="button" @click=${() => { void this.loadAudience(); }}>${this.msg.retry}</button>
            ` : ''}
            ${this.audienceLoading ? '' : html`
                <label class="everyone">
                    <input
                        type="checkbox"
                        .checked=${this.audience === 'all'}
                        ?disabled=${this.audiencePending.has('audience')}
                        @change=${(ev: Event) => { void this.onEveryone((ev.target as HTMLInputElement).checked); }}
                    >
                    ${this.msg.audienceAll}
                </label>
                ${this.audience === 'all' ? '' : html`
                    <ul class="publisher-list">
                        ${this.humans.map((person) => html`
                            <li class="publisher-row ${this.audiencePending.has(person.userId) ? 'row-pending' : ''}">
                                <span class="name">${person.name}</span>
                                <label class="mute">
                                    <input
                                        type="checkbox"
                                        .checked=${this.readers.has(person.userId)}
                                        ?disabled=${this.audiencePending.has(person.userId)}
                                        @change=${(ev: Event) => { void this.onReader(person.userId, (ev.target as HTMLInputElement).checked); }}
                                    >
                                    ${this.msg.reader}
                                </label>
                            </li>
                        `)}
                    </ul>
                `}
            `}
        </div>
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

    private audienceSummary(): string {
        if (this.audience === 'all') return this.msg.audienceSummaryAll;
        return this.msg.audienceSummaryCount.replace('N', String(this.readers.size));
    }

    private async ensureUserId(): Promise<string> {
        if (this.userId) return this.userId;
        const userResult = await msgGetUserUpdate({ userId: '' });
        if (!userResult.success || !userResult.response?.user?.userId) {
            throw new Error(userResult.error || 'Failed to fetch user');
        }
        this.userId = userResult.response.user.userId;
        return this.userId;
    }

    private async load() {
        this.loading = true;
        this.error = '';
        try {
            const userId = await this.ensureUserId();
            const result = await msgGetMomentsSubscriptions({ userId });
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

    private async loadAudience() {
        this.audienceLoading = true;
        this.audienceError = '';
        this.audienceLoadFailed = false;
        try {
            const userId = await this.ensureUserId();
            const [room, people] = await Promise.all([
                msgEnsureMomentsRoom({ userId }),
                msgGetUsers({ status: 'active', prefixName: '', userId }),
            ]);
            if (!room.ok || !room.response.thread) {
                console.error(room.ok ? this.msg.audienceLoadError : room.error);
                this.audienceError = room.ok ? this.msg.audienceLoadError : room.error;
                this.audienceLoadFailed = true;
                return;
            }
            this.audience = room.response.audience === 'all' ? 'all' : 'selected';
            this.readers = new Set(
                room.response.thread.users.map((user) => user.userId).filter((id) => id !== userId)
            );
            if (!people.success || !people.response?.users) {
                console.error(people.error);
                this.humans = [];
                this.audienceError = people.error || this.msg.audienceLoadError;
                this.audienceLoadFailed = true;
            } else {
                const listed = people.response.users as MomentsUserOption[];
                this.humans = listed.filter((user) => user.isHuman === true && user.userId !== userId);
            }
        } catch (err) {
            console.error(err);
            this.audienceError = err instanceof Error ? err.message : this.msg.audienceLoadError;
            this.audienceLoadFailed = true;
        } finally {
            this.audienceLoading = false;
        }
    }

    /** Relê só a sala: audiência e leitores. A lista de humanos e o "carregando" ficam. */
    private async refreshRoom(userId: string) {
        const room = await msgEnsureMomentsRoom({ userId });
        if (!room.ok || !room.response.thread) {
            console.error(room.ok ? this.msg.audienceLoadError : room.error);
            this.audienceError = room.ok ? this.msg.audienceLoadError : room.error;
            return;
        }
        this.audience = room.response.audience === 'all' ? 'all' : 'selected';
        this.readers = new Set(
            room.response.thread.users.map((user) => user.userId).filter((id) => id !== userId)
        );
    }

    private async onEveryone(everyone: boolean) {
        let userId: string;
        try {
            userId = await this.ensureUserId();
        } catch (err) {
            console.error(err);
            this.audienceError = err instanceof Error ? err.message : this.msg.audienceError;
            return;
        }
        const previous = this.audience;
        const next: MomentsAudience = everyone ? 'all' : 'selected';
        this.audience = next;
        this.audienceError = '';
        this.audiencePending = new Set(this.audiencePending).add('audience');
        try {
            const result = await msgSetMomentsAudience({ userId, audience: next });
            if (!result.ok) {
                console.error(result.error);
                this.audience = previous;
                this.audienceError = result.error || this.msg.audienceError;
                return;
            }
            await this.refreshRoom(userId);
        } catch (err) {
            console.error(err);
            this.audience = previous;
            this.audienceError = err instanceof Error ? err.message : this.msg.audienceError;
        } finally {
            const pending = new Set(this.audiencePending);
            pending.delete('audience');
            this.audiencePending = pending;
        }
    }

    private async onReader(personId: string, included: boolean) {
        let userId: string;
        try {
            userId = await this.ensureUserId();
        } catch (err) {
            console.error(err);
            this.audienceError = err instanceof Error ? err.message : this.msg.audienceError;
            return;
        }
        const had = this.readers.has(personId);
        const next = new Set(this.readers);
        if (included) next.add(personId);
        else next.delete(personId);
        this.readers = next;
        this.audienceError = '';
        this.audiencePending = new Set(this.audiencePending).add(personId);
        try {
            const result = await msgSetMomentsReaders({
                userId,
                add: included ? [personId] : [],
                remove: included ? [] : [personId],
            });
            if (!result.ok) {
                console.error(result.error);
                const reverted = new Set(this.readers);
                if (had) reverted.add(personId);
                else reverted.delete(personId);
                this.readers = reverted;
                this.audienceError = result.error || this.msg.audienceError;
            }
        } catch (err) {
            console.error(err);
            const reverted = new Set(this.readers);
            if (had) reverted.add(personId);
            else reverted.delete(personId);
            this.readers = reverted;
            this.audienceError = err instanceof Error ? err.message : this.msg.audienceError;
        } finally {
            const pending = new Set(this.audiencePending);
            pending.delete(personId);
            this.audiencePending = pending;
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
