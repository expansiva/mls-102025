/// <mls fileReference="_102025_/l2/collabMessagesSettings.ts" enhancement="_102027_/l2/enhancementLit" />

import { html, nothing } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { updateUsers, listThreads } from '/_102025_/l2/collabMessagesIndexedDB.js';
import { msgGetUserUpdate, msgUpdateUserDetails } from '/_102025_/l2/shared/api.js';

import {
    loadChatPreferences,
    saveChatPreferences,
    saveNotificationPreferencesAudio,
    loadNotificationPreferencesAudio,
    loadNotificationPreferences,
    registerToken,
    saveNotificationPreferences,
    saveOpenClawIntegrations,
    loadOpenClawIntegrations,
    generateUUIDv7,
    generateAgentAvatar,

} from '/_102025_/l2/collabMessagesHelper.js';

import * as msg from '/_102025_/l2/shared/interfaces.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import {
    IChatPreferences,
    TranslateMode,
} from '/_102025_/l2/collabMessagesHelper.js';

import {
    collab_user,
    collab_minus,
    collab_ban,
    collab_dot,
    collab_message,
    collab_bell,
    collab_plug,
    collab_plus,
    collab_trash,
    collab_robot,
    collab_refresh,
    collab_copy,
    collab_chevron_left,
    collab_edit,
    collab_xmark,
    collab_floppy_disk,
    collab_check
} from '/_102025_/l2/collabMessagesIcons.js';


/// **collab_i18n_start** 
const message_pt = {
    loading: 'Carregando...',
    save: 'Salvar',
    status: 'Status',
    userid: 'Id do usuário',
    username: 'Nome do usuário',
    errorUserName: 'Nome do usuário não pode ser vazio',
    successSavingUser: 'Perfil do usuário atualizado com sucesso',
    successSavingChatPref: 'Preferências do chat atualizado com sucesso',
    chatPref: 'Preferências do chat',
    translate: 'Tradução',
    preferLanguage: 'Idioma preferido',
    userTitle: 'Usuário',
    prefNotification: 'Preferências de notificação',
    infoNotification: 'Avisamos quando houver mudanças e novas mensagens, sem pop-ups, só sincronismo, mais velocidade para você',
    moreNotification: 'Saiba mais',
    notificationStatusEnabled: 'Notificações ativadas',
    notificationStatusFailed: 'Não foi possivel ativar as notificações, verificar permissões no browser',
    btnEnableNotifications: 'Ativar notificações',
    soundEnable: 'Ativar som nas notificações',
    // Avatar
    changeAvatar: 'Alterar',
    editAvatar: 'Editar Avatar',
    avatarUrl: 'URL do Avatar',
    avatarUrlPlaceholder: 'https://exemplo.com/imagem.png',
    invalidAvatarUrl: 'URL inválida ou imagem não encontrada',
    // OpenClaw Integration
    integrationsTitle: 'Integrações - OpenClaw',
    addIntegration: 'Adicionar',
    removeIntegration: 'Remover Integração',
    editIntegration: 'Editar',
    integrationDetails: 'Detalhes da Integração',
    integrationName: 'Nome da Integração',
    serverUrl: 'URL do Servidor',
    bearerToken: 'Token de Autenticação',
    generateToken: 'Gerar Token',
    copyToken: 'Copiar Token',
    tokenCopied: 'Token copiado!',
    addAgent: 'Adicionar Agente',
    removeAgent: 'Remover',
    agentName: 'Nome do Agente',
    agentAvatar: 'Avatar URL (opcional)',
    senderId: 'Sender ID',
    agents: 'Agentes',
    noAgents: 'Nenhum agente configurado',
    noIntegrations: 'Nenhuma integração configurada',
    cancel: 'Cancelar',
    confirmRemoveIntegration: 'Remover esta integração?',
    confirmRemoveAgent: 'Remover este agente?',
    errorAgentName: 'Nome do agente é obrigatório',
    errorIntegrationName: 'Nome da integração é obrigatório',
    successSavingIntegration: 'Integração salva com sucesso',
    successRemoveIntegration: 'Integração removida com sucesso',
    configureAgent: 'Configurar Agente',
    generateAvatar: 'Gerar Avatar',
    back: 'Voltar',
    integrationRemoveInfo: 'Ao remover esta integração, os agentes vinculados a ela serão desconectados.',
    // Novas mensagens para confirmação de remoção
    deleteConfirmTitle: 'Confirmar remoção',
    deleteConfirmInstruction: 'Digite o nome da integração para confirmar:',
    deleteConfirmPlaceholder: 'Nome da integração',
    deleteConfirmButton: 'Confirmar remoção',
    deleteConfirmError: 'O nome digitado não corresponde ao nome da integração'
}

