/// <mls fileReference="_102025_/l2/collabMessagesChatMessage.ts" enhancement="_102027_/l2/enhancementLit" />

import { html, nothing, LitElement, TemplateResult } from 'lit';
import {until } from 'lit/directives/until.js';
import { customElement, property, state } from 'lit/decorators.js';
import {
    collab_translate,
    collab_circle_exclamation,
	    collab_smile,
	    collab_chevron_down,
    collab_reply,
    collab_copy,
    collab_pin,
    collab_star,
    collab_edit,
    collab_delete
} from '/_102025_/l2/collabMessagesIcons.js';

import { loadChatPreferences, formatTimestamp } from '/_102025_/l2/collabMessagesHelper.js';
import { getMessage, updateMessage } from '/_102025_/l2/collabMessagesIndexedDB.js';
import { msgUpdateMessage } from '/_102025_/l2/shared/api.js';
import { hasTaskNotificationPending } from '/_102025_/l2/collabMessagesSyncNotifications.js';

import * as msg from '/_102025_/l2/shared/interfaces.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import { IChatPreferences, IMessage, IThreadInfo } from '/_102025_/l2/collabMessagesHelper.js';

/// **collab_i18n_start**
const message_pt = {
    loading: 'Carregando...',
    msgNotSend: 'Mensagem não enviada*',
    reply: 'Responder',
    copy: 'Copiar',
    pin: 'Fixar',
    unpin: 'Desfixar',
    favorite: 'Favoritar',
    unfavorite: 'Remover favorito',
    requestReadConfirmation: 'Confirmação de leitura',
    cancelReadConfirmation: 'Cancelar confirmação de leitura',
    confirmRead: 'Recebi e li a mensagem',
    allConfirmedRead: 'Confirmado que todos receberam',
    requestedReadConfirmation: 'pediu confirmação de leitura em',
    confirmedRead: 'confirmou leitura em',
    canceledReadConfirmation: 'cancelou confirmação de leitura em',
    notConfirmedRead: 'não confirmado',
    delete: 'Apagar',
    edit: 'Editar',
    you: 'Você',
    reactions: 'reações',
    reaction: 'reação',
    clickToRemove: 'Clique para remover',
}

const message_en = {
    loading: 'Loading...',
    msgNotSend: 'Message not sent*',
    reply: 'Reply',
    copy: 'Copy',
    pin: 'Pin',
    unpin: 'Unpin',
    favorite: 'Favorite',
    unfavorite: 'Remove favorite',
    requestReadConfirmation: 'Read confirmation',
    cancelReadConfirmation: 'Cancel read confirmation',
    confirmRead: 'I received and read the message',
    allConfirmedRead: 'Confirmed that everyone received it',
    requestedReadConfirmation: 'requested read confirmation at',
    confirmedRead: 'confirmed reading at',
    canceledReadConfirmation: 'canceled read confirmation at',
    notConfirmedRead: 'not confirmed',
    delete: 'Delete',
    edit: 'Edit',
    you: 'You',
    reactions: 'reactions',
    reaction: 'reaction',
    clickToRemove: 'Click to remove',

}

type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = {
    'en': message_en,
    'pt': message_pt
}
/// **collab_i18n_end**

@customElement('collab-messages-chat-message-102025')
export class CollabMessagesChatMessage102025 extends StateLitElement {

    @property() message?: IMessage;
    @property({ reflect: true }) messageId?: string;
    @property({ attribute: false }) allThreads: msg.Thread[] = [];
    @property() actualThread: IThreadInfo | undefined;
    @property() usersAvaliables: msg.User[] = [];
    @property() currentUser: msg.User | undefined;
    @property() userId: string | undefined;
    @property({ attribute: false }) openedReactionMessageId?: string;
    @property({ attribute: false }) reactionPickerTarget?: HTMLElement;
    @property() openedMenuFor?: string;
    @property() messageMenuTarget?: HTMLElement;
    @property() openedReactionListMessageId?: string;
    @property() reactionListTarget?: HTMLElement;

    @state() userPreferenceChat?: IChatPreferences;
    @state() private messageMenuPlacement: 'top' | 'bottom' = 'bottom';
    @state() private reactionListPlacement: 'top' | 'bottom' = 'top';

    public onTaskClick?: Function;
    private msg: MessageType = messages['en'];

    private readonly reactionEmojis: Record<string, string> = {
        thumbs_up: '👍',
        laugh: '😂',
        heart: '❤️',
        wow: '😮',
        sad: '😢',
        angry: '😡'
    } as const;


    updated() {
        this.positionReactionPicker();
        this.positionMessageMenu();
        this.animateReactionPicker();
        this.updateMessageMenuPlacement();
        // this.positionReactionListPopup();
        this.updateReactionListPlacement();

    }


