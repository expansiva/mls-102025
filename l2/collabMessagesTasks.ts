/// <mls fileReference="_102025_/l2/collabMessagesTasks.ts" enhancement="_102027_/l2/enhancementLit" />

/// **collab_i18n_start**
const message_pt = {
  myTasks: 'Minhas tasks',
  workflows: 'Workflows',
  simulator: 'Simulador',
  approvals: 'Aprovações',
  analytics: 'Analytics',
  settings: 'Configurações',
  board: 'Board',
  comingSoon: 'Em desenvolvimento',
};
const message_en = {
  myTasks: 'My tasks',
  workflows: 'Workflows',
  simulator: 'Simulator',
  approvals: 'Approvals',
  analytics: 'Analytics',
  settings: 'Settings',
  board: 'Board',
  comingSoon: 'In development',
};
/// **collab_i18n_end**

import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import { getUserId } from '/_102025_/l2/collabMessagesHelper.js';
import { openElementInServiceDetails } from '/_102027_/l2/libCommom.js';

import '/_102025_/l2/collabTasksSidebar.js';

type ScreenId = 'board' | 'mytasks' | 'workflows' | 'simulator' | 'approvals' | 'analytics' | 'settings';

function getMsg() {
  return document.documentElement.lang === 'pt' ? message_pt : message_en;
}

@customElement('collab-messages-tasks-102025')
export class CollabMessagesTasks extends StateLitElement {

  @state() private screen: ScreenId = 'board';

  connectedCallback() {
    super.connectedCallback();
    this._openScreen('board');
  }

  render() {
    return html`
      <collab-tasks-sidebar-102025
        .activeScreen=${this.screen}
        @screen-change=${(e: CustomEvent) => this._onScreenChange(e.detail as ScreenId)}
      ></collab-tasks-sidebar-102025>
    `;
  }

  private _onScreenChange(screen: ScreenId) {
    this.screen = screen;
    this._openScreen(screen);
  }

  private async _openScreen(screen: ScreenId) {
    const msg = getMsg();
    const userId = getUserId() || '';
    let el: HTMLElement;

    if (screen === 'board') {
      await import('/_102025_/l2/collabTasksBoard.js');
      const board = document.createElement('collab-tasks-board-102025') as HTMLElement & {
        userId?: string;
        organizationId?: string;
        reloadKey?: number;
      };
      board.userId = userId;
      board.organizationId = 'collabcodes';
      board.reloadKey = Date.now();
      el = board;
    } else {
      await import('/_102025_/l2/collabTasksEmptyState.js');
      const empty = document.createElement('collab-tasks-empty-state-102025') as HTMLElement;
      const label = (msg as any)[screen] as string ?? screen;
      empty.setAttribute('title', label);
      empty.setAttribute('subtitle', msg.comingSoon);
      el = empty;
    }

    openElementInServiceDetails(el);
  }
}
