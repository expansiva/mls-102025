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

import { html, css } from 'lit';
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

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      background: var(--color-background-secondary, #f7f7f8);
      border-right: 1px solid var(--color-border, #e5e7eb);
      transition: width 0.2s ease;
      overflow: hidden;
    }
    :host([collapsed]) { width: 44px; }
    .sidebar-inner {
      display: flex;
      flex-direction: column;
      width: 200px;
      height: 100%;
      padding: 8px 0;
    }
    .sidebar-inner.collapsed {
      width: 44px;
    }
    .collapse-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      color: var(--color-text-secondary, #6b7280);
      font-size: 18px;
      margin-bottom: 4px;
    }
    .collapse-btn:hover { color: var(--color-text-primary, #111); }
    .nav-section { padding: 0 0 8px; }
    .nav-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-text-secondary, #9ca3af);
      padding: 4px 16px 2px;
      white-space: nowrap;
      overflow: hidden;
    }
    .nav-label.collapsed { opacity: 0; }
    .nav-divider {
      height: 1px;
      background: var(--color-border, #e5e7eb);
      margin: 8px 10px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 16px;
      cursor: pointer;
      border-radius: 6px;
      margin: 1px 6px;
      white-space: nowrap;
      overflow: hidden;
      font-size: 14px;
      color: var(--color-text-primary, #374151);
      transition: background 0.15s;
    }
    .nav-item:hover { background: var(--color-background-hover, rgba(0,0,0,0.06)); }
    .nav-item.active {
      background: var(--color-background-active, rgba(99,102,241,0.12));
      color: var(--color-accent, #6366f1);
      font-weight: 600;
    }
    .nav-icon { flex-shrink: 0; display: flex; align-items: center; }
    .nav-icon svg { width: 16px; height: 16px; }
    .nav-label-text { overflow: hidden; text-overflow: ellipsis; }
    .nav-label-text.hidden { display: none; }
  `;

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
