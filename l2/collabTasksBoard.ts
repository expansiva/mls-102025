/// <mls fileReference="_102025_/l2/collabTasksBoard.ts" enhancement="_102027_/l2/enhancementLit" />

/// **collab_i18n_start**
const message_pt = {
  todo:             'A fazer',
  inProgress:       'Em andamento',
  paused:           'Pausado',
  done:             'Concluído',
  failed:           'Falhou',
  emptyColumn:      'Nada por aqui ainda.',
  boardEmptyTitle:  'Sem tarefas de workflow.',
  boardEmptySubtitle: 'Crie uma com /createNewChat kai: <título> em qualquer thread.',
  loadError:        'Não consegui carregar as tarefas.',
  retry:            'Tentar de novo',
};
const message_en = {
  todo:             'To do',
  inProgress:       'In progress',
  paused:           'Paused',
  done:             'Done',
  failed:           'Failed',
  emptyColumn:      'Nothing here yet.',
  boardEmptyTitle:  'No workflow tasks yet.',
  boardEmptySubtitle: 'Create one with /createNewChat kai: <title> from any thread.',
  loadError:        'Could not load tasks.',
  retry:            'Retry',
};
/// **collab_i18n_end**

import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import * as msg from '/_102025_/l2/shared/interfaces.js';
import { msgListTasks, msgGetOrgPreferences } from '/_102025_/l2/shared/api.js';

import '/_102025_/l2/collabTasksCard.js';
import '/_102025_/l2/collabTasksEmptyState.js';

function getMsg() {
  return document.documentElement.lang === 'pt' ? message_pt : message_en;
}

// ── Module-level tag vocabulary cache ─────────────────────────────────────
let _tagCache: msg.TagVocabularyEntry[] | null = null;

async function loadTagVocabulary(organizationId: string): Promise<msg.TagVocabularyEntry[]> {
  if (_tagCache) return _tagCache;
  const result = await msgGetOrgPreferences({ organizationId });
  if (result.success && result.response) {
    _tagCache = result.response.tagVocabulary ?? [];
  } else {
    _tagCache = [];
  }
  return _tagCache;
}

// ── Columns definition ─────────────────────────────────────────────────────
type StatusKey = 'todo' | 'in progress' | 'paused' | 'done' | 'failed';

const ALWAYS_COLUMNS: StatusKey[] = ['todo', 'in progress', 'paused', 'done'];
const STAGGER_CAP = 8;

@customElement('collab-tasks-board-102025')
export class CollabTasksBoard extends StateLitElement {

  @property({ type: Number }) reloadKey = 0;
  @property({ type: String }) userId = '';
  @property({ type: String }) organizationId = 'collabcodes';

  @state() private activeTasks: msg.TaskData[] = [];
  @state() private closedTasks: msg.TaskData[] = [];
  @state() private tagVocabulary: msg.TagVocabularyEntry[] = [];
  @state() private loadingActive = true;
  @state() private loadingClosed = true;
  @state() private error: string | null = null;

  private _initialFetchDone = false;
  private _refetchTimer: ReturnType<typeof setTimeout> | null = null;
  private _onTaskChange!: EventListener;
  private _onThreadChange!: EventListener;
  private _onTaskMetaChanged!: EventListener;

  connectedCallback() {
    super.connectedCallback();
    this._onTaskChange = (e: Event) => this._handleTaskChange(e as CustomEvent);
    this._onThreadChange = (e: Event) => this._handleThreadChange(e as CustomEvent);
    this._onTaskMetaChanged = (e: Event) => this._handleTaskMetaChanged(e as CustomEvent);
    const w = window?.top ?? window;
    w.addEventListener('task-change', this._onTaskChange);
    w.addEventListener('thread-change', this._onThreadChange);
    w.addEventListener('task-meta-changed', this._onTaskMetaChanged);
    this._fetchAll();
    this._initialFetchDone = true;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const w = window?.top ?? window;
    w.removeEventListener('task-change', this._onTaskChange);
    w.removeEventListener('thread-change', this._onThreadChange);
    w.removeEventListener('task-meta-changed', this._onTaskMetaChanged);
    if (this._refetchTimer) clearTimeout(this._refetchTimer);
  }