    render() {
        const lang = this.getMessageKey(messages);
        this.msg = messages[lang];
        this.userPreferenceChat = loadChatPreferences();
        return this.renderMessage();
    }

    private renderMessage() {
        const message = this.message;
        if (!message) return html`${nothing}`
        const isSame = message.isSame;
        const dateFormated = formatTimestamp(message.createAt);
        const userToFind = [
            ...this.usersAvaliables,
            ...(this.actualThread?.users || [])
        ].filter(
            (user, index, self) =>
                index === self.findIndex(u => u.userId === user.userId)
        );

        const userName = userToFind.find((user) => user.userId === message.senderId)?.name || message.senderId;
        const userAvatar = userToFind.find((user) => user.userId === message.senderId)?.avatar_url || '';
        const cls = message.senderId === this.userId ? 'user' : 'system';
        const titleTranslated = this.getTitleMessageTranslated(message);
        const hasReactions = message.reactions ? Object.keys(message.reactions).length > 0 : false;
        return html`
            <div class="message ${cls} ${isSame ? 'same' : ''} ${hasReactions ? 'reaction-on' : ''}">
                <div class="message-group">
                    <div class="message-row">
                        ${cls === 'user' ? this.renderReactionButtonAdd(message) : nothing}
                    
                        <div class="message-card ${cls} ${isSame ? 'same' : ''} ${this.isPinned(message) ? 'pinned' : ''}">

                            ${this.renderSubMenuButton(message)}
                            ${this.renderMessageMenu(message)}
                            ${!isSame ? html`<div class="message-title">@${userName}</div>` : ``}
                            ${message.replyTo ? this.renderReplyPreview(message.replyTo) : nothing}
                            ${this.renderMessageByLanguage(message)}
                            ${message.isLoading ? html`<span class="loader"></span>` : ''}
                            ${message.isFailed ? html`<div class="failed">
                            <div>
                                <span>${collab_circle_exclamation}</span>
                                <small>${this.msg.msgNotSend}</small>
                            </div>
                            <small>${message.isFailedError}</small>
                        </div>`: ''}
                        
                        ${message.taskId ? html`
                            <div class="message-ai">
                                <collab-messages-task-102025
                                    messageId=${this.getMessageOrderAt(message)}
                                    .context= ${message.context}
                                    lastChanged= ${message.lastChanged}
                                    taskId=${message.taskId}
                                    threadId=${this.actualThread?.thread.threadId}
                                    userId=${this.userId}
                                    title=${titleTranslated}
                                    status=${message.taskStatus}
                                    .notificationPending=${hasTaskNotificationPending(message.taskId)}
                                    @taskclick=${() => { if (this.onTaskClick) this.onTaskClick(message?.taskId || '', this.getMessageOrderAt(message), message.threadId, message) }}
                                >
                                </collab-messages-task-102025>
                            </div> `: html``
                            }
                            ${this.renderMessageResultByLanguage(message)}
                            ${this.renderReadConfirmations(message)}
                            ${this.renderMessageFooterResult(message)}
                            ${this.renderReactions(message)}
                            ${this.renderReactionPicker(message)}
                            <div class="message-footer">${dateFormated?.timeShort}</div>
                        </div>
                        ${cls === 'system' ? this.renderReactionButtonAdd(message) : nothing}
                        ${cls === 'system' && !isSame ? html`<collab-messages-avatar-102025 avatar=${userAvatar} alt=${userName} ></collab-messages-avatar-102025>` : ''}
                    </div>
                </div>
            </div>

         `;
    }

    private renderMessageByLanguage(message: msg.Message) {
        const mode = this.userPreferenceChat?.translationMode || 'icon';
        if (!this.userPreferenceChat || mode === 'none' || !message.translations) {
            return html`
            <div class="message-content">
                ${this.renderCollabMessagesRichPreview(message.content)} 
            </div>`
        }
        const { language } = this.userPreferenceChat;
        const messageByLanguagePref = message.translations ? message.translations[language] : '';
        const isSameLanguege = language === message.language_detected;
        switch (mode) {
            case 'icon':
                return html`
                <div class="message-content">
                    ${this.renderCollabMessagesRichPreview(messageByLanguagePref || message.content)} 
                     ${!isSameLanguege ? collab_translate : ''}
                </div>`;
            case 'text':
                return html`
                <div class="message-content">
                    ${this.renderCollabMessagesRichPreview(messageByLanguagePref || message.content)}   
                </div>
                ${!isSameLanguege ?
                        html`<small class="message-content translate">
                            ${this.renderCollabMessagesRichPreview(message.content)}   
                        </small>`
                        : ''}`;
            case 'iconText':
                return html`
                    <div class="message-content">
                        ${this.renderCollabMessagesRichPreview(messageByLanguagePref || message.content)}   
                        ${!isSameLanguege ? collab_translate : ''}
                    </div>
                ${!isSameLanguege ?
                        html`<small class="message-content translate">
                        ${this.renderCollabMessagesRichPreview(message.content)}    
                    </small>`
                        : ''
                    }`;
            case 'trace':
                return html`
                <div class="message-content trace">
                    <div>
                        <b>[LanguageDetected: ${message.language_detected}]</b>
                        ${this.renderCollabMessagesRichPreview(message.content)}   
                    </div>
                    ${Object.keys(message.translations).map((key) => {
                    if (key === 'language_detected') return ''
                    if (key === message.language_detected) return ''
                    return html`
                            <div>
                                <b>[${key}]</b>
                                ${this.renderCollabMessagesRichPreview(message.translations ? message.translations[key] : '')}                        
                            </div>`
                })}
                </div>`
            default:
                return null;
        }
    }


