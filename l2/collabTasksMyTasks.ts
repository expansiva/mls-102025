/// <mls fileReference="_102025_/l2/collabTasksMyTasks.ts" enhancement="_102027_/l2/enhancementLit" />

/// **collab_i18n_start**
const message_pt = {
  title:           'Meus processos',
  subtitle:        'tarefas atribuídas a mim',
  active:          'Em andamento',
  closed:          'Concluídos',
  emptyTitle:      'Sem tarefas atribuídas.',
  emptySubtitle:   'Tarefas de workflow aparecerão aqui quando atribuídas a você.',
  loadError:       'Não consegui carregar as tarefas.',
  retry:           'Tentar de novo',
  reload:          'Recarregar',
  todo:            'A fazer',
  inProgress:      'Em andamento',
  paused:          'Pausado',
  done:            'Concluído',
  failed:          'Falhou',
  priorityLow:     'baixa',
  priorityNormal:  'normal',
  priorityHigh:    'alta',
  priorityUrgent:  'urgente',
  today:           'hoje',
  tomorrow:        'amanhã',
  overdue:         'atrasado',
  openTask:        'Abrir task',
  appearance:      'Aparência',
  themes:          'Tema',
  themeClean:      'Limpo',
  themeAmber:      'Âmbar',
  themeForest:     'Floresta',
  themeCleanDesc:  'Visual neutro e minimalista',
  themeAmberDesc:  'Tons quentes e aconchegantes',
  themeForestDesc: 'Natureza com imagem de fundo',
};
const message_en = {
  title:           'My tasks',
  subtitle:        'tasks assigned to me',
  active:          'Active',
  closed:          'Closed',
  emptyTitle:      'No tasks assigned.',
  emptySubtitle:   'Workflow tasks will appear here when assigned to you.',
  loadError:       'Could not load tasks.',
  retry:           'Retry',
  reload:          'Reload',
  todo:            'To do',
  inProgress:      'In progress',
  paused:          'Paused',
  done:            'Done',
  failed:          'Failed',
  priorityLow:     'low',
  priorityNormal:  'normal',
  priorityHigh:    'high',
  priorityUrgent:  'urgent',
  today:           'today',
  tomorrow:        'tomorrow',
  overdue:         'overdue',
  openTask:        'Open task',
  appearance:      'Appearance',
  themes:          'Theme',
  themeClean:      'Clean',
  themeAmber:      'Amber',
  themeForest:     'Forest',
  themeCleanDesc:  'Neutral and minimal',
  themeAmberDesc:  'Warm and cozy tones',
  themeForestDesc: 'Nature background image',
};
/// **collab_i18n_end**

import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import * as msg from '/_102025_/l2/shared/interfaces.js';
import { msgListTasks } from '/_102025_/l2/shared/api.js';
import { openElementInServiceDetails } from '/_102027_/l2/libCommom.js';
import { getUserId } from '/_102025_/l2/collabMessagesHelper.js';
import {
  type TasksTheme,
  loadTasksTheme,
  applyThemeToHost,
} from '/_102025_/l2/collabTasksTheme.js';

import '/_102025_/l2/collabTasksThemePicker.js';
import '/_102025_/l2/collabTasksDesignTokens.js';

function getMsg() {
  return document.documentElement.lang === 'pt' ? message_pt : message_en;
}

type MyTasksTheme = TasksTheme;

// ── Sorting helpers ───────────────────────────────────────────────────────
const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
const STATUS_ORDER:   Record<string, number> = { 'in progress': 0, 'todo': 1, 'paused': 2, 'done': 3, 'failed': 4 };

function sortActive(tasks: msg.TaskData[]): msg.TaskData[] {
  return [...tasks].sort((a, b) => {
    const pA = PRIORITY_ORDER[a.priority ?? 'normal'] ?? 2;
    const pB = PRIORITY_ORDER[b.priority ?? 'normal'] ?? 2;
    if (pA !== pB) return pA - pB;
    const sA = STATUS_ORDER[a.status] ?? 9;
    const sB = STATUS_ORDER[b.status] ?? 9;
    if (sA !== sB) return sA - sB;
    return (b.last_updated ?? 0) - (a.last_updated ?? 0);
  });
}