  updated(changed: Map<string, unknown>) {
    super.updated(changed);
    if (this._initialFetchDone && changed.has('reloadKey')) {
      this._fetchAll();
    }
  }

  private async _fetchAll() {
    this.loadingActive = true;
    this.loadingClosed = true;
    this.error = null;

    try {
      const [vocab, activeResult] = await Promise.all([
        loadTagVocabulary(this.organizationId),
        msgListTasks({ view: 'active', pageSize: 200 }),
      ]);

      this.tagVocabulary = vocab;

      if (!activeResult.success) {
        this.error = activeResult.error ?? 'error';
        this.loadingActive = false;
        this.loadingClosed = false;
        return;
      }

      this.activeTasks = this._filterWorkflow(activeResult.response?.tasks ?? []);
      this.loadingActive = false;

      // Lazy: closed view
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
      const result = await msgListTasks({ view: 'closed', pageSize: 100 });
      if (result.success) {
        this.closedTasks = this._filterWorkflow(result.response?.tasks ?? []);
      }
    } catch {
      // closed fetch errors are silent; keep what we had
    }
    this.loadingClosed = false;
  }

  private _filterWorkflow(tasks: msg.TaskData[]): msg.TaskData[] {
    return tasks.filter(t => {
      if (!t.taskRoom?.pmaId) {
        console.warn('[Board] non-workflow task slipped through:', t.PK);
        return false;
      }
      return true;
    });
  }

  private _scheduleRefetch() {
    if (this._refetchTimer) clearTimeout(this._refetchTimer);
    this._refetchTimer = setTimeout(() => this._fetchAll(), 300);
  }

  private _handleTaskChange(e: CustomEvent) {
    const task = e.detail?.context?.task as msg.TaskData | undefined;
    if (!task) { this._scheduleRefetch(); return; }
    if (!task.taskRoom?.pmaId) return;

    const isClosed = task.status === 'done' || task.status === 'failed';
    const activeIdx = this.activeTasks.findIndex(t => t.PK === task.PK);
    const closedIdx = this.closedTasks.findIndex(t => t.PK === task.PK);

    if (activeIdx >= 0) {
      if (isClosed) {
        this.activeTasks = this.activeTasks.filter(t => t.PK !== task.PK);
        this.closedTasks = [task, ...this.closedTasks];
      } else {
        const updated = [...this.activeTasks];
        updated[activeIdx] = task;
        this.activeTasks = updated;
      }
    } else if (closedIdx >= 0) {
      const updated = [...this.closedTasks];
      updated[closedIdx] = task;
      this.closedTasks = updated;
    } else {
      this._scheduleRefetch();
    }
  }

  private _handleThreadChange(e: CustomEvent) {
    const thread = e.detail as msg.Thread | undefined;
    if (!thread?.threadId) { this._scheduleRefetch(); return; }
    const threadId = thread.threadId;
    const activeIdx = this.activeTasks.findIndex(t => t.taskRoom?.threadId === threadId);
    const closedIdx = this.closedTasks.findIndex(t => t.taskRoom?.threadId === threadId);
    if (activeIdx < 0 && closedIdx < 0) return; // not our task
    this._scheduleRefetch();
  }

  private _handleTaskMetaChanged(e: CustomEvent) {
    const { taskId, taskTitle } = e.detail as { taskId: string; taskTitle: string; threadId: string };
    const pk = `task/#${taskId}`;
    const activeIdx = this.activeTasks.findIndex(t => t.PK === pk);
    if (activeIdx >= 0) {
      const updated = [...this.activeTasks];
      updated[activeIdx] = { ...updated[activeIdx], title: taskTitle };
      this.activeTasks = updated;
      return;
    }
    const closedIdx = this.closedTasks.findIndex(t => t.PK === pk);
    if (closedIdx >= 0) {
      const updated = [...this.closedTasks];
      updated[closedIdx] = { ...updated[closedIdx], title: taskTitle };
      this.closedTasks = updated;
    }
  }