    private replyCache = new Map<string, Promise<TemplateResult>>();

    private renderReplyPreview(replyId: string) {

        if (!this.replyCache.has(replyId)) {
            this.replyCache.set(replyId, this.loadReplyPreview(replyId));
        }

        return until(
            this.replyCache.get(replyId),
            html`<div class="message-reply-preview loading">${this.msg.loading}</div>`
        );
    }

    private async loadReplyPreview(replyId: string) {

        if (!this.actualThread) return html`${nothing}`;
        const messageId = this.normalizeMessageId(this.actualThread.thread.threadId, replyId);
        const reply = await getMessage(messageId);
        if (!reply) return html`${nothing}`

        const user =
            this.usersAvaliables.find(u => u.userId === reply.senderId) ||
            this.actualThread?.users?.find(u => u.userId === reply.senderId);

        let name: string = reply.senderId;
        if (user?.name) {
            name = user.userId === this.userId ? this.msg.you : '@' + user.name;
        }

        return html`
        <div
            class="message-reply-preview"
            @click=${() => this.onReplyPreviewClick(reply.createAt)}
        >
            <div class="message-reply-bar"></div>

            <div class="message-reply-content">
                <div class="message-reply-user">
                    ${name}
                </div>

                <div class="message-reply-text">
                    ${this.renderCollabMessagesRichPreview(reply.content)}  
                </div>
            </div>
        </div>
    `;
    }

    private onReplyPreviewClick(messageId: string) {
        this.dispatchEvent(new CustomEvent('reply-preview-click', {
            detail: { messageId },
            bubbles: true,
            composed: true
        }));
    }

    private renderMessageResultByLanguage(message: msg.Message) {

        if (!message.taskResults || message.taskResults.length === 0 || message.taskStatus !== 'done') return html``;
        const mode = this.userPreferenceChat?.translationMode || 'icon';
        if (!this.userPreferenceChat || mode === 'none') {
            return html`<div class="message-content">${message.taskResults[0]}</div>`
        }
        const response = message.taskResults[0];
        const { language } = this.userPreferenceChat;
        const messageByLanguagePref = message.taskResultsTranslated ? message.taskResultsTranslated[language] : '';
        const isSameLanguege = language === message.taskResultsTranslated?.language_detected;

        switch (mode) {
            case 'icon':
                return html`<div class="message-content">${messageByLanguagePref || response} ${!isSameLanguege ? collab_translate : ''}</div>`;
            case 'text':
                return html`
                <div class="message-content">${messageByLanguagePref || response}</div>
                ${!isSameLanguege ? html`<small class="message-content translate">${response}</small>` : ''}`;
            case 'iconText':
                return html`<div class="message-content">${messageByLanguagePref || response} ${!isSameLanguege ? collab_translate : ''}</div>
                ${!isSameLanguege ? html`<small class="message-content translate">${response}</small>` : ''}`;
            case 'trace':
                return html`<div class="message-content trace">
                <div><b>[LanguageDetected: ${message.language_detected}]</b> ${response}</div>
                ${Object.keys(message.taskResultsTranslated || {}).map((key) => {
                    if (key === 'language_detected') return ''
                    if (key === message.taskResultsTranslated?.language_detected) return ''
                    return html`<div><b>[${key}]</b> ${message.taskResultsTranslated ? message.taskResultsTranslated[key] : ''}</div>`
                })}
                </div>`
            default:
                return null;
        }
    }

