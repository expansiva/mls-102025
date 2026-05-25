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
    collab_delete,
    collab_paperclip,
    collab_ban,
    collab_link,
    collab_tasks,
    collab_bell_slash,
    collab_chevron_right,
    collab_clock_static,
    collab_xmark,
    collab_check
} from '/_102025_/l2/collabMessagesIcons.js';

import { loadChatPreferences, formatTimestamp } from '/_102025_/l2/collabMessagesHelper.js';
import { getMessage, updateMessage } from '/_102025_/l2/collabMessagesIndexedDB.js';
import { msgGetAttachmentUrl, msgUpdateMessage } from '/_102025_/l2/shared/api.js';
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
    copyLink: 'Copiar link',
    markUnread: 'Marcar como não lida',
    createTask: 'Criar task',
    forward: 'Encaminhar',
    pin: 'Fixar',
    unpin: 'Desfixar',
    favorite: 'Favoritar',
    unfavorite: 'Remover favorito',
    requestReadConfirmation: 'Confirmação de leitura',
    cancelReadConfirmation: 'Cancelar confirmação de leitura',
    confirmRead: 'Recebi e li a mensagem',
    allConfirmedRead: 'Confirmado que todos receberam',
    deletedMessage: 'Mensagem deletada',
    moderatedMessage: 'Mensagem moderada',
    deletedBy: 'deletada por',
    moderatedBy: 'moderada por',
    originalVisibleToModerators: 'conteúdo original visível para admins e moderadores',
    requestedReadConfirmation: 'pediu confirmação de leitura em',
    confirmedRead: 'confirmou leitura em',
    canceledReadConfirmation: 'cancelou confirmação de leitura em',
    notConfirmedRead: 'não confirmado',
    delete: 'Apagar',
    moderate: 'Moderar',
    edit: 'Editar',
    edited: 'editado',
    save: 'Salvar',
    cancel: 'Cancelar',
    viewHistory: 'Ver histórico',
    editHistory: 'Histórico de edições',
    originalMessage: 'Mensagem original',
    editedBy: 'Editada por',
    currentMessage: 'Mensagem atual',
    you: 'Você',
    reactions: 'reações',
    reaction: 'reação',
    clickToRemove: 'Clique para remover',
    attachmentRemoved: 'Anexo removido por',
    openAttachment: 'Abrir anexo',
    deleteAttachment: 'Apagar anexo',
}

