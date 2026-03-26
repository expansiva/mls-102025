/// <mls fileReference="_102025_/l2/collabMenuTest.ts" enhancement="_100554_/l2/enhancementLit.ts"/>

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import { collab_arrow_up_long, collab_bell, collab_circle_exclamation, collab_link, collab_bug_x12, collab_magnifying_glass } from '/_102025_/l2/collabMessagesIcons.js';

import '/_102025_/l2/collabMessagesTabMenu.js'

@customElement('collab-menu-test-102025')
export class CollabMenuTest102025 extends StateLitElement {


    private items = [
        { id: 'menu', icon: collab_arrow_up_long, label: 'Menu', type: 'tab' },
        { id: 'phone', icon: collab_bell, label: 'Phone', type: 'tab' },
        { id: 'list', icon: collab_circle_exclamation, label: 'List', type: 'tab' },
        { id: 'connect', icon: collab_link, label: 'Connect', type: 'tab', active: true },
        { id: 'file', icon: collab_bug_x12, label: 'File', type: 'tab' },
        { id: 'settings', icon: collab_magnifying_glass, label: 'Settigns', type: 'button' }
    ];

    render() {
        return html`
    <collab-messages-tab-menu-102025
        .items=${this.items}
        activeId="connect"
        @tab-change=${(e: MouseEvent) => console.log('Tab changed:', e.detail)}
        @button-click=${(e: MouseEvent) => console.log('Button clicked:', e.detail)}
    ></collab-messages-tab-menu-102025>
`;
    }
}