const message_en = {
    loading: 'Loading...',
    save: 'Save',
    status: 'Status',
    userid: 'User Id',
    username: 'UserName',
    errorUserName: 'User name cannot be empty',
    successSavingUser: 'User perfil updated successfully',
    successSavingChatPref: 'Chat preferences updated successfully',
    chatPref: 'Chat Preferences',
    translate: 'Translate',
    preferLanguage: 'Preferred language',
    userTitle: 'User',
    prefNotification: 'Notification Preferences',
    infoNotification: 'We\'ll notify you when there are changes and new messages — no pop-ups, just seamless syncing for faster performance.',
    moreNotification: 'Learn more',
    notificationStatusEnabled: 'Notifications enabled',
    btnEnableNotifications: 'Enable notifications',
    notificationStatusFailed: 'Unable to enable notifications, check browser permissions',
    soundEnable: 'Enable sound for notifications',
    // Avatar
    changeAvatar: 'Change',
    editAvatar: 'Edit Avatar',
    avatarUrl: 'Avatar URL',
    avatarUrlPlaceholder: 'https://example.com/image.png',
    invalidAvatarUrl: 'Invalid URL or image not found',
    // OpenClaw Integration
    integrationsTitle: 'Integrations - OpenClaw',
    addIntegration: 'Add',
    removeIntegration: 'Remove Integration',
    editIntegration: 'Edit',
    integrationDetails: 'Integration Details',
    integrationName: 'Integration Name',
    serverUrl: 'Server URL',
    bearerToken: 'Bearer Token',
    generateToken: 'Generate Token',
    copyToken: 'Copy Token',
    tokenCopied: 'Token copied!',
    addAgent: 'Add Agent',
    removeAgent: 'Remove',
    agentName: 'Agent Name',
    agentAvatar: 'Avatar URL (optional)',
    senderId: 'Sender ID',
    agents: 'Agents',
    noAgents: 'No agents configured',
    noIntegrations: 'No integrations configured',
    cancel: 'Cancel',
    confirmRemoveIntegration: 'Remove this integration?',
    confirmRemoveAgent: 'Remove this agent?',
    errorAgentName: 'Agent name is required',
    errorIntegrationName: 'Integration name is required',
    successSavingIntegration: 'Integration saved successfully',
    successRemoveIntegration: 'Integration removed successfully',
    configureAgent: 'Configure Agent',
    generateAvatar: 'Generate Avatar',
    back: 'Back',
    integrationRemoveInfo: 'Removing this integration will disconnect the agents linked to it.',
    // New messages for delete confirmation
    deleteConfirmTitle: 'Confirm removal',
    deleteConfirmInstruction: 'Type the integration name to confirm:',
    deleteConfirmPlaceholder: 'Integration name',
    deleteConfirmButton: 'Confirm removal',
    deleteConfirmError: 'The typed name does not match the integration name'
}

type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = {
    'en': message_en,
    'pt': message_pt
}
/// **collab_i18n_end**

type ViewMode = 'main' | 'integrationDetails' | 'addAgent' | 'editAvatar';

@customElement('collab-messages-settings-102025')
export class CollabMessagesSettings extends StateLitElement {

    private msg: MessageType = messages['en'];
    private list: msg.ThreadPerformanceCache[] = [];

    @state() userPerfil: msg.User | undefined;
    @state() private chatPreferences: IChatPreferences = {
        translationMode: 'icon',
        language: '',
        threadMaintenance: ''
    };

    @state() notificationPreferences?: NotificationPermission | null;
    @state() audioEnabled: boolean = false;

    // Avatar edit states
    @state() tempAvatarUrl: string = '';
    @state() avatarUrlValid: boolean = true;
    @state() avatarLoading: boolean = false;

    // OpenClaw Integration states
    @state() integrations: IOpenClawIntegrationLocal[] = [];
    @state() viewMode: ViewMode = 'main';
    @state() currentIntegrationId: string = '';
    @state() newAgentName: string = '';
    @state() newAgentAvatarUrl: string = '';
    @state() tokenCopiedId: string = '';

    // Delete confirmation states
    @state() showDeleteConfirmation: boolean = false;
    @state() deleteConfirmationInput: string = '';
    @state() deleteConfirmationError: string = '';

    @property() labelOk: string = '';
    @property() labelError: string = '';
    @property() labelOkPref: string = '';
    @property() labelErrorPref: string = '';
    @property() labelOkNotification: string = '';
    @property() labelErrorNotification: string = '';
    @property() labelOkIntegration: string = '';
    @property() labelErrorIntegration: string = '';

    @property() isSavingUser: boolean = false;
    @property() isSavingChat: boolean = false;
    @property() isSavingNotification: boolean = false;
    @property() isSavingIntegration: boolean = false;

    @query('.avatar img') userAvatarEl: HTMLImageElement | undefined;

