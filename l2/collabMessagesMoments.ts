/// <mls fileReference="_102025_/l2/collabMessagesMoments.ts" enhancement="_102027_/l2/enhancementLit" />

import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import {
    msgGetMomentsFeed,
    msgGetMomentsStats,
    msgMarkMomentSeen,
    momentsStartIndex,
    type MomentsFeedItem,
    type MomentsSeenItem,
    type MomentsStatsPost,
} from '/_102025_/l2/collabMessagesMomentsApi.js';
import { collab_chevron_left, collab_eye, collab_gear, collab_plus, collab_signal } from '/_102025_/l2/collabMessagesIcons.js';
import { REACTION_EMOJIS } from '/_102025_/l2/collabMessagesReactions.js';
import { msgUpdateMessage } from '/_102025_/l2/shared/api.js';

import '/_102025_/l2/collabMessagesRichPreviewText.js';
import '/_102025_/l2/collabMessagesMomentsNew.js';
import '/_102025_/l2/collabMessagesSettingsMoments.js';

/// **collab_i18n_start**
const message_pt = {
    loading: 'Carregando...',
    newMoment: 'Novo moment',
    stats: 'Estatísticas',
    publishers: 'Publicadores',
    caughtUp: 'Você está em dia',
    refresh: 'atualizar',
    newMoments: 'Novos moments',
    retry: 'tentar de novo',
    networkError: 'Não foi possível carregar os moments.',
    back: 'Voltar',
    reach: 'alcance',
    reachOf: 'Alcance: {reach} de {audience}',
    reactions: 'reações',
}

const message_en = {
    loading: 'Loading...',
    newMoment: 'New moment',
    stats: 'Statistics',
    publishers: 'Publishers',
    caughtUp: "You're all caught up",
    refresh: 'refresh',
    newMoments: 'New moments',
    retry: 'try again',
    networkError: 'Could not load moments.',
    back: 'Back',
    reach: 'reach',
    reachOf: 'Reach: {reach} of {audience}',
    reactions: 'reactions',
}

type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = {
    'en': message_en,
    'pt': message_pt
}
/// **collab_i18n_end**

type MomentsView = 'feed' | 'new' | 'stats' | 'publishers';
type MomentsAction = 'new' | 'stats' | 'publishers';

const SEEN_FLUSH_MS = 3000;
const SEEN_BATCH = 50;
const SEEN_THRESHOLD = 0.6;

@customElement('collab-messages-moments-102025')
export class CollabMessagesMoments102025 extends StateLitElement {

    private msg: MessageType = messages['en'];

    @property({ type: String }) userId = '';

    @property({ attribute: false }) userPerfil: { userId?: string } | undefined;

    @state() private view: MomentsView = 'feed';
    @state() private items: MomentsFeedItem[] = [];
    @state() private loading = false;
    @state() private error = '';
    @state() private hasNewMoments = false;
    @state() private statsPosts: MomentsStatsPost[] = [];
    @state() private audience = 0;
    @state() private statsError = '';
    @state() private statsLoading = false;

    private seenQueue: MomentsSeenItem[] = [];
    private seenKeys = new Set<string>();
    private flushTimer = 0;
    private flushing = false;
    private observer: IntersectionObserver | undefined;
    private pendingScroll = false;
    private startIndex = 0;
    private loadedFor = '';

    private onVisibility = () => {
        if (document.visibilityState === 'hidden') void this.flushSeen();
    };

    private onPush = (ev: Event) => {
        const detail = (ev as CustomEvent<{ threadId?: string }>).detail;
        const threadId = detail?.threadId;
        if (!threadId) return;
        if (this.items.some((item) => item.threadId === threadId)) this.hasNewMoments = true;
    };

    override connectedCallback() {
        super.connectedCallback();
        window.addEventListener('message-change', this.onPush);
        window.addEventListener('thread-change', this.onPush);
        document.addEventListener('visibilitychange', this.onVisibility);
        this.flushTimer = window.setInterval(() => { void this.flushSeen(); }, SEEN_FLUSH_MS);
    }

