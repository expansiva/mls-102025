/// <mls fileReference="_102025_/l2/collabMessagesTasks.ts" enhancement="_102027_/l2/enhancementLit" />

/// **collab_i18n_start**
const message_pt = {
  tasks: 'Tasks',
  board: 'Board',
  myTasks: 'Minhas tasks',
  workflows: 'Workflows',
  simulator: 'Simulador',
  approvals: 'Aprovações',
  analytics: 'Analytics',
  settings: 'Configurações',
  reload: 'Recarregar',
};
const message_en = {
  tasks: 'Tasks',
  board: 'Board',
  myTasks: 'My tasks',
  workflows: 'Workflows',
  simulator: 'Simulator',
  approvals: 'Approvals',
  analytics: 'Analytics',
  settings: 'Settings',
  reload: 'Reload',
};
/// **collab_i18n_end**

import { html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import { getUserId } from '/_102025_/l2/collabMessagesHelper.js';

import '/_102025_/l2/collabTasksSidebar.js';
import '/_102025_/l2/collabTasksTopbar.js';
import '/_102025_/l2/collabTasksEmptyState.js';
import '/_102025_/l2/collabTasksBoard.js';

type ScreenId = 'board' | 'mytasks' | 'workflows' | 'simulator' | 'approvals' | 'analytics' | 'settings';

function getMsg() {
  return document.documentElement.lang === 'pt' ? message_pt : message_en;
}

@customElement('collab-messages-tasks-102025')
export class CollabMessagesTasks extends StateLitElement {

  @state() private screen: ScreenId = 'board';
  @state() private reloadKey = 0;

  render() {
    const msg = getMsg();
    const userId = getUserId() || '';

    return html`
      <collab-tasks-sidebar-102025
        .activeScreen=${this.screen}
        @screen-change=${(e: CustomEvent) => { this.screen = e.detail as ScreenId; }}
      ></collab-tasks-sidebar-102025>
      <div class="dashboard-main">
        <collab-tasks-topbar-102025
          .title=${this._screenLabel(this.screen, msg)}
          @dashboard-reload=${() => { this.reloadKey++; }}
        ></collab-tasks-topbar-102025>
        <div class="dashboard-content">
          ${this._renderScreen(userId, msg)}
        </div>
      </div>
    `;
  }

  private _renderScreen(userId: string, msg: typeof message_en) {
    const key = this.reloadKey;
    switch (this.screen) {
      case 'board':
        return html`<collab-tasks-board-102025
          .reloadKey=${key}
          .userId=${userId}
        ></collab-tasks-board-102025>`;
      case 'mytasks':
        return html`<collab-tasks-empty-state-102025
          title=${msg.myTasks}
          subtitle="In development"
        ></collab-tasks-empty-state-102025>`;
      case 'workflows':
        return html`<collab-tasks-empty-state-102025
          title=${msg.workflows}
          subtitle="In development — depends on Workflow definitions"
        ></collab-tasks-empty-state-102025>`;
      case 'simulator':
        return html`<collab-tasks-empty-state-102025
          title=${msg.simulator}
          subtitle="In development — depends on Workflow simulator"
        ></collab-tasks-empty-state-102025>`;
      case 'approvals':
        return html`<collab-tasks-empty-state-102025
          title=${msg.approvals}
          subtitle="In development — depends on Guardrails (Stage 5)"
        ></collab-tasks-empty-state-102025>`;
      case 'analytics':
        return html`<collab-tasks-empty-state-102025
          title=${msg.analytics}
          subtitle="In development — depends on Evaluation (Stage 6)"
        ></collab-tasks-empty-state-102025>`;
      case 'settings':
        return html`<collab-tasks-empty-state-102025
          title=${msg.settings}
          subtitle="In development"
        ></collab-tasks-empty-state-102025>`;
      default:
        return nothing;
    }
  }

  private _screenLabel(screen: ScreenId, msg: typeof message_en): string {
    const map: Record<ScreenId, string> = {
      board: msg.board,
      mytasks: msg.myTasks,
      workflows: msg.workflows,
      simulator: msg.simulator,
      approvals: msg.approvals,
      analytics: msg.analytics,
      settings: msg.settings,
    };
    return map[screen] || screen;
  }
}
