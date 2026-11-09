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

export const SITES_MENU_CHANGED = 'SitesMenuChanged';

const MENU_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7] as mls.Level[];

type MenuEvents = {
    addEventListener: (levels: mls.Level[], types: mls.events.TypeEvent[], listener: () => void) => void;
    removeEventListener: (
        levels: mls.Level[] | undefined,
        types: mls.events.TypeEvent[] | undefined,
        listener: () => void,
    ) => void;
};

function menuEvents(): MenuEvents | undefined {
    const events = (globalThis as { mls?: { events?: MenuEvents } }).mls?.events;
    if (!events?.addEventListener) return undefined;
    return events;
}

@customElement('collab-messages-apps-102025')
export class CollabMessagesApps extends CollabLitElement {

    @state() menuModules: CollabProgramMenu[] = [];

    /** Stable reference: mls.events removes a subscriber by identity. */
    private readonly onSitesMenuChanged = () => { void this.loadMenu(); };
    private menuFlight: Promise<void> | null = null;
    private menuQueued = false;

    connectedCallback(): void {
        super.connectedCallback();
        const events = menuEvents();
        if (!events) return;
        events.addEventListener(
            MENU_LEVELS,
            [SITES_MENU_CHANGED] as unknown as mls.events.TypeEvent[],
            this.onSitesMenuChanged,
        );
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        menuEvents()?.removeEventListener(undefined, undefined, this.onSitesMenuChanged);
    }

    async firstUpdated(_changedProperties: Map<PropertyKey, unknown>) {
        super.firstUpdated(_changedProperties);
        await this.loadMenu();
    }

    async loadMenu(): Promise<void> {
        if (this.menuFlight) {
            this.menuQueued = true;
            return;
        }
        do {
            this.menuQueued = false;
            this.menuFlight = this.pullMenu();
            try {
                await this.menuFlight;
            } finally {
                this.menuFlight = null;
            }
        } while (this.menuQueued);
    }

    private async pullMenu(): Promise<void> {
        try {
            this.menuModules = await environment.apps.getProgramMenu();
        } catch (err) {
            console.error('[appsMenu] reload failed', err);
        }
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
