/// <mls fileReference="_102025_/l2/collabMessagesThreadDetails.ts" enhancement="_102027_/l2/enhancementLit" />

import { html, repeat, ifDefined, nothing } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';

import { updateThread, getUser, deleteAllMessagesFromThread } from '/_102025_/l2/collabMessagesIndexedDB.js';
import { collab_triangle_exclamation, collab_floppy_disk, collab_edit } from '/_102025_/l2/collabMessagesIcons.js';
import { notifyThreadChange } from '/_102025_/l2/collabMessagesEvents.js';
import { addMessage, loadOpenClawIntegrations, generateUUIDv7, generateAgentAvatar } from "/_102025_/l2/collabMessagesHelper.js";

import * as msg from '/_102025_/l2/shared/interfaces.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';

import {
    msgGetThreadUpdates,
    msgRemoveParticipantFromThread,
    msgAddOrUpdateThreadIntegration,
    msgAddOrUpdateThreadBot,

    msgAddOrUpdateThreadOpenClawAgent,
    msgRemoveThreadOpenClawAgent,

    msgUpdateThread
} from '/_102025_/l2/shared/api.js';

import '/_102025_/l2/collabMessagesInputTag.js';
import '/_102025_/l2/collabMessagesAddParticipant.js';
import '/_102025_/l2/collabMessagesChangeAvatar.js';

/// **collab_i18n_start** 
const message_pt = {
    loading: 'Carregando...',
    threadName: 'Nome da thread',
    visibility: 'Visibilidade',
    visibilityPublic: 'Pública',
    visibilityPrivate: 'Privada',
    visibilityCompany: 'Empresa',
    visibilityTeam: 'Time',
    status: 'Status',
    statusActive: 'Ativo',
    statusArchived: 'Arquivado',
    statusDeleted: 'Deletado',
    statusDeleting: 'Deletando',
    topicsDefault: 'Tópicos',
    welcomeMessage: 'Mensagem de boas-vindas',
    remove: 'Remover',
    disable: 'Desabilitar',
    active: 'Ativar',
    users: 'Usuários',
    bots: 'Bots',
    agents: 'Agents',
    group: 'Grupo',
    details: 'Detalhes',
    languages: 'Tradução automática nos idiomas',
    languagesHint: 'A cada mensagem será verificado o idioma da mensagem e feito a tradução para os idiomas acima, deixe em branco para não gastar créditos.',
    validateFormError: 'Preencha todos os campos obrigatórios.',
    userError: 'ID de usuário inválido.',
    btnSave: 'Salvar alterações',
    btnSaveAgent: 'Adicionar agente',

    btnCancel: 'Cancelar',
    btnEdit: 'Editar',
    successSaving: 'Alterações salvas com sucesso!',
    noChanges: 'Nenhuma alteração detectada.',
    addParticipant: 'Adicionar participante',
    addAgent: 'Adicionar Agent',
    labelUserId: 'Nome do usuario ou Id',
    labelPermission: 'Autoridade:',
    errorFieldsAddParticipant: 'Preencha todos os campos!',
    errorRemoveUser: 'Erro ao remover usuário',
    errorRemoveAgent: 'Erro ao remover agent',
    successAddAgent: 'Agent adicionado com sucesso',
    successRemoveAgent: 'Agent removido com sucesso',
    threadDetails: 'Detalhes da sala',
    changeAvatar: 'Alterar avatar',
    errorSaveThreadDeletStatus: 'A thread não pode ser alterada enquanto status "deleting"',
    threadNameInvalid: 'The name must start with #',
    selectIntegration: 'Selecione a integração',
    selectAgent: 'Selecione o agent',
    noIntegrations: 'Nenhuma integração encontrada',
    noAgentsInIntegration: 'Nenhum agent nesta integração',
    allAgentsAdded: 'Todos os agents já foram adicionados',
    agentAlreadyAdded: 'Já adicionado',
    cancel: 'Cancelar',
    save: 'Salvar',
    noAgents: 'Nenhum agent adicionado',
    noTopics: 'Nenhum tópico definido',
    noLanguages: 'Nenhum idioma definido',
    noWelcomeMessage: 'Nenhuma mensagem definida',
}

