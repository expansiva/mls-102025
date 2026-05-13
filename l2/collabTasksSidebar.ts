/// <mls fileReference="_102025_/l2/collabTasksSidebar.ts" enhancement="_102027_/l2/enhancementLit" />

/// **collab_i18n_start**
const message_pt = {
  board: 'Board',
  myTasks: 'Minhas tasks',
  workflows: 'Workflows',
  simulator: 'Simulador',
  approvals: 'Aprovações',
  analytics: 'Analytics',
  settings: 'Configurações',
  tracking: 'Acompanhamento',
  manage: 'Gerenciar',
  workspace: 'Workspace',
};
const message_en = {
  board: 'Board',
  myTasks: 'My tasks',
  workflows: 'Workflows',
  simulator: 'Simulator',
  approvals: 'Approvals',
  analytics: 'Analytics',
  settings: 'Settings',
  tracking: 'Tracking',
  manage: 'Manage',
  workspace: 'Workspace',
};
/// **collab_i18n_end**

import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import {
  collab_tasks,
  collab_gear,
} from '/_102025_/l2/collabMessagesIcons.js';

type ScreenId = 'board' | 'mytasks' | 'workflows' | 'simulator' | 'approvals' | 'analytics' | 'settings';

function getMsg() {
  return document.documentElement.lang === 'pt' ? message_pt : message_en;
}

@customElement('collab-tasks-sidebar-102025')
export class CollabTasksSidebar extends StateLitElement {

  @property({ type: String }) activeScreen: ScreenId = 'board';
  @state() private collapsed = false;

  private _emit(screen: ScreenId) {
    this.dispatchEvent(new CustomEvent('screen-change', { detail: screen, bubbles: true, composed: true }));
  }

  render() {
    const msg = getMsg();
    const c = this.collapsed;

    const item = (id: ScreenId, label: string, icon?: unknown) => html`
      <div class="nav-item ${this.activeScreen === id ? 'active' : ''}" @click=${() => this._emit(id)}>
        ${icon ? html`<span class="nav-icon">${icon}</span>` : html`<span class="nav-icon" style="width:16px"></span>`}
        <span class="nav-label-text ${c ? 'hidden' : ''}">${label}</span>
      </div>
    `;

    return html`
      <div class="sidebar-inner ${c ? 'collapsed' : ''}">
        <button class="collapse-btn" @click=${() => { this.collapsed = !this.collapsed; }}>
          ${c ? '›' : '‹'}
        </button>

        <div class="nav-section">
          <div class="nav-label ${c ? 'collapsed' : ''}">${msg.tracking}</div>
          ${item('board', msg.board, collab_tasks)}
          ${item('mytasks', msg.myTasks, collab_tasks)}
        </div>

        <div class="nav-divider"></div>

        <div class="nav-section">
          <div class="nav-label ${c ? 'collapsed' : ''}">${msg.manage}</div>
          ${item('workflows', msg.workflows)}
          ${item('simulator', msg.simulator)}
          ${item('approvals', msg.approvals)}
          ${item('analytics', msg.analytics)}
        </div>

        <div class="nav-divider"></div>

        <div class="nav-section">
          <div class="nav-label ${c ? 'collapsed' : ''}">${msg.workspace}</div>
          ${item('settings', msg.settings, collab_gear)}
        </div>
      </div>
    `;
  }
}