    private renderReadConfirmations(message: msg.Message) {
        if (!message.readConfirmations || message.readConfirmations.length === 0) return nothing;
        const statusByUser = this.getReadConfirmationStatusByUser(message.readConfirmations);
        return html`
            <div class="message-read-confirmations">
                <div class="message-read-confirmation">
                    ${message.readConfirmations.map(request => html`
                        <div class="read-confirmation-line">
                            ${this.renderUserLabel(request.requestedBy)}
                            <span>${this.msg.requestedReadConfirmation}</span>
                            <span class="read-confirmation-time">${this.formatLocalDateTime(request.requestedAt)}</span>
                        </div>
                    `)}
                    ${statusByUser.map(({ userId, confirmedAt }) => html`
                        <div class="read-confirmation-line ${confirmedAt ? 'confirmed' : 'pending'}">
                            ${this.renderUserLabel(userId)}
                            ${confirmedAt ? html`
                                <span>${this.msg.confirmedRead}</span>
                                <span class="read-confirmation-time">${this.formatLocalDateTime(confirmedAt)}</span>
                            ` : html`<span>${this.msg.notConfirmedRead}</span>`}
                        </div>
                    `)}
                    ${message.readConfirmations.map(request => request.canceledAt ? html`
                        <div class="read-confirmation-line canceled">
                            ${this.renderUserLabel(request.canceledBy || request.requestedBy)}
                            <span>${this.msg.canceledReadConfirmation}</span>
                            <span class="read-confirmation-time">${this.formatLocalDateTime(request.canceledAt)}</span>
                        </div>
                    ` : nothing)}
                </div>
            </div>
        `;
    }

    private getReadConfirmationStatusByUser(readConfirmations: msg.MessageReadConfirmation[]) {
        const statusByUser = new Map<string, { userId: string; confirmedAt?: string }>();
        for (const request of readConfirmations) {
            for (const userId of request.targetUserIds) {
                const confirmedAt = request.confirmedBy?.[userId];
                const current = statusByUser.get(userId);
                if (!current) {
                    statusByUser.set(userId, { userId, confirmedAt });
                    continue;
                }
                if (!current.confirmedAt && confirmedAt) {
                    statusByUser.set(userId, { userId, confirmedAt });
                }
            }
        }
        return [...statusByUser.values()];
    }

    private renderUserLabel(userId: string) {
        const user = this.findUser(userId);
        return html`<span class="read-confirmation-user">@${user?.name || userId}</span>`;
    }

    private formatLocalDateTime(timestamp: string): string {
        return formatTimestamp(timestamp)?.dateFull || timestamp;
    }

    private renderMessageFooterResult(message: msg.MessagePerformanceCache) {

        if (!message.footers || message.footers.length === 0) return html``;
        return html`<div class="message-result">
            ${message.footers?.map((footer) => {
            const content = footer.lines.join('\n').trim();
            if (!content) return html``;
            return html`
                <div class="message-result-text">
                    <b>${footer.title?.trim()}</b>
                    <div>
                        ${this.renderCollabMessagesRichPreview(footer.lines.join('\n').trim())}                    
                    </div>
                </div>`
        })}
        </div>`

    }

    private renderCollabMessagesRichPreview(text: string) {
        if (text.trim().startsWith('@@')) text = text.slice(0, 300) + (text.length > 300 ? '...' : '');
        return html`
        <collab-messages-rich-preview-text-102025 
            @mention-hover=${this.onMentionHover}
            @channel-hover=${this.onChannelHover}
            .allUsers=${this.usersAvaliables} 
            .allThreads=${this.allThreads}
            text="${text}"
        ></collab-messages-rich-preview-text-102025>`
    }

    private async onMentionHover(ev: CustomEvent) {

        this.removeAllUserModal();
        if (!ev.detail || !ev.detail.userId || !ev.detail.element) return;
        const actualUserModal = this.usersAvaliables.find((user) => user.userId === ev.detail.userId);
        if (!actualUserModal) return;
        const rects = (ev.detail.element as HTMLElement).getBoundingClientRect();
        const modal = document.createElement('collab-messages-user-modal-102025');
        (modal as any).user = actualUserModal;
        (modal as any).setAttribute('actualUserId', this.userId);
        this.appendChild(modal);
        await (modal as LitElement).updateComplete;
        const rectsModal = modal.getBoundingClientRect();
        modal.style.top = (rects.top - rectsModal.height - rects.height - 70) + 'px';
        modal.style.left = '20px';

    }


    private async onChannelHover(ev: CustomEvent) {

        this.removeAllChannelModal();
        if (!ev.detail || !ev.detail.threadId || !ev.detail.element) return;
        const actualThreadModal = this.allThreads.find((thread) => thread.threadId === `${ev.detail.threadId}`);
        if (!actualThreadModal) return;
        const rects = (ev.detail.element as HTMLElement).getBoundingClientRect();
        const modal = document.createElement('collab-messages-thread-modal-102025');
        (modal as any).thread = actualThreadModal;
        this.appendChild(modal);
        await (modal as LitElement).updateComplete;
        const rectsModal = modal.getBoundingClientRect();
        modal.style.top = (rects.top - rectsModal.height - rects.height - 70) + 'px';
        modal.style.left = '20px';

    }

