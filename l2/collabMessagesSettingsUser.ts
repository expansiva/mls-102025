/// <mls fileReference="_102025_/l2/collabMessagesSettingsUser.ts" enhancement="_102027_/l2/enhancementLit.ts"/>

import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import { updateUsers } from '/_102025_/l2/collabMessagesIndexedDB.js';
import { msgGetUserUpdate, msgUpdateUserDetails } from '/_102025_/l2/shared/api.js';
import * as msg from '/_102025_/l2/shared/interfaces.js';

import {
    collab_user,
    collab_minus,
    collab_ban,
    collab_dot,
    collab_edit,
    collab_xmark,
    collab_floppy_disk,
    collab_check,
    collab_chevron_left,
} from '/_102025_/l2/collabMessagesIcons.js';

/// **collab_i18n_start**
const message_pt = {
    userTitle: 'Usuário',
    save: 'Salvar',
    cancel: 'Cancelar',
    status: 'Status',
    userid: 'Id do usuário',
    username: 'Nome do usuário',
    errorUserName: 'Nome do usuário não pode ser vazio',
    successSavingUser: 'Perfil do usuário atualizado com sucesso',
    changeAvatar: 'Alterar',
    editAvatar: 'Editar Avatar',
    avatarUrl: 'URL do Avatar',
    avatarUrlPlaceholder: 'https://exemplo.com/imagem.png',
    invalidAvatarUrl: 'URL inválida ou imagem não encontrada',
};

const message_en = {
    userTitle: 'User',
    save: 'Save',
    cancel: 'Cancel',
    status: 'Status',
    userid: 'User Id',
    username: 'UserName',
    errorUserName: 'User name cannot be empty',
    successSavingUser: 'User profile updated successfully',
    changeAvatar: 'Change',
    editAvatar: 'Edit Avatar',
    avatarUrl: 'Avatar URL',
    avatarUrlPlaceholder: 'https://example.com/image.png',
    invalidAvatarUrl: 'Invalid URL or image not found',
};

type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = {
    'en': message_en,
    'pt': message_pt
};
/// **collab_i18n_end**

type ViewMode = 'main' | 'editAvatar';

@customElement('collab-messages-settings-user-102025')
export class CollabMessagesSettingsUser extends StateLitElement {

    private msg: MessageType = messages['en'];

    @state() private userPerfil: msg.User | undefined;
    @state() private viewMode: ViewMode = 'main';
    @state() private isSaving: boolean = false;
    @state() private labelOk: string = '';
    @state() private labelError: string = '';

    // Avatar edit states
    @state() private tempAvatarUrl: string = '';
    @state() private avatarUrlValid: boolean = true;
    @state() private avatarLoading: boolean = false;

    async firstUpdated() {
        this.userPerfil = await this.getUserPerfil();
    }

    render() {
        const lang = this.getMessageKey(messages);
        this.msg = messages[lang];

        if (this.viewMode === 'editAvatar') {
            return this.renderEditAvatarView();
        }

        return this.renderUserSection();
    }

    private renderUserSection() {
        const avatarUrl = this.userPerfil?.avatar_url;
        const iconByStatus: Record<string, ReturnType<any> | string> = {
            'active': collab_dot,
            'deleted': collab_minus,
            'blocked': collab_ban,
            '': '',
        };
        const icon = iconByStatus[this.userPerfil?.status || ''];

        return html`
        <div class="section user">
            <h4>${collab_user} ${this.msg.userTitle}</h4>

            <div class="user-content">
                <div class="avatar-section">
                    <div class="avatar">
                        ${avatarUrl
                            ? html`<img src="${avatarUrl}" alt="Avatar" />`
                            : html`<div class="avatar-placeholder">${collab_user}</div>`
                        }
                    </div>
                    <button class="btn-small btn-link" @click=${this.handleOpenEditAvatar}>
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
                <button @click=${this.handleSave} ?disabled=${this.isSaving}>
                    ${this.isSaving ? html`<span class="loader"></span>` : html`${collab_floppy_disk} ${this.msg.save}`}
                </button>
            </div>
            ${this.labelOk ? html`<small class="saving-ok">${this.labelOk}</small>` : ''}
            ${this.labelError ? html`<small class="saving-error">${this.labelError}</small>` : ''}      
        </div>
        `;
    }

    private renderEditAvatarView() {
        const previewUrl = this.tempAvatarUrl || this.userPerfil?.avatar_url || '';

        return html`
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
        `;
    }

    // ========== API ==========
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

    // ========== HANDLERS ==========
    private handleNameInput(e: Event) {
        if (!this.userPerfil) return;
        const target = e.target as HTMLInputElement;
        this.userPerfil = { ...this.userPerfil, name: target.value };
    }

    private async handleSave() {
        this.labelError = '';
        this.labelOk = '';

        if (!this.userPerfil || !this.userPerfil.name) {
            this.labelError = this.msg.errorUserName;
            return;
        }

        this.isSaving = true;

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
                this.labelError = result.error || 'Failed to update user profile.';
                return;
            }

            this.labelOk = this.msg.successSavingUser;
            await updateUsers([result.response.user]);

            this.dispatchEvent(new CustomEvent('user-saved', {
                detail: { user: result.response.user },
                bubbles: true,
                composed: true
            }));

        } catch (error: any) {
            console.error('Error updating user profile:', error);
            this.labelError = error?.message || 'An unexpected error occurred.';
        } finally {
            this.isSaving = false;
        }
    }

    // ========== AVATAR HANDLERS ==========
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

        try {
            new URL(this.tempAvatarUrl);
        } catch {
            this.avatarUrlValid = false;
            return;
        }

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
}