const message_en = {
    loading: 'Loading...',
    threadName: 'Thread name',
    visibility: 'Visibility',
    visibilityPublic: 'Public',
    visibilityPrivate: 'Private',
    visibilityCompany: 'Company',
    visibilityTeam: 'Team',
    status: 'Status',
    statusActive: 'Active',
    statusArchived: 'Archived',
    statusDeleted: 'Deleted',
    statusDeleting: 'Deleting',
    topicsDefault: 'Topics',
    welcomeMessage: 'Welcome message',
    remove: 'Remove',
    disable: 'Disable',
    active: 'Active',
    group: 'Group',
    users: 'Users',
    bots: 'Bots',
    agents: 'Agents',
    languages: 'Automatic translation in multiple languages',
    details: 'Details',
    languagesHint: 'For each message, the language will be detected and translated into the languages above. Leave blank to avoid spending credits.',
    validateFormError: 'Please fill in all required fields.',
    userError: 'Invalid user ID.',
    btnSave: 'Save changes',
    btnSaveAgent: 'Add agent',
    btnCancel: 'Cancel',
    btnEdit: 'Edit',
    successSaving: 'Saved successfully',
    noChanges: 'No changes.',
    addParticipant: 'Add Participant',
    addAgent: 'Add Agent',
    labelUserId: 'User id or name',
    labelPermission: 'Auth:',
    errorFieldsAddParticipant: 'Fill in all fields!',
    errorRemoveUser: 'Error on remove user',
    errorRemoveAgent: 'Error on remove agent',
    successAddAgent: 'Agent added successfully',
    successRemoveAgent: 'Agent removed successfully',
    threadDetails: 'Thread details',
    changeAvatar: 'Change avatar',
    errorSaveThreadDeletStatus: 'The thread cannot be changed when status is "deleting"',
    threadNameInvalid: 'The name must start with #',
    selectIntegration: 'Select integration',
    selectAgent: 'Select agent',
    noIntegrations: 'No integrations found',
    noAgentsInIntegration: 'No agents in this integration',
    allAgentsAdded: 'All agents already added',
    agentAlreadyAdded: 'Already added',
    cancel: 'Cancel',
    save: 'Save',
    noAgents: 'No agents added',
    noTopics: 'No topics defined',
    noLanguages: 'No languages defined',
    noWelcomeMessage: 'No message defined',
}

type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = {
    'en': message_en,
    'pt': message_pt
}
/// **collab_i18n_end**

@customElement('collab-messages-thread-details-102025')
export class CollabMessagesThreadDetails extends StateLitElement {

    private msg: MessageType = messages['en'];

    @property() userId: string | undefined = '20250417120841.1000';

    @property() threadDetails?: IThreadDetails = { "thread": {} } as IThreadDetails;

    @query('collab-messages-change-avatar-102025') avatarEl?: HTMLElement;

    @property() labelOk: string = '';
    @property() labelError: string = '';
    @property() labelErrorRemoveUser: string = '';
    @property() labelErrorRemoveBoot: string = '';
    @property() labelErrorAgent: string = '';
    @property() labelOkAgent: string = '';

    @state() private isLoading: boolean = false;
    @state() private editedThreadDetails?: IThreadDetails;

    @state() private isDirectMessage?: boolean = false;
    @state() private isChannel?: boolean = false;
    @state() private isFileChannel?: boolean = false;

    // Details edit mode
    @state() private isEditingDetails: boolean = false;

    // Agent states
    @state() private showAgentForm: boolean = false;
    @state() private integrations: msg.IOpenClawIntegration[] = [];
    @state() private selectedIntegrationId: string = '';
    @state() private selectedAgentId: string = '';
    @state() private isLoadingAgents: boolean = false;

    async firstUpdated(changedProperties: Map<PropertyKey, unknown>) {
        super.firstUpdated(changedProperties);
        this.editedThreadDetails = JSON.parse(JSON.stringify(this.threadDetails));
        this.loadIntegrations();
    }

    private async loadIntegrations() {
        try {
            this.integrations = await loadOpenClawIntegrations();
        } catch (err: any) {
            console.error('Error loading integrations:', err.message);
            this.integrations = [];
        }
    }

    async updated(changedProperties: Map<string, any>) {
        super.updated(changedProperties);

        if (changedProperties.has('threadDetails') && this.threadDetails && this.userId) {

            for (const user of this.threadDetails?.thread.users || []) {
                const find = this.threadDetails?.users.find((u) => u.userId === user.userId);
                if (!find) {
                    const resUser = await getUser(user.userId);
                    if (resUser) {
                        this.threadDetails.users.push(resUser);
                        if (this.editedThreadDetails) this.editedThreadDetails.users = [... this.threadDetails.users];
                        this.requestUpdate();
                    }
                    else {
                        const data = await this.getThreadInfo(this.threadDetails.thread.threadId, this.userId);
                        this.threadDetails = data;
                        this.editedThreadDetails = JSON.parse(JSON.stringify(this.threadDetails));
                    }
                }
            }
        }
    }

    private getAddedAgentIds(): Set<string> {
        const integrations: msg.ThreadIntegration[] = this.editedThreadDetails?.thread.integrations || [];
        const addedIds = new Set<string>();
        for (const integration of integrations) {
            if (integration.config?.agentId && integration.status === 'active') {
                addedIds.add(integration.config.agentId);
            }
        }
        return addedIds;
    }

    private getAvailableAgents(integrationId: string): { agent: msg.IOpenClawAgent; isAdded: boolean }[] {
        const integration = this.integrations.find(i => i.id === integrationId);
        if (!integration) return [];

        const addedIds = this.getAddedAgentIds();
        return integration.agents.map(agent => ({
            agent,
            isAdded: addedIds.has(agent.id)
        }));
    }