    private removeAllUserModal() {
        const all = this.querySelectorAll('collab-messages-user-modal-102025');
        all.forEach((item) => item.remove());
    }

    private removeAllChannelModal() {
        const all = this.querySelectorAll('collab-messages-thread-modal-102025');
        all.forEach((item) => item.remove());
    }

    private getTitleMessageTranslated(message: msg.Message) {
        const mode = this.userPreferenceChat?.translationMode || 'icon';
        if (!this.userPreferenceChat || mode === 'none' || !message.taskTitleTranslated) {
            return message.taskTitle;
        }
        const { language } = this.userPreferenceChat;
        const titleByLanguagePref = message.taskTitleTranslated ? (message.taskTitleTranslated[language] ? message.taskTitleTranslated[language] : message.taskTitle) : message.taskTitle;
        return titleByLanguagePref;
    }


    //Reactions

    private renderReactions(message: IMessage) {
        if (!message.reactions) return nothing;

        const totalReactions = Object.values(message.reactions).reduce((acc, users) => acc + users.length, 0);
        if (totalReactions === 0) return nothing;

        return html`
        <div class="message-reactions">
            <button 
                class="reactions-summary"
                @click=${(ev: Event) => this.openReactionList(message, ev)}
            >
                ${Object.entries(message.reactions).map(([name, users]) => {
            const emoji = this.reactionEmojis[name];
            if (!emoji || users.length === 0) return nothing;
            return html`<span class="reaction-emoji">${emoji}</span>`;
        })}
                <span class="reaction-count">${totalReactions}</span>
            </button>
            ${this.renderReactionListPopup(message)}
        </div>
    `;
    }

    private renderReactionListPopup(message: IMessage) {
        if (this.openedReactionListMessageId !== message.createAt) return nothing;
        if (!message.reactions) return nothing;

        const allReactions: Array<{ userId: string; emoji: string; reactionName: string }> = [];

        Object.entries(message.reactions).forEach(([name, users]) => {
            const emoji = this.reactionEmojis[name];
            if (emoji) {
                users.forEach(userId => {
                    allReactions.push({ userId, emoji, reactionName: name });
                });
            }
        });

        allReactions.sort((a, b) => {
            if (a.userId === this.userId) return -1;
            if (b.userId === this.userId) return 1;
            return 0;
        });

        const totalCount = allReactions.length;
        const reactionWord = totalCount === 1 ? this.msg.reaction : this.msg.reactions;

        return html`
        <div class="reaction-list-popup ${this.reactionListPlacement}">
            <div class="reaction-list-header">
                ${totalCount} ${reactionWord}
            </div>
            <div class="reaction-list-divider"></div>
            <div class="reaction-list-content">
                ${allReactions.map(({ userId, emoji, reactionName }) => {

            const user = this.findUser(userId);
            const userName = user?.name || userId;
            const userAvatar = user?.avatar_url || '';
            const isCurrentUser = userId === this.userId;

            return html`
                        <div 
                            class="reaction-list-item ${isCurrentUser ? 'current-user' : ''}"
                            @click=${() => isCurrentUser ? this.removeReactionFromList(message, reactionName) : null}
                        >
                            <div class="reaction-list-user">
                                <collab-messages-avatar-102025 
                                    avatar=${userAvatar}
                                    alt=${userName}
                                ></collab-messages-avatar-102025>
                                <div class="reaction-list-detail">
                                    <span class="reaction-list-name">
                                        ${isCurrentUser ? this.msg.you : userName}
                                    </span>
                                    ${isCurrentUser ? html`<small class="reaction-list-small">${this.msg.clickToRemove}</small>` : nothing}
                                </div>

                            </div>
                            <span class="reaction-list-emoji">${emoji}</span>
                        </div>
                    `;
        })}
            </div>
        </div>
    `;
    }

    private findUser(userId: string): msg.User | undefined {
        return [
            ...this.usersAvaliables,
            ...(this.actualThread?.users || [])
        ].find(user => user.userId === userId);
    }

    private openReactionList(message: IMessage, ev: Event) {
        ev.stopPropagation();

        if (this.openedReactionListMessageId === message.createAt) {
            this.closeReactionList();
            return;
        }

        this.closeAllPopups();
        this.openedReactionListMessageId = message.createAt;
        this.reactionListTarget = ev.currentTarget as HTMLElement;

        this.updateReactionListPlacement();
    }

    private updateReactionListPlacement() {
        if (!this.reactionListTarget) return;

        const popup = this.renderRoot.querySelector(
            '.reaction-list-popup'
        ) as HTMLElement | null;

        if (!popup) return;

        const targetRect = this.reactionListTarget.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - targetRect.bottom;
        const spaceAbove = targetRect.top;
        const shouldOpenTop = spaceBelow < popupRect.height && spaceAbove > spaceBelow;

        this.reactionListPlacement = shouldOpenTop ? 'top' : 'bottom';

        requestAnimationFrame(() => {
            popup.classList.add('open');
        });
    }