    async firstUpdated(changedProperties: Map<PropertyKey, unknown>) {
        super.updated(changedProperties);
        this.list = await listThreads();
        this.userPerfil = await this.getUserPerfil();
        this.chatPreferences = loadChatPreferences();
        const audioPref = loadNotificationPreferencesAudio();
        this.audioEnabled = audioPref;
        this.integrations = await loadOpenClawIntegrations();
    }

    updated() {
        const select = this.renderRoot.querySelector('select#selectThread') as any;
        if (select) {
            select.value = this.chatPreferences?.threadMaintenance ?? '';
        }
    }

    render() {
        const lang = this.getMessageKey(messages);
        this.msg = messages[lang];

        if (this.viewMode === 'editAvatar') {
            return this.renderEditAvatarView();
        }

        if (this.viewMode === 'integrationDetails') {
            return this.renderIntegrationDetailsView();
        }

        if (this.viewMode === 'addAgent') {
            return this.renderAddAgentView();
        }

        return html`
            ${this.renderUser()}
            ${this.renderChatPreferences()}
            ${this.renderPreferencesNotifications()}
            ${this.renderOpenClawIntegrations()}
        `;
    }

    private renderUser() {
        const avatarUrl = this.userPerfil?.avatar_url;
        const iconByStatus = {
            'active': collab_dot,
            'deleted': collab_minus,
            'blocked': collab_ban,
            '': html``,
        }
        const icon = iconByStatus[this.userPerfil?.status || '']

        return html`
        <div>
            <div class="section user">
                <h4>${collab_user} ${this.msg.userTitle}</h4>

                <div class="user-content">
                    <div class="avatar-section">
                        <div class="avatar">
                            ${avatarUrl
                ? html`<img src="${avatarUrl}" alt="Avatar" />`
                : html`<div class="avatar-placeholder">${collab_user}</div>`}
                        </div>
                        <button class="btn-small btn-secondary" @click=${this.handleOpenEditAvatar}>
                            ${collab_edit} ${this.msg.changeAvatar}
                        </button>
                    </div>

                    <div class="user-info">
                        <div class="user-info-item">
                            <label>${this.msg.username}</label>
                            <input
                                .value=${this.userPerfil?.name ?? ''} 
                                type="text" 
                                @input=${this.handleNameInput}
                            />
                        </div>
                        <div class="user-info-row">
                            <div class="user-info-item">
                                <label>${this.msg.userid}</label>
                                <span class="user-id">${this.userPerfil?.userId ?? ''}</span>
                            </div>
                            <div class="user-info-item status">
                                <label>${this.msg.status}</label>
                                <span class=${this.userPerfil?.status}>${this.userPerfil?.status ?? 'N/A'} ${icon}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <button @click=${this.handleSave} ?disabled=${this.isSavingUser}>
                        ${this.isSavingUser ? html`<span class="loader"></span>` : html`${collab_floppy_disk} ${this.msg.save}`}
                    </button>
                </div>
                ${this.labelOk ? html`<small class="saving-ok">${this.labelOk}</small>` : ''}
                ${this.labelError ? html`<small class="saving-error">${this.labelError}</small>` : ''}      
            </div>
        </div>
        `
    }

    private renderEditAvatarView() {
        const previewUrl = this.tempAvatarUrl || this.userPerfil?.avatar_url || '';

        return html`
        <div>
            <div class="section edit-avatar">
                <h4>
                    <button class="btn-back" @click=${this.handleCancelEditAvatar}>
                        ${collab_chevron_left}
                    </button>
                    ${collab_user} ${this.msg.editAvatar}
                </h4>

                <div class="avatar-edit-content">
                    <div class="avatar-preview-small">
                        ${this.avatarLoading
                ? html`<div class="avatar-loading"><span class="loader"></span></div>`
                : previewUrl && this.avatarUrlValid
                    ? html`<img src="${previewUrl}" alt="Preview" @error=${this.handleAvatarError} />`
                    : html`<div class="avatar-placeholder">${collab_user}</div>`
            }
                    </div>
                    <div class="avatar-url-field">
                        <label>${this.msg.avatarUrl}</label>
                        <input 
                            type="url" 
                            .value=${this.tempAvatarUrl}
                            @input=${this.handleAvatarUrlInput}
                            placeholder="${this.msg.avatarUrlPlaceholder}"
                        />
                        ${!this.avatarUrlValid && this.tempAvatarUrl
                ? html`<small class="saving-error">${this.msg.invalidAvatarUrl}</small>`
                : ''
            }
                    </div>
                </div>

                <div class="form-actions">
                    <button class="btn-secondary" @click=${this.handleCancelEditAvatar}>
                        ${collab_xmark} ${this.msg.cancel}
                    </button>
                    <button @click=${this.handleSaveAvatar} ?disabled=${!this.avatarUrlValid || this.avatarLoading}>
                        ${collab_check} ${this.msg.changeAvatar}
                    </button>
                </div>
            </div>
        </div>
        `;
    }