    private getVisibilityLabel(visibility: string | undefined): string {
        switch (visibility) {
            case 'public': return this.msg.visibilityPublic;
            case 'private': return this.msg.visibilityPrivate;
            case 'company': return this.msg.visibilityCompany;
            case 'team': return this.msg.visibilityTeam;
            default: return visibility || '-';
        }
    }

    private getStatusLabel(status: string | undefined): string {
        switch (status) {
            case 'active': return this.msg.statusActive;
            case 'archived': return this.msg.statusArchived;
            case 'deleted': return this.msg.statusDeleted;
            case 'deleting': return this.msg.statusDeleting;
            default: return status || '-';
        }
    }

    private enterEditMode() {
        this.editedThreadDetails = JSON.parse(JSON.stringify(this.threadDetails));
        this.isEditingDetails = true;
        this.labelOk = '';
        this.labelError = '';
    }

    private cancelEditMode() {
        this.editedThreadDetails = JSON.parse(JSON.stringify(this.threadDetails));
        this.isEditingDetails = false;
        this.labelOk = '';
        this.labelError = '';
    }

    render() {

        const lang = this.getMessageKey(messages);
        this.msg = messages[lang];
        this.isDirectMessage = this.threadDetails?.thread?.name?.startsWith('@');
        this.isChannel = this.threadDetails?.thread?.name?.startsWith('#');
        this.isFileChannel = this.threadDetails?.thread?.name?.startsWith('_');

        return html`
        <div class="content">
            ${this.isEditingDetails ? this.renderDetailsEditMode() : this.renderDetailsViewMode()}
            ${this.renderUsers()}
            ${this.renderAgents()}
            ${this.renderBots()}
        </div>
        `;
    }

    private renderDetailsViewMode() {
        const thread = this.threadDetails?.thread;
        const topics = thread?.defaultTopics?.filter(t => t && t.trim()) || [];
        const languages = thread?.languages?.filter(l => l && l.trim()) || [];

        return html`
        <div class="section details details-view">
            <div class="details-header">
                <h3>${this.msg.details}
                    <button class="btn-edit" @click=${this.enterEditMode} title="${this.msg.btnEdit}">
                    ${collab_edit}
                    </button>
                </h3>
            
            </div>

            <div class="details-summary">
                ${this.isChannel ? html`
                    <div class="summary-avatar">
                        <img src="${thread?.avatar_url || generateAgentAvatar(thread?.name || '')}" 
                             alt="${thread?.name}" 
                             width="48" 
                             height="48" />
                    </div>
                ` : ''}

                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">${this.msg.threadName}</span>
                        <span class="summary-value">${thread?.name || '-'}</span>
                    </div>

                    <div class="summary-item">
                        <span class="summary-label">${this.msg.status}</span>
                        <span class="summary-value status-badge status-${thread?.status}">
                            ${this.getStatusLabel(thread?.status)}
                        </span>
                    </div>

                    <div class="summary-item">
                        <span class="summary-label">${this.msg.visibility}</span>
                        <span class="summary-value">${this.getVisibilityLabel(thread?.visibility)}</span>
                    </div>

                    <div class="summary-item">
                        <span class="summary-label">${this.msg.topicsDefault}</span>
                        <span class="summary-value">
                            ${topics.length > 0
                ? html`<span class="tags-inline">${topics.join(', ')}</span>`
                : html`<span class="empty-value">${this.msg.noTopics}</span>`
            }
                        </span>
                    </div>

                    ${this.isChannel ? html`
                        <div class="summary-item summary-item-full">
                            <span class="summary-label">${this.msg.welcomeMessage}</span>
                            <span class="summary-value">
                                ${thread?.welcomeMessage
                    ? html`<span class="welcome-preview">${thread.welcomeMessage}</span>`
                    : html`<span class="empty-value">${this.msg.noWelcomeMessage}</span>`
                }
                            </span>
                        </div>
                    ` : ''}

                    <div class="summary-item">
                        <span class="summary-label">${this.msg.languages}</span>
                        <span class="summary-value">
                            ${languages.length > 0
                ? html`<span class="tags-inline">${languages.join(', ')}</span>`
                : html`<span class="empty-value">${this.msg.noLanguages}</span>`
            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
        `;
    }