    override disconnectedCallback() {
        window.removeEventListener('message-change', this.onPush);
        window.removeEventListener('thread-change', this.onPush);
        document.removeEventListener('visibilitychange', this.onVisibility);
        window.clearInterval(this.flushTimer);
        this.observer?.disconnect();
        this.observer = undefined;
        void this.flushSeen();
        super.disconnectedCallback();
    }

    override updated(changed: Map<PropertyKey, unknown>) {
        const uid = this.userId || this.userPerfil?.userId || '';
        if (uid && uid !== this.loadedFor && (changed.has('userId') || changed.has('userPerfil') || !this.loadedFor)) {
            void this.loadFeed();
        }
        if (changed.has('view') && this.view === 'stats') void this.loadStats();
        if (this.view === 'feed') {
            if (this.pendingScroll) this.scrollToStart();
            this.bindObserver();
        }
    }

    private currentUserId(): string {
        return this.userId || this.userPerfil?.userId || '';
    }

    private async loadFeed() {
        const userId = this.currentUserId();
        if (!userId) return;
        this.loadedFor = userId;
        this.loading = true;
        this.error = '';
        this.hasNewMoments = false;
        try {
            const result = await msgGetMomentsFeed({ userId });
            if (!result.ok) {
                console.error(result.error);
                this.error = result.error || this.msg.networkError;
                this.items = [];
                return;
            }
            this.items = result.response.items ?? [];
            this.startIndex = momentsStartIndex(this.items);
            this.pendingScroll = true;
        } catch (err) {
            console.error(err);
            this.error = err instanceof Error ? err.message : this.msg.networkError;
            this.items = [];
        } finally {
            this.loading = false;
        }
    }

    private scrollToStart() {
        const scroller = this.querySelector('.moments-feed');
        if (!scroller) return;
        const cards = scroller.querySelectorAll<HTMLElement>('.moment-card, .moment-end');
        const target = cards[this.startIndex] ?? cards[cards.length - 1];
        target?.scrollIntoView({ block: 'start' });
        this.pendingScroll = false;
    }

