/// <mls fileReference="_102025_/l2/collabMessagesChat.ts" enhancement="_102027_/l2/enhancementLit" />

import { html, LitElement,  nothing } from 'lit'; 
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { repeat } from 'lit/directives/repeat.js';
import { customElement, property, state, query } from 'lit/decorators.js';
import {
    collab_chevron_left,
    collab_chevron_right,
    collab_gear,
    collab_plus,
    collab_folder_tree,
    collab_bell,
    collab_pin,
    collab_star,
    collab_paperclip,
    collab_circle_exclamation,
    collab_robot,
    collab_message,
    collab_xmark
} from '/_102025_/l2/collabMessagesIcons.js';

import { removeThreadFromSync, hasThreadNotificationPending, getPendingTaskNotificationsForThread, getThreadUpdateInBackground, checkIfNotificationUnread, markThreadReadLocally } from '/_102025_/l2/collabMessagesSyncNotifications.js';
import { notifyThreadChange, notifyThreadNotification } from '/_102025_/l2/collabMessagesEvents.js';

import {
    addOrUpdateTask,
    addMessages,
    addMessage,
    addThread,
    updateThread,
    updateUsers,
    updateMessage,
    getMessage,
    getMessagesByThreadId,
    deleteAllMessagesFromThread,
    deleteTask,
    listUsers,
    getThread,
    updateLastMessageReadTime
} from '/_102025_/l2/collabMessagesIndexedDB.js';

import {
    IDBThreadPerformanceCache
} from '/_102025_/l2/collabMessagesIndexedDB.js';

import {
    getBotsContext,
    registerToken,
    loadNotificationPreferences,
    loadNotificationDeviceId,
    generateAgentAvatar,
    getTemporaryContext,
    formatTimestamp,
    changeFavIcon
} from '/_102025_/l2/collabMessagesHelper.js';

import {
    msgGetMessagesAfter,
    msgGetMessagesBefore,
    msgGetTaskUpdate,
    msgGetThreadUpdates,
    msgAddMessage,
    msgCompleteAttachmentUpload,
    msgCreateAttachmentUpload,
    msgDeleteAttachment,
    msgUpdateMessage
} from '/_102025_/l2/shared/api.js';

import { environment } from '/_102036_/l2/environmentContract.js';

import '/_102025_/l2/collabMessagesTask.js';
import '/_102025_/l2/collabMessagesTaskInfo.js';
import '/_102025_/l2/collabMessagesTopics.js';
import '/_102025_/l2/collabMessagesPrompt.js';
import '/_102025_/l2/collabMessagesAvatar.js';
import '/_102025_/l2/collabMessagesThreadDetails.js';
import '/_102025_/l2/collabMessagesUserModal.js';
import '/_102025_/l2/collabMessagesThreadModal.js';
import '/_102025_/l2/collabMessagesFilter.js';
import '/_102025_/l2/collabMessagesAdd.js';
import '/_102025_/l2/collabMessagesChatMessage.js';
import '/_102025_/l2/collabMessagesRichPreviewText.js';

import * as msg from '/_102025_/l2/shared/interfaces.js';
import { IMessage, IThreadInfo, AGENTDEFAULT } from '/_102025_/l2/collabMessagesHelper.js';
import { CollabMessagesPrompt } from '/_102025_/l2/collabMessagesPrompt.js';
import { CollabMessagesChatMessage102025 } from '/_102025_/l2/collabMessagesChatMessage.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';


/// **collab_i18n_start**
const message_pt = {
    loading: 'Carregando...',
    btnAddParticipant: 'Adicionar participante',
    threadDetails: 'Detalhes da sala',
    threadAdd: 'Adicionar sala',
    msgNotSend: 'Mensagem não enviada*',
    noThreads: 'Nenhuma sala disponível no momento.',
    placeholderSearch: 'Digite para filtrar',
    threadArchived: 'A thread foi arquivada por [user] em [date]',
    threadDeleting: 'A thread foi deletada em [date]',
    archived: 'Arquivado',
    deleting: 'Deletando',
    deleted: 'Deletada',
    btnNext: 'Continuar',
    promptPlaceholder: '(@ para menções) (@@ para agentes)',
    today: 'Hoje',
    yesterday: 'Ontem',
    newMessages: 'Novas mensagens',
    lastMessagePrefix: 'Você',
    toolbarPins: 'Mensagens fixadas',
    toolbarSaved: 'Favoritos',
    toolbarReadReceipts: 'Follow-up',
    toolbarAttachments: 'Anexos',
    toolbarAgent: 'Agente de resumo',
    toolbarHelpTitle: 'Sobre o recurso',
    toolbarHelpOpen: 'Abrir ajuda',
    toolbarHelpBack: 'Voltar',
    toolbarHelpPinsTitle: 'Mensagens fixadas',
    toolbarHelpPinsText: 'Use para manter mensagens importantes acessiveis no topo da conversa. Quando houver itens, o botao navega entre eles.',
    toolbarHelpSavedTitle: 'Favoritos',
    toolbarHelpSavedText: 'Use para guardar mensagens importantes para voce. Os favoritos sao pessoais e aparecem apenas para o seu usuario.',
    toolbarHelpReadReceiptsTitle: 'Follow-up',
    toolbarHelpReadReceiptsText: 'Use para acompanhar mensagens que precisam de confirmação ou execução. Quando houver pendência para você, o botão chama atenção no toolbar.',
    toolbarHelpAttachmentsTitle: 'Anexos',
    toolbarHelpAttachmentsText: 'Use para navegar rapidamente pelas mensagens com arquivos, imagens, videos ou documentos anexados.',
    toolbarHelpAgentTitle: 'Agente de resumo',
    toolbarHelpAgentText: 'Este espaco esta preparado para recursos de agente que ajudam a reduzir ruido e destacar pontos importantes da conversa.',
    replaceOldestPin: 'Já existem 3 mensagens fixadas. Substituir a mais antiga?',
    readOnlyThread: 'Você tem acesso somente leitura nesta sala.',
    forwardMessageTitle: 'Encaminhar mensagem',
    forwardDestinationLabel: 'Digite o nome do canal ou DM',
    forwardDestinationPlaceholder: '#canal ou @user',
    forwardEmpty: 'Nenhum canal ou DM encontrado',
    forwardCancel: 'Cancelar',
    forwardSend: 'Encaminhar',
    forwardSelectDestination: 'Selecione um destino',
    forwardPrefix: 'Mensagem encaminhada',
    taskTitlePrompt: 'Título da task',
}

const message_en = {
    loading: 'Loading...',
    btnAddParticipant: 'Add Participant',
    threadDetails: 'Thread details',
    threadAdd: 'Add thread',
    msgNotSend: 'Message not sent*',
    noThreads: 'No threads available at the moment.',
    placeholderSearch: 'Type to filter',
    threadArchived: 'Thread is archived by [user] in [date]',
    threadDeleting: 'Thread was deleted in [date]',
    archived: 'Archived',
    deleting: 'Deleting',
    deleted: 'Deleted',
    btnNext: 'Next',
    promptPlaceholder: '(@ for mentions) (@@ for agents)',
    today: 'Today',
    yesterday: 'Yesterday',
    newMessages: 'New messages',
    lastMessagePrefix: 'You',
    toolbarPins: 'Pinned messages',
    toolbarSaved: 'Saved messages',
    toolbarReadReceipts: 'Follow-up',
    toolbarAttachments: 'Attachments',
    toolbarAgent: 'Summary agent',
    toolbarHelpTitle: 'About this feature',
    toolbarHelpOpen: 'Open help',
    toolbarHelpBack: 'Back',
    toolbarHelpPinsTitle: 'Pinned messages',
    toolbarHelpPinsText: 'Use this to keep important messages easy to reach at the top of the conversation. When there are items, the button navigates through them.',
    toolbarHelpSavedTitle: 'Saved messages',
    toolbarHelpSavedText: 'Use this to save important messages for yourself. Saved messages are personal and visible only to your user.',
    toolbarHelpReadReceiptsTitle: 'Follow-up',
    toolbarHelpReadReceiptsText: 'Use this to track messages that need read or execution confirmation. When you have a pending item, the toolbar button draws attention.',
    toolbarHelpAttachmentsTitle: 'Attachments',
    toolbarHelpAttachmentsText: 'Use this to quickly navigate messages with files, images, videos, or documents attached.',
    toolbarHelpAgentTitle: 'Summary agent',
    toolbarHelpAgentText: 'This area is prepared for agent features that help reduce noise and highlight important conversation points.',
    replaceOldestPin: 'There are already 3 pinned messages. Replace the oldest one?',
    readOnlyThread: 'You have read-only access in this room.',
    forwardMessageTitle: 'Forward message',
    forwardDestinationLabel: 'Type the channel or DM name',
    forwardDestinationPlaceholder: '#channel or @user',
    forwardEmpty: 'No channel or DM found',
    forwardCancel: 'Cancel',
    forwardSend: 'Forward',
    forwardSelectDestination: 'Select a destination',
    forwardPrefix: 'Forwarded message',
    taskTitlePrompt: 'Task title',
}

type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = {
    'en': message_en,
    'pt': message_pt
}
/// **collab_i18n_end**

type ToolbarItemKind = 'pins' | 'saved' | 'readReceipts' | 'attachments' | 'agent';

@customElement('collab-messages-chat-102025')
export class CollabMessagesChat extends StateLitElement {

    private msg: MessageType = messages['en'];

    @query('collab-messages-prompt-102025') collabMessagesPrompt: CollabMessagesPrompt | undefined;
    @query('.new-messages-label') private unreadEl!: HTMLDivElement | undefined;
    @query('.chat-container') private messageContainer!: HTMLDivElement | undefined;

    @state() private isLoadingThread: boolean = false;
    @state() private filteredThreads: IFilteredThreadsByStatus = { active: [], archived: [], deleted: [], deleting: [] };
    @state() private isThreadError: boolean = false;
    @state() private threadErrorMsg: string = '';
    @state() private lastTopicFilter: string = '';
    @state() private welcomeMessage: string = '';
    @state() private usersAvaliables: msg.User[] = [];
    @state() private elementTaskDetails: HTMLElement | undefined;
    @state() private taskNotificationNavDirection: 'up' | 'down' | '' = '';
    @state() private toolbarView: Partial<Record<ToolbarItemKind, number>> = {};

    @property() group: 'CONNECT' | 'APPS' | 'DOCS' | 'CRM' = 'CONNECT';
    @property() userId: string | undefined;
    @property() threadToOpen: string | undefined;
    @property() taskToOpen: string | undefined;
    @property() userDeviceId: string | undefined;
    @property() activeScenerie: IScenery = 'list';
    @property() actualThread: IThreadInfo | undefined;
    @property() actualTask: msg.TaskData | undefined;
    @property() actualMessage: IMessage | undefined;
    @property() actualMessages: IMessage[] = [];
    @property() actualMessagesParsed: IMessageGrouped = {};
    @property() isLoadingMessages: boolean = false;
    @property() searchTerm: string = '';
    @property({ attribute: false }) userThreads: IThread = {};
    @property({ attribute: false }) allThreads: msg.Thread[] = [];
    @property() lastMessageReaded: string | undefined = ''
    @property() unreadCountInSelectedThread: number = 0;
    @state() private forwardMessageSource?: IMessage;
    @state() private forwardDestinationQuery: string = '';
    @state() private forwardDestinationThreadId: string = '';
    @state() private forwardError: string = '';
    @state() private isForwardingMessage: boolean = false;
    @state() private highlightedMessageId: string = '';
    @state() private toolbarHelpKind?: ToolbarItemKind;

    private isSystemChangeScroll: boolean = false;
    private savedScrollTop = 0;
    private hasMoreMessagesLocalDB = true;
    private hasMoreMessagesBefore: boolean = false;
    private messagesLimit = 50;
    private messagesOffset = 0;
    private isLoadingMoreMessages = false;
    private isChangeTopics = false;
    private wasMessagesAtBottom: boolean = true;
    private ignoreToolbarScrollClearUntil = 0;
    private isToolbarAutoScroll = false;
    private toolbarAutoScrollTimer?: ReturnType<typeof setTimeout>;