    private renderDetailsEditMode() {
        return html`
        <div class="section details details-edit">
            <div class="details-header">
                <h3>${this.msg.details}: ${this.threadDetails?.thread.threadId}</h3>
            </div>

            ${this.isChannel ? html`
                <collab-messages-change-avatar-102025
                    ?disabled
                    userId=${this.userId}
                    threadId=${this.threadDetails?.thread.threadId}
                    value=${ifDefined(this.editedThreadDetails?.thread.avatar_url)}
                    nameValue=${ifDefined(this.editedThreadDetails?.thread.name)}
                    @value-changed=${(e: CustomEvent<string>) => {
                    if (this.editedThreadDetails) {
                        this.editedThreadDetails.thread.avatar_url = e.detail;
                    }
                }}
                ></collab-messages-change-avatar-102025>
            `: ''}

            <label>${this.msg.threadName}
                <input type="text" required
                    .value=${this.editedThreadDetails?.thread.name}
                    pattern=${ifDefined(this.isChannel ? "^#.*" : undefined)}
                    ?disabled=${this.isDirectMessage || this.isFileChannel}
                    @input=${(e: Event) => { if (this.editedThreadDetails && !this.isChannel) this.editedThreadDetails.thread.name = (e.target as HTMLInputElement).value }}
                >
                <span class="field-thread-name-error">${this.msg.threadNameInvalid}</span>
            </label>

            <label>${this.msg.status}
                <select 
                    name="status" 
                    required
                    .disabled=${['deleting'].includes(this.editedThreadDetails?.thread.status || '')}
                    .value=${this.editedThreadDetails?.thread.status}
                    @change=${(e: Event) => {
                if (this.editedThreadDetails) {
                    this.editedThreadDetails.thread.status =
                        (e.target as HTMLSelectElement).value as msg.ThreadStatus;
                }
            }}
                >
                    <option value="active">${this.msg.statusActive}</option>
                    <option value="archived">${this.msg.statusArchived}</option>
                    <option 
                        value="deleting" 
                        ?hidden=${this.editedThreadDetails?.thread.status !== 'deleting'}
                    >
                        ${this.msg.statusDeleting}
                    </option>
                    <option value="deleted">${this.msg.statusDeleted}</option>
                </select>
            </label>

            <label>${this.msg.visibility}
                <select name="visibility" required
                    ?disabled=${this.isDirectMessage || this.isFileChannel}
                    .value=${this.editedThreadDetails?.thread.visibility}
                    @change=${(e: Event) => { if (this.editedThreadDetails && this.isChannel) this.editedThreadDetails.thread.visibility = (e.target as HTMLInputElement).value as msg.ThreadVisibility }}>
                    <option value="public">${this.msg.visibilityPublic}</option>
                    <option value="private">${this.msg.visibilityPrivate}</option>
                    <option value="company">${this.msg.visibilityCompany}</option>
                    <option value="team">${this.msg.visibilityTeam}</option>
                </select>
            </label>
            
            <label>${this.msg.topicsDefault}</label>
            <collab-messages-input-tag-102025 
                pattern="^\\+[a-zA-Z0-9-]+$"
                .value=${this.editedThreadDetails?.thread.defaultTopics?.join(',')}
                placeholder="+topic"
                .onValueChanged=${(value: string) => {
                if (this.editedThreadDetails) {
                    this.editedThreadDetails.thread.defaultTopics = value.split(',');
                }
            }}
                id="topicsInput"
            ></collab-messages-input-tag-102025>

            ${this.isChannel ? html`
                <label>${this.msg.welcomeMessage}</label>
                <textarea 
                    name="welcomemessage"
                    rows="5" 
                    .value=${this.editedThreadDetails?.thread?.welcomeMessage || ''}
                    @input=${(e: Event) => { if (this.editedThreadDetails && this.isChannel) this.editedThreadDetails.thread.welcomeMessage = (e.target as HTMLInputElement).value }}
                ></textarea>  
            ` : ''}
                
            <label>${this.msg.languages}</label>
            <collab-messages-input-tag-102025 
                pattern="^[a-z]{2}$|^[a-z]{2}-[A-Z]{2}$"
                .value=${this.editedThreadDetails?.thread?.languages?.join(',')}
                .onValueChanged=${(value: string) => { if (this.editedThreadDetails) this.editedThreadDetails.thread.languages = value.split(',') }}
                id="languageInput"
            ></collab-messages-input-tag-102025>
            <small>${this.msg.languagesHint}</small>
    
            <div class="actions">
                <div class="form-actions">
                    <button class="btn-cancel" @click=${this.cancelEditMode}>
                        ${this.msg.btnCancel}
                    </button>
                    <button class="btn-save" @click=${this.saveChanges} ?disabled=${this.isLoading}>
                        ${this.isLoading ? html`<span class="loader"></span>` : html`${collab_floppy_disk} ${this.msg.btnSave}`}
                    </button>
                </div>
                ${this.labelOk ? html`<small class="saving-ok">${this.labelOk}</small>` : ''}
                ${this.labelError ? html`<small class="saving-error">${this.labelError}</small>` : ''}   
            </div>
        </div>
        `;
    }