    private renderChatPreferences() {
        return html`<div>
        <div class="section chat-preferences">
            <h4>${collab_message} ${this.msg.chatPref}</h4>
            <div class="chat-config-item form-field">
                <label for="translationMode">${this.msg.translate}:</label>
                <select id="translationMode" @change=${this.handleTranslationModeChange} .value=${this.chatPreferences?.translationMode ?? 'icon'}>
                    <option value="none">none</option>
                    <option value="icon">icon</option>
                    <option value="text">text</option>
                    <option value="iconText">icon + text</option>
                    <option value="trace">trace</option>
                </select>
            </div>
            <div class="chat-config-item form-field">
                <label>${this.msg.preferLanguage}:</label>
                <input @input=${this.handleLanguageInput} .value=${this.chatPreferences?.language ?? ''} type="text" />
            </div>
            <div class="chat-config-item action">
                <button @click=${this.handleSaveChatPref} ?disabled=${this.isSavingChat}>
                    ${this.isSavingChat ? html`<span class="loader"></span>` : html`${collab_floppy_disk} ${this.msg.save}`}
                </button>
            </div>
            ${this.labelOkPref ? html`<small class="saving-ok">${this.labelOkPref}<small>` : ''}
            ${this.labelErrorPref ? html`<small class="saving-error">${this.labelErrorPref}<small>` : ''}    
        </div>
    </div>`;
    }

    private renderPreferencesNotifications() {
        this.notificationPreferences = this.getNotificationStatus();
        return html`
        <div>
            <div class="section notification-preferences">
                <h4>${collab_bell} ${this.msg.prefNotification}</h4>

                ${this.notificationPreferences === 'granted' ?
                html`
                        <div>${this.msg.notificationStatusEnabled}</div>
                        ${this.renderReadMore()}
                    ` :
                html`
                        <button @click=${this.onEnabledNotifications} ?disabled=${this.isSavingNotification}>
                            ${this.isSavingNotification ? html`<span class="loader"></span>` : this.msg.btnEnableNotifications}
                        </button>
                        <br>
                        ${this.labelOkNotification ? html`<small class="saving-ok">${this.labelOkNotification}<small>` : ''}
                        ${this.labelErrorNotification ? html`<small class="saving-error">${this.labelErrorNotification}<small>` : ''}   
                        ${this.renderReadMore()}
                    `}
            <div class="notification-audio-config">
                <label>
                    <input type="checkbox" .checked=${this.audioEnabled} @change=${this.handleAudioToggle} />
                    ${this.msg.soundEnable}
                </label>
            </div>
        </div>
        `
    }

