/// <mls fileReference="_102025_/l2/collabMessagesTabMenu.ts" enhancement="_102027_/l2/enhancementLit"/>

import { html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';

export interface TabMenuItem {
    id: string;
    icon: TemplateResult;
    label: string;
    activeColor?: string;
    type: 'tab' | 'button';
}

const DEFAULT_ACTIVE_COLOR = '#1C91CD';

@customElement('collab-messages-tab-menu-102025')
export class CollabMessagesTabMenu extends StateLitElement {

    @property({ type: Array }) items: TabMenuItem[] = [];
    @property({ type: String }) activeId: string = '';

    private get _tabs(): TabMenuItem[] {
        return this.items.filter(item => item.type === 'tab');
    }

    private get _buttons(): TabMenuItem[] {
        return this.items.filter(item => item.type === 'button');
    }

    private _handleItemClick(item: TabMenuItem) {
        this.activeId = item.id;
        
        const eventName = item.type === 'tab' ? 'tab-change' : 'button-click';
        this.dispatchEvent(new CustomEvent(eventName, {
            detail: { id: item.id, item },
            bubbles: true,
            composed: true
        }));
    }

    private _renderItem(item: TabMenuItem, showSeparator: boolean = false) {
        const isActive = item.id === this.activeId;
        const activeColor = item.activeColor || DEFAULT_ACTIVE_COLOR;
        const activeStyle = isActive ? `color: ${activeColor};` : '';

        return html`
            <button 
                class="menu-item ${isActive ? 'active' : ''}"
                style="${activeStyle}"
                @click=${() => this._handleItemClick(item)}
            >
                ${item.icon}
                ${isActive ? html`<span class="item-label">${item.label}</span>` : ''}
            </button>
            ${showSeparator ? html`<div class="separator"></div>` : ''}
        `;
    }

    render() {
        const tabs = this._tabs;
        const buttons = this._buttons;

        return html`
            <div class="tab-menu">
                ${tabs.map((tab, index) => this._renderItem(tab, index < tabs.length - 1))}
                
                ${buttons.length > 0 ? html`
                    <div class="spacer"></div>
                    ${buttons.map(btn => this._renderItem(btn, false))}
                ` : ''}
            </div>
        `;
    }
}