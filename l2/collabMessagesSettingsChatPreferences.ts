/// <mls fileReference="_102025_/l2/collabMessagesSettingsChatPreferences.ts" enhancement="_102027_/l2/enhancementLit"/>

import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';

import {
    loadChatPreferences,
    saveChatPreferences,
    IChatPreferences,
    TranslateMode,
} from '/_102025_/l2/collabMessagesHelper.js';

import {
    collab_message,
    collab_floppy_disk,
} from '/_102025_/l2/collabMessagesIcons.js';

/// **collab_i18n_start**
const message_pt = {
    chatPref: 'Preferências do chat',
    translate: 'Tradução',
    preferLanguage: 'Idioma preferido',
    save: 'Salvar',
    successSavingChatPref: 'Preferências do chat atualizado com sucesso',
};

const message_en = {
    chatPref: 'Chat Preferences',
    translate: 'Translate',
    preferLanguage: 'Preferred language',
    save: 'Save',
    successSavingChatPref: 'Chat preferences updated successfully',
};

type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = {
    'en': message_en,
    'pt': message_pt
};
/// **collab_i18n_end**

@customElement('collab-messages-settings-chat-preferences-102025')
export class CollabMessagesSettingsChatPreferences extends StateLitElement {

    private msg: MessageType = messages['en'];

    @state() private chatPreferences: IChatPreferences = {
        translationMode: 'icon',
        language: '',
        threadMaintenance: ''
    };

    @state() private isSaving: boolean = false;
    @state() private labelOk: string = '';
    @state() private labelError: string = '';

    async firstUpdated() {
        this.chatPreferences = loadChatPreferences();
    }

    render() {
        const lang = this.getMessageKey(messages);
        this.msg = messages[lang];

        return html`
        <div class="section chat-preferences">
            <h4>${collab_message} ${this.msg.chatPref}</h4>
            
            <div class="chat-config-item form-field">
                <label for="translationMode">${this.msg.translate}:</label>
                <select 
                    id="translationMode" 
                    @change=${this.handleTranslationModeChange} 
                    .value=${this.chatPreferences?.translationMode ?? 'icon'}
                >
                    <option value="none">none</option>
                    <option value="icon">icon</option>
                    <option value="text">text</option>
                    <option value="iconText">icon + text</option>
                    <option value="trace">trace</option>
                </select>
            </div>
            
            <div class="chat-config-item form-field">
                <label>${this.msg.preferLanguage}:</label>
                <input 
                    @input=${this.handleLanguageInput} 
                    .value=${this.chatPreferences?.language ?? ''} 
                    type="text" 
                />
            </div>
            
            <div class="chat-config-item action">
                <button @click=${this.handleSave} ?disabled=${this.isSaving}>
                    ${this.isSaving 
                        ? html`<span class="loader"></span>` 
                        : html`${collab_floppy_disk} ${this.msg.save}`
                    }
                </button>
            </div>
            
            ${this.labelOk ? html`<small class="saving-ok">${this.labelOk}</small>` : ''}
            ${this.labelError ? html`<small class="saving-error">${this.labelError}</small>` : ''}    
        </div>
        `;
    }

    // ========== HANDLERS ==========
    private handleTranslationModeChange(e: Event) {
        const select = e.target as HTMLSelectElement;
        this.chatPreferences = { 
            ...this.chatPreferences, 
            translationMode: select.value as TranslateMode 
        };
    }

    private handleLanguageInput(e: Event) {
        const target = e.target as HTMLInputElement;
        this.chatPreferences = { 
            ...this.chatPreferences, 
            language: target.value 
        };
    }

    private async handleSave() {
        this.labelError = '';
        this.labelOk = '';
        this.isSaving = true;

        try {
            saveChatPreferences(this.chatPreferences);
            this.labelOk = this.msg.successSavingChatPref;

            this.dispatchEvent(new CustomEvent('preferences-saved', {
                detail: { preferences: this.chatPreferences },
                bubbles: true,
                composed: true
            }));

        } catch (error: any) {
            console.error('Error on update chat preferences:', error);
            this.labelError = error.message;
        } finally {
            this.isSaving = false;
        }
    }
}