    async updated(changedProperties: Map<PropertyKey, unknown>) {

        super.updated(changedProperties);


        if (changedProperties.has('activeScenerie') && (this.activeScenerie === 'list')) {
            this.usersAvaliables = await listUsers();
        }

        if (changedProperties.has('threadToOpen')) {
            if (this.threadToOpen) {
                if (this.activeScenerie !== 'list') {
                    this.activeScenerie = 'list';
                    await this.updateComplete;
                }

                const threadElement = this.querySelector(
                    `[threadId="${this.threadToOpen}"]`
                ) as IHTMLLiThreadItem;

                if (!threadElement) return;
                const detailsParent = threadElement.closest('details');
                if (detailsParent && !detailsParent.open) {
                    detailsParent.open = true;
                    await this.updateComplete;
                }

                this.onThreadClick(threadElement.item);
            }
        }

        if (changedProperties.has('activeScenerie')
            && (changedProperties.get('activeScenerie') === 'task'
                || changedProperties.get('activeScenerie') === 'addParticipant'
                || changedProperties.get('activeScenerie') === 'threadDetails'
                || changedProperties.get('activeScenerie') === 'forwardMessage'
                || changedProperties.get('activeScenerie') === 'toolbarHelp'
            )
            && this.activeScenerie === 'details') {
            this.restoreScrollPosition();
        }

        if (changedProperties.has('actualMessagesParsed') && this.actualMessagesParsed !== undefined) {
            await this.verifyChatScroll();
            await this.updateComplete;
            await this.nextFrame();
            this.updateTaskNotificationNavDirection();
        }
    }

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('click', this.onDocumentClick);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('task-change', this.onTaskChange);
        // window.removeEventListener('task-details-close', this.onTaskDetailsClose);
        window.removeEventListener('thread-change', this.onThreadChange.bind(this));
        window.removeEventListener('message-change', this.onMessageChange.bind(this));
        window.removeEventListener('message-send', this.onMessageSend);
        document.removeEventListener("visibilitychange", this.onVisibilityChange.bind(this));
        document.removeEventListener('click', this.onDocumentClick);

    }

    async firstUpdated(changedProperties: Map<PropertyKey, unknown>) {
        super.firstUpdated(changedProperties);
        window.addEventListener('task-change', this.onTaskChange);
        // window.addEventListener('task-details-close', this.onTaskDetailsClose);
        window.addEventListener('thread-change', this.onThreadChange.bind(this));
        window.addEventListener('message-change', this.onMessageChange.bind(this));
        window.addEventListener('message-send', this.onMessageSend);
        document.addEventListener("visibilitychange", this.onVisibilityChange.bind(this));
    }

    render() {
        const lang = this.getMessageKey(messages);
        this.msg = messages[lang];
        if (this.activeScenerie === 'loading') {
            return html`<div class="loading">${this.msg.loading}</div>`;
        }

        return html`
            ${this.renderHeader()}
            ${this.renderContent()}`;
    }

    private renderHeader() {
        switch (this.activeScenerie) {
            case 'task':
                return html`
                    <div class="header">
                        <span @click=${this.onTitleClick}>${collab_chevron_left} <span class="header-title">Task: ${this.actualTask?.PK || ''}</span></span>
                    </div>`;
            case 'details':
                return html`
                    <div class="header">
                        <span @click=${this.onTitleClick}>${collab_chevron_left} <span class="header-title">Thread: ${this.getThreadName(this.actualThread)}</span></span>
                        ${this.actualThread?.thread.status !== 'deleted' ? html`
                            <div class="header-actions">
                                <span @click=${this.onThreadDetailsClick}>${collab_gear}</span>
                            </div>
                        `: ''}                        
                    </div>`;
            case 'list':
                return html`<div class="header">
                    ${this.renderThreadSearch()}
                    <div class="header-actions">
                            <span @click=${this.onThreadAddClick}>${collab_plus}</span>
                    </div>
                </div>`;
            case 'threadDetails':
                return html`
                    <div class="header">
                        <span @click=${this.onTitleClick}>${collab_chevron_left} ${this.msg.threadDetails}</span>
                    </div>`;
            case 'threadAdd':
                return html`
                    <div class="header">
                        <span @click=${this.onTitleClick}>${collab_chevron_left} ${this.msg.threadAdd}</span>
                    </div>`;
            case 'forwardMessage':
                return html`
                    <div class="header">
                        <span @click=${this.onTitleClick}>${collab_chevron_left} ${this.msg.forwardMessageTitle}</span>
                    </div>`;
            case 'toolbarHelp':
                return html`
                    <div class="header">
                        <span @click=${this.onTitleClick}>${collab_chevron_left} ${this.msg.toolbarHelpTitle}</span>
                    </div>`;
            default:
                return null;
        }
    }

    private renderContent() {
        switch (this.activeScenerie) {
            case 'list':
                return this.renderListThreads();
            case 'details':
                return this.renderChatMessages();
            case 'task':
                return this.renderTaskDetails();
            case 'threadDetails':
                return this.renderThreadDetails();
            case 'threadAdd':
                return this.renderThreadAdd();
            case 'forwardMessage':
                return this.renderForwardMessage();
            case 'toolbarHelp':
                return this.renderToolbarHelp();
            default:
                return null;
        }
    }

    private renderChatMessages() {
        if (!this.actualThread) return html``;

        if (this.welcomeMessage && !['deleting', 'deleted', 'archived'].includes(this.actualThread?.thread.status)) {
            return this.renderWelcomeMessage();
        }

        if (this.actualThread.thread.status === 'deleting' || this.actualThread.thread.status === 'deleted') {
            const formatedTimestamp = formatTimestamp(this.actualThread.thread.deletedAt || '');
            const deletedAt = this.parseLocalDate(formatedTimestamp?.dateFull || '');
            return html`
                <div>${this.msg.threadDeleting.replace('[date]', deletedAt.datafull)}</div>
            `
        }

        if (this.actualThread.thread.status === 'archived') {
            const formatedTimestamp = formatTimestamp(this.actualThread.thread.archivedAt || '');
            const archivedAt = this.parseLocalDate(formatedTimestamp?.dateFull || '');
            const archivedBy = this.actualThread.users.find((user) => user.userId === this.actualThread?.thread.archivedBy)
            return html`
                <div>${this.msg.threadArchived.replace('[user]', archivedBy?.name || '').replace('[date]', archivedAt.datafull)}</div>
            `
        }

        const sortedEntries = Object.entries(this.actualMessagesParsed)
            .map(([date, value]) => [date.trim(), value])
            .sort(([a], [b]) => new Date(a as string).getTime() - new Date(b as string).getTime());

        const sortedObj: IMessageGrouped = Object.fromEntries(sortedEntries);
        const firstUnreadMessageCreateAt = this.getFirstUnreadMessageCreateAt();

        return html`
            ${this.renderTopics()}
            ${this.renderThreadToolbar()}
            <div
                @scroll=${this.onChatScroll} class="chat-container"
                @wheel=${this.clearToolbarSelection}
                @touchstart=${this.clearToolbarSelection}
                @copy=${this.onCopyChat}
            >
                ${repeat(Object.keys(sortedObj), (key) => key, (key) => {
            const threadMessages = sortedObj[key];
            const messageTime = this.parseLocalDate(key);
            const displayDate = this.formatMessageDate(messageTime.dateObject);
            return html`
                    <div class="message-time">${displayDate}</div>
                        ${repeat(threadMessages, (message) => `${message.threadId}/${message.createAt}`, (message) => {
                return html`
                                ${firstUnreadMessageCreateAt === message.createAt ? html`<div class="new-messages-label">${this.msg.newMessages}</div>` : nothing}
                                <collab-messages-chat-message-102025
                                    messageId=${message.createAt}
                                    .message=${message}
                                    .allThreads=${this.allThreads}
                                    .actualThread=${this.actualThread}
                                    .usersAvaliables=${this.usersAvaliables}
                                    .currentUser=${this.getCurrentUser()}
                                    .toolbarHighlighted=${this.isMessageHighlightedByToolbar(message)}
                                    .userId=${this.userId}
                                    .onTaskClick=${this.onTaskClick.bind(this)}
                                    @reply-preview-click=${this.onReplyPreviewClick}
                                    @reply-message=${this.onReplyMessageClick}
                                    @pin-message=${this.onPinMessageClick}
                                    @favorite-message=${this.onFavoriteMessageClick}
                                    @read-confirmation-message=${this.onReadConfirmationMessageClick}
                                    @message-action-message=${this.onMessageActionMessageClick}
                                    @edit-message=${this.onEditMessageClick}
                                    @mark-unread-message=${this.onMarkUnreadMessageClick}
                                    @forward-message=${this.onForwardMessageClick}
                                    @delete-attachment-message=${this.onDeleteAttachmentMessage}
                                ></collab-messages-chat-message-102025>`
            })}`
        })}
                        ${this.isLoadingMessages ? html`<div class="unread-messages">Loading messages...</div>` : html``}
                        ${this.isThreadError ? html`<div class="error-messages">${this.threadErrorMsg}</div>` : html``}
                    </div>
                ${this.renderTaskNotificationNav()}
                ${this.renderPrompt()}`
    }

    private renderTaskNotificationNav() {
        if (!this.actualThread) return nothing;
        const taskId = this.getFirstPendingTaskNotificationInView();
        if (!taskId) return nothing;
        const direction = this.taskNotificationNavDirection || 'up';
        if (!this.taskNotificationNavDirection) return nothing;
        return html`
            <button
                class="task-notification-nav ${direction}"
                @click=${() => this.scrollToTaskNotification(taskId)}
                title="Go to updated task"
            >
                ${this.renderTaskNotificationNavIcon(direction)}
            </button>
        `;
    }

    private renderForwardMessage() {
        const destinations = this.getForwardDestinationSuggestions();
        const selectedThread = this.allThreads.find(thread => thread.threadId === this.forwardDestinationThreadId);
        return html`
            <div class="forward-message-scenario">
                <label for="forward-destination">${this.msg.forwardDestinationLabel}</label>
                <input
                    id="forward-destination"
                    type="search"
                    .value=${this.forwardDestinationQuery}
                    placeholder=${this.msg.forwardDestinationPlaceholder}
                    @input=${this.onForwardDestinationInput}
                />
                ${this.forwardError ? html`<small class="forward-error">${this.forwardError}</small>` : nothing}
                <ul class="forward-destination-list">
                    ${destinations.length === 0 ? html`<li class="forward-empty">${this.msg.forwardEmpty}</li>` : nothing}
                    ${destinations.map(thread => this.renderForwardDestination(thread))}
                </ul>
                <div class="forward-actions">
                    <button class="secondary" @click=${this.cancelForwardMessage}>
                        ${collab_xmark}
                        ${this.msg.forwardCancel}
                    </button>
                    <button class="primary" ?disabled=${!selectedThread || this.isForwardingMessage} @click=${this.confirmForwardMessage}>
                        ${collab_chevron_right}
                        ${this.isForwardingMessage ? this.msg.loading : this.msg.forwardSend}
                    </button>
                </div>
            </div>
        `;
    }

    private renderForwardDestination(thread: msg.Thread) {
        const selected = this.forwardDestinationThreadId === thread.threadId;
        return html`
            <li>
                <button class=${selected ? 'selected' : ''} @click=${() => this.selectForwardDestination(thread)}>
                    <span class="forward-destination-avatar">${this.renderForwardDestinationAvatar(thread)}</span>
                    <span class="forward-destination-name">${this.getForwardThreadName(thread)}</span>
                </button>
            </li>
        `;
    }

    private renderToolbarHelp() {
        const kind = this.toolbarHelpKind || 'pins';
        const help = this.getToolbarHelpContent(kind);
        return html`
            <div class="toolbar-help-scenario">
                <div class="toolbar-help-icon">${help.icon}</div>
                <h3>${help.title}</h3>
                <p>${help.text}</p>
                <button @click=${this.closeToolbarHelp}>
                    ${collab_chevron_left}
                    ${this.msg.toolbarHelpBack}
                </button>
            </div>
        `;
    }

    private getToolbarHelpContent(kind: ToolbarItemKind): { title: string, text: string, icon: unknown } {
        switch (kind) {
            case 'pins':
                return { title: this.msg.toolbarHelpPinsTitle, text: this.msg.toolbarHelpPinsText, icon: collab_pin };
            case 'saved':
                return { title: this.msg.toolbarHelpSavedTitle, text: this.msg.toolbarHelpSavedText, icon: collab_star };
            case 'readReceipts':
                return { title: this.msg.toolbarHelpReadReceiptsTitle, text: this.msg.toolbarHelpReadReceiptsText, icon: collab_circle_exclamation };
            case 'attachments':
                return { title: this.msg.toolbarHelpAttachmentsTitle, text: this.msg.toolbarHelpAttachmentsText, icon: collab_paperclip };
            case 'agent':
                return { title: this.msg.toolbarHelpAgentTitle, text: this.msg.toolbarHelpAgentText, icon: collab_robot };
        }
    }

    private closeToolbarHelp = () => {
        this.toolbarHelpKind = undefined;
        this.activeScenerie = 'details';
    }

    private renderTaskNotificationNavIcon(direction: 'up' | 'down' | '') {
        const rotate = direction === 'down' ? 'rotate(180 12 12)' : '';
        return html`
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <g transform="${rotate}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 14l5-5 5 5"></path>
                    <path d="M7 19l5-5 5 5"></path>
                </g>
            </svg>
        `;
    }

    private renderWelcomeMessage() {
        return html`
            <div class="welcome-message">
                <p>${this.welcomeMessage}</p>
                <button @click=${() => { this.welcomeMessage = ''; }}>${this.msg.btnNext}</button>       
            </div>`
    }

    private renderTopics() {
        return html`
            <collab-messages-topics-102025
                .selectedTopic=${this.lastTopicFilter === '' ? 'all' : this.lastTopicFilter}
                .messages=${this.actualMessages}
                .threadTopics=${this.actualThread?.thread.defaultTopics || []}
                @topic-selected=${(e: CustomEvent) => this.onTopicClick(e)}
            ></collab-messages-topics-102025>
        `
    }

    private renderThreadToolbar() {
        const pinnedMessages = this.actualThread?.thread.pinnedMessages || [];
        const favoriteMessageIds = this.getFavoriteMessageIdsForThread();
        const readConfirmationMessageIds = this.getReadConfirmationMessageIdsForThread();
        const attachments = this.getAttachmentMessages();
        const agentMessages = this.getAgentMessages();
        const hasPendingReadConfirmation = this.hasPendingReadConfirmationsForThread();
        const items = [
            {
                kind: 'pins' as ToolbarItemKind,
                icon: collab_pin,
                total: pinnedMessages.length,
                active: this.toolbarView.pins !== undefined,
                important: false,
                attention: false,
                onClick: () => this.navigateToolbarItem('pins')
            },
            {
                kind: 'saved' as ToolbarItemKind,
                icon: collab_star,
                total: favoriteMessageIds.length,
                active: this.toolbarView.saved !== undefined,
                important: false,
                attention: false,
                onClick: () => this.navigateToolbarItem('saved')
            },
            {
                kind: 'readReceipts' as ToolbarItemKind,
                icon: collab_circle_exclamation,
                total: readConfirmationMessageIds.length,
                active: this.toolbarView.readReceipts !== undefined,
                important: hasPendingReadConfirmation,
                attention: hasPendingReadConfirmation,
                onClick: () => this.navigateToolbarItem('readReceipts')
            },
            {
                kind: 'attachments' as ToolbarItemKind,
                icon: collab_paperclip,
                total: attachments.length,
                active: this.toolbarView.attachments !== undefined,
                important: false,
                attention: false,
                onClick: () => this.navigateToolbarItem('attachments')
            },
            {
                kind: 'agent' as ToolbarItemKind,
                icon: collab_robot,
                total: agentMessages.length,
                active: this.toolbarView.agent !== undefined,
                important: false,
                attention: false,
                onClick: () => this.navigateToolbarItem('agent')
            }
        ];

        return html`
            <div class="thread-toolbar" role="toolbar">
                ${items.map(item => html`
                    <button
                        class="thread-toolbar-btn ${item.active ? 'active' : ''} ${item.important ? 'important' : ''} ${item.attention ? 'attention' : ''}"
                        .title=${this.getToolbarTitle(item.kind)}
                        aria-label=${this.getToolbarTitle(item.kind)}
                        @click=${item.onClick}
                    >
                        ${item.icon}
                        ${this.renderToolbarCounter(item.kind, item.total)}
                        ${item.important ? html`<span class="toolbar-alert">*</span>` : nothing}
                    </button>
                `)}
            </div>
        `;
    }

    private renderToolbarCounter(kind: ToolbarItemKind, total: number) {
        if (total <= 0) return nothing;
        const index = this.toolbarView[kind];
        const label = index === undefined ? `${total}` : `${Math.min(index + 1, total)}/${total}`;
        return html`<span class="toolbar-counter">(${label})</span>`;
    }

    private navigateToolbarItem(kind: ToolbarItemKind) {
        if (kind === 'pins') {
            const pinnedMessages = this.actualThread?.thread.pinnedMessages || [];
            if (pinnedMessages.length === 0) return this.openToolbarHelp(kind);
            const nextIndex = this.getNextToolbarIndex(kind, pinnedMessages.length);
            this.toolbarView = { ...this.toolbarView, [kind]: nextIndex };
            this.scrollToMessageId(pinnedMessages[nextIndex].messageId);
            return;
        }
        if (kind === 'saved') {
            const favoriteMessageIds = this.getFavoriteMessageIdsForThread();
            if (favoriteMessageIds.length === 0) return this.openToolbarHelp(kind);
            const nextIndex = this.getNextToolbarIndex(kind, favoriteMessageIds.length);
            this.toolbarView = { ...this.toolbarView, [kind]: nextIndex };
            this.scrollToMessageId(favoriteMessageIds[nextIndex]);
            return;
        }
        if (kind === 'readReceipts') {
            const readConfirmationMessageIds = this.getReadConfirmationMessageIdsForThread();
            if (readConfirmationMessageIds.length === 0) return this.openToolbarHelp(kind);
            const nextIndex = this.getNextToolbarIndex(kind, readConfirmationMessageIds.length);
            this.toolbarView = { ...this.toolbarView, [kind]: nextIndex };
            this.scrollToMessageId(readConfirmationMessageIds[nextIndex]);
            return;
        }
        if (kind === 'attachments') {
            const attachments = this.getAttachmentMessages();
            if (attachments.length === 0) return this.openToolbarHelp(kind);
            const nextIndex = this.getNextToolbarIndex(kind, attachments.length);
            this.toolbarView = { ...this.toolbarView, [kind]: nextIndex };
            this.scrollToMessageId(`${attachments[nextIndex].threadId}/${attachments[nextIndex].orderAt || attachments[nextIndex].createAt}`);
            return;
        }
        if (kind === 'agent') {
            const agentMessages = this.getAgentMessages();
            if (agentMessages.length === 0) return this.openToolbarHelp(kind);
            const nextIndex = this.getNextToolbarIndex(kind, agentMessages.length);
            this.toolbarView = { ...this.toolbarView, [kind]: nextIndex };
            this.scrollToMessageId(`${agentMessages[nextIndex].threadId}/${agentMessages[nextIndex].orderAt || agentMessages[nextIndex].createAt}`);
        }
    }

    private getToolbarTitle(kind: ToolbarItemKind): string {
        switch (kind) {
            case 'pins': return this.msg.toolbarPins;
            case 'saved': return this.msg.toolbarSaved;
            case 'readReceipts': return this.msg.toolbarReadReceipts;
            case 'attachments': return this.msg.toolbarAttachments;
            case 'agent': return this.msg.toolbarAgent;
        }
    }

    private clearToolbarSelection = () => {
        if (Object.keys(this.toolbarView).length === 0 && !this.highlightedMessageId) return;
        this.toolbarView = {};
        this.highlightedMessageId = '';
        this.isToolbarAutoScroll = false;
        if (this.toolbarAutoScrollTimer) clearTimeout(this.toolbarAutoScrollTimer);
    }

    private getNextToolbarIndex(kind: ToolbarItemKind, total: number): number {
        const current = this.toolbarView[kind];
        if (current === undefined || current >= total - 1) return 0;
        return current + 1;
    }

    private getAttachmentMessages(): IMessage[] {
        return this.actualMessages.filter(message => {
            const hasActiveAttachments = !!message.attachments?.some(attachment => attachment.status === 'active');
            return hasActiveAttachments || !!message.url || (!!message.type && message.type !== 'text' && !message.attachments?.length);
        });
    }

    private getAgentMessages(): IMessage[] {
        return this.actualMessages.filter(message =>
            !!message.footers?.length ||
            !!message.taskResults?.length ||
            !!message.taskResultsTranslated
        );
    }

    private openToolbarHelp(kind: ToolbarItemKind) {
        this.toolbarHelpKind = kind;
        this.saveScrollPosition();
        this.activeScenerie = 'toolbarHelp';
    }

    private getFavoriteMessageIdsForThread(): string[] {
        const threadId = this.actualThread?.thread.threadId;
        if (!threadId) return [];
        return (this.getCurrentUser()?.favorites || []).filter(messageId => messageId.startsWith(`${threadId}/`));
    }

    private getReadConfirmationMessageIdsForThread(): string[] {
        const threadId = this.actualThread?.thread.threadId;
        if (!threadId) return [];
        const readConfirmations = this.getCurrentUser()?.readConfirmations || {};
        return [...new Set([
            ...(readConfirmations.pending || []),
            ...(readConfirmations.requested || []),
            ...this.getReadConfirmationMessageIdsFromLoadedMessages(),
        ])]
            .filter(messageId => messageId.startsWith(`${threadId}/`))
            .filter(messageId => {
                const loadedMessage = this.getLoadedMessageById(messageId);
                return loadedMessage ? this.isReadConfirmationRelevantForCurrentUser(loadedMessage) : true;
            });
    }

    private hasPendingReadConfirmationsForThread(): boolean {
        const threadId = this.actualThread?.thread.threadId;
        if (!threadId) return false;
        return !!this.getCurrentUser()?.readConfirmations?.pending?.some(messageId => {
            if (!messageId.startsWith(`${threadId}/`)) return false;
            const loadedMessage = this.getLoadedMessageById(messageId);
            return loadedMessage ? this.isReadConfirmationPendingForCurrentUser(loadedMessage) : true;
        }) ||
            this.actualMessages.some(message => this.isReadConfirmationPendingForCurrentUser(message));
    }

    private getLoadedMessageById(messageId: string): msg.Message | undefined {
        return this.actualMessages.find(message => `${message.threadId}/${message.orderAt || message.createAt}` === messageId);
    }

    private getReadConfirmationMessageIdsFromLoadedMessages(): string[] {
        return this.actualMessages
            .filter(message => this.isReadConfirmationRelevantForCurrentUser(message))
            .map(message => `${message.threadId}/${message.orderAt || message.createAt}`);
    }

    private isReadConfirmationRelevantForCurrentUser(message: msg.Message): boolean {
        return this.isReadConfirmationPendingForCurrentUser(message) ||
            this.isReadConfirmationRequestedByCurrentUser(message);
    }

    private isReadConfirmationPendingForCurrentUser(message: msg.Message): boolean {
        if (!this.userId) return false;
        return !!message.readConfirmations?.some(request =>
            !request.canceledAt &&
            (
                (this.getReadConfirmationKind(request) === 'read' &&
                    request.targetUserIds.includes(this.userId!) && !request.confirmedBy?.[this.userId!]) ||
                (this.getReadConfirmationKind(request) === 'execution' &&
                    request.targetUserIds.includes(this.userId!) && !this.getFollowupReactionForUser(message, this.userId!))
            )
        );
    }

    private isReadConfirmationRequestedByCurrentUser(message: msg.Message): boolean {
        if (!this.userId) return false;
        return !!message.readConfirmations?.some(request =>
            !request.canceledAt &&
            request.requestedBy === this.userId &&
            (
                (this.getReadConfirmationKind(request) === 'read' &&
                    request.targetUserIds.some(userId => !request.confirmedBy?.[userId])) ||
                (this.getReadConfirmationKind(request) === 'execution' &&
                    this.getFollowupReactionForUser(message, this.userId!) !== 'followup_revisado')
            )
        );
    }

    private getReadConfirmationKind(request: msg.MessageReadConfirmation): 'read' | 'execution' {
        return request.kind || 'read';
    }

    private getFollowupReactionForUser(message: msg.Message, userId: string): string | undefined {
        const reactions = message.reactions || {};
        for (const [reaction, users] of Object.entries(reactions)) {
            if (reaction.startsWith('followup_') && users.includes(userId)) return reaction;
        }
        return undefined;
    }

    private getCurrentUser(): msg.User | undefined {
        if (!this.userId) return undefined;
        return [
            ...this.usersAvaliables,
            ...(this.actualThread?.users || [])
        ].find(user => user.userId === this.userId);
    }

    private scrollToMessageId(messageId: string) {
        this.highlightedMessageId = messageId;
        this.isToolbarAutoScroll = true;
        this.ignoreToolbarScrollClearUntil = Date.now() + 2000;
        this.deferToolbarAutoScrollEnd();
        const orderAt = messageId.split('/').pop();
        if (!orderAt) return;
        const messageEl = this.messageContainer?.querySelector(
            `collab-messages-chat-message-102025[messageid="${orderAt}"]`
        );
        if (!messageEl) return;
        messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    private deferToolbarAutoScrollEnd() {
        if (this.toolbarAutoScrollTimer) clearTimeout(this.toolbarAutoScrollTimer);
        this.toolbarAutoScrollTimer = setTimeout(() => {
            this.isToolbarAutoScroll = false;
        }, 500);
    }

    private isMessageHighlightedByToolbar(message: IMessage): boolean {
        return this.highlightedMessageId === `${message.threadId}/${message.orderAt || message.createAt}`;
    }

    private async onTopicClick(e: CustomEvent) {

        this.lastTopicFilter = e.detail.topic === 'all' ? '' : e.detail.topic;
        this.isChangeTopics = true;
        this.isSystemChangeScroll = true;

        if (e.detail.topic === 'all') {
            this.actualMessagesParsed = this.parseMessages(this.actualMessages, this.lastTopicFilter);
        }
        else this.actualMessagesParsed = this.parseMessages(this.actualMessages, this.lastTopicFilter);

        /*if (this.messageContainer) {
            const newHeight = this.messageContainer.scrollHeight;
            this.messageContainer.scrollTop = newHeight;
        }*/

    }

    private removeAllModal() {
        const all = this.querySelectorAll('collab-messages-user-modal-102025');
        const all2 = this.querySelectorAll('collab-messages-thread-modal-102025');
        [...all, ...all2].forEach((item) => item.remove());
    }


    private renderPrompt() {
        if (!this.canWriteCurrentThread()) {
            return html`<div class="read-only-thread">${this.msg.readOnlyThread}</div>`;
        }
        return html`
            <collab-messages-prompt-102025
                acceptAutoCompleteAgents="true"
                acceptAutoCompleteUser="true"
                enableRichPreview="true"
                threadId=${this.actualThread?.thread.threadId}
                .onSend=${this.handleSend.bind(this)}
                placeholder=${this.msg.promptPlaceholder}
                @textarea-resize=${this.handlePromptResize}
                scope="*"
            ></collab-messages-prompt-102025>
        `;
    }

    private getCurrentThreadUserAuth(): msg.UserAuth | undefined {
        return this.actualThread?.thread.users.find(user => user.userId === this.userId)?.auth;
    }

    private canWriteCurrentThread(): boolean {
        const auth = this.getCurrentThreadUserAuth();
        return auth === 'admin' || auth === 'moderator' || auth === 'write';
    }

    private showReadOnlyThreadError() {
        this.isThreadError = true;
        this.threadErrorMsg = this.msg.readOnlyThread;
    }

    private renderListThreads() {

        if (!this.userThreads[this.group] || (this.userThreads[this.group].length === 0 && !this.isLoadingThread)) {
            return html`<div style="padding:1rem;">${this.msg.noThreads}</div>`;
        }

        const ordenedThreads = this.getOrdenedThreadsByStatus();
        this.filteredThreads = this.getFilteredThreads(ordenedThreads);

        return html`
            ${this.renderThreadsByStatus2()}
            ${this.isLoadingThread ? html`<div>${this.msg.loading}</div>` : ''}
        `;
    }

    private getThreadAvatar(item: IFilteredThreads) {
        let threadAvatar = generateAgentAvatar(item.thread.name);
        if (item.thread.name.startsWith('@') && item.thread.users.length === 2) {
            const user = item.users.find((user) => user.userId !== this.userId);
            if (user && user.avatar_url) threadAvatar = user.avatar_url;
        } else if (item.thread.avatar_url) {
            threadAvatar = item.thread.avatar_url;
        }
        return threadAvatar;
    }

    private getThreadName(item: IThreadInfo | undefined) {

        if (!item) return '';
        if (this.isDirectMessage(item)) {
            const user = item.users.find((user) => user.userId !== this.userId);
            if (user) return '@' + user.name;
        }
        return item.thread.name || item.thread.threadId;
    }

    private isDirectMessage(item: IThreadInfo) {
        return item.thread.name.startsWith('@') && item.thread.users.length === 2
    }

    private renderThreadsByStatus2() {
        const groups = this.groupThreadsByPrefix(this.filteredThreads.active);

        return html`
        <ul class="thread-list">
            ${Object.entries(groups).map(([prefix, items]) => {
            if (items.length === 1) {
                return this.renderThreadItemLi(items[0]);
            } else {
                const lastItem = items[0];

                const unreadCount = items.reduce(
                    (total, item) => total + (item.thread?.unreadCount || 0),
                    0
                );
                const hasPendingNotification = items.some((item) => hasThreadNotificationPending(item.thread.threadId));
                const pendingTasksCount = items.reduce(
                    (total, item) => total + (item?.thread?.pendingTasks?.length || 0),
                    0
                );

                const now = new Date();
                const isToday =
                    lastItem._lastMessageDate.dateObject.getFullYear() === now.getFullYear() &&
                    lastItem._lastMessageDate.dateObject.getMonth() === now.getMonth() &&
                    lastItem._lastMessageDate.dateObject.getDate() === now.getDate();

                const displayDate = isToday
                    ? lastItem._lastMessageDate.time
                    : this.formatMessageDate(lastItem._lastMessageDate.dateObject);


                return html`
                        <li class="thread-group ${hasPendingNotification ? 'has-notification' : ''}">
                            <details>
                                <summary class="group-title">
                                    <div class="thread-group-avatar">
                                        ${collab_folder_tree}
                                    </div>
                                    <div class="thread-group-content">
                                        <div class="thread-group-item-header">
                                            <span class="thread-group-name">${prefix}</span>
                                            <span class="last-group-update">
                                                ${this.renderTaskPendingsCount(pendingTasksCount)}
                                                ${displayDate}
                                            
                                            </span>
                                        </div>
                                        <div class="thread-group-summary">
                                            <span class="last-group-message">${items.length} Threads </span>
                                            ${unreadCount > 0 ? html`<span class="unread-count">${unreadCount}</span>` : hasPendingNotification ? html`<span class="unread-count">•</span>` : nothing}
                                        </div>
                                    </div>                                
                                </summary>
                                <ul class="group-items">
                                    ${items.map(item => this.renderThreadItemLi(item, prefix))}
                                </ul>
                            </details>
                        </li>
                    `;
            }
        })}
        
            ${this.renderArchivedThreads()}
            ${this.renderDeletingThreads()}
            ${this.renderDeletedThreads()}

        </ul>
    `;
    }

    private renderThreadItemLi(item: IFilteredThreads, prefix?: string) {
        let threadAvatar = this.getThreadAvatar(item);
        let threadName = this.getThreadName(item);
        if (prefix) threadName = threadName.replace(prefix + '/', '');

        const isDirectMessage = this.isDirectMessage(item);

        let lastMessage: string = item.thread.lastMessage || '';

        const firstColonIndex = lastMessage.indexOf(':');

        let userMessageId = lastMessage.slice(0, firstColonIndex);
        let userMessage = lastMessage.slice(firstColonIndex + 1);
        const unreadCount = item.thread.unreadCount || 0;
        const hasPendingNotification = hasThreadNotificationPending(item.thread.threadId);
        const pendingTasksCount = item.thread.pendingTasks?.length || 0;

        const now = new Date();
        const isToday =
            item._lastMessageDate.dateObject.getFullYear() === now.getFullYear() &&
            item._lastMessageDate.dateObject.getMonth() === now.getMonth() &&
            item._lastMessageDate.dateObject.getDate() === now.getDate();

        const displayDate = isToday
            ? item._lastMessageDate.time
            : this.formatMessageDate(item._lastMessageDate.dateObject);

        if (item.users.length > 0) {
            const sortedUsers = [...item.users].sort((a, b) => b.name.length - a.name.length);

            if (userMessageId === this.userId) userMessageId = this.msg.lastMessagePrefix
            else userMessageId = sortedUsers.find(u => u.userId === userMessageId)?.name || '';

            userMessage = userMessage.replace(/\[@([^\]]+)\]\(([^)]+)\)/g, (_m, name, userId) => {
                const user = sortedUsers.find(u => u.userId === userId);
                if (!user) return `@${name}`;
                return `@${user.name}`;
            });
        }

        return html`
        <li .item=${item} threadId=${item.thread.threadId} 
            @click=${() => this.onThreadClick(item)} 
            class="thread-item ${hasPendingNotification ? 'has-notification' : ''}">
            <div class="thread-item-avatar">
                ${threadAvatar.startsWith('<') && threadAvatar.endsWith('>') ?
                html`${unsafeHTML(threadAvatar)}` :
                html`<img src="${threadAvatar}"></img>`
            }
            </div>
            <div class="thread-content">
                <div class="thread-item-header">
                    <span class="thread-name">${threadName}</span>
                    <span class="last-update">
                        ${this.renderTaskPendingsCount(pendingTasksCount)}
                        ${displayDate}
                    </span>
                </div>
                <div class="thread-summary">
                    ${userMessage ? html`
                            <span class="last-message">${userMessageId && !isDirectMessage ? html`<span>${userMessageId}:</span>` : nothing}${userMessage || ''}</span>
                        `: nothing
            }
                    
                    ${unreadCount > 0 ? html`<span class="unread-count">${unreadCount}</span>` : hasPendingNotification ? html`<span class="unread-count">•</span>` : nothing}
                </div>
            </div>
        </li>
    `;
    }


    private renderTaskPendingsCount(pendingTasksCount: number) {

        return html`
            ${pendingTasksCount > 0 ? html`
                <span class="tasks-pendings-count">
                    ${collab_bell}
                    <span class="notification-badge">${pendingTasksCount}</span>
                </span>` : nothing}
        `

    }

    private formatMessageDate(input: string | Date): string {

        const date = typeof input === 'string' ? new Date(input) : input;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const diffTime = today.getTime() - target.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return this.msg.today;
        if (diffDays === 1) return this.msg.yesterday;

        const lang = document.querySelector('html')?.lang || 'pt-BR';
        if (diffDays > 1 && diffDays < 7) {
            return target.toLocaleDateString(lang, {
                weekday: 'short',
            });
        }

        return target.toLocaleDateString(lang);
    }


    private renderArchivedThreads() {
        if (this.filteredThreads.archived.length === 0) return html`${nothing}`;
        return html`        
            ${this.filteredThreads.archived.map((item) => {

            let threadAvatar = this.getThreadAvatar(item);
            const unreadCount = item.thread.unreadCount || 0;

            function isWithinLastWeek(date: Date): boolean {
                const now = new Date();
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                return date >= oneWeekAgo;
            }

            if (!item._lastMessageDateArchived) return html``

            return html`
                ${!isWithinLastWeek(item._lastMessageDateArchived.dateObject)
                    ? html`${nothing}`
                    : html`
                        <li @click=${() => this.onThreadClick(item)} class="thread-item">
                            <div class="thread-item-avatar">
                                    ${threadAvatar.startsWith('<') && threadAvatar.endsWith('>') ?
                            html`${unsafeHTML(threadAvatar)}` :
                            html`<img src="${threadAvatar}"></img>`
                        }
                            </div>
                            <div class="thread-content">
                                <div class="thread-item-header">
                                    <span class="thread-name">(${this.msg.archived}) ${item.thread.name || item.thread.threadId}</span>
                                    ${unreadCount > 0 ? html`<span class="unread-count">*</span>` : nothing}
                                </div>
                            </div>
                        </li>`
                }`
        })}
        `
    }

    private renderDeletingThreads() {
        if (this.filteredThreads.deleting.length === 0) return html``;
        return html`        
            ${this.filteredThreads.deleting.map((item) => {

            let threadAvatar = this.getThreadAvatar(item);
            const unreadCount = item.thread.unreadCount || 0;

            function isWithinLastWeek(date: Date): boolean {
                const now = new Date();
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                return date >= oneWeekAgo;
            }

            if (!item.lastMessageDateDeleting) return html``

            return html`
                ${!isWithinLastWeek(item.lastMessageDateDeleting.dateObject)
                    ? html``
                    : html`
                        <li @click=${() => this.onThreadClick(item)} class="thread-item">
                            <div class="thread-item-avatar">
                                    ${threadAvatar.startsWith('<') && threadAvatar.endsWith('>') ?
                            html`${unsafeHTML(threadAvatar)}` :
                            html`<img src="${threadAvatar}"></img>`
                        }
                            </div>
                            <div class="thread-content">
                                <div class="thread-item-header">
                                    <span class="thread-name">(${this.msg.deleting}) ${item.thread.name || item.thread.threadId}</span>
                                    ${unreadCount > 0 ? html`<span class="unread-count">*</span>` : nothing}

                                </div>
                            </div>
                        </li>`
                }`
        })}
        `
    }

    private renderDeletedThreads() {
        if (this.filteredThreads.deleted.length === 0) return html``;
        return html`      
          
            ${this.filteredThreads.deleted.map((item) => {
            let threadAvatar = this.getThreadAvatar(item);
            if (!item.lastMessageDateDeleting) return html``
            const unreadCount = item.thread.unreadCount || 0;

            return html`
                <li @click=${() => this.onThreadClick(item)} class="thread-item">
                    <div class="thread-item-avatar">
                            ${threadAvatar.startsWith('<') && threadAvatar.endsWith('>') ?
                    html`${unsafeHTML(threadAvatar)}` :
                    html`<img src="${threadAvatar}"></img>`
                }
                    </div>
                    <div class="thread-content">
                        <div class="thread-item-header">
                            <span class="thread-name" style="text-decoration: line-through;">(${this.msg.deleted}) ${item.thread.name || item.thread.threadId}</span>
                            ${unreadCount > 0 ? html`<span class="unread-count">*</span>` : nothing}
                        </div>
                    </div>
                </li>`
        })}
        `
    }

    private renderThreadSearch() {
        return html`
		<collab-messages-filter-102025
			@search-change=${this.onSearchInput}
            .expanded=${this.searchTerm !== ''}
            .query=${this.searchTerm}
			placeholder=${this.msg.placeholderSearch}>
		</collab-messages-filter-102025>
	`;
    }

    private renderTaskDetails() {

        if (this.elementTaskDetails) {
            return html`${this.elementTaskDetails}`
        }

        return html`<span> No find any widget to show task details <span>`;

    }

    private renderThreadDetails() {
        return html`<collab-messages-thread-details-102025 userId=${this.userId} .threadDetails=${{ ...this.actualThread }}></collab-messages-thread-details-102025>`
    }

    private renderThreadAdd() {
        return html`
            <collab-messages-add-102025 
                .onAddSuccess = ${() => { this.activeScenerie = 'list' }}
                .group=${this.group}
                userId=${this.userId} 
            ></collab-messages-add-102025>`
    }

    private onSearchInput(e: CustomEvent) {

        this.searchTerm = e.detail.toLowerCase();
        const ordenedThreads = this.getOrdenedThreadsByStatus();
        this.filteredThreads = this.getFilteredThreads(ordenedThreads);
    }

    private getScrollAnchor(container: HTMLElement): IScrollAnchor | undefined {
        const containerRect = container.getBoundingClientRect();
        const messages = Array.from(container.querySelectorAll('collab-messages-chat-message-102025')) as HTMLElement[];
        for (const message of messages) {
            const rect = message.getBoundingClientRect();
            if (rect.bottom >= containerRect.top) {
                const messageId = message.getAttribute('messageid');
                if (!messageId) return;
                return {
                    messageId,
                    offsetTop: rect.top - containerRect.top
                };
            }
        }
    }

    private restoreScrollAnchor(container: HTMLElement, anchor: IScrollAnchor | undefined) {
        if (!anchor) return;
        const target = container.querySelector(`collab-messages-chat-message-102025[messageid="${anchor.messageId}"]`) as HTMLElement | null;
        if (!target) return;
        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        container.scrollTop += targetRect.top - containerRect.top - anchor.offsetTop;
        this.savedScrollTop = container.scrollTop;
    }

    private async updateMessagesAfterScrollMore(newMessages: msg.MessagePerformanceCache[], container: HTMLElement, anchor: IScrollAnchor | undefined) {

        this.actualMessages = [...this.actualMessages, ...newMessages];
        this.actualMessagesParsed = this.parseMessages(this.actualMessages, this.lastTopicFilter);
        await this.updateComplete;
        await this.waitingForRenderCodesWebComponents();
        await this.nextFrame();
        await this.nextFrame();
        this.restoreScrollAnchor(container, anchor);
    }

    private async getBeforeMessagesInServer(thread: msg.ThreadPerformanceCache) {
        const firstItem = [...this.actualMessages].sort((a, b) => a.orderAt.localeCompare(b.orderAt))[0];
        const response = await this.getMessagesBefore(thread, firstItem.orderAt);
        const newMessages = response?.data;
        this.hasMoreMessagesBefore = response?.hasMore || false;
        return newMessages;
    }

    private onCopyChat(ev: ClipboardEvent) {

        ev.preventDefault();
        const selection = window.getSelection();
        if (!selection) return;
        let container = document.createElement("div");
        for (let i = 0; i < selection.rangeCount; i++) {
            container.appendChild(selection.getRangeAt(i).cloneContents());
        }

        const extractMessage = (el: HTMLElement) => {
            const titleEl = el.querySelector(".message-title");
            const timeEl = el.querySelector(".message-footer");
            const contentEl = el.querySelector(".collab-md-message") as HTMLElement;
            const taskEl = el.querySelector('collab-messages-task-102025') as HTMLElement;
            let author = titleEl?.textContent?.trim();
            const content = contentEl?.innerText?.trim() || "";
            const time = timeEl?.textContent?.trim() || "";
            const task = taskEl?.getAttribute('taskid');
            return {
                author,
                content,
                time,
                task
            }
        }

        const items = container.querySelectorAll(".message-time, .message-card");
        if (items.length === 0) {
            const { author, content, task, time } = extractMessage(container);
            if (content) {
                const msg = `${time ? time : ''} ${author ? author : ''} ${content} ${task ? `(Task:${task})` : ''}`;
                return ev.clipboardData?.setData("text/plain", msg);
            }
            ev.clipboardData?.setData("text/plain", selection.toString());
            return;
        }

        let result: string[] = [];
        let lastAuthor = "";
        let currentDate = "";


        items.forEach(el => {
            if (el.classList.contains("message-time")) {
                currentDate = el.textContent?.trim() || '';
                result.push(`--- ${currentDate} ---`);
            } else {
                let { author, content, task, time } = extractMessage(el as HTMLElement);
                if (!author) author = lastAuthor;
                else lastAuthor = author;
                if (content) {
                    result.push(`${time ? time : ''} ${author ? author : ''} ${content} ${task ? `(Task:${task})` : ''}`);
                }
            }
        });

        if (result.length > 0) {
            ev.clipboardData?.setData("text/plain", result.join("\n"));
        }
    }

    private async onChatScroll(e: Event) {
        if (this.scrollLock) return;
        
        this.removeAllModal();
        this.updateTaskNotificationNavDirection();
        if (this.isChangeTopics) {
            this.isChangeTopics = false;
            return;
        }

        if (this.isSystemChangeScroll) {
            this.isSystemChangeScroll = false;
            return;
        }

        if (this.isToolbarAutoScroll || Date.now() <= this.ignoreToolbarScrollClearUntil) {
            this.deferToolbarAutoScrollEnd();
        } else {
            this.clearToolbarSelection();
        }

        const container = e.target as HTMLElement;
        this.savedScrollTop = container.scrollTop;
        const threshold = 5;
        this.wasMessagesAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - threshold;
        if (
            this.wasMessagesAtBottom &&
            this.actualThread &&
            (this.unreadCountInSelectedThread > 0 || hasThreadNotificationPending(this.actualThread.thread.threadId))
        ) {
            await this.clearUnreadMarkerForActualThread();
        }
        const scrollAnchor = this.getScrollAnchor(container);

        if (
            container.scrollTop === 0 &&
            !this.isLoadingMoreMessages &&
            this.actualThread &&
            !this.hasMoreMessagesLocalDB &&
            this.hasMoreMessagesBefore
        ) {
            this.isLoadingMoreMessages = true;
            const newMessages = await this.getBeforeMessagesInServer(this.actualThread.thread);
            if (newMessages) await this.updateMessagesAfterScrollMore(newMessages.map(item => ({ ...item, footers: [], })), container, scrollAnchor);
            this.isLoadingMoreMessages = false;
            return;
        }

        if (
            container.scrollTop === 0 &&
            !this.isLoadingMoreMessages &&
            this.actualThread &&
            this.hasMoreMessagesLocalDB
        ) {

            this.isLoadingMoreMessages = true;
            const newOffset = this.messagesOffset + this.messagesLimit;
            const newMessages = await getMessagesByThreadId(
                this.actualThread.thread.threadId,
                this.messagesLimit,
                newOffset
            );

            if (newMessages.length > 0) {
                this.messagesOffset = newOffset;
                await this.updateMessagesAfterScrollMore(newMessages, container, scrollAnchor);
            } else {
                const newMessages = await this.getBeforeMessagesInServer(this.actualThread.thread);
                if (newMessages) await this.updateMessagesAfterScrollMore(newMessages.map(item => ({ ...item, footers: [], })), container, scrollAnchor);
                this.hasMoreMessagesLocalDB = false;
            }

            this.isLoadingMoreMessages = false;
        }
    }

    private getFirstPendingTaskNotificationInView(): string {
        if (!this.actualThread) return '';
        const pendingTaskIds = getPendingTaskNotificationsForThread(this.actualThread.thread.threadId);
        if (pendingTaskIds.length === 0) return '';
        const renderedTasks = Array.from(this.querySelectorAll('collab-messages-task-102025')) as HTMLElement[];
        const found = renderedTasks.find((item) => pendingTaskIds.includes(item.getAttribute('taskid') || ''));
        return found?.getAttribute('taskid') || '';
    }

    private getTaskNotificationElement(taskId: string): HTMLElement | null {
        if (!taskId) return null;
        return this.querySelector(`collab-messages-task-102025[taskid="${taskId}"]`) as HTMLElement | null;
    }

    private updateTaskNotificationNavDirection() {
        const taskId = this.getFirstPendingTaskNotificationInView();
        const taskEl = this.getTaskNotificationElement(taskId);
        if (!this.messageContainer || !taskEl) {
            if (this.taskNotificationNavDirection) this.taskNotificationNavDirection = '';
            return;
        }

        const containerRect = this.messageContainer.getBoundingClientRect();
        const taskRect = taskEl.getBoundingClientRect();
        let nextDirection: 'up' | 'down' | '' = '';
        if (taskRect.bottom < containerRect.top) nextDirection = 'up';
        else if (taskRect.top > containerRect.bottom) nextDirection = 'down';

        if (this.taskNotificationNavDirection !== nextDirection) {
            this.taskNotificationNavDirection = nextDirection;
        }
    }

    private async scrollToTaskNotification(taskId: string) {
        const taskEl = this.getTaskNotificationElement(taskId);
        if (!taskEl) return;
        taskEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await this.nextFrame();
        this.updateTaskNotificationNavDirection();
    }

    private groupThreadsByPrefix(threads: IFilteredThreads[]) {

        const groups: Record<string, IFilteredThreads[]> = {};

        for (const t of threads) {
            const name = this.getThreadName(t);
            if (name.startsWith('_') && name.includes('/')) {
                const [prefix] = name.split('/');
                if (!groups[prefix]) groups[prefix] = [];
                groups[prefix].push(t);
            } else {
                if (!groups[name]) groups[name] = [];
                groups[name].push(t);
            }
        }

        return groups;
    }

    private getOrdenedThreadsByStatus(): IFilteredThreadsByStatus {
        const threads = this.userThreads[this.group]
            .map((item) => {
                const lastTimestamp = item.thread.lastMessageTime
                    ? item.thread.lastMessageTime
                    : item.thread.history?.length ? item.thread.history[0]?.timestamp : '';

                const formatedTimestamp = formatTimestamp(lastTimestamp)?.dateFull;
                const lastMessageDate = this.parseLocalDate(formatedTimestamp || '');
                let lastMessageDateArchived;
                let lastMessageDateDeleting;

                if (item.thread.status === 'archived' && item.thread.archivedAt) {
                    const formatedTimestampArchived = formatTimestamp(item.thread.archivedAt)?.dateFull;
                    lastMessageDateArchived = this.parseLocalDate(formatedTimestampArchived || '');
                }

                if ((item.thread.status === 'deleting' || item.thread.status === 'deleted') && item.thread.deletedAt) {
                    const formatedTimestampArchived = formatTimestamp(item.thread.deletedAt)?.dateFull;
                    lastMessageDateDeleting = this.parseLocalDate(formatedTimestampArchived || '');
                }

                return {
                    ...item,
                    _lastMessageDate: lastMessageDate,
                    _lastMessageDateArchived: lastMessageDateArchived,
                    lastMessageDateDeleting: lastMessageDateDeleting,

                };
            })
            .sort((a, b) =>
                b._lastMessageDate.dateObject.getTime() -
                a._lastMessageDate.dateObject.getTime()
            );

        const result = {
            archived: [] as IFilteredThreads[],
            deleted: [] as IFilteredThreads[],
            deleting: [] as IFilteredThreads[],
            active: [] as IFilteredThreads[],
        };

        for (const threadInfo of threads) {
            if (threadInfo.thread.status === 'archived') {
                result.archived.push(threadInfo);
            } else if (threadInfo.thread.status === 'deleted') {
                result.deleted.push(threadInfo);
            } else if (threadInfo.thread.status === 'deleting') {
                result.deleting.push(threadInfo);
            } else {
                result.active.push(threadInfo);
            }
        }

        return result;
    }
    private getFilteredThreads(ordened: IFilteredThreadsByStatus): IFilteredThreadsByStatus {
        if (!this.searchTerm) return ordened;

        const term = this.searchTerm.toLowerCase();

        Object.keys(ordened).forEach((key: string) => {
            const key2 = key as 'deleted' | 'archived' | 'active' | 'deleting';

            ordened[key2] = ordened[key2].filter(item => {
                const threadName = item.thread.name?.toLowerCase() ?? '';

                if (threadName.startsWith('@')) {
                    const users = item.thread.users
                        .map(u => this.usersAvaliables.find(au => au.userId === u.userId));
                    return users.some(user =>
                        (`@${user?.name.toLowerCase()}`).includes(term)
                    );
                }

                return threadName.includes(term);
            });
        });

        return ordened;
    }

    private async getMessagesAfter(
        thread: msg.Thread,
        lastOrderAt: string = ''
    ): Promise<msg.ResponseGetMessagesAfter | undefined> {

        if (!this.userId) return;

        const result = await msgGetMessagesAfter({
            lastOrderAt,
            threadId: thread.threadId,
            userId: this.userId
        });

        if (!result.success || !result.response) {
            console.warn('Failed to fetch messages after:', result.error);
            return;
        }

        return result.response;
    }

    private async getMessagesBefore(
        thread: msg.Thread,
        orderAt: string = ''
    ): Promise<msg.ResponseGetMessagesBefore | undefined> {

        if (!this.userId) return;

        const result = await msgGetMessagesBefore({
            orderAt,
            threadId: thread.threadId,
            userId: this.userId
        });

        if (!result.success || !result.response) {
            console.warn('Failed to fetch messages before:', result.error);
            return;
        }

        return result.response;
    }

    private parseMessages(
        rawData: msg.MessagePerformanceCache[],
        topic: string
    ): IMessageGrouped {
        const groupedByDay: IMessageGrouped = {};

        [...rawData].forEach(msg => {

            if (
                topic &&
                msg.content &&
                !(
                    msg.content.startsWith(`${topic} `) ||
                    msg.content.endsWith(` ${topic}`) ||
                    msg.content.includes(` ${topic} `)
                )
            ) {
                return;
            }

            const formatted = formatTimestamp(msg.createAt);
            const dateKey =
                formatted?.date ||
                msg.createAt
                    .slice(0, 8)
                    .replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');

            if (!groupedByDay[dateKey]) {
                groupedByDay[dateKey] = [];
            }
            groupedByDay[dateKey].push(msg);
        });


        for (const day in groupedByDay) {
            groupedByDay[day].sort((a, b) =>
                a.orderAt.localeCompare(b.orderAt)
            );
        }

        return this.groupMessages(groupedByDay);
    }

    private groupMessages(groupedByDay: IMessageGrouped): IMessageGrouped {
        const result: IMessageGrouped = {};

        Object.keys(groupedByDay).forEach((key) => {
            let consecutiveCount = 0;
            let lastSenderId: string | null = null;

            result[key] = groupedByDay[key].map((msg, index, arr) => {
                let isSame = false;

                if (msg.senderId === lastSenderId) {
                    consecutiveCount++;
                    isSame = true;
                    if (consecutiveCount >= 3) {
                        consecutiveCount = 0;
                        isSame = false;
                    }

                } else {
                    consecutiveCount = 0;
                    isSame = false;
                    lastSenderId = msg.senderId;
                }

                return { ...msg, isSame };
            });
        });

        return result;
    }

    private parseLocalDate(dateString: string) {

        const normalized = dateString.includes(' ')
            ? dateString.replace(' ', 'T')
            : `${dateString}T00:00:00`;

        const date = new Date(normalized);

        return {
            dateObject: date,
            datafull: date.toLocaleString(),
            date: date.toLocaleDateString(),
            time: date.toTimeString().split(' ')[0]
        };
    }

    private mergeMessages(
        array1: msg.MessagePerformanceCache[],
        array2: msg.MessagePerformanceCache[]
    ): msg.MessagePerformanceCache[] {
        const map = new Map<string, msg.MessagePerformanceCache>();
        for (const item of array1) {
            map.set(`${item.threadId}/${item.createAt}`, item);
        }
        for (const item of array2) {
            map.set(`${item.threadId}/${item.createAt}`, { ...map.get(`${item.threadId}/${item.createAt}`), ...item });
        }
        return Array.from(map.values());
    }

    private async onThreadClick(threadInfo: IThreadInfo) {

        this.welcomeMessage = '';
        this.activeScenerie = 'loading';
        this.lastTopicFilter = '';
        this.messagesOffset = 0;
        this.hasMoreMessagesLocalDB = true;
        this.hasMoreMessagesBefore = false;
        this.toolbarView = {};
        this.ignoreToolbarScrollClearUntil = 0;
        this.actualThread = threadInfo;
        const temp = await getThread(this.actualThread.thread.threadId)
        this.unreadCountInSelectedThread = temp?.unreadCount ?? (threadInfo.thread as msg.ThreadPerformanceCache).unreadCount ?? 0;
        this.lastMessageReaded = (temp as any)?.lastMessageReadTime || (threadInfo.thread as any).lastMessageReadTime || '';
        const messagesInDb = await getMessagesByThreadId(this.actualThread.thread.threadId, this.messagesLimit, 0);
        this.actualMessages = messagesInDb;
        this.isSystemChangeScroll = true;
        this.actualMessagesParsed = this.parseMessages(this.actualMessages, this.lastTopicFilter);
        this.activeScenerie = 'details';
        this.isLoadingMessages = true;
        this.isThreadError = false;
        this.threadErrorMsg = '';
        this.checkWelcomeMessage(this.actualThread.thread, messagesInDb);

        try {
            if (!this.userId) return;
            const threadByServer = await this.getThreadInfo(this.actualThread.thread.threadId, this.userId, threadInfo.thread.lastSync || new Date('2000-01-01').toISOString());
            const threadUpdated = await updateThread(threadByServer.thread.threadId, threadByServer.thread);
            threadInfo = await this.updateMessagesOnDb(threadByServer, threadByServer.messages);

            await updateUsers(threadByServer.users);
            this.actualThread = { ...threadByServer };
            this.updateUsersInState(threadByServer.users);
            notifyThreadChange(threadUpdated);
            if (threadByServer.hasMore) await this.loadAllMessages(threadInfo);
            if (this.unreadCountInSelectedThread === 0) await this.markActualThreadRead(threadByServer.thread.threadId);
            this.checkForRegisterNotification();

            if (threadByServer.threadsPending) {
                this.updateThreadPendingsInBackground(threadInfo.thread.threadId, threadByServer.threadsPending)
            }

            if (['deleted'].includes(threadByServer.thread.status)) {
                await deleteAllMessagesFromThread(threadByServer.thread.threadId);
                const threadUpdated = await this.clearUnreadMessageFromThread(threadByServer.thread);
                notifyThreadChange(threadUpdated);
            }

            this.checkNotificationsUnreadMessages();

            if (this.taskToOpen) {
                await this.updateComplete;
                this.openTask();
            }

            await this.verifyChatScroll();


        } catch (err: any) {
            this.isThreadError = true;
            this.threadErrorMsg = err.message || 'Error on read thread';
            throw new Error('Error on loading messages: ' + err.message);
        } finally {
            this.isLoadingMessages = false;
        }
    }

    private async updateThreadPendingsInBackground(threadId: string, threadsPendings: string[]) {
        for await (let threadPending of threadsPendings) {

            let threadId2: string = '';
            const parts = threadPending.split(':');
            threadId2 = parts[0];

            if (threadId !== threadId2) {
                removeThreadFromSync(threadId2);
                await getThreadUpdateInBackground(threadPending);
            }
        }
    }

    private async markActualThreadRead(threadId: string) {
        const lastMessageReadTime = this.getLastKnownMessageCreateAt();
        const thread = await markThreadReadLocally(threadId, lastMessageReadTime);
        if (thread && this.actualThread?.thread.threadId === threadId) {
            this.actualThread.thread = thread;
        }
    }

    private async clearUnreadMarkerForActualThread() {
        if (!this.actualThread) return;
        const lastMessageReadTime = this.getLastKnownMessageCreateAt();
        const thread = await markThreadReadLocally(this.actualThread.thread.threadId, lastMessageReadTime);
        if (thread) this.actualThread.thread = thread;
        this.unreadCountInSelectedThread = 0;
        this.lastMessageReaded = lastMessageReadTime || '';
    }

    private getLastKnownMessageCreateAt(): string | undefined {
        const lastMessage = [...this.actualMessages]
            .sort((a, b) => (a.orderAt || a.createAt).localeCompare(b.orderAt || b.createAt))
            .at(-1);
        return lastMessage?.createAt;
    }

    private openTask() {
        let taskEl: Element | null = null;
        if (this.taskToOpen === 'last') {
            const tasks = this.querySelectorAll('collab-messages-task-102025');
            taskEl = tasks[tasks.length - 1] || null;
        } else {
            taskEl = this.querySelector(`collab-messages-task-102025[taskid="${this.taskToOpen}"]`);
        }

        if (taskEl) {
            taskEl.dispatchEvent(new CustomEvent('taskclick', {
                bubbles: true,
                composed: true
            }));

        }
        this.taskToOpen = '';
    }

    private checkWelcomeMessage(thread: msg.ThreadPerformanceCache, messagesInDb: msg.MessagePerformanceCache[]) {
        if (messagesInDb.length > 0) return;
        if (!thread.welcomeMessage) return;
        this.welcomeMessage = thread.welcomeMessage;
    }

    private async checkNotificationsUnreadMessages() {
        const hasPendingMessages = await checkIfNotificationUnread();
        if (!hasPendingMessages) {
            changeFavIcon(false);
            notifyThreadNotification(false);
        }
    }

    private alreadyCheckForRegisterToken: boolean = false;
    private async checkForRegisterNotification() {
        if (this.alreadyCheckForRegisterToken) return;
        this.alreadyCheckForRegisterToken = true;
        const notificationPreference = loadNotificationPreferences();
        if (notificationPreference === 'denied') return;
        await registerToken();
    }

    private async loadAllMessages(threadInfo: IThreadInfo): Promise<void> {

        const response = await this.getMessagesAfter(threadInfo.thread, threadInfo.thread.lastSync || '');
        if (!response || !response.data || response.data.length === 0 || !this.actualThread || !this.userId) {
            return;
        }
        threadInfo = await this.updateMessagesOnDb(threadInfo, response.data);
        if (!response.hasMore) return;
        return this.loadAllMessages(threadInfo);
    }


    private async updateMessagesOnDb(threadInfo: IThreadInfo, messages: msg.Message[] | undefined) {
        if (!messages) return threadInfo;
        const newMessages: msg.MessagePerformanceCache[] = [];
        for await (let mm of messages) {
            const messageId = this.normalizeMessageId(mm.threadId, mm.orderAt || mm.createAt)
            const messageOld = await getMessage(messageId);
            const tempMessage: msg.MessagePerformanceCache = { ...mm, footers: messageOld?.footers || [] };
            newMessages.push(tempMessage);
        }


        const lastMessages = newMessages[newMessages.length - 1] || this.actualMessages[0];
        await addMessages(newMessages);
        const preserveUnreadMarker = this.shouldPreserveUnreadMarker(threadInfo.thread.threadId);
        if (lastMessages && this.actualThread && !preserveUnreadMarker) this.actualThread.thread = await updateLastMessageReadTime(threadInfo.thread.threadId, lastMessages.createAt);
        this.actualMessages = this.mergeMessages(this.actualMessages, newMessages);
        this.actualMessagesParsed = this.parseMessages(this.actualMessages, this.lastTopicFilter);
        await this.updateLastMessage(threadInfo, preserveUnreadMarker);
        return threadInfo;
    }

    private async clearUnreadMessageFromThread(thread: msg.Thread) {
        const _thread = await updateThread(
            thread.threadId,
            thread,
            '',
            '',
            0
        );
        if (this.actualThread) this.actualThread.thread = _thread;
        return _thread;
    }

    private shouldPreserveUnreadMarker(threadId: string): boolean {
        return this.actualThread?.thread.threadId === threadId && this.unreadCountInSelectedThread > 0;
    }

    private getFirstUnreadMessageCreateAt(): string {
        if (!this.unreadCountInSelectedThread) return '';
        const sortedMessages = [...this.actualMessages].sort((a, b) =>
            (a.orderAt || a.createAt).localeCompare(b.orderAt || b.createAt)
        );
        if (!this.lastMessageReaded) return sortedMessages[0]?.createAt || '';
        const lastReadIndex = sortedMessages.findIndex(message => message.createAt === this.lastMessageReaded);
        return sortedMessages[lastReadIndex + 1]?.createAt || '';
    }

    private getUnreadMessagesCount(): number {
        const firstUnreadMessageCreateAt = this.getFirstUnreadMessageCreateAt();
        if (!firstUnreadMessageCreateAt) return 0;
        const sortedMessages = [...this.actualMessages].sort((a, b) =>
            (a.orderAt || a.createAt).localeCompare(b.orderAt || b.createAt)
        );
        const firstUnreadIndex = sortedMessages.findIndex(message => message.createAt === firstUnreadMessageCreateAt);
        return firstUnreadIndex >= 0 ? sortedMessages.length - firstUnreadIndex : 0;
    }

    private async updateLastMessage(threadInfo: IThreadInfo, preserveUnreadMarker = false) {
        const keys = Object.keys(this.actualMessagesParsed).sort();
        const lastKey = keys.length > 0 ? keys[keys.length - 1] : null;
        const lastArray = lastKey ? this.actualMessagesParsed[lastKey] : [];
        const lastMessage = lastArray.length > 0 ? lastArray[lastArray.length - 1] : undefined;
        if (lastMessage) {
            const lastMessageText = `${lastMessage.senderId}:${lastMessage.content}`;
            const unreadCount = preserveUnreadMarker ? this.getUnreadMessagesCount() : 0;
            const thread = await updateThread(
                threadInfo.thread.threadId,
                threadInfo.thread,
                lastMessageText,
                lastMessage.createAt,
                unreadCount,
                lastMessage.createAt,
            );
            if (preserveUnreadMarker) this.unreadCountInSelectedThread = unreadCount;
            threadInfo.thread = thread;
            notifyThreadChange(thread);
        }
    }

    private async onTitleClick() {
        await this.updateComplete;
        if (this.activeScenerie === 'task') {
            this.activeScenerie = 'details';
            return;
        }
        if (this.activeScenerie === 'details' || this.activeScenerie === 'threadAdd') {
            this.actualThread = undefined;
            this.activeScenerie = 'list';
            return;
        }
        if (this.activeScenerie === 'threadDetails') {
            this.activeScenerie = 'details';
            return;
        }
        if (this.activeScenerie === 'forwardMessage') {
            this.cancelForwardMessage();
            return;
        }
        if (this.activeScenerie === 'toolbarHelp') {
            this.closeToolbarHelp();
            return;
        }
    }

    private onThreadDetailsClick() {
        this.saveScrollPosition();
        this.activeScenerie = 'threadDetails';
    }

    private onThreadAddClick() {
        this.activeScenerie = 'threadAdd';
    }

    private async handleSend(value: string,
        opt: {
            isSpecialMention: boolean,
            agentName: string,
            replyTo?: string,
            attachments?: File[]
        }
    ) {
        if (!this.canWriteCurrentThread()) {
            throw new Error(this.msg.readOnlyThread);
        }
        this.isSystemChangeScroll = true;
        this.lastTopicFilter = '';

        if (this.actualThread) {

            const isDirectMessage = this.isDirectMessage(this.actualThread);
            const isDirectMessageToAgent =
                this.actualThread.thread.openClawAgents?.some(agent =>
                    this.actualThread?.thread.users?.some(user => user.userId === agent.collabUserId)
                );

            if (isDirectMessage && isDirectMessageToAgent && !value.startsWith('@@')) {
                const agentDM = this.actualThread?.thread.users.find((user) => user.userId !== this.userId);
                const alias = this.actualThread.thread.openClawAgents?.find((agentOC) => agentOC.collabUserId === agentDM?.userId)?.alias;
                if (alias) value = `@@${alias.trim()} ${value.trim()}`;
            }

        }

        try {
            if (opt.attachments?.length) {
                await this.addAttachmentMessage(value, opt.attachments, opt.replyTo);
            } else if (!opt.isSpecialMention) {
                await this.addMessage(value, opt.replyTo);
            } else {
                await this.addMessageIA(value, opt.agentName, opt.replyTo);
            }
            await this.scrollMessagesToBottom();
        } catch (err: any) {
            throw new Error(err.message);
        }
    }

    private handlePromptResize(e: CustomEvent) {
        if (this.wasMessagesAtBottom) {
            const chatEl = this.querySelector('.chat-container') as HTMLElement | null;
            if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
        }
    }

    private async scrollMessagesToBottom() {
        this.isSystemChangeScroll = true;
        await this.updateComplete;
        await this.waitingForRenderCodesWebComponents();
        await this.nextFrame();
        if (this.messageContainer) {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
            this.wasMessagesAtBottom = true;
            this.updateTaskNotificationNavDirection();
        }
        this.isSystemChangeScroll = false;
    }

    private async addMessage(prompt: string, replyTo: string | undefined) {
        if (!this.userId || !this.actualThread) return;

        this.unreadCountInSelectedThread = 0;

        const message: IMessage = await this.createTempMessage(
            prompt,
            this.userId,
            this.actualThread.thread.threadId,
            replyTo
        );

        try {
            const context: msg.ExecutionContext = {
                message,
                task: undefined,
                isTest: false
            };

            const contextToBot = await getBotsContext(
                this.actualThread.thread,
                prompt,
                context
            );

            const result = await msgAddMessage({
                content: prompt,
                threadId: this.actualThread.thread.threadId,
                userId: this.userId,
                ...(replyTo ? { replyTo } : {}),
                ...(contextToBot ? { contextToBot } : {})
            });

            if (!result.success || !result.response?.message) {
                throw new Error(
                    result.error || 'Failed to send message'
                );
            }

            message.isFailed = false;
            message.isFailedError = '';

            await this.updateMessage2(
                false,
                true,
                message,
                result.response.message,
                result.response.botOutputs
            );
            const responseMessages = (result.response as any).messages as msg.Message[] | undefined;
            for (const responseMessage of responseMessages || []) {
                await this.updateMessage2(
                    false,
                    true,
                    responseMessage as IMessage,
                    responseMessage,
                    undefined
                );
            }
            await this.scrollMessagesToBottom();
            await this.clearUnreadMarkerForActualThread();

        } catch (err: any) {
            message.isFailed = true;
            message.isFailedError = err?.message || 'Failed to send message';
            message.isLoading = false;

            this.actualMessagesParsed = this.parseMessages(
                this.actualMessages,
                this.lastTopicFilter
            );

            console.error('Error sending message:', err);
        }
    }

    private async addAttachmentMessage(prompt: string, files: File[], replyTo: string | undefined) {
        if (!this.userId || !this.actualThread) return;
        if (files.length === 0) return;

        const threadId = this.actualThread.thread.threadId;
        const attachments: msg.AttachmentUploadCompletion[] = [];

        for (const file of files.slice(0, 6)) {
            const createResult = await msgCreateAttachmentUpload({
                userId: this.userId,
                threadId,
                fileName: file.name,
                contentType: file.type || 'application/octet-stream',
                sizeBytes: file.size
            });
            if (!createResult.success || !createResult.response) {
                throw new Error(createResult.error || 'Failed to create attachment upload');
            }

            const uploadResponse = await fetch(createResult.response.uploadUrl, {
                method: 'PUT',
                headers: createResult.response.headers,
                body: file
            });
            if (!uploadResponse.ok) {
                throw new Error(`Failed to upload attachment: ${file.name}`);
            }

            attachments.push({
                attachmentId: createResult.response.attachmentId,
                storageKey: createResult.response.storageKey,
                fileName: file.name,
                contentType: file.type || 'application/octet-stream',
                sizeBytes: file.size
            });
        }

        const result = await msgCompleteAttachmentUpload({
            userId: this.userId,
            threadId,
            content: prompt,
            ...(replyTo ? { replyTo } : {}),
            attachments
        });
        if (!result.success || !result.response?.message) {
            throw new Error(result.error || 'Failed to complete attachment upload');
        }

        await this.updateMessage2(false, true, result.response.message as IMessage, result.response.message, undefined);
        this.clearToolbarSelection();
        await this.scrollMessagesToBottom();
        await this.clearUnreadMarkerForActualThread();
    }

    private async addMessageIA(prompt: string, agentName: string, replyTo: string | undefined) {
        if (!this.userId || !this.actualThread) return;
        this.unreadCountInSelectedThread = 0;
        const context = getTemporaryContext(this.actualThread.thread.threadId, this.userId, prompt);
        let agentToCall = AGENTDEFAULT;
        if (agentName) agentToCall = agentName;
        const message: IMessage = await this.createTempMessage(prompt, this.userId, this.actualThread.thread.threadId, replyTo);
        try {

            context.message = message;
            environment.agents.executeAgent(agentToCall, context);

        } catch (err: any) {
            console.error('Error on send message:' + err.message);
            if (message.isLoading) {
                message.isLoading = false;
                message.isFailed = true;
                message.isFailedError = err.message;
                this.actualMessagesParsed = this.parseMessages(this.actualMessages, this.lastTopicFilter);
            }
        }
    }

    private async updateMessageAI(context: msg.ExecutionContext, updateThreadDB: boolean, oldContextCreateAt?: string) {

        if (this.activeScenerie !== 'details') return;
        if (!context.message) return;

        const { content, createAt, orderAt, senderId, threadId, taskId, taskTitle, taskTitleTranslated, taskStatus,
            taskResults, taskResultsTranslated } = context.message;

        const createAt2 = oldContextCreateAt ? oldContextCreateAt : createAt;
        let messageAdded = this.actualMessages.find((item) =>
            item.senderId === senderId &&
            item.createAt === createAt2 &&
            item.threadId === threadId
        );

        if (!messageAdded) {
            const newMessage: msg.MessagePerformanceCache = {
                content,
                createAt,
                orderAt,
                senderId,
                threadId,
                footers: []
            }
            if (updateThreadDB && this.actualThread) {
                const lastMessageText = `${senderId}:${content}`;
                const thread = await updateThread(threadId, this.actualThread.thread, lastMessageText, createAt, 0, createAt);
                if (this.actualThread) this.actualThread.thread = thread;
            }
            if (taskId) newMessage.taskId = taskId;
            this.actualMessages.unshift({ context, lastChanged: new Date().getTime(), ...newMessage });
            this.actualMessagesParsed = this.parseMessages(this.actualMessages, this.lastTopicFilter);
            await addMessage(newMessage);
            this.requestUpdate();

        } else {

            messageAdded.content = content;
            messageAdded.senderId = senderId;
            messageAdded.createAt = createAt;
            messageAdded.threadId = threadId;
            messageAdded.orderAt = orderAt;
            // if (status) messageAdded.status = status;
            if (taskTitle) messageAdded.taskTitle = taskTitle;
            if (taskTitleTranslated) messageAdded.taskTitleTranslated = taskTitleTranslated;
            if (taskStatus) messageAdded.taskStatus = taskStatus;
            if (taskResults) messageAdded.taskResults = taskResults;
            if (taskResultsTranslated) messageAdded.taskResultsTranslated = taskResultsTranslated;
            messageAdded.context = context;
            messageAdded.isLoading = false;
            messageAdded.lastChanged = new Date().getTime();
            if (taskId) messageAdded.taskId = taskId;
            const cloned = structuredClone(messageAdded);
            delete cloned.context;
            delete cloned.isLoading;
            delete cloned.lastChanged;
            if (oldContextCreateAt) this.isSystemChangeScroll = true;
            this.actualMessagesParsed = this.parseMessages(this.actualMessages, this.lastTopicFilter);
            await addMessage(cloned);
            if (this.actualThread) await this.updateLastMessage(this.actualThread);
            this.requestUpdate();

        }
    }

    private async createTempMessage(content: string, senderId: string, threadId: string, replyTo: string | undefined, taskId?: string) {
        const now = new Date();
        const formattedDate = now.getUTCFullYear().toString()
            + String(now.getUTCMonth() + 1).padStart(2, '0')
            + String(now.getUTCDate()).padStart(2, '0')
            + String(now.getUTCHours()).padStart(2, '0')
            + String(now.getUTCMinutes()).padStart(2, '0')
            + String(now.getUTCSeconds()).padStart(2, '0')
            + "." + Math.floor(1000 + Math.random() * 9000);
        const newMessage: IMessage = {
            content,
            createAt: formattedDate,
            orderAt: formattedDate,
            senderId,
            threadId,
            isLoading: true,
            isFailed: false,
            isFailedError: '',
            replyTo,
            footers: []
        }

        if (taskId) newMessage.taskId = taskId;
        this.actualMessages.push(newMessage);
        this.actualMessagesParsed = this.parseMessages(this.actualMessages, this.lastTopicFilter);
        this.requestUpdate();
        await this.scrollMessagesToBottom();
        return newMessage;
    }

    private async updateMessage2(updateLastSyncThreadDB: boolean, updateLastMessageThreadDB: boolean, oldMessage: IMessage, newMessage: msg.Message, outputs: msg.BotOutput[] | undefined) {

        if (this.actualThread && (updateLastSyncThreadDB || updateLastMessageThreadDB)) {

            const lastMessageText = `${newMessage.senderId}:${newMessage.content}`;

            let thread = await updateThread(
                newMessage.threadId,
                this.actualThread.thread,
                updateLastMessageThreadDB ? lastMessageText : undefined,
                updateLastMessageThreadDB ? newMessage.createAt : undefined,
                0,
                updateLastSyncThreadDB ? newMessage.createAt : undefined,
            );

            thread = await updateLastMessageReadTime(newMessage.threadId, newMessage.createAt)
            if (this.actualThread) this.actualThread.thread = thread;
            notifyThreadChange(this.actualThread.thread);
        }

        const footerData: IMessageFooter[] = [];
        for await (let item of outputs || []) {

            const footerItem: IMessageFooter = {
                title: item.botId,
                lines: [item.output]
            }

            const module = await environment.agents.loadAgent(item.botId) as any;

            if (module && module.afterBot && typeof module.afterBot === 'function') {
                const context: msg.ExecutionContext = {
                    message: newMessage,
                    task: undefined,
                    isTest: false
                }
                try {
                    const response = await module.afterBot(context, item);
                    footerItem.lines = [response];

                } catch (err: any) {
                    footerItem.lines = [err.message];
                }
            }

            footerData.push(footerItem);

        }

        const alreadyExist = this.actualMessages.find(item =>
            item.senderId === oldMessage.senderId &&
            item.createAt === oldMessage.createAt &&
            item.threadId === oldMessage.threadId);

        if (alreadyExist) {
            this.actualMessages = this.actualMessages.map(item => {
                if (
                    item.senderId === oldMessage.senderId &&
                    item.createAt === oldMessage.createAt &&
                    item.threadId === oldMessage.threadId
                ) {
                    const { isLoading, isFailed, isFailedError, ...rest }: IMessage = { ...newMessage, isSame: oldMessage.isSame, footers: footerData };
                    return rest;
                }
                return item;
            });
        } else this.actualMessages.unshift({ ...newMessage, footers: footerData });

        const m = newMessage as IMessage;
        delete m.isLoading;
        delete m.isFailed;
        delete m.isFailedError;
        delete m.isSame;

        if (outputs) m.footers = footerData;
        await addMessage(m);
        const messagesInDb = await getMessagesByThreadId(m.threadId, this.messagesLimit, 0);
        this.actualMessages = messagesInDb;
        this.actualMessagesParsed = this.parseMessages(this.actualMessages, this.lastTopicFilter);
        this.requestUpdate();

    }


    private async onTaskClick(taskId: string, messageId: string, threadId: string, message: IMessage) {
        this.saveScrollPosition();
        const task = await this.getTaskUpdate(taskId, messageId, threadId);
        if (!task) return;
        addOrUpdateTask(task);
        this.actualTask = task;
        this.actualMessage = message;
        const messageId2 = `${this.actualThread?.thread.threadId}/${this.actualMessage?.createAt}`;

        let rc = await environment.tasks.openTaskDetails(messageId2, this.actualTask.PK || '', this.actualTask, this.actualMessage);
        if (this.hasStudioTaskDetailHost()) return;
        if (!rc.openLocal) rc = this.createLocalTaskDetails(this.actualTask, this.actualMessage);
        if (!rc.openLocal) return;

        this.activeScenerie = 'task'
        this.elementTaskDetails = rc.element;

    }

    private hasStudioTaskDetailHost(): boolean {
        const roots: ParentNode[] = [document];
        if (window.parent && window.parent !== window) {
            try {
                roots.push(window.parent.document);
            } catch {
                // Cross-origin parent is not inspectable; fall back to local behavior.
            }
        }
        return roots.some(root => !!root.querySelector('service-detail-100554'));
    }

    private createLocalTaskDetails(task: msg.TaskData, message: IMessage): { openLocal: boolean, element: HTMLElement | undefined } {
        const element = document.createElement('collab-messages-task-info-102025') as HTMLElement & {
            task?: msg.TaskData,
            message?: IMessage
        };
        element.task = task;
        element.message = message;
        return { openLocal: true, element };
    }

    private onReplyPreviewClick(ev: CustomEvent) {

        const messageReply = this.messageContainer?.querySelector(
            `collab-messages-chat-message-102025[messageid="${ev.detail.messageId}"]`
        );
        if (!messageReply) return;
        messageReply.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    private onReplyMessageClick(ev: CustomEvent) {
        if (!ev.detail) return;
        const data = ev.detail as IMessage;
        this.collabMessagesPrompt?.setReply({
            messageId: data.createAt,
            senderId: data.senderId,
            preview: data.content.slice(0, 80)
        });
    }

    private async onPinMessageClick(ev: CustomEvent) {
        if (!this.userId || !this.actualThread) return;
        if (!this.canWriteCurrentThread()) {
            this.showReadOnlyThreadError();
            return;
        }
        const data = ev.detail as { message: IMessage, pin: boolean };
        const message = data.message;
        const messageId = `${message.threadId}/${message.orderAt || message.createAt}`;
        const pinnedMessages = this.actualThread.thread.pinnedMessages || [];
        const alreadyPinned = pinnedMessages.some(item => item.messageId === messageId);
        if (data.pin && !alreadyPinned && pinnedMessages.length >= 3 && !window.confirm(this.msg.replaceOldestPin)) return;
        const result = await msgUpdateMessage({
            userId: this.userId,
            threadId: this.actualThread.thread.threadId,
            messageId: message.orderAt || message.createAt,
            pin: data.pin
        });

        if (!result.success || !result.response?.message) {
            throw new Error(result.error || 'Failed to update message pin');
        }

        await updateMessage(result.response.message);
        if (result.response.thread) {
            const updatedThread = await updateThread(
                result.response.thread.threadId,
                result.response.thread
            );
            this.actualThread.thread = updatedThread;
            notifyThreadChange(updatedThread);
        }

        this.actualMessages = this.actualMessages.map(item =>
            item.threadId === result.response!.message.threadId && item.createAt === result.response!.message.createAt
                ? { ...item, ...result.response!.message }
                : item
        );

        for (const responseMessage of result.response.messages || []) {
            await this.updateMessage2(false, true, responseMessage as IMessage, responseMessage, undefined);
        }

        this.actualMessagesParsed = this.parseMessages(this.actualMessages, this.lastTopicFilter);
        this.requestUpdate();
    }

    private async onFavoriteMessageClick(ev: CustomEvent) {
        if (!this.userId || !this.actualThread) return;
        const data = ev.detail as { message: IMessage, favorite: boolean };
        const message = data.message;
        const result = await msgUpdateMessage({
            userId: this.userId,
            threadId: this.actualThread.thread.threadId,
            messageId: message.orderAt || message.createAt,
            favorite: data.favorite
        });

        if (!result.success || !result.response?.user) {
            throw new Error(result.error || 'Failed to update message favorite');
        }

        await updateUsers([result.response.user]);
        this.updateCurrentUser(result.response.user);
        if (!data.favorite) this.clearToolbarSelection();
        this.requestUpdate();
    }

    private async onReadConfirmationMessageClick(ev: CustomEvent) {
        if (!this.userId || !this.actualThread) return;
        if (!this.canWriteCurrentThread()) {
            this.showReadOnlyThreadError();
            return;
        }
        const data = ev.detail as { message: IMessage, action: 'request' | 'confirm' | 'cancel' | 'requestExecution' | 'reviewExecution' };
        const message = data.message;
        const result = await msgUpdateMessage({
            userId: this.userId,
            threadId: this.actualThread.thread.threadId,
            messageId: message.orderAt || message.createAt,
            readConfirmation: data.action
        });

        if (!result.success || !result.response?.message) {
            throw new Error(result.error || 'Failed to update read confirmation');
        }

        await updateMessage(result.response.message);
        this.actualMessages = this.actualMessages.map(item =>
            item.threadId === result.response!.message.threadId && item.createAt === result.response!.message.createAt
                ? { ...item, ...result.response!.message }
                : item
        );

        const users = result.response.users || [];
        if (users.length > 0) {
            await updateUsers(users);
            this.updateUsersInState(users);
        }

        this.actualMessagesParsed = this.parseMessages(this.actualMessages, this.lastTopicFilter);
        this.requestUpdate();
    }

    private async onMessageActionMessageClick(ev: CustomEvent) {
        if (!this.userId || !this.actualThread) return;
        if (!this.canWriteCurrentThread()) {
            this.showReadOnlyThreadError();
            return;
        }
        const data = ev.detail as { message: IMessage, action: 'delete' | 'moderate' | 'createTask' };
        const message = data.message;
        const taskTitle = data.action === 'createTask'
            ? window.prompt(this.msg.taskTitlePrompt, this.createTaskTitleFromMessage(message)) || undefined
            : undefined;
        if (data.action === 'createTask' && !taskTitle) return;
        const result = await msgUpdateMessage({
            userId: this.userId,
            threadId: this.actualThread.thread.threadId,
            messageId: message.orderAt || message.createAt,
            messageAction: data.action,
            ...(taskTitle ? { taskTitle } : {})
        });

        if (!result.success || !result.response?.message) {
            throw new Error(result.error || 'Failed to update message');
        }

        await this.applyMessageUpdateResponse(result.response);
    }

    private async onEditMessageClick(ev: CustomEvent) {
        if (!this.userId || !this.actualThread) return;
        const data = ev.detail as { message: IMessage, content: string };
        const result = await msgUpdateMessage({
            userId: this.userId,
            threadId: this.actualThread.thread.threadId,
            messageId: data.message.orderAt || data.message.createAt,
            editContent: data.content
        });

        if (!result.success || !result.response?.message) {
            throw new Error(result.error || 'Failed to edit message');
        }

        await this.applyMessageUpdateResponse(result.response);
    }

    private async applyMessageUpdateResponse(response: msg.ResponseUpdateMessage) {
        await updateMessage(response.message);
        this.actualMessages = this.actualMessages.map(item =>
            item.threadId === response.message.threadId && item.createAt === response.message.createAt
                ? { ...item, ...response.message }
                : item
        );

        if (response.task) await addOrUpdateTask(response.task);
        if (response.taskRoomThread) {
            const existingThread = await getThread(response.taskRoomThread.threadId);
            const threadCache = existingThread
                ? await updateThread(response.taskRoomThread.threadId, response.taskRoomThread)
                : await addThread(response.taskRoomThread);
            notifyThreadChange(threadCache);
        }

        if (response.thread) {
            const updatedThread = await updateThread(
                response.thread.threadId,
                response.thread
            );
            if (this.actualThread && updatedThread.threadId === this.actualThread.thread.threadId) {
                this.actualThread.thread = updatedThread;
            }
            notifyThreadChange(updatedThread);
        }

        this.clearToolbarSelection();
        this.actualMessagesParsed = this.parseMessages(this.actualMessages, this.lastTopicFilter);
        this.requestUpdate();
    }

    private async onMarkUnreadMessageClick(ev: CustomEvent) {
        if (!this.actualThread) return;
        const message = (ev.detail as { message: IMessage }).message;
        const sortedMessages = [...this.actualMessages].sort((a, b) =>
            (a.orderAt || a.createAt).localeCompare(b.orderAt || b.createAt)
        );
        const index = sortedMessages.findIndex(item => item.threadId === message.threadId && item.createAt === message.createAt);
        if (index < 0) return;
        const previous = sortedMessages[index - 1];
        const unreadCount = sortedMessages.length - index;
        let updatedThread = await updateThread(
            this.actualThread.thread.threadId,
            this.actualThread.thread,
            undefined,
            undefined,
            unreadCount
        );
        const lastReadMessageId = previous?.createAt || '';
        updatedThread = await updateLastMessageReadTime(this.actualThread.thread.threadId, lastReadMessageId);
        this.lastMessageReaded = previous?.createAt || '';
        this.unreadCountInSelectedThread = unreadCount;
        this.actualThread.thread = updatedThread;
        notifyThreadChange(updatedThread);
        this.requestUpdate();
    }

    private onForwardMessageClick(ev: CustomEvent) {
        if (!this.actualThread) return;
        const message = (ev.detail as { message: IMessage }).message;
        this.forwardMessageSource = message;
        this.forwardDestinationQuery = '';
        this.forwardDestinationThreadId = '';
        this.forwardError = '';
        this.isForwardingMessage = false;
        this.saveScrollPosition();
        this.activeScenerie = 'forwardMessage';
    }

    private onForwardDestinationInput = (ev: Event) => {
        this.forwardDestinationQuery = (ev.target as HTMLInputElement).value;
        this.forwardDestinationThreadId = '';
        this.forwardError = '';
    }

    private selectForwardDestination(thread: msg.Thread) {
        this.forwardDestinationThreadId = thread.threadId;
        this.forwardDestinationQuery = this.getForwardThreadName(thread);
        this.forwardError = '';
    }

    private cancelForwardMessage = () => {
        this.forwardMessageSource = undefined;
        this.forwardDestinationQuery = '';
        this.forwardDestinationThreadId = '';
        this.forwardError = '';
        this.isForwardingMessage = false;
        this.activeScenerie = 'details';
    }

    private confirmForwardMessage = async () => {
        if (!this.userId || !this.forwardMessageSource) return;
        const targetThread = this.allThreads.find(thread => thread.threadId === this.forwardDestinationThreadId);
        if (!targetThread) {
            this.forwardError = this.msg.forwardSelectDestination;
            return;
        }
        this.isForwardingMessage = true;
        const message = this.forwardMessageSource;
        const content = `${this.msg.forwardPrefix}\n${this.createMessageLink(message)}\n\n${message.content}`;
        try {
            const result = await msgAddMessage({
                userId: this.userId,
                threadId: targetThread.threadId,
                content
            });
            if (!result.success || !result.response?.message) {
                throw new Error(result.error || 'Failed to forward message');
            }
            await addMessage(result.response.message as IMessage);
            const thread = await getThread(targetThread.threadId);
            if (thread) {
                const lastMessageText = `${this.userId}:${content}`;
                let updatedThread = await updateThread(targetThread.threadId, thread, lastMessageText, result.response.message.createAt, 0, result.response.message.createAt);
                updatedThread = await updateLastMessageReadTime(targetThread.threadId, result.response.message.createAt);
                notifyThreadChange(updatedThread);
            }
            this.cancelForwardMessage();
        } catch (err: any) {
            this.forwardError = err?.message || 'Failed to forward message';
            this.isForwardingMessage = false;
        }
    }

    private getForwardDestinationSuggestions(): msg.Thread[] {
        const query = this.forwardDestinationQuery.trim().toLowerCase();
        const prefix = query[0];
        const search = prefix === '#' || prefix === '@' ? query.slice(1) : query;
        return this.allThreads
            .filter(thread => this.isForwardDestinationAllowed(thread))
            .filter(thread => {
                const isDm = this.isDirectMessageThread(thread);
                const name = this.getForwardThreadName(thread).toLowerCase();
                if (!query) return true;
                if (prefix === '#') return !isDm && name.includes(search);
                if (prefix === '@') return isDm && name.replace(/^@/, '').includes(search);
                return name.includes(search) || thread.threadId.toLowerCase().includes(search);
            })
            .sort((a, b) => this.getForwardThreadSortTime(b).localeCompare(this.getForwardThreadSortTime(a)))
            .slice(0, 25);
    }

    private isForwardDestinationAllowed(thread: msg.Thread): boolean {
        if (thread.threadId === this.actualThread?.thread.threadId) return false;
        if (!thread.users.some(threadUser => threadUser.userId === this.userId)) return false;
        return !['archived', 'deleting', 'deleted'].includes(thread.status || '');
    }

    private getForwardThreadSortTime(thread: msg.Thread): string {
        return (thread as msg.ThreadPerformanceCache).lastMessageTime || thread.createdAt || thread.threadId;
    }

    private isDirectMessageThread(thread: msg.Thread) {
        return thread.name?.startsWith('@') && thread.users.length === 2;
    }

    private getForwardThreadName(thread: msg.Thread): string {
        if (this.isDirectMessageThread(thread)) {
            const otherThreadUser = thread.users.find(item => item.userId !== this.userId);
            const user = this.usersAvaliables.find(item => item.userId === otherThreadUser?.userId);
            return `@${user?.name || otherThreadUser?.userId || thread.name.replace(/^@/, '')}`;
        }
        return thread.name || thread.threadId;
    }

    private renderForwardDestinationAvatar(thread: msg.Thread) {
        if (this.isDirectMessageThread(thread)) {
            const otherThreadUser = thread.users.find(item => item.userId !== this.userId);
            const user = this.usersAvaliables.find(item => item.userId === otherThreadUser?.userId);
            if (user?.avatar_url) return html`<img src=${user.avatar_url} alt=${user.name} />`;
            return collab_message;
        }
        if (thread.avatar_url) return html`<img src=${thread.avatar_url} alt=${this.getForwardThreadName(thread)} />`;
        return collab_folder_tree;
    }

    private createTaskTitleFromMessage(message: IMessage): string {
        return (message.content || '').replace(/\s+/g, ' ').trim().slice(0, 80) || this.msg.taskTitlePrompt;
    }

    private createMessageLink(message: IMessage): string {
        const messageId = encodeURIComponent(message.orderAt || message.createAt);
        const threadId = encodeURIComponent(message.threadId);
        const url = new URL(window.location.href);
        url.hash = `message/${threadId}/${messageId}`;
        return url.toString();
    }

    private async onDeleteAttachmentMessage(ev: CustomEvent) {
        if (!this.userId || !this.actualThread) return;
        if (!this.canWriteCurrentThread()) {
            this.showReadOnlyThreadError();
            return;
        }
        const data = ev.detail as { message: IMessage, attachmentId: string };
        const message = data.message;
        const result = await msgDeleteAttachment({
            userId: this.userId,
            threadId: this.actualThread.thread.threadId,
            messageId: message.orderAt || message.createAt,
            attachmentId: data.attachmentId
        });

        if (!result.success || !result.response?.message) {
            throw new Error(result.error || 'Failed to delete attachment');
        }

        await updateMessage(result.response.message);
        this.actualMessages = this.actualMessages.map(item =>
            item.threadId === result.response!.message.threadId && item.createAt === result.response!.message.createAt
                ? { ...item, ...result.response!.message }
                : item
        );
        this.clearToolbarSelection();
        this.actualMessagesParsed = this.parseMessages(this.actualMessages, this.lastTopicFilter);
        this.requestUpdate();
    }

    private updateCurrentUser(user: msg.User) {
        this.updateUsersInState([user]);
    }

    private updateUsersInState(users: msg.User[]) {
        this.usersAvaliables = users.reduce((items, user) => this.replaceUser(items, user), this.usersAvaliables);
        if (this.actualThread) {
            this.actualThread = {
                ...this.actualThread,
                users: users.reduce((items, user) => this.replaceUser(items, user), this.actualThread.users),
            };
        }
    }

    private replaceUser(users: msg.User[], user: msg.User): msg.User[] {
        const exists = users.some(item => item.userId === user.userId);
        if (!exists) return [...users, user];
        return users.map(item => item.userId === user.userId ? user : item);
    }

    private async getTaskUpdate(
        taskId: string,
        createdAt: string,
        threadId: string
    ) {
        if (!taskId || !createdAt || !threadId) {
            throw new Error('Invalid arguments for getTaskUpdate');
        }

        if (!this.userId) {
            throw new Error('Invalid userId');
        }

        const result = await msgGetTaskUpdate({
            taskId,
            messageId: this.normalizeTaskMessageId(threadId, createdAt),
            userId: this.userId
        });

        if (!result.success || !result.response?.task) {
            if (result.statusCode === 404) {
                await this.clearMissingTaskReference(taskId, createdAt, threadId);
                return undefined;
            }
            throw new Error(
                result.error || 'Failed to fetch task update'
            );
        }

        return result.response.task;
    }

    private async clearMissingTaskReference(taskId: string, messageIdOrOrderAt: string, threadId: string) {
        await deleteTask(taskId);

        const messageId = this.normalizeMessageId(threadId, messageIdOrOrderAt);
        const message = await getMessage(messageId);
        if (!message || message.taskId !== taskId) return;

        const cleanedMessage = { ...message };
        delete cleanedMessage.taskId;
        delete cleanedMessage.stepId;
        delete cleanedMessage.taskTitle;
        delete cleanedMessage.taskStatus;
        delete cleanedMessage.taskResults;
        delete cleanedMessage.taskResultsTranslated;
        delete cleanedMessage.taskTitleTranslated;

        await updateMessage(cleanedMessage);

        if (this.actualThread?.thread.threadId !== threadId) return;
        this.actualMessages = this.actualMessages.map(item =>
            item.threadId === cleanedMessage.threadId && item.createAt === cleanedMessage.createAt
                ? cleanedMessage
                : item
        );
        this.actualMessagesParsed = this.parseMessages(this.actualMessages, this.lastTopicFilter);
        this.requestUpdate();
    }

    private normalizeTaskMessageId(threadId: string, messageIdOrOrderAt: string): string {
        if (!messageIdOrOrderAt.includes('/')) return `${threadId}/${messageIdOrOrderAt}`;
        const parts = messageIdOrOrderAt.split('/').filter(Boolean);
        if (parts.length === 2) return messageIdOrOrderAt;
        return `${parts[0]}/${parts[parts.length - 1]}`;
    }

    private normalizeMessageId(threadId: string, messageIdOrOrderAt: string): string {
        const parts = messageIdOrOrderAt.split('/').filter(Boolean);
        const orderAt = parts[parts.length - 1] || messageIdOrOrderAt;
        return `${threadId}/${orderAt}`;
    }

    private async getThreadInfo(
        threadId: string,
        userId: string,
        lastOrderAt: string
    ): Promise<msg.ResponseGetThreadUpdate> {

        const deviceId = loadNotificationDeviceId();

        try {
            const result = await msgGetThreadUpdates({
                threadId,
                userId,
                lastOrderAt,
                deviceId: deviceId || undefined
            });

            removeThreadFromSync(threadId);

            if (!result.success) {
                if (result.statusCode === 403) {
                    throw new Error(result.error || 'Access denied to thread');
                }

                throw new Error(
                    result.error || 'Failed to fetch thread updates'
                );
            }

            if (!result.response) {
                throw new Error('Empty response while fetching thread updates');
            }

            return result.response;

        } catch (err: any) {
            throw new Error(
                err?.message || 'Unexpected error while fetching thread updates'
            );
        }
    }

    private saveScrollPosition() {
        if (this.messageContainer) {
            this.savedScrollTop = this.messageContainer.scrollTop;
        }
    }

    private async restoreScrollPosition() {
        if (this.messageContainer) {
            await this.updateComplete;
            await this.waitingForRenderCodesWebComponents();
            this.messageContainer.scrollTop = this.savedScrollTop;
        }
    }

    private onTaskChange = async (e: Event) => {
        const customEvent = e as CustomEvent;
        const message: msg.Message = customEvent.detail.context.message;
        const task: msg.TaskData = customEvent.detail.context.task;
        const thId = message?.threadId;
        if (!this.actualThread || !thId || thId !== this.actualThread.thread.threadId) return;
        await this.updateMessageAI(customEvent.detail.context, false, customEvent.detail.oldContextCreateAt);
        if (task) await addOrUpdateTask(customEvent.detail.context.task);
    };


    /*
    private onTaskDetailsClose = async (_e: Event) => {
        const taskId = (_e as CustomEvent).detail;
        clearServiceDetails();
        if (taskId) {
            this.taskToOpen = taskId;
            this.openTask();
        }
    };*/

    private onThreadChange = async (e: Event) => {

        const customEvent = e as CustomEvent;
        await this.updateMessageAI(customEvent.detail, false);
        const thread = customEvent.detail as msg.Thread;
        const threadUpdated = this.userThreads[this.group].find((th) => th.thread.threadId === thread.threadId);

        if (['deleted'].includes(thread.status)) {
            await deleteAllMessagesFromThread(thread.threadId);
        }

        if (threadUpdated) threadUpdated.thread = { ...threadUpdated.thread, ...thread };
        else if (thread.group === this.group) {
            this.userThreads[this.group] = [...this.userThreads[this.group], { thread, hasMore: false, users: [] }];
        }

        if (threadUpdated?.thread.threadId === this.actualThread?.thread.threadId) {
            this.actualThread = threadUpdated;
            if (this.actualThread) {
                const hasUnreadMessages = !!(this.actualThread.thread.unreadCount && this.actualThread.thread.unreadCount > 0);
                const chatEl = this.querySelector('.chat-container') as HTMLElement | null;
                if (chatEl) {
                    const isScrolledToBottom = chatEl.scrollTop + chatEl.clientHeight >= chatEl.scrollHeight - 1;
                    if (isScrolledToBottom) this.isSystemChangeScroll = true;
                }
                const messagesInDb = await getMessagesByThreadId(this.actualThread.thread.threadId, this.messagesLimit, 0);
                this.actualMessages = messagesInDb;
                this.actualMessagesParsed = this.parseMessages(this.actualMessages, this.lastTopicFilter);
                if (hasUnreadMessages) await this.updateLastMessage(this.actualThread);
            }
        }

        if (this.activeScenerie === 'threadDetails' && (
            thread.status === 'deleted' ||
            thread.status === 'deleting' ||
            thread.status === 'archived'
        )) {
            this.activeScenerie = 'list';
        }

        this.requestUpdate();
    };

    private onMessageChange(e: Event) {

        const customEvent = e as CustomEvent;
        const message: msg.Message = customEvent.detail;

        if (!this.actualThread || !message || message.threadId !== this.actualThread.thread.threadId) return;
        let updatedMessage: msg.MessagePerformanceCache | undefined;
        this.actualMessages = this.actualMessages.map(item => {
            if (item.createAt !== message.createAt) return item;
            updatedMessage = {
                ...item,
                ...message,
                footers: item.footers || []
            };
            return updatedMessage;
        });

        for (const item of Object.values(this.actualMessagesParsed)) {
            const find = item.find(m => m.createAt === message.createAt);
            if (find) {
                Object.assign(find, updatedMessage || message);
                const item = this.messageContainer?.querySelector(`collab-messages-chat-message-102025[messageid="${message.createAt}"]`);
                if (item) (item as any)['message'] = updatedMessage || message;
                break;
            }
        }
        this.clearToolbarSelection();
        this.requestUpdate();

    }

    private onMessageSend = async (e: Event) => {
        const customEvent = e as CustomEvent;
        const message: msg.Message = customEvent.detail.context.message;
        const outputs: msg.BotOutput[] = customEvent.detail.context.botOutput;
        const thId = message?.threadId;
        if (!this.actualThread || !thId || thId !== this.actualThread.thread.threadId) return;
        this.updateMessage2(false, true, { ...message, footers: [] }, message, outputs);
    };

    private onVisibilityChange() {
        if (this.activeScenerie === 'details') {
            this.checkNotificationsUnreadMessages();
        }
    }

    private onDocumentClick = () => {
        const all = Array.from(this.querySelectorAll('collab-messages-chat-message-102025')) as CollabMessagesChatMessage102025[]
        all.forEach((item: CollabMessagesChatMessage102025) => {
            item.openedReactionMessageId = undefined;
            item.reactionPickerTarget = undefined;
            item.openedMenuFor = undefined;
            item.messageMenuTarget = undefined;
            item.openedReactionListMessageId = undefined;
            item.reactionListTarget = undefined;
        });
    };


    private scrollLock = false;
    private async verifyChatScroll() {
        if (!this.messageContainer || !this.isSystemChangeScroll) return;
        this.scrollLock = true;

        try {
            await this.updateComplete;
            await this.waitingForRenderCodesWebComponents();
            await this.nextFrame();

            const target = this.unreadEl;
            if (target) {
                target.scrollIntoView({ block: 'center' });
            } else {
                this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
            }
        } finally {
            await this.nextFrame();
            this.scrollLock = false;
            this.isSystemChangeScroll = false;
        }
    }

    private async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private nextFrame(): Promise<void> {
        return new Promise(resolve => requestAnimationFrame(() => resolve()));
    }

    private async waitingForRenderCodesWebComponents() {

        await this.nextFrame();
        if (!this.messageContainer) return;

        const allMessages = Array.from(this.messageContainer.querySelectorAll('collab-messages-chat-message-102025'));
        await Promise.all(
            Array.from(allMessages)
                .map(el => (el as LitElement).updateComplete)
        );
        await this.nextFrame();

        const allRichPreviews = Array.from(this.messageContainer.querySelectorAll('collab-messages-rich-preview-text-102025'));
        await Promise.all(
            Array.from(allRichPreviews)
                .map(el => (el as LitElement).updateComplete)
        );

        await this.nextFrame();

        const allCodes = Array.from(this.messageContainer.querySelectorAll('collab-messages-text-code-102025'));
        await Promise.all(
            Array.from(allCodes)
                .map(el => (el as any).whenRendered)
        );
    }

}