    private renderUsers() {

        const users = this.editedThreadDetails?.users || [];
        const isDm = this.threadDetails?.thread?.name?.startsWith('@');
        const threadUsers = users.filter((user) => !user.kind);

        const usersValids = this.editedThreadDetails?.thread.users.filter(user =>
            threadUsers.some(tu => tu.userId === user.userId)
        );

        return html`
        <div class="section users">
            <div class="details-header">
                <h3>${this.msg.users}</h3>
            </div>
            <ul>
                ${repeat(
            usersValids || [],
            ((user: { userId: string }) => user.userId) as any,
            ((user: { userId: string, auth: string }) => {
                const details = users.find((us) => us.userId === user.userId);
                return html`
                        <li>
                            ${this.renderAvatar(details?.avatar_url ? details.avatar_url : generateAgentAvatar(details?.name || ''))}
                                <small>${details?.name}<b>(${user.auth})</b> - ${user.userId}</small>
                                ${!isDm ? html`<button class="remove" @click="${(e: MouseEvent) => this.removeUser(e, user.userId)}">${this.msg.remove}</button>` : ''}            
                            </li>
                        `;
            }
            ) as any)}
            </ul>
            ${this.labelErrorRemoveUser ? html`<small class="saving-error">${collab_triangle_exclamation} ${this.labelErrorRemoveUser}<small>` : ''}   

            ${!isDm
                ? html`<details class="details-add-participant">
                            <summary>${this.msg.addParticipant}</summary>
                            <div class="add-participant">
                                <collab-messages-add-participant-102025
                                    userId=${this.userId} 
                                    .actualThread=${{ ...this.threadDetails }}
                                    @add-participant=${this.onAddParticipant}
                                    
                                    ></collab-messages-add-participant-102025>
                            </div>
                        </details>`
                : ''
            }
            
        </div>
        `
    }

    private renderAvatar(value: string) {

        if (value.trim().startsWith("<svg")) {
            return html`<div class="agent-avatar-svg" .innerHTML=${value}></div>`;
        }

        if (this.isUrl(value)) {
            return html`<img src="${value}" alt="${value}" width="32" height="32" />`;
        }

        return html`<div class="agent-avatar-emoji">${value}</div>`;
    }

    private isUrl(value: string): boolean {
        try {
            new URL(value);
            return true;
        } catch {
            return value.startsWith("data:image");
        }
    }

    private renderAgents() {

        const agentsOpenClaw = this.editedThreadDetails?.thread.openClawAgents || [];
        const isDm = this.threadDetails?.thread?.name?.startsWith('@');

        return html`
    <div class="section agents">
        <div class="details-header">
            <h3>${this.msg.agents}</h3>
        </div>
    
        <ul>
            ${agentsOpenClaw.length === 0
                ? html`<li class="empty-list"><small>${this.msg.noAgents}</small></li>`
                : repeat(
                    agentsOpenClaw,
                    ((agentOC: msg.OpenClawAgentBinding) => agentOC.agentId) as any,
                    ((agentOC: msg.OpenClawAgentBinding) => {

                        const agentName = agentOC.alias || agentOC.agentId || 'Unknown';
                        const avatarUrl = generateAgentAvatar(agentName);

                        return html`
                            <li>
                                <img src="${avatarUrl}" 
                                     alt="${agentName}" 
                                     width="32" 
                                     height="32" />
                                <div class="agent-info">
                                    <small class="agent-name">${agentName}<b>(${agentOC.enabled ? 'active' : 'disabled'})</b></small>
                    
                                </div>
                                ${!isDm ? html`
                                    <div class="agent-actions">
                                        <button class=${agentOC.enabled ? 'remove' : 'activate'}>
                                            ${agentOC.enabled ? this.msg.disable : this.msg.active}
                                        </button>
                                    </div>
                                ` : nothing}
                            
                            </li>
                        `;
                    }) as any
                )
            }
        </ul>

        ${this.labelErrorAgent ? html`<small class="saving-error">${collab_triangle_exclamation} ${this.labelErrorAgent}</small>` : ''}
        ${this.labelOkAgent ? html`<small class="saving-ok">${this.labelOkAgent}</small>` : ''}
                
        ${!isDm ? html`
            <details class="details-add-agent" ?open=${this.showAgentForm}>
                <summary @click=${(e: Event) => {
                    const details = (e.target as HTMLElement).closest('details');
                    if (details) {
                        e.preventDefault();
                        this.showAgentForm = !this.showAgentForm;
                        if (this.showAgentForm) {
                            this.openAgentForm();
                        } else {
                            this.closeAgentForm();
                        }
                    }
                }}>${this.msg.addAgent}</summary>
                <div class="agent-form-content">
                    ${this.renderAgentFormContent()}
                </div>
            </details>
        `: nothing}


    
    </div>
    `;
    }

