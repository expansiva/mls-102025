/// <mls fileReference="_102025_/l2/collabTasksWorkflows.ts" enhancement="_102027_/l2/enhancementLit" />

/// **collab_i18n_start**
const message_pt = {
  title:        'Workflows',
  subtitle:     'processos em uso',
  reload:       'Recarregar',
  loadError:    'Não consegui carregar.',
  retry:        'Tentar de novo',
  emptyTitle:   'Nenhum workflow ativo.',
  emptySub:     'Tasks com workflow aparecerão aqui quando criadas.',
  active:       'ativo',
  activeP:      'ativos',
  done:         'concluído',
  doneP:        'concluídos',
  failed:       'falhou',
  failedP:      'falharam',
  staticWf:     'Workflow estático',
  dynamicWf:    'Workflow dinâmico',
  noType:       'Workflow',
  openBoard:    'Ver no board',
};
const message_en = {
  title:        'Workflows',
  subtitle:     'processes in use',
  reload:       'Reload',
  loadError:    'Could not load.',
  retry:        'Retry',
  emptyTitle:   'No active workflows.',
  emptySub:     'Tasks with a workflow will appear here.',
  active:       'active',
  activeP:      'active',
  done:         'done',
  doneP:        'done',
  failed:       'failed',
  failedP:      'failed',
  staticWf:     'Static workflow',
  dynamicWf:    'Dynamic workflow',
  noType:       'Workflow',
  openBoard:    'View in board',
};
/// **collab_i18n_end**

import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import * as msg from '/_102025_/l2/shared/interfaces.js';
import { msgListTasks } from '/_102025_/l2/shared/api.js';
import { getUserId } from '/_102025_/l2/collabMessagesHelper.js';

function getMsg() {
  return document.documentElement.lang === 'pt' ? message_pt : message_en;
}

interface WorkflowGroup {
  pmaId: string;
  workflowType?: msg.WorkflowType;
  active:  msg.TaskData[];
  done:    msg.TaskData[];
  failed:  msg.TaskData[];
}

@customElement('collab-tasks-workflows-102025')
export class CollabTasksWorkflows extends StateLitElement {

  @property({ type: String }) userId = '';

  @state() private groups: WorkflowGroup[] = [];
  @state() private loading = true;
  @state() private error: string | null = null;

  connectedCallback() {
    super.connectedCallback();
    if (!this.userId) this.userId = getUserId() || '';
    this._fetchAll();
  }

  private async _fetchAll() {
    this.loading = true;
    this.error = null;
    try {
      const [activeRes, closedRes] = await Promise.all([
        msgListTasks({ userId: this.userId, view: 'active', pageSize: 200 }),
        msgListTasks({ userId: this.userId, view: 'closed', pageSize: 200 }),
      ]);
      if (!activeRes.success) { this.error = activeRes.error ?? 'error'; this.loading = false; return; }
      const all = [
        ...(activeRes.response?.tasks ?? []),
        ...(closedRes.response?.tasks ?? []),
      ].filter(t => t.taskRoom?.pmaId);

      const map = new Map<string, WorkflowGroup>();
      for (const t of all) {
        const pmaId = t.taskRoom!.pmaId!;
        if (!map.has(pmaId)) {
          map.set(pmaId, {
            pmaId,
            workflowType: t.taskRoom?.workflowType,
            active: [], done: [], failed: [],
          });
        }
        const g = map.get(pmaId)!;
        if (!g.workflowType && t.taskRoom?.workflowType) g.workflowType = t.taskRoom.workflowType;
        if (t.status === 'done')        g.done.push(t);
        else if (t.status === 'failed') g.failed.push(t);
        else                            g.active.push(t);
      }
      // Sort: most active tasks first
      this.groups = [...map.values()].sort((a, b) =>
        (b.active.length + b.done.length + b.failed.length) -
        (a.active.length + a.done.length + a.failed.length)
      );
    } catch (err: any) {
      this.error = err?.message ?? 'error';
    }
    this.loading = false;
  }

