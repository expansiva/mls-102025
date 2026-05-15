/// <mls fileReference="_102025_/l2/collabTasksApprovals.ts" enhancement="_102027_/l2/enhancementLit" />

/// **collab_i18n_start**
const message_pt = {
  title:       'Aprovações',
  reload:      'Recarregar',
  loadError:   'Não consegui carregar.',
  retry:       'Tentar de novo',
  emptyTitle:  'Nenhuma pendência.',
  emptySub:    'Tasks de workflow atribuídas a você aparecerão aqui.',
  pending:     'pendente',
  pendingP:    'pendentes',
  paused:      'pausado',
  pausedP:     'pausados',
  todo:        'A fazer',
  inProgress:  'Em andamento',
  pausedLabel: 'Pausado',
  priorityUrgent: 'urgente',
  priorityHigh:   'alta',
  priorityNormal: 'normal',
  priorityLow:    'baixa',
  today:       'hoje',
  tomorrow:    'amanhã',
  overdue:     'atrasado',
  openTask:    'Abrir task',
  waitingSince:'há',
  day:         'dia',
  days:        'dias',
};
const message_en = {
  title:       'Approvals',
  reload:      'Reload',
  loadError:   'Could not load.',
  retry:       'Retry',
  emptyTitle:  'Nothing pending.',
  emptySub:    'Workflow tasks assigned to you will appear here.',
  pending:     'pending',
  pendingP:    'pending',
  paused:      'paused',
  pausedP:     'paused',
  todo:        'To do',
  inProgress:  'In progress',
  pausedLabel: 'Paused',
  priorityUrgent: 'urgent',
  priorityHigh:   'high',
  priorityNormal: 'normal',
  priorityLow:    'low',
  today:       'today',
  tomorrow:    'tomorrow',
  overdue:     'overdue',
  openTask:    'Open task',
  waitingSince:'for',
  day:         'day',
  days:        'days',
};
/// **collab_i18n_end**

import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import * as msg from '/_102025_/l2/shared/interfaces.js';
import { msgListTasks } from '/_102025_/l2/shared/api.js';
import { openElementInServiceDetails } from '/_102027_/l2/libCommom.js';
import { getUserId } from '/_102025_/l2/collabMessagesHelper.js';

function getMsg() {
  return document.documentElement.lang === 'pt' ? message_pt : message_en;
}

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };

function waitingDays(lastUpdated: number): number {
  return Math.floor((Date.now() - lastUpdated) / 86_400_000);
}

function dueDateLabel(dueDate: string | undefined, m: typeof message_en): string {
  if (!dueDate) return '';
  const today    = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  if (dueDate === today)    return m.today;
  if (dueDate === tomorrow) return m.tomorrow;
  if (new Date(dueDate + 'T23:59:59') < new Date()) return m.overdue;
  return dueDate;
}

@customElement('collab-tasks-approvals-102025')
export class CollabTasksApprovals extends StateLitElement {

  @property({ type: String }) userId = '';

  @state() private pending: msg.TaskData[] = [];
  @state() private paused:  msg.TaskData[] = [];
  @state() private loading  = true;
  @state() private error: string | null = null;

  connectedCallback() {
    super.connectedCallback();
    if (!this.userId) this.userId = getUserId() || '';
    this._fetchAll();
  }

  private async _fetchAll() {
    this.loading = true;
    this.error   = null;
    try {
      const res = await msgListTasks({ userId: this.userId, view: 'active', pageSize: 200 });
      if (!res.success) { this.error = res.error ?? 'error'; this.loading = false; return; }
      const tasks = res.response?.tasks ?? [];

      // Pending: assigned to me, todo, has workflow
      const pendingTasks = tasks
        .filter(t =>
          t.taskRoom?.pmaId &&
          t.status === 'todo' &&
          (t.assignees?.includes(this.userId) || t.owner === this.userId)
        )
        .sort((a, b) => {
          const pa = PRIORITY_ORDER[a.priority ?? 'normal'] ?? 2;
          const pb = PRIORITY_ORDER[b.priority ?? 'normal'] ?? 2;
          if (pa !== pb) return pa - pb;
          return (b.last_updated ?? 0) - (a.last_updated ?? 0);
        });

      // Paused: workflow paused waiting for action
      const pausedTasks = tasks
        .filter(t =>
          t.taskRoom?.pmaId &&
          t.status === 'paused' &&
          (t.assignees?.includes(this.userId) || t.owner === this.userId)
        )
        .sort((a, b) => (b.last_updated ?? 0) - (a.last_updated ?? 0));

      this.pending = pendingTasks;
      this.paused  = pausedTasks;
    } catch (err: any) {
      this.error = err?.message ?? 'error';
    }
    this.loading = false;
  }