function dueDateLabel(dueDate: string | undefined, m: typeof message_en): string {
  if (!dueDate) return '';
  const todayStr    = new Date().toISOString().slice(0, 10);
  const tomorrowDate = new Date(); tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr  = tomorrowDate.toISOString().slice(0, 10);
  if (dueDate === todayStr)    return m.today;
  if (dueDate === tomorrowStr) return m.tomorrow;
  if (new Date(dueDate + 'T23:59:59') < new Date()) return m.overdue;
  return dueDate;
}

function isOverdue(dueDate: string | undefined): boolean {
  if (!dueDate) return false;
  return new Date(dueDate + 'T23:59:59') < new Date();
}

@customElement('collab-tasks-my-tasks-102025')
export class CollabTasksMyTasks extends StateLitElement {

  @property({ type: String }) userId = '';

  @state() private activeTasks: msg.TaskData[] = [];
  @state() private closedTasks: msg.TaskData[] = [];
  @state() private loadingActive = true;
  @state() private loadingClosed = true;
  @state() private error: string | null = null;
  @state() private showClosed = false;
  @state() private _theme: MyTasksTheme = 'clean';
  @state() private _showSettings = false;

  private _refetchTimer: ReturnType<typeof setTimeout> | null = null;
  private _onTaskChange!: EventListener;
  private _onTaskMetaChanged!: EventListener;
  private _onThemeChanged!: EventListener;
  private _onBgChanged!: EventListener;

  connectedCallback() {
    super.connectedCallback();
    if (!this.userId) this.userId = getUserId() || '';
    this._theme = loadTasksTheme();
    this._applyThemeClass();
    this._onTaskChange    = (e: Event) => this._handleTaskChange(e as CustomEvent);
    this._onTaskMetaChanged = (e: Event) => this._handleTaskMetaChanged(e as CustomEvent);
    // Stay in sync when theme is changed elsewhere (board picker, etc.).
    this._onThemeChanged = (e: Event) => {
      const detail = (e as CustomEvent).detail as { theme: MyTasksTheme };
      if (detail?.theme && detail.theme !== this._theme) {
        this._theme = detail.theme;
      }
      applyThemeToHost(this._theme, this);
    };
    this._onBgChanged = (e: Event) => {
      const detail = (e as CustomEvent).detail as { theme: MyTasksTheme; url: string };
      if (detail?.theme === this._theme) {
        this.style.setProperty('--theme-bg-url', `url("${detail.url}")`);
      }
    };
    const w = window?.top ?? window;
    w.addEventListener('task-change', this._onTaskChange);
    w.addEventListener('task-meta-changed', this._onTaskMetaChanged);
    w.addEventListener('tasks-theme-changed', this._onThemeChanged);
    w.addEventListener('tasks-bg-changed',    this._onBgChanged);
    this._fetchAll();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const w = window?.top ?? window;
    w.removeEventListener('task-change', this._onTaskChange);
    w.removeEventListener('task-meta-changed', this._onTaskMetaChanged);
    w.removeEventListener('tasks-theme-changed', this._onThemeChanged);
    w.removeEventListener('tasks-bg-changed',    this._onBgChanged);
    if (this._refetchTimer) clearTimeout(this._refetchTimer);
  }

  private _applyThemeClass() {
    applyThemeToHost(this._theme, this);
  }

  private async _fetchAll() {
    this.loadingActive = true;
    this.loadingClosed = true;
    this.error = null;
    try {
      const activeResult = await msgListTasks({ userId: this.userId, view: 'active', pageSize: 200 });
      if (!activeResult.success) {
        this.error = activeResult.error ?? 'error';
        this.loadingActive = false;
        this.loadingClosed = false;
        return;
      }
      this.activeTasks = sortActive(activeResult.response?.tasks ?? []);
      this.loadingActive = false;
      this._fetchClosed();
    } catch (err: any) {
      this.error = err?.message ?? 'error';
      this.loadingActive = false;
      this.loadingClosed = false;
    }
  }