    private bindObserver() {
        this.observer?.disconnect();
        const scroller = this.querySelector('.moments-feed');
        if (!scroller) return;
        this.observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.intersectionRatio < SEEN_THRESHOLD) continue;
                const el = entry.target as HTMLElement;
                if (el.classList.contains('moment-end')) {
                    void this.flushSeen();
                    continue;
                }
                const index = Number(el.dataset.index);
                const item = this.items[index];
                if (!item || item.seen) continue;
                if (this.isOwn(item)) continue;
                this.markLocalSeen(item);
            }
        }, { root: scroller, threshold: SEEN_THRESHOLD });
        scroller.querySelectorAll('.moment-card, .moment-end').forEach((el) => this.observer?.observe(el));
    }

    private isOwn(item: MomentsFeedItem): boolean {
        const uid = this.currentUserId();
        return !!uid && (item.publisher.userId === uid || item.message.senderId === uid);
    }

    private markLocalSeen(item: MomentsFeedItem) {
        const messageId = `${item.threadId}/${item.message.orderAt}`;
        const key = `${item.threadId}:${messageId}`;
        item.seen = true;
        if (this.seenKeys.has(key)) return;
        this.seenKeys.add(key);
        this.seenQueue.push({ threadId: item.threadId, messageId });
    }

    private async flushSeen() {
        const userId = this.currentUserId();
        if (this.flushing || !userId || this.seenQueue.length === 0) return;
        this.flushing = true;
        const batch = this.seenQueue.splice(0, SEEN_BATCH);
        try {
            const result = await msgMarkMomentSeen({ userId, items: batch });
            if (!result.ok) {
                console.error(result.error);
                this.restoreQueue(batch);
            } else {
                for (const item of batch) this.seenKeys.delete(`${item.threadId}:${item.messageId}`);
            }
        } catch (err) {
            console.error(err);
            this.restoreQueue(batch);
        } finally {
            this.flushing = false;
        }
    }

    private restoreQueue(batch: MomentsSeenItem[]) {
        const queued = new Set(this.seenQueue.map((item) => `${item.threadId}:${item.messageId}`));
        const back = batch.filter((item) => !queued.has(`${item.threadId}:${item.messageId}`));
        this.seenQueue = back.concat(this.seenQueue);
    }

    private openView(action: MomentsAction) {
        this.view = action;
        this.dispatchEvent(new CustomEvent('moments-action', { detail: action, bubbles: true }));
    }

    private backToFeed() {
        this.view = 'feed';
        void this.loadFeed();
    }

    private formatWhen(value: string): string {
        if (!/^\d{14}/.test(value)) return value;
        return `${value.slice(6, 8)}/${value.slice(4, 6)}/${value.slice(0, 4)} ${value.slice(8, 10)}:${value.slice(10, 12)}`;
    }

    private renderTop() {
        return html`
            <header class="moments-top">
                ${this.view === 'feed' ? nothing : html`
                    <button type="button" class="moments-back" title=${this.msg.back} @click=${() => this.backToFeed()}>${collab_chevron_left}</button>
                `}
                <button type="button" title=${this.msg.newMoment} @click=${() => this.openView('new')}>${collab_plus}</button>
                <button type="button" title=${this.msg.stats} @click=${() => this.openView('stats')}>${collab_signal}</button>
                <button type="button" title=${this.msg.publishers} @click=${() => this.openView('publishers')}>${collab_gear}</button>
            </header>
            ${this.hasNewMoments ? html`
                <button type="button" class="moments-new" @click=${() => { void this.loadFeed(); }}>${this.msg.newMoments}</button>
            ` : nothing}
        `;
    }

    private async toggleReaction(item: MomentsFeedItem, reaction: string) {
        const userId = this.currentUserId();
        if (!userId) return;
        const previous = item.message.reactions;
        const current = previous ?? {};
        const next: Record<string, string[]> = {};
        for (const [name, users] of Object.entries(current)) {
            const filtered = users.filter((id) => id !== userId);
            if (filtered.length) next[name] = filtered;
        }
        if (!current[reaction]?.includes(userId)) {
            next[reaction] = [...(next[reaction] ?? []), userId];
        }
        const apply = (reactions: MomentsFeedItem['message']['reactions']) => {
            item.message = { ...item.message, reactions };
            this.items = this.items.map((row) => row === item ? { ...row, message: item.message } : row);
        };
        apply(Object.keys(next).length ? next : undefined);
        try {
            const result = await msgUpdateMessage({
                messageId: item.message.orderAt,
                threadId: item.threadId,
                userId,
                reaction,
            });
            if (!result.success || !result.response?.message) {
                throw new Error(result.error || 'Failed to update message reaction');
            }
        } catch (err) {
            console.error(err);
            apply(previous);
        }
    }

    private renderCard(item: MomentsFeedItem, index: number) {
        const userId = this.currentUserId();
        const reactions = item.message.reactions ?? {};
        return html`
            <article class="moment-card" data-index=${index}>
                <header class="moment-head">
                    ${item.publisher.avatar_url
                        ? html`<img class="moment-avatar" src=${item.publisher.avatar_url} alt="">`
                        : html`<span class="moment-avatar"></span>`}
                    <span class="moment-name">${item.publisher.name}</span>
                    <time class="moment-date">${this.formatWhen(item.message.createAt)}</time>
                </header>
                <div class="moment-body">
                    <collab-messages-rich-preview-text-102025 .text=${item.message.content}></collab-messages-rich-preview-text-102025>
                </div>
                <footer class="moment-foot">
                    ${Object.entries(REACTION_EMOJIS).map(([name, emoji]) => html`
                        <button
                            type="button"
                            class="moment-reaction ${reactions[name]?.includes(userId) ? 'is-mine' : ''}"
                            @click=${() => { void this.toggleReaction(item, name); }}
                        >${emoji} ${reactions[name]?.length ?? 0}</button>
                    `)}
                    ${this.isOwn(item) ? html`<span class="moment-reach">${collab_eye} ${item.reach ?? 0}</span>` : nothing}
                </footer>
            </article>
        `;
    }

    private renderEnd() {
        return html`
            <section class="moment-end">
                <p>${this.msg.caughtUp}</p>
                <button type="button" @click=${() => { void this.loadFeed(); }}>${this.msg.refresh}</button>
            </section>
        `;
    }

    private async loadStats() {
        const userId = this.currentUserId();
        if (!userId) return;
        this.statsLoading = true;
        this.statsError = '';
        try {
            const result = await msgGetMomentsStats({ userId });
            if (!result.ok) {
                console.error(result.error);
                this.statsError = result.error || this.msg.networkError;
                this.statsPosts = [];
                return;
            }
            this.audience = result.response.audience ?? 0;
            this.statsPosts = result.response.posts ?? [];
        } catch (err) {
            console.error(err);
            this.statsError = err instanceof Error ? err.message : this.msg.networkError;
            this.statsPosts = [];
        } finally {
            this.statsLoading = false;
        }
    }

    private onPublished = () => {
        this.view = 'feed';
        void this.loadFeed();
    };

    override render() {
        const lang = this.getMessageKey(messages);
        this.msg = messages[lang];
        return html`
            <div class="moments-shell">
                ${this.renderTop()}
                ${this.renderBody()}
            </div>
        `;
    }

    private renderBody() {
        const userId = this.currentUserId();
        if (this.view === 'new') {
            return html`
                <collab-messages-moments-new-102025
                    .userId=${userId}
                    @moments-published=${this.onPublished}
                ></collab-messages-moments-new-102025>
            `;
        }
        if (this.view === 'stats') return this.renderStats();
        if (this.view === 'publishers') {
            return html`<collab-messages-settings-moments-102025></collab-messages-settings-moments-102025>`;
        }
        return this.renderFeed();
    }

    private renderStats() {
        if (this.statsLoading && this.statsPosts.length === 0 && !this.statsError) {
            return html`<p class="moments-status">${this.msg.loading}</p>`;
        }
        if (this.statsError) {
            return html`
                <div class="moments-status">
                    <p>${this.statsError}</p>
                    <button type="button" @click=${() => { void this.loadStats(); }}>${this.msg.retry}</button>
                </div>
            `;
        }
        return html`
            <ul class="moments-stats">
                ${this.statsPosts.map((post) => html`
                    <li class="moments-stats-card">
                        <time>${this.formatWhen(post.createAt)}</time>
                        <collab-messages-rich-preview-text-102025 .text=${post.preview}></collab-messages-rich-preview-text-102025>
                        <p>${this.msg.reachOf.replace('{reach}', String(post.reach)).replace('{audience}', String(this.audience))}</p>
                        <span>${post.reactions} ${this.msg.reactions}</span>
                    </li>
                `)}
            </ul>
        `;
    }

    private renderFeed() {
        if (this.loading && this.items.length === 0 && !this.error) {
            return html`<p class="moments-status">${this.msg.loading}</p>`;
        }
        if (this.error) {
            return html`
                <div class="moments-status">
                    <p>${this.error}</p>
                    <button type="button" @click=${() => { this.loadedFor = ''; void this.loadFeed(); }}>${this.msg.retry}</button>
                </div>
            `;
        }
        return html`
            <div class="moments-feed">
                ${this.items.map((item, index) => this.renderCard(item, index))}
                ${this.renderEnd()}
            </div>
        `;
    }
}
