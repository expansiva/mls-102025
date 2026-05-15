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

  private _onBoardFilter!: EventListener;

  connectedCallback() {
    super.connectedCallback();
    this._onBoardFilter = (e: Event) => {
      const { pmaId } = (e as CustomEvent).detail as { pmaId: string };
      this.screen = 'board';
      this._openBoardWithFilter(pmaId);
    };
    const w = window?.top ?? window;
    w.addEventListener('tasks-open-board-filter', this._onBoardFilter);
    this._openScreen('board');
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const w = window?.top ?? window;
    w.removeEventListener('tasks-open-board-filter', this._onBoardFilter);
  }

  private async _openBoardWithFilter(pmaId: string) {
    const userId = getUserId() || '';
    await import('/_102025_/l2/collabTasksBoard.js');
    const board = document.createElement('collab-tasks-board-102025') as HTMLElement & {
      userId?: string; organizationId?: string; reloadKey?: number; initialPmaFilter?: string;
    };
    board.userId = userId;
    board.organizationId = 'collabcodes';
    board.reloadKey = Date.now();
    board.initialPmaFilter = pmaId;
    openElementInServiceDetails(board);
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
    } else if (screen === 'mytasks') {
      await import('/_102025_/l2/collabTasksMyTasks.js');
      const myTasks = document.createElement('collab-tasks-my-tasks-102025') as HTMLElement & {
        userId?: string;
      };
      myTasks.userId = userId;
      el = myTasks;
    } else if (screen === 'workflows') {
      await import('/_102025_/l2/collabTasksWorkflows.js');
      const wf = document.createElement('collab-tasks-workflows-102025') as HTMLElement & {
        userId?: string;
      };
      wf.userId = userId;
      el = wf;
    } else if (screen === 'approvals') {
      await import('/_102025_/l2/collabTasksApprovals.js');
      const ap = document.createElement('collab-tasks-approvals-102025') as HTMLElement & {
        userId?: string;
      };
      ap.userId = userId;
      el = ap;
    } else if (screen === 'analytics') {
      await import('/_102025_/l2/collabTasksAnalytics.js');
      const an = document.createElement('collab-tasks-analytics-102025') as HTMLElement & {
        userId?: string;
      };
      an.userId = userId;
      el = an;
    } else if (screen === 'settings') {
      await import('/_102025_/l2/collabTasksSettings.js');
      const st = document.createElement('collab-tasks-settings-102025') as HTMLElement & {
        userId?: string; organizationId?: string;
      };
      st.userId = userId;
      st.organizationId = 'collabcodes';
      el = st;
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