    private removeReactionFromList(message: IMessage, reactionName: string) {
        if (!this.userId) return;

        const updated = this.toggleReaction(message, reactionName, this.userId);
        this.message = updated;

        const totalReactions = updated.reactions
            ? Object.values(updated.reactions).reduce((acc, users) => acc + users.length, 0)
            : 0;

        if (totalReactions === 0) {
            this.closeReactionList();
        }
    }

    private closeReactionList() {
        this.openedReactionListMessageId = undefined;
        this.reactionListTarget = undefined;
    }

    private renderReactionButtonAdd(message: IMessage) {
        return html`
            <button
                class="reaction add"
                @click=${(ev: Event) => this.openReactionPicker(message, ev)}
            >
                ${collab_smile}
            </button>
        `
    }

    private renderReactionPicker(message: IMessage) {
        if (this.openedReactionMessageId !== message.createAt) return nothing;

        return html`
        <div class="reaction-picker">
            ${Object.entries(this.reactionEmojis).map(([name, emoji]) => html`
                <button
                    class="reaction-picker-item"
                    @click=${() => this.onPickerEmojiSelect(message, name)}
                >
                    ${emoji}
                </button>
            `)}
        </div>
    `;
    }


    private onPickerEmojiSelect(message: IMessage, emoji: string) {
        if (!this.userId) return;
        const updated = this.toggleReaction(message, emoji, this.userId);
        this.message = updated;
        this.closeReactionPicker();
    }


    private openReactionPicker(message: IMessage, ev?: Event) {
        ev?.stopPropagation();

        if (this.openedReactionMessageId === message.createAt) {
            this.closeReactionPicker();
            return;
        }

        this.closeReactionPicker();
        this.openedReactionMessageId = message.createAt;
        this.reactionPickerTarget = ev?.currentTarget as HTMLElement;
    }

    private closeReactionPicker() {
        this.openedReactionMessageId = undefined;
        this.reactionPickerTarget = undefined;
        this.closeAllPopups();
    }


    private toggleReaction(
        message: IMessage,
        reaction: string,
        userId: string
    ): IMessage {


        const current = message.reactions ?? {};
        const next: Record<string, string[]> = {};

        for (const [name, users] of Object.entries(current)) {
            const filtered = users.filter(id => id !== userId);
            if (filtered.length) {
                next[name] = filtered;
            }
        }

        if (!current[reaction]?.includes(userId)) {
            next[reaction] = [...(next[reaction] ?? []), userId];
        }

        this.updateReactionOnDb(message, reaction)

        return {
            ...message,
            reactions: Object.keys(next).length ? next : undefined,
            lastChanged: Date.now()
        };
    }

    private async updateReactionOnDb(message: IMessage, reaction: string) {
        if (!this.actualThread?.thread.threadId) throw new Error('Invalid thread id');
        if (!this.userId) throw new Error('Invalid user id');

        const result = await msgUpdateMessage({
            messageId: message.createAt,
            threadId: this.actualThread.thread.threadId,
            userId: this.userId,
            reaction,
        });

        if (!result.success || !result.response?.message) {
            throw new Error(result.error || 'Failed to update message reaction');
        }

        this.message = {
            ...result.response.message,
            footers: message.footers
        };

        await updateMessage(this.message);
    }

    private animateReactionPicker() {
        const picker = this.querySelector(
            '.reaction-picker'
        ) as HTMLElement | null;

        if (!picker) return;
        const items = Array.from(
            picker.querySelectorAll('.reaction-picker-item')
        ) as HTMLElement[];

        requestAnimationFrame(() => {
            picker.classList.add('open');
            items.forEach((el, i) => {
                setTimeout(() => {
                    el.classList.add('show');
                }, 65 * i);
            });
        });
    }

    private positionReactionPicker() {
        if (!this.reactionPickerTarget) return;

        const picker = this.querySelector(
            '.reaction-picker'
        ) as HTMLElement | null;

        if (!picker) return;

        const btnRect = this.reactionPickerTarget.getBoundingClientRect();
        const pickerRect = picker.getBoundingClientRect();

        const parent = picker.offsetParent as HTMLElement;
        const parentRect = parent.getBoundingClientRect();

        const GAP = 8;

        const top =
            btnRect.top -
            parentRect.top -
            pickerRect.height -
            GAP;

        picker.style.top = `${Math.max(top, 4)}px`;
        picker.style.bottom = 'auto';

        if (parent.classList.contains('user')) {
            picker.style.right = '0';
            picker.style.left = 'auto';
        } else {
            picker.style.left = '0';
            picker.style.right = 'auto';
        }
    }