const message_en = {
    loading: 'Loading...',
    msgNotSend: 'Message not sent*',
    reply: 'Reply',
    copy: 'Copy',
    copyLink: 'Copy link',
    markUnread: 'Mark as unread',
    createTask: 'Create task',
    forward: 'Forward',
    pin: 'Pin',
    unpin: 'Unpin',
    favorite: 'Favorite',
    unfavorite: 'Remove favorite',
    requestReadConfirmation: 'Read confirmation',
    cancelReadConfirmation: 'Cancel read confirmation',
    confirmRead: 'I received and read the message',
    allConfirmedRead: 'Confirmed that everyone received it',
    deletedMessage: 'Deleted message',
    moderatedMessage: 'Moderated message',
    deletedBy: 'deleted by',
    moderatedBy: 'moderated by',
    originalVisibleToModerators: 'original content visible to admins and moderators',
    requestedReadConfirmation: 'requested read confirmation at',
    confirmedRead: 'confirmed reading at',
    canceledReadConfirmation: 'canceled read confirmation at',
    notConfirmedRead: 'not confirmed',
    delete: 'Delete',
    moderate: 'Moderate',
    edit: 'Edit',
    edited: 'edited',
    save: 'Save',
    cancel: 'Cancel',
    viewHistory: 'View history',
    editHistory: 'Edit history',
    originalMessage: 'Original message',
    editedBy: 'Edited by',
    currentMessage: 'Current message',
    you: 'You',
    reactions: 'reactions',
    reaction: 'reaction',
    clickToRemove: 'Click to remove',
    attachmentRemoved: 'Attachment removed by',
    openAttachment: 'Open attachment',
    deleteAttachment: 'Delete attachment',

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
    @state() private isEditingMessage = false;
    @state() private editContent = '';
    @state() private showEditHistory = false;

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
        const isMessageContentHidden = this.isMessageContentHidden(message);
        return html`
            <div class="message ${cls} ${isSame ? 'same' : ''} ${hasReactions ? 'reaction-on' : ''}">
                <div class="message-group">
                    <div class="message-row">
                        ${cls === 'user' ? this.renderReactionButtonAdd(message) : nothing}
                    
                        <div class="message-card ${cls} ${isSame ? 'same' : ''} ${this.isPinned(message) ? 'pinned' : ''}">

                            ${this.renderSubMenuButton(message)}
                            ${this.renderMessageMenu(message)}
                            ${!isSame ? html`<div class="message-title">@${userName}</div>` : ``}
                            ${message.replyTo && !isMessageContentHidden ? this.renderReplyPreview(message.replyTo) : nothing}
                            ${this.isEditingMessage ? this.renderEditMessageForm(message) : this.renderMessageByLanguage(message)}
                            ${this.renderEditHistory(message)}
                            ${!isMessageContentHidden ? this.renderAttachments(message) : nothing}
                            ${message.isLoading ? html`<span class="loader"></span>` : ''}
                            ${message.isFailed ? html`<div class="failed">
                            <div>
                                <span>${collab_circle_exclamation}</span>
                                <small>${this.msg.msgNotSend}</small>
                            </div>
                            <small>${message.isFailedError}</small>
                        </div>`: ''}
                        
                        ${message.taskId && !isMessageContentHidden ? html`
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
                            ${!isMessageContentHidden ? this.renderMessageResultByLanguage(message) : nothing}
                            ${!isMessageContentHidden ? this.renderReadConfirmations(message) : nothing}
                            ${!isMessageContentHidden ? this.renderMessageFooterResult(message) : nothing}
                            ${!isMessageContentHidden ? this.renderReactions(message) : nothing}
                            ${!isMessageContentHidden ? this.renderReactionPicker(message) : nothing}
                            <div class="message-footer">
                                <span>${dateFormated?.timeShort}</span>
                                ${message.editedAt ? html`<small>${this.msg.edited}</small>` : nothing}
                            </div>
                        </div>
                        ${cls === 'system' ? this.renderReactionButtonAdd(message) : nothing}
                        ${cls === 'system' && !isSame ? html`<collab-messages-avatar-102025 avatar=${userAvatar} alt=${userName} ></collab-messages-avatar-102025>` : ''}
                    </div>
                </div>
            </div>

         `;
    }

    private renderMessageByLanguage(message: msg.Message) {
        if (message.moderation) {
            const notice = this.renderModerationNotice(message);
            if (this.isMessageContentHidden(message)) return notice;
            return html`${notice}${this.renderMessageContentByLanguage(message)}`;
        }
        return this.renderMessageContentByLanguage(message);
    }

    private renderMessageContentByLanguage(message: msg.Message) {
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

    private renderModerationNotice(message: msg.Message) {
        const moderation = message.moderation;
        if (!moderation) return nothing;
        const isDeleted = moderation.status === 'deleted';
        return html`
            <div class="message-moderation-notice ${moderation.status}">
                ${isDeleted ? collab_delete : collab_ban}
                <div>
                    <span>${isDeleted ? this.msg.deletedMessage : this.msg.moderatedMessage}</span>
                    <small>
                        ${isDeleted ? this.msg.deletedBy : this.msg.moderatedBy}
                        @${this.getUserName(moderation.by)}
                        ${this.formatLocalDateTime(moderation.at)}
                    </small>
                    ${!this.isMessageContentHidden(message) ? html`<small>${this.msg.originalVisibleToModerators}</small>` : nothing}
                </div>
            </div>
        `;
    }

    private renderEditMessageForm(message: msg.Message) {
        return html`
            <div class="message-edit-form">
                <textarea
                    .value=${this.editContent}
                    @input=${(ev: Event) => this.editContent = (ev.target as HTMLTextAreaElement).value}
                ></textarea>
                <div class="message-edit-actions">
                    <button @click=${() => this.onEditCancelClick()}>${this.msg.cancel}</button>
                    <button @click=${() => this.onEditSaveClick(message)}>${this.msg.save}</button>
                </div>
            </div>
        `;
    }

    private renderEditHistory(message: msg.Message) {
        if (!this.showEditHistory || !message.edits?.length || this.isMessageContentHidden(message)) return nothing;
        return html`
            <div class="message-edit-history">
                <div class="message-edit-history-title">${this.msg.editHistory}</div>
                ${message.edits.map((edit, index) => {
            const previousEdit = message.edits?.[index - 1];
            return html`
                        <div class="message-edit-history-item">
                            <small>
                                ${index === 0
                    ? html`${this.msg.originalMessage} @${this.getUserName(message.senderId)} ${this.formatLocalDateTime(message.createAt)}`
                    : html`${this.msg.editedBy} @${this.getUserName(previousEdit?.editedBy)} ${this.formatLocalDateTime(previousEdit?.editedAt || '')}`}
                            </small>
                            <div>${this.renderCollabMessagesRichPreview(edit.content)}</div>
                        </div>
                    `;
        })}
                <div class="message-edit-history-item current">
                    <small>
                        ${message.editedBy && message.editedAt
                ? html`${this.msg.currentMessage} - ${this.msg.editedBy} @${this.getUserName(message.editedBy)} ${this.formatLocalDateTime(message.editedAt)}`
                : this.msg.currentMessage}
                    </small>
                    <div>${this.renderCollabMessagesRichPreview(message.content)}</div>
                </div>
            </div>
        `;
    }

    private renderAttachments(message: msg.Message) {
        if (!message.attachments?.length) return nothing;
        return html`
            <div class="message-attachments">
                ${message.attachments.map(attachment => this.renderAttachment(message, attachment))}
            </div>
        `;
    }

    private renderAttachment(message: msg.Message, attachment: msg.MessageAttachment) {
        if (attachment.status === 'deleted') {
            return html`
                <div class="message-attachment deleted">
                    ${collab_paperclip}
                    <span>${attachment.fileName}</span>
                    <small>
                        ${this.msg.attachmentRemoved}
                        @${this.getUserName(attachment.deletedBy)}
                        ${attachment.deletedAt ? this.formatLocalDateTime(attachment.deletedAt) : ''}
                    </small>
                </div>
            `;
        }

        const canDelete = this.canDeleteAttachment(attachment);
        if (attachment.kind === 'image') {
            return html`
                <div class="message-attachment image">
                    <a
                        href=${attachment.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        title=${this.msg.openAttachment}
                        @click=${(ev: MouseEvent) => this.openAttachment(ev, message, attachment)}
                    >
                        <img
                            src=${attachment.url || ''}
                            alt=${attachment.fileName}
                            loading="lazy"
                            @error=${(ev: Event) => this.refreshAttachmentImage(ev, message, attachment)}
                        />
                    </a>
                    <div class="attachment-meta">
                        <span>${attachment.fileName}</span>
                        <small>${this.formatFileSize(attachment.sizeBytes)}</small>
                        ${canDelete ? this.renderDeleteAttachmentButton(message, attachment) : nothing}
                    </div>
                </div>
            `;
        }

        return html`
            <div class="message-attachment file">
                <a
                    href=${attachment.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    title=${this.msg.openAttachment}
                    @click=${(ev: MouseEvent) => this.openAttachment(ev, message, attachment)}
                >
                    ${collab_paperclip}
                    <span>${attachment.fileName}</span>
                    <small>${this.formatFileSize(attachment.sizeBytes)}</small>
                </a>
                ${canDelete ? this.renderDeleteAttachmentButton(message, attachment) : nothing}
            </div>
        `;
    }

    private renderDeleteAttachmentButton(message: msg.Message, attachment: msg.MessageAttachment) {
        return html`
            <button
                class="attachment-delete"
                title=${this.msg.deleteAttachment}
                aria-label=${this.msg.deleteAttachment}
                @click=${(ev: MouseEvent) => this.onDeleteAttachmentClick(ev, message, attachment)}
            >
                ${collab_delete}
            </button>
        `;
    }

    private async openAttachment(ev: MouseEvent, message: msg.Message, attachment: msg.MessageAttachment) {
        ev.preventDefault();
        const url = await this.loadAttachmentUrl(message, attachment);
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    private async refreshAttachmentImage(ev: Event, message: msg.Message, attachment: msg.MessageAttachment) {
        const image = ev.currentTarget as HTMLImageElement;
        if (!image || image.dataset.refreshing === 'true') return;
        image.dataset.refreshing = 'true';
        try {
            image.src = await this.loadAttachmentUrl(message, attachment);
        } finally {
            image.dataset.refreshing = 'false';
        }
    }

    private async loadAttachmentUrl(message: msg.Message, attachment: msg.MessageAttachment): Promise<string> {
        if (!this.userId) throw new Error('User not found');
        const result = await msgGetAttachmentUrl({
            userId: this.userId,
            threadId: message.threadId,
            messageId: message.orderAt || message.createAt,
            attachmentId: attachment.attachmentId
        });
        if (!result.success || !result.response?.url) {
            throw new Error(result.error || 'Failed to open attachment');
        }
        attachment.url = result.response.url;
        return result.response.url;
    }

    private onDeleteAttachmentClick(ev: MouseEvent, message: msg.Message, attachment: msg.MessageAttachment) {
        ev.preventDefault();
        ev.stopPropagation();
        this.dispatchEvent(new CustomEvent('delete-attachment-message', {
            detail: {
                message,
                attachmentId: attachment.attachmentId
            },
            bubbles: true,
            composed: true
        }));
    }

    private canDeleteAttachment(attachment: msg.MessageAttachment): boolean {
        if (attachment.uploadedBy === this.userId && this.canWriteThread()) return true;
        const currentThreadUser = this.actualThread?.thread.users.find(user => user.userId === this.userId);
        return currentThreadUser?.auth === 'admin' || currentThreadUser?.auth === 'moderator';
    }

    private canWriteThread(): boolean {
        const currentThreadUser = this.actualThread?.thread.users.find(user => user.userId === this.userId);
        return currentThreadUser?.auth === 'admin' ||
            currentThreadUser?.auth === 'moderator' ||
            currentThreadUser?.auth === 'write';
    }

    private canModerateThread(): boolean {
        const currentThreadUser = this.actualThread?.thread.users.find(user => user.userId === this.userId);
        return currentThreadUser?.auth === 'admin' || currentThreadUser?.auth === 'moderator';
    }

    private isMessageContentHidden(message: msg.Message): boolean {
        return !!message.moderation && !this.canModerateThread();
    }

    private canDeleteMessage(message: IMessage): boolean {
        if (message.moderation) return false;
        return (message.senderId === this.userId && this.canWriteThread()) || this.canModerateThread();
    }

    private canModerateMessage(message: IMessage): boolean {
        return !message.moderation && this.canModerateThread();
    }

    private canEditMessage(message: IMessage): boolean {
        if (message.moderation || message.attachments?.length) return false;
        if (!(message.senderId === this.userId || this.canModerateThread())) return false;
        return Date.now() - this.parseCompactDate(message.createAt).getTime() <= 24 * 60 * 60 * 1000;
    }

    private parseCompactDate(timestamp: string): Date {
        const year = Number(timestamp.slice(0, 4));
        const month = Number(timestamp.slice(4, 6)) - 1;
        const day = Number(timestamp.slice(6, 8));
        const hour = Number(timestamp.slice(8, 10));
        const minute = Number(timestamp.slice(10, 12));
        const second = Number(timestamp.slice(12, 14));
        return new Date(Date.UTC(year, month, day, hour, minute, second));
    }

    private getUserName(userId?: string): string {
        if (!userId) return '';
        return this.usersAvaliables.find(user => user.userId === userId)?.name || userId;
    }

    private formatFileSize(size: number): string {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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
            @mention-click=${this.onMentionClick}
            @channel-hover=${this.onChannelHover}
            .allUsers=${this.usersAvaliables} 
            .allThreads=${this.allThreads}
            text="${text}"
        ></collab-messages-rich-preview-text-102025>`
    }

    private async onMentionClick(ev: CustomEvent) {

        this.removeAllUserModal();
        if (!ev.detail || !ev.detail.userId || !ev.detail.element) return;
        const actualUserModal = this.usersAvaliables.find((user) => user.userId === ev.detail.userId);
        if (!actualUserModal) return;
        const rects = (ev.detail.element as HTMLElement).getBoundingClientRect();
        const modal = document.createElement('collab-messages-user-modal-102025');
        (modal as any).user = actualUserModal;
        (modal as any).setAttribute('actualUserId', this.userId);
        (modal as any).isDirectMessage = this.isCurrentThreadDirectMessage();
        this.appendChild(modal);
        await (modal as LitElement).updateComplete;
        const rectsModal = modal.getBoundingClientRect();
        this.positionModalByTarget(modal, rects, rectsModal);

    }

    private positionModalByTarget(modal: HTMLElement, targetRect: DOMRect, modalRect: DOMRect) {
        const margin = 8;
        const width = modalRect.width || 280;
        const height = modalRect.height || 0;
        const maxLeft = Math.max(margin, window.innerWidth - width - margin);
        const maxTop = Math.max(margin, window.innerHeight - height - margin);
        let left = targetRect.left + (targetRect.width / 2) - (width / 2);
        let top = targetRect.bottom + margin;

        if (top + height > window.innerHeight - margin) {
            top = targetRect.top - height - margin;
        }

        modal.style.position = 'fixed';
        modal.style.left = `${Math.min(Math.max(left, margin), maxLeft)}px`;
        modal.style.top = `${Math.min(Math.max(top, margin), maxTop)}px`;
    }

    private isCurrentThreadDirectMessage(): boolean {
        const thread = this.actualThread?.thread;
        return Boolean(thread?.name?.startsWith('@') && thread.users?.length === 2);
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
        if (!this.canWriteThread()) return;

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
        if (!this.canWriteThread()) return nothing;
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
        if (!this.canWriteThread()) return nothing;
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
        if (!this.canWriteThread()) return;
        const updated = this.toggleReaction(message, emoji, this.userId);
        this.message = updated;
        this.closeReactionPicker();
    }


    private openReactionPicker(message: IMessage, ev?: Event) {
        ev?.stopPropagation();
        if (!this.canWriteThread()) return;

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
        const canWrite = this.canWriteThread();
        const canUseMessageActions = canWrite && !message.moderation;
        const canCancelReadConfirmation = canUseMessageActions && this.canCancelReadConfirmation(message);
        const canRequestReadConfirmation = canUseMessageActions && this.getMentionedUserIds(message).length > 0 && !this.hasReadConfirmation(message);
        const canConfirmRead = canUseMessageActions && this.hasPendingReadConfirmation(message);
        const allConfirmedRead = this.hasAllReadConfirmationsConfirmed(message);
        const canDeleteMessage = this.canDeleteMessage(message);
        const canModerateMessage = this.canModerateMessage(message);
        const canEditMessage = this.canEditMessage(message);
        const canReadContent = !this.isMessageContentHidden(message);

        return html`
        <div class="message-menu ${this.messageMenuPlacement}">
            <button ?disabled=${!canReadContent} @click=${() => this.onCopyTextClick(message)}>
                ${collab_copy}
                ${this.msg.copy}
            </button>
            <button @click=${() => this.onCopyLinkClick(message)}>
                ${collab_link}
                ${this.msg.copyLink}
            </button>
            <button ?disabled=${!canReadContent} @click=${() => this.onReplyClick(message)}>
                ${collab_reply}
                ${this.msg.reply}
            </button>
            <button @click=${() => this.onMarkUnreadClick(message)}>
                ${collab_bell_slash}
                ${this.msg.markUnread}
            </button>
            <button ?disabled=${!canUseMessageActions} @click=${() => this.onPinClick(message)}>
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
                ${canCancelReadConfirmation ? collab_xmark : collab_circle_exclamation}
                ${canCancelReadConfirmation ? this.msg.cancelReadConfirmation : this.msg.requestReadConfirmation}
            </button>
            <button ?disabled=${!canConfirmRead} @click=${() => this.onReadConfirmationClick(message, 'confirm')}>
                ${collab_check}
                ${this.msg.confirmRead}
            </button>
            ${allConfirmedRead ? html`
                <button disabled>
                    ${collab_check}
                    ${this.msg.allConfirmedRead}
                </button>
            ` : nothing}
            <button ?disabled=${!canUseMessageActions || !!message.taskId} @click=${() => this.onMessageActionClick(message, 'createTask')}>
                ${collab_tasks}
                ${this.msg.createTask}
            </button>
            <button ?disabled=${!canReadContent} @click=${() => this.onForwardClick(message)}>
                ${collab_chevron_right}
                ${this.msg.forward}
            </button>
            <button ?disabled=${!canEditMessage} @click=${() => this.onEditClick(message)}>
                ${collab_edit}
                ${this.msg.edit}
            </button>
            ${message.edits?.length ? html`
                <button ?disabled=${!canReadContent} @click=${() => this.onViewHistoryClick()}>
                    ${collab_clock_static}
                    ${this.msg.viewHistory}
                </button>
            ` : nothing}
            <button ?disabled=${!canDeleteMessage} @click=${() => this.onMessageActionClick(message, 'delete')}>
                ${collab_delete}
                ${this.msg.delete}
            </button>
            <button ?disabled=${!canModerateMessage} @click=${() => this.onMessageActionClick(message, 'moderate')}>
                ${collab_ban}
                ${this.msg.moderate}
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

    private async onCopyTextClick(message: IMessage) {
        if (this.isMessageContentHidden(message)) return;
        this.closeMessageMenu();
        await navigator.clipboard?.writeText(message.content || '');
    }

    private async onCopyLinkClick(message: IMessage) {
        this.closeMessageMenu();
        await navigator.clipboard?.writeText(this.getMessageLink(message));
    }

    private getMessageLink(message: IMessage): string {
        const messageId = encodeURIComponent(message.orderAt || message.createAt);
        const threadId = encodeURIComponent(message.threadId);
        const url = new URL(window.location.href);
        url.hash = `message/${threadId}/${messageId}`;
        return url.toString();
    }

    private onMarkUnreadClick(message: IMessage) {
        this.closeMessageMenu();
        this.dispatchEvent(new CustomEvent('mark-unread-message', {
            detail: { message },
            bubbles: true,
            composed: true
        }));
    }

    private onForwardClick(message: IMessage) {
        if (this.isMessageContentHidden(message)) return;
        this.closeMessageMenu();
        this.dispatchEvent(new CustomEvent('forward-message', {
            detail: { message },
            bubbles: true,
            composed: true
        }));
    }

    private onEditClick(message: IMessage) {
        if (!this.canEditMessage(message)) return;
        this.closeMessageMenu();
        this.editContent = message.content || '';
        this.isEditingMessage = true;
    }

    private onEditCancelClick() {
        this.isEditingMessage = false;
        this.editContent = '';
    }

    private onEditSaveClick(message: msg.Message) {
        const content = this.editContent.trim();
        if (!content || content === message.content) return;
        this.isEditingMessage = false;
        this.dispatchEvent(new CustomEvent('edit-message', {
            detail: { message, content },
            bubbles: true,
            composed: true
        }));
    }

    private onViewHistoryClick() {
        this.closeMessageMenu();
        this.showEditHistory = !this.showEditHistory;
    }

    private onPinClick(message: IMessage) {
        if (!this.canWriteThread()) return;
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
        if (!this.canWriteThread()) return;
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

    private onMessageActionClick(message: IMessage, action: 'delete' | 'moderate' | 'createTask') {
        if (action === 'delete' && !this.canDeleteMessage(message)) return;
        if (action === 'moderate' && !this.canModerateMessage(message)) return;
        if (action === 'createTask' && (message.moderation || message.taskId || !this.canWriteThread())) return;
        this.closeMessageMenu();
        this.dispatchEvent(new CustomEvent('message-action-message', {
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