    private renderOpenClawIntegrations() {
        return html`
        <div>
            <div class="section integrations">
                <h4>${collab_plug} ${this.msg.integrationsTitle}</h4>

                ${this.integrations.length === 0
                ? html`<p class="no-items">${this.msg.noIntegrations}</p>`
                : html`
                        <ul class="integrations-list">
                            ${this.integrations.map(integration => html`
                                <li class="integration-item">
                                    <div class="integration-info">
                                        <span class="integration-name">${integration.name || `Integration #${integration.id.slice(0, 8)}`}</span>
                                        <span class="integration-meta">${integration.agents.length} ${this.msg.agents.toLowerCase()}</span>
                                    </div>
                                    <button class="btn-small btn-secondary" @click=${() => this.handleOpenIntegrationDetails(integration.id)}>
                                        ${collab_edit} ${this.msg.editIntegration}
                                    </button>
                                </li>
                            `)}
                        </ul>
                    `
            }
                <div class="integration-actions">
                    <button class="btn-add" @click=${this.handleAddIntegration}>
                        ${collab_plus} ${this.msg.addIntegration}
                    </button>
                </div>
            </div>
        </div>`;
    }

    private renderIntegrationDetailsView() {
        const integration = this.integrations.find(i => i.id === this.currentIntegrationId);
        if (!integration) return html``;

        const isTokenCopied = this.tokenCopiedId === integration.id;

        return html`
        <div>
            <div class="section integrations integration-details">
                    <h4>
                <button class="btn-back" @click=${this.handleBackToMain}>
                    ${collab_chevron_left}
                </button>
                ${collab_plug} ${this.msg.integrationDetails}
            </h4>
                <div class="form-field">
                    <label>${this.msg.integrationName}</label>
                    <input 
                        type="text" 
                        .value=${integration.name} 
                        @input=${(e: Event) => this.handleIntegrationNameChange(integration.id, e)} 
                        placeholder="Ex: Production Server"
                    />
                </div>

                <div class="form-field">
                    <label>${this.msg.serverUrl}</label>
                    <input 
                        type="url" 
                        .value=${integration.url} 
                        @input=${(e: Event) => this.handleIntegrationUrlChange(integration.id, e)} 
                        placeholder="https://openclaw.example.com"
                    />
                </div>
                
                <div class="form-field">
                    <label>${this.msg.bearerToken}</label>
                    <div class="token-field">
                        <input type="text" .value=${integration.bearerToken} readonly />
                        <button class="btn-icon" @click=${() => this.handleGenerateToken(integration.id)} title="${this.msg.generateToken}">
                            ${collab_refresh}
                        </button>
                        <button class="btn-icon ${isTokenCopied ? 'copied' : ''}" @click=${() => this.handleCopyToken(integration)} title="${this.msg.copyToken}">
                            ${collab_copy}
                        </button>
                    </div>
                    ${isTokenCopied ? html`<small class="saving-ok">${this.msg.tokenCopied}</small>` : ''}
                </div>

                <div class="agents-section">
                    <div class="agents-header">
                        <label>${this.msg.agents}</label>
                        <button class="btn-small" @click=${() => this.handleOpenAddAgent(integration.id)}>
                            ${collab_plus} ${this.msg.addAgent}
                        </button>
                    </div>
                    ${integration.agents.length === 0
                ? html`<p class="no-items">${this.msg.noAgents}</p>`
                : html`
                            <div class="agents-list">
                                ${integration.agents.map(agent => this.renderAgent(integration.id, agent))}
                            </div>
                        `
            }
                </div>

                <div class="form-actions">
                    ${!integration.isLocal ? html`
                        <div class="info-message">
                            ${this.msg.integrationRemoveInfo}
                        </div>

                        <button 
                            class="btn-danger-outline" 
                            @click=${() => this.handleToggleDeleteConfirmation()}
                        >
                            ${collab_trash} ${this.msg.removeIntegration}
                        </button>
                        
                        ${this.renderDeleteConfirmation(integration)}
                    ` : nothing}
                </div>
                ${!this.showDeleteConfirmation ? html`
                <div class="form-actions">
                    <button class="btn-secondary" style="margin-left:auto" @click=${() => this.handleCancelIntegration(integration.id)}>
                        ${collab_xmark} ${this.msg.cancel}
                    </button>
                    <button  @click=${() => this.handleSaveIntegration(integration.id)}>
                        ${this.isSavingIntegration ? html`<span class="loader"></span>` : html`${collab_floppy_disk} ${this.msg.save}`}
                    </button>
                </div>` : nothing}

                ${this.labelOkIntegration ? html`<small class="saving-ok">${this.labelOkIntegration}</small>` : ''}
                ${this.labelErrorIntegration ? html`<small class="saving-error">${this.labelErrorIntegration}</small>` : ''}
            </div>
        </div>`;
    }

    private renderDeleteConfirmation(integration: IOpenClawIntegrationLocal) {
        if (!this.showDeleteConfirmation) return nothing;

        const integrationName = integration.name || `Integration #${integration.id.slice(0, 8)}`;
        const isMatch = this.deleteConfirmationInput.trim() === integrationName;

        return html`
            <div class="delete-confirmation">
                <label>${this.msg.deleteConfirmInstruction}</label>
                <span class="confirm-name">${integrationName}</span>
                <input 
                    type="text" 
                    .value=${this.deleteConfirmationInput}
                    @input=${this.handleDeleteConfirmationInput}
                />
                <div class="delete-actions">
                    <button 
                        class="btn-cancel" 
                        @click=${this.handleCancelDelete}
                    >${this.msg.cancel}</button>
                    <button 
                        class="btn-confirm" 
                        @click=${() => this.handleConfirmDelete(integration.id, integrationName)}
                        ?disabled=${!isMatch || this.isSavingIntegration}
                    >${this.isSavingIntegration ? html`<span class="loader"></span>` : this.msg.deleteConfirmButton}</button>
                </div>
            </div>
        `;
    }

    private renderAgent(integrationId: string, agent:msg.IOpenClawAgent) {
        return html`
        <div class="agent-card">
            <div class="agent-avatar">
                <img src="${agent.avatarUrl}" alt="${agent.name}" />
            </div>
            <div class="agent-info">
                <span class="agent-name">${agent.name}</span>
                <span class="agent-sender-id">${agent.senderId}</span>
            </div>
            <button class="btn-icon btn-danger" @click=${() => this.handleRemoveAgent(integrationId, agent.id)} title="${this.msg.removeAgent}">
                ${collab_trash}
            </button>
        </div>`;
    }

    private renderAddAgentView() {
        const integration = this.integrations.find(i => i.id === this.currentIntegrationId);
        if (!integration) return html``;

        const previewAvatar = this.newAgentAvatarUrl || (this.newAgentName ? generateAgentAvatar(this.newAgentName) : '');
        const previewSenderId = this.newAgentName
            ? `integration:openclaw:${this.newAgentName.toLowerCase().replace(/\s+/g, '')}`
            : 'integration:openclaw:...';

        return html`
        <div>
            
            <div class="section add-agent-form">
            <h4>
                <button class="btn-back" @click=${this.handleBackToIntegrationDetails}>
                    ${collab_chevron_left}
                </button>
                ${collab_robot} ${this.msg.configureAgent}
            </h4>
                <p class="integration-context">${integration.name || `Integration #${integration.id.slice(0, 8)}`}</p>
                
                <div class="agent-preview">
                    ${previewAvatar
                ? html`<img src="${previewAvatar}" alt="Preview" class="preview-avatar" />`
                : html`<div class="preview-avatar-placeholder">${collab_robot}</div>`
            }
                    <div class="preview-info">
                        <span class="preview-name">${this.newAgentName || '...'}</span>
                        <span class="preview-sender-id">${previewSenderId}</span>
                    </div>
                </div>

                <div class="form-field">
                    <label>${this.msg.agentName} *</label>
                    <input type="text" .value=${this.newAgentName} @input=${this.handleNewAgentNameInput} placeholder="Ex: Assistant Bot" />
                </div>

                <div class="form-field">
                    <label>${this.msg.agentAvatar}</label>
                    <div class="avatar-input-group">
                        <input type="url" .value=${this.newAgentAvatarUrl} @input=${this.handleNewAgentAvatarInput} placeholder="https://..." />
                        <button class="btn-small" @click=${this.handleGenerateAgentAvatar}>
                            ${collab_refresh} ${this.msg.generateAvatar}
                        </button>
                    </div>
                </div>

            
                <div class="form-actions">
                    <button class="btn-secondary" @click=${this.handleBackToIntegrationDetails}>
                        ${this.msg.cancel}
                    </button>
                    <button class="btn-primary" @click=${this.handleSaveAgent}>
                        ${collab_floppy_disk} ${this.msg.save}
                    </button>
                </div>

                ${this.labelErrorIntegration ? html`<small class="saving-error">${this.labelErrorIntegration}</small>` : ''}
                
                
            </div>
        </div>`;
    }

    private getNotificationStatus(): NotificationPermission | null {
        const notificationPreferences = loadNotificationPreferences();
        if ('Notification' in window) {
            const permission = Notification.permission;
            if (permission === this.notificationPreferences) return notificationPreferences;
            if (permission === 'granted' && notificationPreferences === 'denied') {
                saveNotificationPreferences('default');
                return 'default'
            }
            if (permission === 'denied' && notificationPreferences === 'granted') {
                saveNotificationPreferences('denied');
                return 'default'
            }
        }
        return notificationPreferences;
    }

    private renderReadMore() {
        return html`
            <details>
                <summary>${this.msg.moreNotification}</summary>
                <div><span>${this.msg.infoNotification}</span></div>   
            </details>
        `
    }

    // Avatar edit handlers
    private handleOpenEditAvatar() {
        this.tempAvatarUrl = this.userPerfil?.avatar_url || '';
        this.avatarUrlValid = true;
        this.avatarLoading = false;
        this.viewMode = 'editAvatar';
    }

    private handleCancelEditAvatar() {
        this.tempAvatarUrl = '';
        this.avatarUrlValid = true;
        this.avatarLoading = false;
        this.viewMode = 'main';
    }

    private handleAvatarUrlInput(e: Event) {
        const input = e.target as HTMLInputElement;
        this.tempAvatarUrl = input.value;

        if (!this.tempAvatarUrl) {
            this.avatarUrlValid = true;
            return;
        }

        // Validate URL format
        try {
            new URL(this.tempAvatarUrl);
        } catch {
            this.avatarUrlValid = false;
            return;
        }

        // Test if image loads
        this.avatarLoading = true;
        const img = new Image();
        img.onload = () => {
            this.avatarLoading = false;
            this.avatarUrlValid = true;
        };
        img.onerror = () => {
            this.avatarLoading = false;
            this.avatarUrlValid = false;
        };
        img.src = this.tempAvatarUrl;
    }

    private handleAvatarError() {
        this.avatarUrlValid = false;
    }

    private handleSaveAvatar() {
        if (!this.avatarUrlValid || this.avatarLoading) return;

        if (this.userPerfil) {
            this.userPerfil = { ...this.userPerfil, avatar_url: this.tempAvatarUrl };
        }
        this.viewMode = 'main';
    }

    // Delete confirmation handlers
    private handleToggleDeleteConfirmation() {
        this.showDeleteConfirmation = !this.showDeleteConfirmation;
        this.deleteConfirmationInput = '';
        this.deleteConfirmationError = '';
    }

    private handleDeleteConfirmationInput(e: Event) {
        const input = e.target as HTMLInputElement;
        this.deleteConfirmationInput = input.value;
        this.deleteConfirmationError = '';
    }

    private handleCancelDelete() {
        this.showDeleteConfirmation = false;
        this.deleteConfirmationInput = '';
        this.deleteConfirmationError = '';
    }

    private async handleConfirmDelete(integrationId: string, integrationName: string) {
        if (this.deleteConfirmationInput.trim() !== integrationName) {
            return;
        }

        this.isSavingIntegration = true;
        const tempIntegrations = this.integrations.filter(i => i.id !== integrationId);
        try {
            await saveOpenClawIntegrations(tempIntegrations);
            this.labelOkIntegration = this.msg.successRemoveIntegration;
            this.integrations = tempIntegrations;
            this.showDeleteConfirmation = false;
            this.deleteConfirmationInput = '';
            this.handleBackToMain();
        } catch (err: any) {
            this.labelErrorIntegration = err.message;
        } finally {
            this.isSavingIntegration = false;
        }
    }

    // OpenClaw Integration handlers
    private handleAddIntegration() {
        const newIntegration: IOpenClawIntegrationLocal = {
            id: generateUUIDv7(),
            name: '',
            url: '',
            bearerToken: generateUUIDv7(),
            agents: [],
            createdAt: new Date().toISOString(),
            isLocal: true
        };
        this.integrations = [...this.integrations, newIntegration];
        this.currentIntegrationId = newIntegration.id;
        this.viewMode = 'integrationDetails';

    }

    private handleOpenIntegrationDetails(integrationId: string) {
        this.currentIntegrationId = integrationId;
        this.labelOkIntegration = '';
        this.labelErrorIntegration = '';
        this.showDeleteConfirmation = false;
        this.deleteConfirmationInput = '';
        this.viewMode = 'integrationDetails';
    }

    private async handleRemoveIntegration(integrationId: string) {
        if (!confirm(this.msg.confirmRemoveIntegration)) return;
        this.isSavingIntegration = true;
        const tempIntegrations = this.integrations.filter(i => i.id !== integrationId);
        try {
            await saveOpenClawIntegrations(tempIntegrations);
            this.labelOkIntegration = this.msg.successRemoveIntegration;
            this.integrations = tempIntegrations;
            this.handleBackToMain();

        }
        catch (err: any) {
            this.labelErrorIntegration = err.message;
        } finally {
            this.isSavingIntegration = false;
        }
    }

    private handleCancelIntegration(integrationId: string) {
        this.integrations = this.integrations.filter(i => i.id !== integrationId && !i.isLocal);
        this.handleBackToMain();
    }

    private async handleSaveIntegration(integrationId: string) {

        this.isSavingIntegration = true;
        this.integrations = this.integrations.map(i => {
            if (i.id === integrationId) {
                const { isLocal, ...rest } = i;
                return rest;
            }
            return i;
        });

        try {
            await saveOpenClawIntegrations(this.integrations);
            this.labelOkIntegration = this.msg.successSavingIntegration;
        }
        catch (err: any) {
            this.labelErrorIntegration = err.message;
        } finally {
            this.isSavingIntegration = false;
        }
    }

    private handleIntegrationNameChange(integrationId: string, e: Event) {
        const input = e.target as HTMLInputElement;
        this.integrations = this.integrations.map(i =>
            i.id === integrationId ? { ...i, name: input.value } : i
        );
    }

    private handleIntegrationUrlChange(integrationId: string, e: Event) {
        const input = e.target as HTMLInputElement;
        this.integrations = this.integrations.map(i =>
            i.id === integrationId ? { ...i, url: input.value } : i
        );
    }

    private handleGenerateToken(integrationId: string) {
        this.integrations = this.integrations.map(i =>
            i.id === integrationId ? { ...i, bearerToken: generateUUIDv7() } : i
        );
    }

    private async handleCopyToken(integration: msg.IOpenClawIntegration) {
        await navigator.clipboard.writeText(integration.bearerToken);
        this.tokenCopiedId = integration.id;
        setTimeout(() => { this.tokenCopiedId = ''; }, 2000);
    }

    private handleOpenAddAgent(integrationId: string) {
        this.currentIntegrationId = integrationId;
        this.newAgentName = '';
        this.newAgentAvatarUrl = '';
        this.labelErrorIntegration = '';
        this.viewMode = 'addAgent';
    }

    private handleBackToMain() {
        this.viewMode = 'main';
        this.currentIntegrationId = '';
        this.newAgentName = '';
        this.newAgentAvatarUrl = '';
        this.labelErrorIntegration = '';
        this.labelOkIntegration = '';
        this.showDeleteConfirmation = false;
        this.deleteConfirmationInput = '';
    }

    private handleBackToIntegrationDetails() {
        this.viewMode = 'integrationDetails';
        this.newAgentName = '';
        this.newAgentAvatarUrl = '';
        this.labelErrorIntegration = '';
    }

    private handleNewAgentNameInput(e: Event) {
        const input = e.target as HTMLInputElement;
        this.newAgentName = input.value;
    }

    private handleNewAgentAvatarInput(e: Event) {
        const input = e.target as HTMLInputElement;
        this.newAgentAvatarUrl = input.value;
    }

    private handleGenerateAgentAvatar() {
        if (this.newAgentName) {
            this.newAgentAvatarUrl = generateAgentAvatar(this.newAgentName);
        }
    }

    private handleSaveAgent() {
        if (!this.newAgentName.trim()) {
            this.labelErrorIntegration = this.msg.errorAgentName;
            return;
        }

        const agentId = generateUUIDv7();
        const sanitizedName = this.newAgentName.toLowerCase().replace(/\s+/g, '');
        const newAgent: msg.IOpenClawAgent = {
            id: agentId,
            name: this.newAgentName.trim(),
            avatarUrl: this.newAgentAvatarUrl || generateAgentAvatar(this.newAgentName),
            senderId: `integration:openclaw:${sanitizedName}`,
            createdAt: new Date().toISOString()
        };

        this.integrations = this.integrations.map(i =>
            i.id === this.currentIntegrationId
                ? { ...i, agents: [...i.agents, newAgent] }
                : i
        );

        this.handleBackToIntegrationDetails();
        setTimeout(() => { this.labelOkIntegration = ''; }, 3000);
    }

    private handleRemoveAgent(integrationId: string, agentId: string) {
        if (!confirm(this.msg.confirmRemoveAgent)) return;
        this.integrations = this.integrations.map(i =>
            i.id === integrationId
                ? { ...i, agents: i.agents.filter(a => a.id !== agentId) }
                : i
        );

    }

    // Original handlers
    private handleAudioToggle(e: Event) {
        const target = e.target as HTMLInputElement;
        this.audioEnabled = target.checked;
        saveNotificationPreferencesAudio(this.audioEnabled);
    }

    private async onEnabledNotifications() {
        this.labelErrorNotification = '';
        this.labelOkNotification = '';
        this.isSavingNotification = true;
        try {
            saveNotificationPreferences('default');
            const token = await registerToken();
            this.notificationPreferences = loadNotificationPreferences();
            this.isSavingNotification = false;
            if (token === null) this.labelOkNotification = this.msg.notificationStatusFailed;
            else this.labelOkNotification = this.msg.notificationStatusEnabled;
        } catch (err: any) {
            this.isSavingNotification = false;
            console.error('Error on enable notificatin:', err.message);
            this.labelErrorNotification = err.message;
        }
    }


    private async getUserPerfil() {
        try {
            const result = await msgGetUserUpdate({ userId: "" });

            if (!result.success || !result.response?.user) {
                throw new Error(result.error || 'Failed to fetch user profile');
            }

            return result.response.user;

        } catch (err: any) {
            throw new Error(err?.message || 'Unexpected error while fetching user profile');
        }
    }
    private async handleSave() {
        this.labelError = '';
        this.labelOk = '';

        if (!this.userPerfil || !this.userPerfil.name) {
            this.labelError = this.msg.errorUserName;
            return;
        }

        this.isSavingUser = true;

        try {
            const result = await msgUpdateUserDetails({
                userId: this.userPerfil.userId,
                avatar_url: this.userPerfil.avatar_url,
                name: this.userPerfil.name,
                status: this.userPerfil.status,
                deviceId: this.userPerfil.notifications?.[0]?.deviceId || '',
                notificationToken: this.userPerfil.notifications?.[0]?.notificationToken || '',
            });

            if (!result.success || !result.response?.user) {
                this.labelError =
                    result.error || 'Failed to update user profile.';
                return;
            }

            this.labelOk = this.msg.successSavingUser || 'User profile updated successfully.';

            await updateUsers([result.response.user]);

        } catch (error: any) {
            console.error('Error updating user profile:', error);
            this.labelError =
                error?.message || 'An unexpected error occurred while saving the user profile.';
        } finally {
            this.isSavingUser = false;
        }
    }

    private async handleSaveChatPref() {
        this.labelErrorPref = '';
        this.labelOkPref = '';
        this.isSavingChat = true;
        try {
            saveChatPreferences(this.chatPreferences);
            this.labelOkPref = `${this.msg.successSavingChatPref}`;
            this.isSavingChat = false;
        } catch (error: any) {
            console.error('Error on update chat preferences:', error);
            this.labelErrorPref = error.message;
            this.isSavingChat = false;
        }
    }

    private handleTranslationModeChange(e: Event) {
        const select = e.target as HTMLSelectElement;
        this.chatPreferences = { ...this.chatPreferences, translationMode: select.value as TranslateMode };
    }

    private handleLanguageInput(e: Event) {
        const target = e.target as HTMLInputElement;
        this.chatPreferences = { ...this.chatPreferences, language: target.value };
    }

    private handleNameInput(e: Event) {
        if (!this.userPerfil) return;
        const target = e.target as HTMLInputElement;
        this.userPerfil.name = target.value;
    }
}

interface IOpenClawIntegrationLocal extends msg.IOpenClawIntegration {
    isLocal?: boolean
}