    // REPLY

    private renderSubMenuButton(message: IMessage) {
        return html`
        <button
            class="message-action submenu"
            @click=${(ev: Event) => this.openMessageMenu(message, ev)}
        >
            ${collab_chevron_down}
        </button>
    `;
    }

    private openMessageMenu(message: IMessage, ev: Event) {
        ev.stopPropagation();

        if (this.openedMenuFor === message.createAt) {
            this.closeMessageMenu();
            return;
        }
        this.closeMessageMenu();
        this.openedMenuFor = message.createAt;
        this.messageMenuTarget = ev.currentTarget as HTMLElement;
    }

    private positionMessageMenu() {

        if (!this.messageMenuTarget) return;

        const submenu = this.querySelector(
            '.message-menu'
        ) as HTMLElement | null;

        if (!submenu) return;

        const btnRect = this.messageMenuTarget.getBoundingClientRect();
        const pickerRect = submenu.getBoundingClientRect();
        const parent = submenu.offsetParent as HTMLElement;
        const parentRect = parent.getBoundingClientRect();
        const GAP = 8;
        const VIEWPORT_GAP = 8;

        const spaceBelow = window.innerHeight - btnRect.bottom;
        let top: number;

        if (spaceBelow >= pickerRect.height + GAP) {
            top =
                btnRect.bottom -
                parentRect.top +
                GAP;
        } else {
            top =
                btnRect.top -
                parentRect.top -
                pickerRect.height -
                GAP;
        }

        submenu.style.top = `${top}px`;
        submenu.style.bottom = 'auto';

        if (parent.classList.contains('user')) {
            submenu.style.right = '10px';
            submenu.style.left = 'auto';
        } else {
            submenu.style.left = '10px';
            submenu.style.right = 'auto';
        }

        const menuRect = submenu.getBoundingClientRect();
        if (menuRect.left < VIEWPORT_GAP) {
            const currentLeft = parseFloat(submenu.style.left || '0') || 0;
            submenu.style.left = `${currentLeft + VIEWPORT_GAP - menuRect.left}px`;
            submenu.style.right = 'auto';
        } else if (menuRect.right > window.innerWidth - VIEWPORT_GAP) {
            const currentRight = parseFloat(submenu.style.right || '0') || 0;
            submenu.style.right = `${currentRight + menuRect.right - (window.innerWidth - VIEWPORT_GAP)}px`;
            submenu.style.left = 'auto';
        }
    }


    private closeMessageMenu() {
        this.openedMenuFor = undefined;
        this.messageMenuTarget = undefined;
        this.closeAllPopups();
    }

    private renderMessageMenu(message: IMessage) {
        if (this.openedMenuFor !== message.createAt) return nothing;
        const canCancelReadConfirmation = this.canCancelReadConfirmation(message);
        const canRequestReadConfirmation = this.getMentionedUserIds(message).length > 0 && !this.hasReadConfirmation(message);
        const canConfirmRead = this.hasPendingReadConfirmation(message);
        const allConfirmedRead = this.hasAllReadConfirmationsConfirmed(message);

        return html`
        <div class="message-menu ${this.messageMenuPlacement}">
            <button>
                ${collab_copy}
                ${this.msg.copy}
            </button>
            <button @click=${() => this.onReplyClick(message)}>
                ${collab_reply}
                ${this.msg.reply}
            </button>
            <button @click=${() => this.onPinClick(message)}>
                ${collab_pin}
                ${this.isPinned(message) ? this.msg.unpin : this.msg.pin}
            </button>
            <button @click=${() => this.onFavoriteClick(message)}>
                ${collab_star}
                ${this.isFavorite(message) ? this.msg.unfavorite : this.msg.favorite}
            </button>
            <button
                ?disabled=${!canRequestReadConfirmation && !canCancelReadConfirmation}
                @click=${() => this.onReadConfirmationClick(message, canCancelReadConfirmation ? 'cancel' : 'request')}
            >
                ${collab_circle_exclamation}
                ${canCancelReadConfirmation ? this.msg.cancelReadConfirmation : this.msg.requestReadConfirmation}
            </button>
            <button ?disabled=${!canConfirmRead} @click=${() => this.onReadConfirmationClick(message, 'confirm')}>
                ${collab_circle_exclamation}
                ${this.msg.confirmRead}
            </button>
            ${allConfirmedRead ? html`
                <button disabled>
                    ${collab_circle_exclamation}
                    ${this.msg.allConfirmedRead}
                </button>
            ` : nothing}
            <button>
                ${collab_edit}
                ${this.msg.edit}
            </button>
            <button>
                ${collab_delete}
                ${this.msg.delete}
            </button>
        
        </div>
    `;
    }