  private async _fetchClosed() {
    this.loadingClosed = true;
    try {
      const result = await msgListTasks({ userId: this.userId, view: 'closed', pageSize: 50 });
      if (result.success) {
        this.closedTasks = (result.response?.tasks ?? []).sort(
          (a, b) => (b.last_updated ?? 0) - (a.last_updated ?? 0)
        );
      }
    } catch { /* silent */ }
    this.loadingClosed = false;
  }

  private _scheduleRefetch() {
    if (this._refetchTimer) clearTimeout(this._refetchTimer);
    this._refetchTimer = setTimeout(() => this._fetchAll(), 300);
  }

  private _handleTaskChange(e: CustomEvent) {
    const task = e.detail?.context?.task as msg.TaskData | undefined;
    if (!task) { this._scheduleRefetch(); return; }
    const isClosed  = task.status === 'done' || task.status === 'failed';
    const activeIdx = this.activeTasks.findIndex(t => t.PK === task.PK);
    const closedIdx = this.closedTasks.findIndex(t => t.PK === task.PK);
    if (activeIdx >= 0) {
      if (isClosed) {
        this.activeTasks = sortActive(this.activeTasks.filter(t => t.PK !== task.PK));
        this.closedTasks = [task, ...this.closedTasks];
      } else {
        const updated = [...this.activeTasks]; updated[activeIdx] = task;
        this.activeTasks = sortActive(updated);
      }
    } else if (closedIdx >= 0) {
      const updated = [...this.closedTasks]; updated[closedIdx] = task;
      this.closedTasks = updated;
    } else {
      this._scheduleRefetch();
    }
  }

  private _handleTaskMetaChanged(e: CustomEvent) {
    const { taskId, taskTitle } = e.detail as { taskId: string; taskTitle: string };
    const pk = `task/#${taskId}`;
    const ai = this.activeTasks.findIndex(t => t.PK === pk);
    if (ai >= 0) {
      const u = [...this.activeTasks]; u[ai] = { ...u[ai], title: taskTitle };
      this.activeTasks = u; return;
    }
    const ci = this.closedTasks.findIndex(t => t.PK === pk);
    if (ci >= 0) {
      const u = [...this.closedTasks]; u[ci] = { ...u[ci], title: taskTitle };
      this.closedTasks = u;
    }
  }

  private async _openTask(task: msg.TaskData) {
    await import('/_102025_/l2/collabMessagesTaskRoom.js');
    const room = document.createElement('collab-messages-task-room-102025') as HTMLElement & {
      task?: msg.TaskData; userId?: string;
    };
    room.task = task;
    room.userId = this.userId;
    openElementInServiceDetails(room);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    const m = getMsg();
    return html`
      ${this._renderHeader(m)}
      ${this._showSettings ? this._renderSettings(m) : nothing}
      <div class="mytasks-body">
        ${this._renderBody(m)}
      </div>
    `;
  }

