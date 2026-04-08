/// <mls fileReference="_102025_/l2/collabMessagesSettingsNotificationPreferences.ts" enhancement="_102027_/l2/enhancementLit"/>

import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';

import {
    saveNotificationPreferencesAudio,
    loadNotificationPreferencesAudio,
    loadNotificationPreferences,
    registerToken,
    saveNotificationPreferences,
} from '/_102025_/l2/collabMessagesHelper.js';

import {
    collab_bell,
} from '/_102025_/l2/collabMessagesIcons.js';

/// **collab_i18n_start**
const message_pt = {
    prefNotification: 'Preferências de notificação',
    infoNotification: 'Avisamos quando houver mudanças e novas mensagens, sem pop-ups, só sincronismo, mais velocidade para você',
    moreNotification: 'Saiba mais',
    notificationStatusEnabled: 'Notificações ativadas',
    notificationStatusFailed: 'Não foi possível ativar as notificações, verificar permissões no browser',
    btnEnableNotifications: 'Ativar notificações',
    soundEnable: 'Ativar som nas notificações',
};

const message_en = {
    prefNotification: 'Notification Preferences',
    infoNotification: 'We\'ll notify you when there are changes and new messages — no pop-ups, just seamless syncing for faster performance.',
    moreNotification: 'Learn more',
    notificationStatusEnabled: 'Notifications enabled',
    notificationStatusFailed: 'Unable to enable notifications, check browser permissions',
    btnEnableNotifications: 'Enable notifications',
    soundEnable: 'Enable sound for notifications',
};

type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = {
    'en': message_en,
    'pt': message_pt
};
/// **collab_i18n_end**

@customElement('collab-messages-settings-notification-preferences-102025')
export class CollabMessagesSettingsNotificationPreferences extends StateLitElement {

    private msg: MessageType = messages['en'];

    @state() private notificationPreferences: NotificationPermission | null = null;
    @state() private audioEnabled: boolean = false;
    @state() private isSaving: boolean = false;
    @state() private labelOk: string = '';
    @state() private labelError: string = '';

    async firstUpdated() {
        this.notificationPreferences = this.getNotificationStatus();
        this.audioEnabled = loadNotificationPreferencesAudio();
    }

    render() {
        const lang = this.getMessageKey(messages);
        this.msg = messages[lang];

        // Atualiza o status atual
        this.notificationPreferences = this.getNotificationStatus();

        return html`
        <div class="section notification-preferences">
            <h4>${collab_bell} ${this.msg.prefNotification}</h4>

            ${this.notificationPreferences === 'granted' 
                ? this.renderEnabled() 
                : this.renderDisabled()
            }

            <div class="notification-audio-config">
                <label>
                    <input 
                        type="checkbox" 
                        .checked=${this.audioEnabled} 
                        @change=${this.handleAudioToggle} 
                    />
                    ${this.msg.soundEnable}
                </label>
            </div>
        </div>
        `;
    }

    private renderEnabled() {
        return html`
            <div class="notification-status enabled">
                <span class="status-icon">✓</span>
                <span>${this.msg.notificationStatusEnabled}</span>
            </div>
            ${this.renderReadMore()}
        `;
    }

    private renderDisabled() {
        return html`
            <button 
                class="btn-enable" 
                @click=${this.handleEnableNotifications} 
                ?disabled=${this.isSaving}
            >
                ${this.isSaving 
                    ? html`<span class="loader"></span>` 
                    : this.msg.btnEnableNotifications
                }
            </button>
            
            ${this.labelOk ? html`<small class="saving-ok">${this.labelOk}</small>` : ''}
            ${this.labelError ? html`<small class="saving-error">${this.labelError}</small>` : ''}
            
            ${this.renderReadMore()}
        `;
    }

    private renderReadMore() {
        return html`
            <details>
                <summary>${this.msg.moreNotification}</summary>
                <div class="details-content">
                    <span>${this.msg.infoNotification}</span>
                </div>   
            </details>
        `;
    }

    // ========== HELPERS ==========
    private getNotificationStatus(): NotificationPermission | null {
        const notificationPreferences = loadNotificationPreferences();
        
        if ('Notification' in window) {
            const permission = Notification.permission;
            
            if (permission === this.notificationPreferences) {
                return notificationPreferences;
            }
            
            if (permission === 'granted' && notificationPreferences === 'denied') {
                saveNotificationPreferences('default');
                return 'default';
            }
            
            if (permission === 'denied' && notificationPreferences === 'granted') {
                saveNotificationPreferences('denied');
                return 'default';
            }
        }
        
        return notificationPreferences;
    }

    // ========== HANDLERS ==========
    private handleAudioToggle(e: Event) {
        const target = e.target as HTMLInputElement;
        this.audioEnabled = target.checked;
        saveNotificationPreferencesAudio(this.audioEnabled);

        this.dispatchEvent(new CustomEvent('audio-preference-changed', {
            detail: { audioEnabled: this.audioEnabled },
            bubbles: true,
            composed: true
        }));
    }

    private async handleEnableNotifications() {
        this.labelError = '';
        this.labelOk = '';
        this.isSaving = true;

        try {
            saveNotificationPreferences('default');
            const token = await registerToken();
            this.notificationPreferences = loadNotificationPreferences();

            if (token === null) {
                this.labelOk = this.msg.notificationStatusFailed;
            } else {
                this.labelOk = this.msg.notificationStatusEnabled;

                this.dispatchEvent(new CustomEvent('notifications-enabled', {
                    detail: { token },
                    bubbles: true,
                    composed: true
                }));
            }
        } catch (err: any) {
            console.error('Error on enable notification:', err.message);
            this.labelError = err.message;
        } finally {
            this.isSaving = false;
        }
    }
}