    private onReplyClick(message: IMessage) {
        this.closeMessageMenu();
        this.dispatchEvent(new CustomEvent('reply-message', {
            detail: message,
            bubbles: true,
            composed: true
        }));
    }

    private onPinClick(message: IMessage) {
        this.closeMessageMenu();
        this.dispatchEvent(new CustomEvent('pin-message', {
            detail: {
                message,
                pin: !this.isPinned(message)
            },
            bubbles: true,
            composed: true
        }));
    }

    private onFavoriteClick(message: IMessage) {
        this.closeMessageMenu();
        this.dispatchEvent(new CustomEvent('favorite-message', {
            detail: {
                message,
                favorite: !this.isFavorite(message)
            },
            bubbles: true,
            composed: true
        }));
    }

    private onReadConfirmationClick(message: IMessage, action: 'request' | 'confirm' | 'cancel') {
        this.closeMessageMenu();
        this.dispatchEvent(new CustomEvent('read-confirmation-message', {
            detail: {
                message,
                action
            },
            bubbles: true,
            composed: true
        }));
    }

    private isPinned(message: IMessage): boolean {
        const messageId = `${message.threadId}/${message.orderAt || message.createAt}`;
        return !!this.actualThread?.thread.pinnedMessages?.some(item => item.messageId === messageId);
    }

    private isFavorite(message: IMessage): boolean {
        const messageId = `${message.threadId}/${message.orderAt || message.createAt}`;
        return !!this.currentUser?.favorites?.includes(messageId);
    }

    private getMentionedUserIds(message: IMessage): string[] {
        if (!this.userId) return [];
        const usersInThread = new Set(this.actualThread?.thread.users.map(user => user.userId) || []);
        return [...message.content.matchAll(/\[@[^\]]+\]\(([^)]+)\)/g)]
            .map(match => match[1])
            .filter(userId => userId !== this.userId && usersInThread.has(userId))
            .filter((userId, index, items) => items.indexOf(userId) === index);
    }

    private hasReadConfirmation(message: IMessage): boolean {
        return !!message.readConfirmations?.length;
    }

    private hasPendingReadConfirmation(message: IMessage): boolean {
        if (!this.userId) return false;
        return !!message.readConfirmations?.some(request =>
            !request.canceledAt &&
            request.targetUserIds.includes(this.userId!) && !request.confirmedBy?.[this.userId!]
        );
    }

    private hasAllReadConfirmationsConfirmed(message: IMessage): boolean {
        if (!this.userId) return false;
        return !!message.readConfirmations?.some(request =>
            !request.canceledAt &&
            request.requestedBy === this.userId && request.targetUserIds.length > 0 &&
            request.targetUserIds.every(userId => !!request.confirmedBy?.[userId])
        );
    }

    private canCancelReadConfirmation(message: IMessage): boolean {
        if (!this.userId) return false;
        return !!message.readConfirmations?.some(request =>
            !request.canceledAt &&
            request.requestedBy === this.userId &&
            request.targetUserIds.some(userId => !request.confirmedBy?.[userId])
        );
    }

    private closeAllPopups() {
        if (!this.parentElement) return;

        const all = Array.from(this.parentElement.querySelectorAll('collab-messages-chat-message-102025')) as CollabMessagesChatMessage102025[];

        all.forEach((item: CollabMessagesChatMessage102025) => {
            item.openedReactionMessageId = undefined;
            item.reactionPickerTarget = undefined;
            item.openedMenuFor = undefined;
            item.messageMenuTarget = undefined;
            item.openedReactionListMessageId = undefined;
            item.reactionListTarget = undefined;
        });

    }

    private updateMessageMenuPlacement() {
        if (!this.messageMenuTarget) return;

        const menu = this.renderRoot.querySelector(
            '.message-menu'
        ) as HTMLElement | null;

        if (!menu) return;

        const targetRect = this.messageMenuTarget.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - targetRect.bottom;
        const spaceAbove = targetRect.top;
        const shouldOpenTop = spaceBelow < menuRect.height && spaceAbove > spaceBelow;
        this.messageMenuPlacement = shouldOpenTop ? 'top' : 'bottom';

        requestAnimationFrame(() => {
            menu.classList.add('open');
        });
    }

    private getMessageOrderAt(message: IMessage): string {
        const value = message.orderAt || message.createAt || '';
        const parts = value.split('/').filter(Boolean);
        return parts[parts.length - 1] || value;
    }

    private normalizeMessageId(threadId: string, messageIdOrOrderAt: string): string {
        const parts = messageIdOrOrderAt.split('/').filter(Boolean);
        const orderAt = parts[parts.length - 1] || messageIdOrOrderAt;
        return `${threadId}/${orderAt}`;
    }

}