  render() {
    const m = getMsg();
    return html`
      <div class="wf-header">
        <div class="wf-header-left">
          <span class="wf-title">${m.title}</span>
          <span class="wf-sep">·</span>
          <span class="wf-sub">${this.loading ? '…' : `${this.groups.length} ${m.subtitle}`}</span>
        </div>
        <button class="wf-icon-btn" title="${m.reload}" @click=${() => this._fetchAll()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </button>
      </div>

      <div class="wf-body">
        ${this.error ? html`
          <div class="wf-error">
            <span>${m.loadError}</span>
            <button @click=${() => this._fetchAll()}>${m.retry}</button>
          </div>
        ` : nothing}

        ${this.loading
          ? this._renderSkeletons()
          : this.groups.length === 0
            ? html`
              <div class="wf-empty">
                <div class="empty-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M4 8h24M4 16h16M4 24h20" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".35"/>
                    <circle cx="24" cy="22" r="5" stroke="currentColor" stroke-width="1.2" opacity=".35"/>
                  </svg>
                </div>
                <div class="empty-title">${m.emptyTitle}</div>
                <div class="empty-sub">${m.emptySub}</div>
              </div>
            `
            : html`
              <div class="wf-list">
                ${this.groups.map(g => this._renderGroup(g, m))}
              </div>
            `
        }
      </div>
    `;
  }

  private _openInBoard(pmaId: string) {
    const w = window?.top ?? window;
    w.dispatchEvent(new CustomEvent('tasks-open-board-filter', {
      detail: { pmaId },
      bubbles: true,
      composed: true,
    }));
  }

  private _renderGroup(g: WorkflowGroup, m: typeof message_en) {
    const total   = g.active.length + g.done.length + g.failed.length;
    const donePct = total > 0 ? Math.round((g.done.length / total) * 100) : 0;
    const failPct = total > 0 ? Math.round((g.failed.length / total) * 100) : 0;
    const typeLabel = g.workflowType === 'staticWorkflow'  ? m.staticWf
                    : g.workflowType === 'dynamicWorkflow' ? m.dynamicWf
                    : m.noType;

    const activeLabel = g.active.length === 1 ? m.active : m.activeP;
    const doneLabel   = g.done.length   === 1 ? m.done   : m.doneP;
    const failLabel   = g.failed.length === 1 ? m.failed : m.failedP;

    return html`
      <div
        class="wf-row"
        role="button"
        tabindex="0"
        title="${m.openBoard}"
        @click=${() => this._openInBoard(g.pmaId)}
        @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._openInBoard(g.pmaId); } }}
      >
        <div class="wf-icon-cell">
          <div class="wf-badge">${g.pmaId.slice(0, 3).toUpperCase()}</div>
        </div>
        <div class="wf-info">
          <div class="wf-name">${g.pmaId}</div>
          <div class="wf-type">${typeLabel}</div>
        </div>
        <div class="wf-stats">
          ${g.active.length > 0 ? html`
            <span class="stat-pill stat-active">${g.active.length} ${activeLabel}</span>
          ` : nothing}
          ${g.done.length > 0 ? html`
            <span class="stat-pill stat-done">${g.done.length} ${doneLabel}</span>
          ` : nothing}
          ${g.failed.length > 0 ? html`
            <span class="stat-pill stat-failed">${g.failed.length} ${failLabel}</span>
          ` : nothing}
        </div>
        <div class="wf-progress-wrap">
          <div class="wf-progress-bar">
            ${donePct > 0 ? html`<div class="bar-done" style="width:${donePct}%"></div>` : nothing}
            ${failPct > 0 ? html`<div class="bar-failed" style="width:${failPct}%"></div>` : nothing}
          </div>
          <span class="wf-pct">${donePct}%</span>
        </div>
      </div>
    `;
  }

  private _renderSkeletons() {
    return html`
      <div class="wf-list">
        ${[70, 55, 85].map(w => html`
          <div class="wf-row-skeleton">
            <div class="skel skel-badge"></div>
            <div class="skel-body">
              <div class="skel skel-name" style="width:${w}px"></div>
              <div class="skel skel-type"></div>
            </div>
            <div class="skel skel-progress"></div>
          </div>
        `)}
      </div>
    `;
  }
}