  private async _openTask(task: msg.TaskData) {
    await import('/_102025_/l2/collabMessagesTaskRoom.js');
    const room = document.createElement('collab-messages-task-room-102025') as HTMLElement & {
      task?: msg.TaskData; userId?: string;
    };
    room.task   = task;
    room.userId = this.userId;
    openElementInServiceDetails(room);
  }

  render() {
    const m     = getMsg();
    const total = this.pending.length + this.paused.length;
    const subLabel = this.loading ? '…'
      : total === 0 ? '0'
      : `${total} ${total === 1 ? m.pending : m.pendingP}`;

    return html`
      <div class="ap-header">
        <div class="ap-header-left">
          <span class="ap-title">${m.title}</span>
          <span class="ap-sep">·</span>
          <span class="ap-sub">${subLabel}</span>
        </div>
        <button class="ap-icon-btn" title="${m.reload}" @click=${() => this._fetchAll()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </button>
      </div>

      <div class="ap-body">
        ${this.error ? html`
          <div class="ap-error">
            <span>${m.loadError}</span>
            <button @click=${() => this._fetchAll()}>${m.retry}</button>
          </div>
        ` : nothing}

        ${this.loading
          ? this._renderSkeletons(3)
          : total === 0
            ? html`
              <div class="ap-empty">
                <div class="empty-icon">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <rect x="3" y="5" width="30" height="26" rx="3" stroke="currentColor" stroke-width="1.2" opacity=".3"/>
                    <path d="M10 14h16M10 20h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".35"/>
                    <path d="M22 20l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/>
                  </svg>
                </div>
                <div class="empty-title">${m.emptyTitle}</div>
                <div class="empty-sub">${m.emptySub}</div>
              </div>
            `
            : html`
              ${this.pending.length > 0 ? html`
                <div class="ap-section-label">
                  ${m.pending} <span class="ap-count">${this.pending.length}</span>
                </div>
                <div class="ap-list">
                  ${this.pending.map(t => this._renderRow(t, m, false))}
                </div>
              ` : nothing}

              ${this.paused.length > 0 ? html`
                <div class="ap-section-label ${this.pending.length > 0 ? 'mt' : ''}">
                  ${m.paused} <span class="ap-count">${this.paused.length}</span>
                </div>
                <div class="ap-list">
                  ${this.paused.map(t => this._renderRow(t, m, true))}
                </div>
              ` : nothing}
            `
        }
      </div>
    `;
  }

  private _renderRow(task: msg.TaskData, m: typeof message_en, isPaused: boolean) {
    const days      = task.last_updated ? waitingDays(task.last_updated) : 0;
    const waitLabel = days === 0 ? m.today
                    : days === 1 ? `${m.waitingSince} 1 ${m.day}`
                    : `${m.waitingSince} ${days} ${m.days}`;
    const dueLabel  = dueDateLabel(task.dueDate, m);
    const isOverdue = !!task.dueDate && new Date(task.dueDate + 'T23:59:59') < new Date();
    const priLabel  = task.priority
      ? (m as any)[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`] ?? task.priority
      : null;

    return html`
      <div
        class="ap-row"
        role="button"
        tabindex="0"
        title="${m.openTask}"
        @click=${() => this._openTask(task)}
        @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._openTask(task); } }}
      >
        <div class="ap-left">
          <div class="ap-task-title">${task.title}</div>
          <div class="ap-task-meta">
            ${task.taskRoom?.pmaId ? html`<span class="ap-pma">${task.taskRoom.pmaId}</span>` : nothing}
            ${task.tags?.[0]       ? html`<span class="ap-tag">${task.tags[0]}</span>`         : nothing}
            <span class="ap-wait ${days >= 3 ? 'old' : ''}">${waitLabel}</span>
          </div>
        </div>
        <div class="ap-right">
          ${isPaused ? html`
            <span class="ap-status-badge paused">${m.pausedLabel}</span>
          ` : priLabel ? html`
            <span class="ap-pri-badge priority-${task.priority}">${priLabel}</span>
          ` : nothing}
          ${dueLabel ? html`
            <span class="ap-due ${isOverdue ? 'overdue' : ''}">${dueLabel}</span>
          ` : nothing}
        </div>
      </div>
    `;
  }

  private _renderSkeletons(count: number) {
    return html`
      <div class="ap-list">
        ${Array.from({ length: count }, (_, i) => html`
          <div class="ap-row-skeleton" style="animation-delay:${i*60}ms">
            <div class="skel-body">
              <div class="skel skel-title" style="width:${50+(i%3)*15}%"></div>
              <div class="skel skel-meta"  style="width:${30+(i%2)*10}%"></div>
            </div>
            <div class="skel skel-badge"></div>
          </div>
        `)}
      </div>
    `;
  }
}