  private _bucket(): Record<StatusKey, msg.TaskData[]> {
    const buckets: Record<StatusKey, msg.TaskData[]> = {
      'todo': [], 'in progress': [], 'paused': [], 'done': [], 'failed': [],
    };
    for (const t of this.activeTasks) {
      if (t.status in buckets) buckets[t.status as StatusKey].push(t);
    }
    for (const t of this.closedTasks) {
      if (t.status === 'done') buckets.done.push(t);
      else if (t.status === 'failed') buckets.failed.push(t);
    }
    return buckets;
  }

  render() {
    const m = getMsg();

    if (this.error && this.activeTasks.length === 0 && this.closedTasks.length === 0) {
      return html`
        <div class="board-error">
          <span>${m.loadError}</span>
          <button class="board-error-retry" @click=${() => this._fetchAll()}>${m.retry}</button>
        </div>
      `;
    }

    const buckets = this._bucket();
    const totalActive = ALWAYS_COLUMNS.reduce((s, k) => s + buckets[k].length, 0);
    const hasFailed = buckets.failed.length > 0;
    const totalAll = totalActive + buckets.done.length + buckets.failed.length;
    const isLoading = this.loadingActive;

    if (!isLoading && !this.loadingClosed && totalAll === 0) {
      return html`
        <collab-tasks-empty-state-102025
          title=${m.boardEmptyTitle}
          subtitle=${m.boardEmptySubtitle}
        ></collab-tasks-empty-state-102025>
      `;
    }

    const columns: StatusKey[] = hasFailed ? [...ALWAYS_COLUMNS, 'failed'] : [...ALWAYS_COLUMNS];

    return html`
      ${this.error ? html`
        <div class="board-error">
          <span>${m.loadError}</span>
          <button class="board-error-retry" @click=${() => this._fetchAll()}>${m.retry}</button>
        </div>
      ` : nothing}
      <div class="board-columns">
        ${columns.map(status => this._renderColumn(status, buckets, m, isLoading, totalAll))}
      </div>
    `;
  }

  private _renderColumn(
    status: StatusKey,
    buckets: Record<StatusKey, msg.TaskData[]>,
    m: typeof message_en,
    boardLoading: boolean,
    totalAll: number,
  ) {
    const tasks = buckets[status];
    const isClosedCol = status === 'done' || status === 'failed';
    const loading = isClosedCol ? this.loadingClosed : boardLoading;
    const skeletonCount = status === 'done' ? 1 : 3;
    const label = status === 'in progress' ? m.inProgress : (m as any)[status] as string;
    const cssStatus = status.replace(' ', '-');

    return html`
      <div class="board-column status-${cssStatus}" aria-busy=${loading ? 'true' : 'false'}>
        <h2 class="col-header">
          <span class="col-dot"></span>
          <span class="col-label">${label}</span>
          <span class="col-count">${loading ? '…' : tasks.length}</span>
        </h2>
        <div class="col-stack">
          ${loading
            ? this._renderSkeletons(skeletonCount)
            : tasks.length === 0
              ? (totalAll > 0
                  ? html`<div class="col-empty">${m.emptyColumn}</div>`
                  : nothing)
              : tasks.map((task, i) => this._renderCard(task, status, i))
          }
        </div>
      </div>
    `;
  }

  private _renderCard(task: msg.TaskData, status: StatusKey, index: number) {
    const delay = Math.min(index, STAGGER_CAP) * 30;
    return html`
      <collab-tasks-card-102025
        class="card-animate"
        style="animation-delay: ${delay}ms"
        .task=${task}
        .tagVocabulary=${this.tagVocabulary}
        .boardStatus=${status}
      ></collab-tasks-card-102025>
    `;
  }

  private _renderSkeletons(count: number) {
    return Array.from({ length: count }, () => html`
      <div class="skeleton-card" aria-hidden="true">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-meta"></div>
      </div>
    `);
  }
}
