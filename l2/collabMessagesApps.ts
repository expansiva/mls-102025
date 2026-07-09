/// <mls fileReference="_102025_/l2/collabMessagesApps.ts" enhancement="_102027_/l2/enhancementLit" />

import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { CollabLitElement } from '/_102029_/l2/collabLitElement.js';
import {
    environment,
    type CollabProgramMenu,
    type CollabProgramMenuItem,
} from '/_102036_/l2/environmentContract.js';
import '/_102025_/l2/collabMessagesAppsMenu.js';

@customElement('collab-messages-apps-102025')
export class CollabMessagesApps extends CollabLitElement {

    @state() menuModules: CollabProgramMenu[] = [];

    async firstUpdated(_changedProperties: Map<PropertyKey, unknown>) {
        super.firstUpdated(_changedProperties);
        this.menuModules = await environment.apps.getProgramMenu();
    }

    render() {
        return html`
            <div class="menu-container">
                <collab-messages-apps-menu-102025
                    .menuModules=${this.menuModules}
                    menuTitle="Modulos"
                    keyFavoritesLocalStorage="modulesMenuFavorites"
                    keyHistoryLocalStorage="modulesMenuHistory"
                    identifier="client-shell"
                    @menu-selected=${(e: CustomEvent) => this.handleMenuClick(e)}
                ></collab-messages-apps-menu-102025>
            </div>
        `;
    }

    private async handleMenuClick(ev: CustomEvent) {
        const item = ev.detail as CollabProgramMenuItem & { project?: number; module?: string; path?: string };
        await environment.apps.openProgram(item);
    }
}
