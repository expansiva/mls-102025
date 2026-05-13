/// <mls fileReference="_102025_/l2/collabTasksTopbar.ts" enhancement="_102027_/l2/enhancementLit" />

/// **collab_i18n_start**
const message_pt = { reload: 'Recarregar' };
const message_en = { reload: 'Reload' };
/// **collab_i18n_end**

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';

function getMsg() {
  return document.documentElement.lang === 'pt' ? message_pt : message_en;
}

@customElement('collab-tasks-topbar-102025')
export class CollabTasksTopbar extends StateLitElement {

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  render() {
    const msg = getMsg();
    return html`
      <div class="title-area">
        <div class="title">${this.title}</div>
        ${this.subtitle ? html`<div class="subtitle">${this.subtitle}</div>` : ''}
      </div>
      <div class="actions">
        <slot name="actions"></slot>
        <button class="reload-btn" @click=${this._reload}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          ${msg.reload}
        </button>
      </div>
    `;
  }

  private _reload() {
    this.dispatchEvent(new CustomEvent('dashboard-reload', { bubbles: true, composed: true }));
  }
}