    private renderAgentFormContent() {
        const availableAgents = this.selectedIntegrationId
            ? this.getAvailableAgents(this.selectedIntegrationId)
            : [];

        const threadIntegrations = this.threadDetails?.thread?.integrations || [];
        const hasAvailableAgents = availableAgents.some(agent => !threadIntegrations.some(ti => ti.config.agentId === agent.agent.id));

        return html`
        <label>${this.msg.selectIntegration}
            <select 
                .value=${this.selectedIntegrationId}
                @change=${(e: Event) => {
                this.selectedIntegrationId = (e.target as HTMLSelectElement).value;
                this.selectedAgentId = '';
            }}
            >
                <option value="">${this.msg.selectIntegration}</option>
                ${this.integrations.length === 0
                ? html`<option value="" disabled>${this.msg.noIntegrations}</option>`
                : this.integrations.map(integration => html`
                        <option value="${integration.id}">${integration.name}</option>
                    `)
            }
            </select>
        </label>

        ${this.selectedIntegrationId ? html`
            <label>${this.msg.selectAgent}
                <select 
                    .value=${this.selectedAgentId}
                    @change=${(e: Event) => {
                    this.selectedAgentId = (e.target as HTMLSelectElement).value;
                }}
                >
                    <option value="">${this.msg.selectAgent}</option>
                    ${availableAgents.length === 0
                    ? html`<option value="" disabled>${this.msg.noAgentsInIntegration}</option>`
                    : !hasAvailableAgents
                        ? html`<option value="" disabled>${this.msg.allAgentsAdded}</option>`
                        : availableAgents.map(({ agent, isAdded }) => html`
                                <option 
                                    value="${agent.id}" 
                                    ?disabled=${isAdded}
                                >
                                    ${agent.name}${isAdded ? ` (${this.msg.agentAlreadyAdded})` : ''}
                                </option>
                            `)
                }
                </select>
            </label>

            ${this.selectedAgentId ? html`
                <div class="agent-preview">
                    ${(() => {
                        const agentData = availableAgents.find(a => a.agent.id === this.selectedAgentId);
                        if (!agentData) return '';
                        const { agent } = agentData;
                        return html`
                            <img src="${agent.avatarUrl || generateAgentAvatar(agent.name)}" 
                                 alt="${agent.name}" 
                                 width="48" 
                                 height="48" />
                            <div>
                                <strong>${agent.name}</strong>
                                <small>ID: ${agent.id}</small>
                                <small>UserId: ${agent.collabUserId}</small>

                            </div>
                        `;
                    })()}
                </div>
            ` : ''}
        ` : ''}

        <div class="form-actions">
            <button 
                class="btn-save" 
                @click=${this.saveAgent}
                ?disabled=${!this.selectedIntegrationId || !this.selectedAgentId || this.isLoadingAgents}
            >
                ${this.isLoadingAgents ? html`<span class="loader"></span>` : html`${collab_floppy_disk} ${this.msg.btnSaveAgent}`}
            </button>
        </div>
    `;
    }


    private findAgentInfo(agentId: string): { agent: msg.IOpenClawAgent; integrationName: string } | null {
        for (const integration of this.integrations) {
            const agent = integration.agents.find(a => a.id === agentId);
            if (agent) {
                return { agent, integrationName: integration.name };
            }
        }
        return null;
    }


    private openAgentForm() {
        this.showAgentForm = true;
        this.selectedIntegrationId = '';
        this.selectedAgentId = '';
        this.labelErrorAgent = '';
        this.labelOkAgent = '';
    }

    private closeAgentForm() {
        this.showAgentForm = false;
        this.selectedIntegrationId = '';
        this.selectedAgentId = '';
    }

    private async saveAgent() {
        this.labelErrorAgent = '';
        this.labelOkAgent = '';

        if (!this.selectedIntegrationId || !this.selectedAgentId) return;
        if (!this.editedThreadDetails || !this.threadDetails || !this.userId) return;

        const integration = this.integrations.find(i => i.id === this.selectedIntegrationId);
        const agent = integration?.agents.find(a => a.id === this.selectedAgentId);

        if (!integration || !agent) return;

        const addedIds = this.getAddedAgentIds();
        if (addedIds.has(agent.id)) {
            this.labelErrorAgent = this.msg.agentAlreadyAdded;
            return;
        }

        this.isLoadingAgents = true;

        try {
            const inboundToken = generateUUIDv7();
            const integrationId = generateUUIDv7();

            const params: msg.RequestAddOrUpdateThreadOpenClawAgent = {
                action: 'addOrUpdateThreadOpenClawAgent',
                userId: this.userId,
                collabUserId: agent.collabUserId,
                agentId: agent.id,
                alias: agent.name,
                connectorId: integration.connectorId,
                threadId: this.threadDetails.thread.threadId,
                enabled: true,
            }

            const result = await msgAddOrUpdateThreadOpenClawAgent(params);

            if (!result.success || !result.response?.thread) {
                throw new Error(
                    result.error || `Failed to add open claw agent: ${agent.name} in thread`
                );
            }

            const thread = result.response.thread;
            this.editedThreadDetails.thread = { ...thread };
            const threadCache = await updateThread(thread.threadId, thread);
            notifyThreadChange(threadCache);

            this.labelOkAgent =
                this.msg.successAddAgent || 'Agent added successfully.';

            /*
            const threadIntegration: msg.ThreadIntegration = {
                integrationId,
                type: 'openclaw',
                status: 'active',
                config: {
                    url: integration.url,
                    bearerToken: integration.bearerToken,
                    inboundToken,
                    agentId: agent.id,
                    sessionId: undefined
                },
                triggers: []
            };

            const result = await msgAddOrUpdateThreadIntegration({
                threadId: this.threadDetails.thread.threadId,
                userId: this.userId,
                ...threadIntegration
            });

            if (!result.success || !result.response?.thread) {
                throw new Error(
                    result.error || 'Failed to add agent to thread.'
                );
            }

            

            const thread = result.response.thread;

            this.editedThreadDetails.thread = { ...thread };

            const threadCache = await updateThread(thread.threadId, thread);
            notifyThreadChange(threadCache);

            this.labelOkAgent =
                this.msg.successAddAgent || 'Agent added successfully.';
*/
            this.closeAgentForm();
            this.requestUpdate();

        } catch (err: any) {
            this.labelErrorAgent =
                err?.message || 'An unexpected error occurred while adding the agent.';
        } finally {
            this.isLoadingAgents = false;
        }
    }