interface IMessageFooter {
    title?: string;
    lines: string[];
    icon?: string; // icon to show in footer, ex: "fa fa-check"
    color?: string; // color of the footer, ex: "#00ff00"
    backgroundColor?: string; // background color of the footer, ex: "#000000"
    timestamp?: string;
}

interface IFilteredThreadsByStatus {
    archived: IFilteredThreads[];
    deleted: IFilteredThreads[];
    deleting: IFilteredThreads[];
    active: IFilteredThreads[];
}

interface IHTMLLiThreadItem extends HTMLElement {
    item: IThreadInfo
}

interface IScrollAnchor {
    messageId: string;
    offsetTop: number;
}

interface IFilteredThreads {
    _lastMessageDate: {
        dateObject: Date;
        datafull: string;
        date: string;
        time: string;
    };
    _lastMessageDateArchived?: {
        dateObject: Date;
        datafull: string;
        date: string;
        time: string;
    };
    lastMessageDateDeleting?: {
        dateObject: Date;
        datafull: string;
        date: string;
        time: string;
    };
    hasMore?: boolean | undefined,
    thread: IDBThreadPerformanceCache;
    users: msg.User[];
}
type IMessageGrouped = { [key: string]: IMessage[] }
type IThread = { [key: string]: IThreadInfo[] }
type IScenery = 'list' | 'details' | 'loading' | 'task' | 'threadDetails' | 'threadAdd' | 'forwardMessage' | 'toolbarHelp'