  private _renderHeader(m: typeof message_en) {
    return html`
      <div class="mytasks-header">
        <div class="mytasks-header-left">
          <span class="mytasks-title">${m.title}</span>
          <span class="mytasks-sep">·</span>
          <span class="mytasks-sub">${m.subtitle}</span>
        </div>
        <div class="mytasks-header-right">
          <button
            class="mytasks-icon-btn ${this._showSettings ? 'active' : ''}"
            title="${m.appearance}"
            @click=${() => { this._showSettings = !this._showSettings; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          <button
            class="mytasks-icon-btn"
            title="${m.reload}"
            @click=${() => this._fetchAll()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  private _renderSettings(m: typeof message_en) {
    return html`
      <div class="settings-panel">
        <div class="settings-panel-title">${m.themes}</div>
        <collab-tasks-theme-picker-102025
          variant="compact"
          hideTitle
        ></collab-tasks-theme-picker-102025>
      </div>
    `;
  }

  private _renderBody(m: typeof message_en) {
    if (this.error && this.activeTasks.length === 0) {
      return html`
        <div class="mytasks-error">
          <span>${m.loadError}</span>
          <button @click=${() => this._fetchAll()}>${m.retry}</button>
        </div>
      `;
    }
    if (this.loadingActive) return this._renderSkeletons(4);
    if (this.activeTasks.length === 0 && this.closedTasks.length === 0 && !this.loadingClosed) {
      return html`
        <div class="mytasks-empty">
          <div class="empty-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="1.2" opacity=".3"/>
              <path d="M11 16l3 3 7-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".4"/>
            </svg>
          </div>
          <div class="empty-title">${m.emptyTitle}</div>
          <div class="empty-sub">${m.emptySubtitle}</div>
        </div>
      `;
    }
    return html`
      ${this.activeTasks.length > 0 ? html`
        <div class="mytasks-section-label">
          ${m.active} <span class="section-count">${this.activeTasks.length}</span>
        </div>
        <div class="mytasks-list">
          ${this.activeTasks.map(task => this._renderTaskRow(task, m))}
        </div>
      ` : nothing}

      ${!this.loadingClosed && this.closedTasks.length > 0 ? html`
        <div
          class="mytasks-section-label closed-toggle"
          @click=${() => { this.showClosed = !this.showClosed; }}
        >
          <svg class="toggle-chevron ${this.showClosed ? 'open' : ''}"
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M3 4.5l3 3 3-3"/>
          </svg>
          ${m.closed} <span class="section-count">${this.closedTasks.length}</span>
        </div>
        ${this.showClosed ? html`
          <div class="mytasks-list closed">
            ${this.closedTasks.map(task => this._renderTaskRow(task, m))}
          </div>
        ` : nothing}
      ` : nothing}

      ${this.loadingClosed ? html`
        <div class="mytasks-loading-closed">
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
        </div>
      ` : nothing}
    `;
  }

  private _renderTaskRow(task: msg.TaskData, m: typeof message_en) {
    const isClosed = task.status === 'done' || task.status === 'failed';
    const pmaId    = task.taskRoom?.pmaId;
    const dueLabel = dueDateLabel(task.dueDate, m);
    const overdue  = !isClosed && isOverdue(task.dueDate);
    const statusLabel = task.status === 'in progress'
      ? m.inProgress
      : (m as any)[task.status] ?? task.status;
    const priorityLabel = task.priority
      ? (m as any)[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`] ?? task.priority
      : null;

    return html`
      <div
        class="task-row ${isClosed ? 'is-closed' : ''} priority-${task.priority ?? 'normal'}"
        role="button"
        tabindex="0"
        title="${m.openTask}"
        @click=${() => this._openTask(task)}
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._openTask(task); }
        }}
      >
        <div class="task-check status-${task.status.replace(' ', '-')}">
          ${isClosed ? html`
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2.5 2.5 3.5-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          ` : nothing}
        </div>

        <div class="task-info">
          <div class="task-title">${task.title}</div>
          <div class="task-meta">
            <span class="status-pill status-${task.status.replace(' ', '-')}">${statusLabel}</span>
            ${pmaId ? html`<span class="meta-sep">·</span><span class="pma-ref">${pmaId}</span>` : nothing}
            ${task.tags?.[0] ? html`<span class="meta-sep">·</span><span class="tag-chip">${task.tags[0]}</span>` : nothing}
          </div>
        </div>

        <div class="task-right">
          ${priorityLabel && !isClosed ? html`
            <span class="priority-badge priority-${task.priority}">${priorityLabel}</span>
          ` : nothing}
          ${dueLabel ? html`
            <span class="due-label ${overdue ? 'overdue' : ''}">${dueLabel}</span>
          ` : nothing}
        </div>
      </div>
    `;
  }

  private _renderSkeletons(count: number) {
    return html`
      <div class="mytasks-list">
        ${Array.from({ length: count }, (_, i) => html`
          <div class="task-row-skeleton" aria-hidden="true" style="animation-delay: ${i * 60}ms">
            <div class="skel skel-check"></div>
            <div class="skel-body">
              <div class="skel skel-title" style="width: ${55 + (i % 3) * 12}%"></div>
              <div class="skel skel-meta"  style="width: ${30 + (i % 2) * 10}%"></div>
            </div>
            <div class="skel skel-badge"></div>
          </div>
        `)}
      </div>
    `;
  }
}