    private async updateStatusAgent(
        e: MouseEvent,
        integrationId: string,
        status: "active" | "disabled"
    ) {

        /*
        
        this.labelErrorAgent = '';
        this.labelOkAgent = '';

        if (!this.editedThreadDetails || !this.threadDetails || !this.userId) return;

        if (['deleting'].includes(this.editedThreadDetails.thread.status || '')) {
            this.labelErrorAgent = this.msg.errorSaveThreadDeletStatus;
            return;
        }
        

        const button = (e.target as HTMLElement).closest('button');

        try {
            button?.classList.add('loading');

            const currentIntegrations: msg.ThreadIntegration[] =
                this.editedThreadDetails.thread.integrations || [];

            const integrationToUpdate = currentIntegrations.find(
                i => i.integrationId === integrationId
            );

            if (!integrationToUpdate) {
                throw new Error('Integration not found');
            }

            const updatedIntegration: msg.ThreadIntegration = {
                ...integrationToUpdate,
                status
            };

            const result = await msgAddOrUpdateThreadIntegration({
                threadId: this.threadDetails.thread.threadId,
                userId: this.userId,
                ...updatedIntegration
            });

            if (!result.success || !result.response?.thread) {
                throw new Error(
                    result.error || 'Failed to update agent status.'
                );
            }

            const thread = result.response.thread;

            this.editedThreadDetails.thread = { ...thread };

            const threadCache = await updateThread(thread.threadId, thread);
            notifyThreadChange(threadCache);

            this.labelOkAgent =
                this.msg.successRemoveAgent ||
                'Agent status updated successfully.';

            this.requestUpdate();

        } catch (err: any) {
            this.labelErrorAgent =
                ('Failed to update agent status') +
                ': ' +
                (err?.message || 'Unexpected error');
        } finally {
            button?.classList.remove('loading');
        }*/
    }

    private renderBots() {

        return html`
        <div class="section bots">
            <div class="details-header">
                <h3>${this.msg.bots}</h3>
            </div>
            <ul>
                ${repeat(
            this.editedThreadDetails?.thread.bots || [],
            ((bot: msg.ThreadBot) => bot.botId) as any,
            ((bot: msg.ThreadBot) => {
                return html`
                        <li>
                            <small>${bot?.botId}<b>(${bot.status})</b></small>
            
                            ${bot.status !== "disabled"
                        ? html`<button class="remove" @click="${(e: MouseEvent) => this.removeBot(e, bot.botId)}">${this.msg.disable}</button>`
                        : ""
                    }                            
                        </li>
                    `;
            }
            ) as any)}
            </ul>
            ${this.labelErrorRemoveBoot ? html`<small class="saving-error">${collab_triangle_exclamation} ${this.labelErrorRemoveBoot}<small>` : ''}   

        </div>
        `
    }

    private async removeUser(e: MouseEvent, userId: string) {
        this.labelErrorRemoveUser = '';
        if (!this.threadDetails || !this.userId || !this.editedThreadDetails) return;

        if (['deleting'].includes(this.editedThreadDetails?.thread.status || '')) {
            this.labelErrorRemoveUser = this.msg.errorSaveThreadDeletStatus;
            return;
        }

        const button = (e.target as HTMLElement).closest('button');
        try {
            button?.classList.add('loading');
            const newThread = await this.removeUserFromThread(this.threadDetails.thread.threadId, this.userId, userId);
            if (newThread) {
                this.threadDetails = JSON.parse(JSON.stringify(this.editedThreadDetails));
                this.editedThreadDetails.thread = { ...newThread };
                const threadCache = await updateThread(newThread.threadId, newThread);
                notifyThreadChange(threadCache);
            }
        } catch (err: any) {
            this.labelErrorRemoveUser = this.msg.errorRemoveUser + ':' + err.message;
        } finally {
            button?.classList.remove('loading');
        }
    }

    private async removeBot(e: MouseEvent, botName: string) {
        this.labelErrorRemoveBoot = '';
        if (!this.threadDetails || !this.userId || !this.editedThreadDetails) return;
        if (['deleting'].includes(this.editedThreadDetails?.thread.status || '')) {
            this.labelErrorRemoveBoot = this.msg.errorSaveThreadDeletStatus;
            return;
        }

        const button = (e.target as HTMLElement).closest('button');
        try {
            button?.classList.add('loading');
            const newThread = await this.disableBot(botName, this.threadDetails.thread.threadId, this.userId);
            this.threadDetails = JSON.parse(JSON.stringify(this.editedThreadDetails));
            this.editedThreadDetails.thread = { ...newThread };

        } catch (err: any) {
            this.labelErrorRemoveBoot = err.message;
        } finally {
            button?.classList.remove('loading');
        }
    }

