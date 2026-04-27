/// <mls fileReference="_102025_/l2/collabMessagesSettingsGeral.ts" enhancement="_102027_/l2/enhancementLit"/>

import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102027_/l2/stateLitElement.js';

import '/_102025_/l2/collabMessagesSettingsOpenClaw.js';
import '/_102025_/l2/collabMessagesSettingsChatPreferences.js';
import '/_102025_/l2/collabMessagesSettingsUser.js';
import '/_102025_/l2/collabMessagesSettingsNotificationPreferences.js';
import * as msg from '/_102025_/l2/shared/interfaces.js';
import { msgGetUserUpdate } from '/_102025_/l2/shared/api.js';

type ViewMode = 'all' | 'user' | 'chat' | 'notification' | 'openclaw';

/// **collab_i18n_start**
const message_pt = {
    loading: 'Carregando informações...',
}
const message_en = {
    loading: 'Loading...',
}
type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = {
    'en': message_en,
    'pt': message_pt
};
/// **collab_i18n_end**

@customElement('collab-messages-settings-geral-102025')
export class CollabMessagesSettingsGeral102025 extends StateLitElement {

    private msg: MessageType = messages['en'];

    @property() viewMode: ViewMode = 'all';

    @state() userPerfil: msg.User | undefined;
    @state() private scrollPositions: Map<ViewMode, number> = new Map();

    private show(section: ViewMode) {
        return this.viewMode === 'all' || this.viewMode === section;
    }

    async firstUpdated(changedProperties: Map<PropertyKey, unknown>) {
        super.updated(changedProperties);
        this.userPerfil = await this.getUserPerfil();
    }

    render() {

        const lang = this.getMessageKey(messages);
        this.msg = messages[lang];

        if (!this.userPerfil) {
            return html`<div>${this.msg.loading}</div>`;
        }

        return html`
        <section style=${this.show('user') ? 'display:block' : 'display:none'}>
            ${this.renderUser()}
        </section>

        <section style=${this.show('chat') ? 'display:block' : 'display:none'}>
            ${this.renderChatPreferences()}
        </section>

        <section style=${this.show('notification') ? 'display:block' : 'display:none'}>
            ${this.renderPreferencesNotifications()}
        </section>

        <section style=${this.show('openclaw') ? 'display:block' : 'display:none'}>
            ${this.renderOpenClawConnectors()}
        </section>
    `;
    }

    private renderUser() {
        return html`<collab-messages-settings-user-102025></collab-messages-settings-user-102025>`;
    }

    private renderChatPreferences() {
        return html`<collab-messages-settings-chat-preferences-102025></collab-messages-settings-chat-preferences-102025>`;

    }

    private renderPreferencesNotifications() {
        return html`<collab-messages-settings-notification-preferences-102025></collab-messages-settings-notification-preferences-102025>`;
    }

    private renderOpenClawConnectors() {
        return html`<collab-messages-settings-open-claw-102025
            @settings-change=${this.onSettingsChange}
            .userId=${this.userPerfil?.userId}
        ></collab-messages-settings-open-claw-102025>`;
    }

    private onSettingsChange(ev: Event) {
        const ev2 = ev as CustomEvent;
        const details = ev2.detail;
        if (!details || details.mode !== 'view') return;
        this.navigateTo(details.viewMode);
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

    private saveScrollPosition() {
        const container = this.renderRoot as HTMLElement;
        if (container) {
            this.scrollPositions.set(this.viewMode, container.scrollTop);
        }
    }

    private restoreScrollPosition(view: ViewMode) {
        const container = this.renderRoot as HTMLElement;
        if (container) {
            const savedPosition = this.scrollPositions.get(view) || 0;
            requestAnimationFrame(() => {
                container.scrollTop = savedPosition;
            });
        }
    }

    private navigateTo(newView: ViewMode, resetScroll = false) {
        this.saveScrollPosition();
        this.viewMode = newView;
        if (resetScroll) {
            requestAnimationFrame(() => {
                const container = this.renderRoot as HTMLElement;
                if (container) container.scrollTop = 0;
            });
        } else {
            this.restoreScrollPosition(newView);
        }
    }


}