    private async disableBot(
        botId: string,
        threadId: string,
        userId: string
    ): Promise<msg.Thread> {

        try {
            const result = await msgAddOrUpdateThreadBot({
                botId,
                llmPrompt: "",
                status: "disabled",
                threadId,
                userId,
                config: undefined
            });

            if (!result.success || !result.response?.thread) {
                throw new Error(
                    result.error || 'Failed to disable bot'
                );
            }

            const thread = result.response.thread;

            this.threadDetails = JSON.parse(JSON.stringify(this.editedThreadDetails));

            const threadCache = await updateThread(threadId, thread);
            notifyThreadChange(threadCache);

            await addMessage(threadId, `Bot ${botId} disabled successfully.`);

            return thread;

        } catch (err: any) {
            throw new Error(
                err?.message || 'Unexpected error while disabling bot'
            );
        }
    }

    private getChangedFields(): msg.RequestUpdateThread | undefined {
        if (!this.threadDetails || !this.editedThreadDetails) return undefined;

        const original = this.threadDetails.thread;
        const edited = this.editedThreadDetails.thread;

        const fields: (keyof msg.ThreadPerformanceCache)[] = ['group', 'languages', 'name', 'status', 'visibility', 'welcomeMessage', 'defaultTopics', 'avatar_url'];
        const changed: msg.RequestUpdateThread = {
            action: 'updateThread',
            threadId: original.threadId,
            userId: this.userId!,
        };

        for (const field of fields) {
            const origVal = JSON.stringify(original[field]);
            const editVal = JSON.stringify(edited[field]);
            if (origVal !== editVal) {
                (changed as any)[field] = edited[field];
            }
        }

        return changed;
    }

    private onAddParticipant(ev: CustomEvent) {
        const thread = ev.detail.thread;
        if (thread && this.threadDetails) {
            this.threadDetails.thread = { ...thread };
            this.editedThreadDetails = { ...this.threadDetails }
            this.requestUpdate();
        }
    }

    private async saveChanges() {

        this.labelError = '';
        this.labelOk = '';

        if (!this.editedThreadDetails || !this.userId) return;

        if (['deleting'].includes(this.editedThreadDetails.thread.status || '')) {
            this.labelError = this.msg.errorSaveThreadDeletStatus;
            return;
        }

        const changes = this.getChangedFields();
        if (!changes) return;

        const needUpdateThread = Object.keys(changes).length > 3;

        if (!needUpdateThread) {
            this.labelError = this.msg.noChanges;
            return;
        }

        this.isLoading = true;

        try {
            const result = await msgUpdateThread(changes);

            if (!result.success || !result.response?.thread) {
                this.labelError =
                    result.error || 'Failed to update thread.';
                return;
            }

            const newThread = result.response.thread;
            const oldStatus = this.threadDetails?.thread.status;

            this.threadDetails = JSON.parse(JSON.stringify(this.editedThreadDetails));

            let threadCache: msg.ThreadPerformanceCache;

            if (
                ['deleted', 'archived'].includes(newThread.status) &&
                newThread.status !== oldStatus
            ) {
                await deleteAllMessagesFromThread(newThread.threadId);

                threadCache = await updateThread(
                    newThread.threadId,
                    newThread,
                    '',
                    '',
                    0,
                    ''
                );
            } else {
                threadCache = await updateThread(newThread.threadId, newThread);
            }

            notifyThreadChange(threadCache);

            this.labelOk =
                this.msg.successSaving || 'Thread updated successfully.';

            // Exit edit mode after successful save
            this.isEditingDetails = false;

        } catch (err: any) {
            console.error(err);
            this.labelError =
                err?.message || 'An unexpected error occurred while saving changes.';
        } finally {
            this.isLoading = false;
        }
    }

    private async removeUserFromThread(
        threadId: string,
        userId: string,
        userIdOrName: string
    ) {
        try {
            const result = await msgRemoveParticipantFromThread({
                threadId,
                userId,
                userIdOrName
            });

            if (!result.success || !result.response?.thread) {
                throw new Error(
                    result.error || 'Failed to remove participant from thread'
                );
            }

            return result.response.thread;

        } catch (err: any) {
            throw new Error(
                err?.message || 'Unexpected error while removing participant'
            );
        }
    }

    private async getThreadInfo(
        threadId: string,
        userId: string
    ): Promise<IThreadDetails> {
        try {
            const result = await msgGetThreadUpdates({
                threadId,
                userId
            });

            if (!result.success || !result.response) {
                throw new Error(result.error || 'Failed to fetch thread details');
            }

            return result.response;

        } catch (err: any) {
            throw new Error(
                err?.message || 'Unexpected error while fetching thread details'
            );
        }
    }

}

interface IThreadDetails {
    thread: msg.ThreadPerformanceCache,
    users: msg.User[]
}