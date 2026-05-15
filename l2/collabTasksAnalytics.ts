/// <mls fileReference="_102025_/l2/collabTasksAnalytics.ts" enhancement="_102027_/l2/enhancementLit" />

/// **collab_i18n_start**
const message_pt = {
  title:         'Analytics',
  subtitle:      'últimos 30 dias',
  reload:        'Recarregar',
  loadError:     'Não consegui carregar.',
  retry:         'Tentar de novo',
  totalActive:   'tarefas ativas',
  completedMonth:'concluídas (30d)',
  workflows:     'workflows em uso',
  highPriority:  'alta prioridade',
  byStatus:      'Por status',
  byPriority:    'Por prioridade',
  topWorkflows:  'Top workflows',
  recentDone:    'Concluídas recentes',
  todo:          'A fazer',
  inProgress:    'Em andamento',
  paused:        'Pausado',
  done:          'Concluído',
  failed:        'Falhou',
  urgent:        'Urgente',
  high:          'Alta',
  normal:        'Normal',
  low:           'Baixa',
  tasks:         'tasks',
  noData:        'Sem dados suficientes.',
  efficiencyPct: 'taxa de sucesso',
};
const message_en = {
  title:         'Analytics',
  subtitle:      'last 30 days',
  reload:        'Reload',
  loadError:     'Could not load.',
  retry:         'Retry',
  totalActive:   'active tasks',
  completedMonth:'completed (30d)',
  workflows:     'workflows in use',
  highPriority:  'high priority',
  byStatus:      'By status',
  byPriority:    'By priority',
  topWorkflows:  'Top workflows',
  recentDone:    'Recently done',
  todo:          'To do',
  inProgress:    'In progress',
  paused:        'Paused',
  done:          'Done',
  failed:        'Failed',
  urgent:        'Urgent',
  high:          'High',
  normal:        'Normal',
  low:           'Low',
  tasks:         'tasks',
  noData:        'Not enough data yet.',
  efficiencyPct: 'success rate',
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

const THIRTY_DAYS = 30 * 24 * 3600 * 1000;

interface Analytics {
  totalActive:    number;
  completedMonth: number;
  workflowCount:  number;
  highPriority:   number;
  efficiencyPct:  number;   // done / (done + failed) * 100
  byStatus:       Record<string, number>;
  byPriority:     Record<string, number>;
  topWorkflows:   { pmaId: string; count: number }[];
}

function compute(active: msg.TaskData[], closed: msg.TaskData[]): Analytics {
  const now = Date.now();
  const thirtyAgo = now - THIRTY_DAYS;

  // Metrics
  const completedMonth = closed.filter(
    t => t.status === 'done' && (t.last_updated ?? 0) >= thirtyAgo
  ).length;

  const allDoneEver   = closed.filter(t => t.status === 'done').length;
  const allFailedEver = closed.filter(t => t.status === 'failed').length;
  const efficiencyPct = (allDoneEver + allFailedEver) > 0
    ? Math.round((allDoneEver / (allDoneEver + allFailedEver)) * 100)
    : 0;

  const allTasks   = [...active, ...closed];
  const pmaIdSet   = new Set(allTasks.map(t => t.taskRoom?.pmaId).filter(Boolean));
  const highPri    = active.filter(t => t.priority === 'high' || t.priority === 'urgent').length;

  // By status (active only)
  const byStatus: Record<string, number> = {};
  for (const t of active) byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;

  // By priority (active only)
  const byPriority: Record<string, number> = {};
  for (const t of active) {
    const p = t.priority ?? 'normal';
    byPriority[p] = (byPriority[p] ?? 0) + 1;
  }

  // Top workflows: count ALL tasks per pmaId
  const pmaCount = new Map<string, number>();
  for (const t of allTasks) {
    if (t.taskRoom?.pmaId) pmaCount.set(t.taskRoom.pmaId, (pmaCount.get(t.taskRoom.pmaId) ?? 0) + 1);
  }
  const topWorkflows = [...pmaCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pmaId, count]) => ({ pmaId, count }));

  return {
    totalActive:    active.length,
    completedMonth,
    workflowCount:  pmaIdSet.size,
    highPriority:   highPri,
    efficiencyPct,
    byStatus,
    byPriority,
    topWorkflows,
  };
}

@customElement('collab-tasks-analytics-102025')
export class CollabTasksAnalytics extends StateLitElement {

  @property({ type: String }) userId = '';

  @state() private analytics: Analytics | null = null;
  @state() private loading = true;
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
      const [activeRes, closedRes] = await Promise.all([
        msgListTasks({ userId: this.userId, view: 'active', pageSize: 200 }),
        msgListTasks({ userId: this.userId, view: 'closed', pageSize: 200 }),
      ]);
      if (!activeRes.success) { this.error = activeRes.error ?? 'error'; this.loading = false; return; }
      this.analytics = compute(
        activeRes.response?.tasks ?? [],
        closedRes.response?.tasks ?? [],
      );
    } catch (err: any) {
      this.error = err?.message ?? 'error';
    }
    this.loading = false;
  }

  render() {
    const m = getMsg();
    return html`
      <div class="an-header">
        <div class="an-header-left">
          <span class="an-title">${m.title}</span>
          <span class="an-sep">·</span>
          <span class="an-sub">${m.subtitle}</span>
        </div>
        <button class="an-icon-btn" title="${m.reload}" @click=${() => this._fetchAll()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </button>
      </div>

      <div class="an-body">
        ${this.error ? html`
          <div class="an-error">
            <span>${m.loadError}</span>
            <button @click=${() => this._fetchAll()}>${m.retry}</button>
          </div>
        ` : nothing}

        ${this.loading
          ? this._renderLoadingTiles()
          : this.analytics
            ? this._renderDashboard(this.analytics, m)
            : nothing
        }
      </div>
    `;
  }

  private _renderDashboard(a: Analytics, m: typeof message_en) {
    const maxStatus   = Math.max(1, ...Object.values(a.byStatus));
    const maxPriority = Math.max(1, ...Object.values(a.byPriority));
    const maxWorkflow = a.topWorkflows[0]?.count ?? 1;

    const statusRows: { key: string; label: string; color: string }[] = [
      { key: 'in progress', label: m.inProgress, color: 'bar-in-progress' },
      { key: 'todo',        label: m.todo,        color: 'bar-todo'        },
      { key: 'paused',      label: m.paused,      color: 'bar-paused'      },
      { key: 'done',        label: m.done,        color: 'bar-done'        },
      { key: 'failed',      label: m.failed,      color: 'bar-failed'      },
    ].filter(r => (a.byStatus[r.key] ?? 0) > 0);

    const priRows: { key: string; label: string; color: string }[] = [
      { key: 'urgent', label: m.urgent, color: 'bar-urgent' },
      { key: 'high',   label: m.high,   color: 'bar-high'   },
      { key: 'normal', label: m.normal, color: 'bar-normal' },
      { key: 'low',    label: m.low,    color: 'bar-low'    },
    ].filter(r => (a.byPriority[r.key] ?? 0) > 0);

    return html`
      <!-- ── Metric tiles ── -->
      <div class="tiles">
        ${this._tile(String(a.totalActive),    m.totalActive,    'tile-blue')}
        ${this._tile(String(a.completedMonth), m.completedMonth, 'tile-green')}
        ${this._tile(String(a.workflowCount),  m.workflows,      'tile-purple')}
        ${this._tile(`${a.efficiencyPct}%`,    m.efficiencyPct,  'tile-neutral')}
      </div>

      <!-- ── Status breakdown ── -->
      ${statusRows.length > 0 ? html`
        <div class="an-card">
          <div class="an-card-title">${m.byStatus}</div>
          ${statusRows.map(r => html`
            <div class="bar-row">
              <div class="bar-label">${r.label}</div>
              <div class="bar-track">
                <div class="bar-fill ${r.color}" style="width:${Math.round((a.byStatus[r.key]??0)/maxStatus*100)}%">
                  <span class="bar-val">${a.byStatus[r.key] ?? 0}</span>
                </div>
              </div>
            </div>
          `)}
        </div>
      ` : nothing}

      <!-- ── Priority breakdown ── -->
      ${priRows.length > 0 ? html`
        <div class="an-card">
          <div class="an-card-title">${m.byPriority}</div>
          ${priRows.map(r => html`
            <div class="bar-row">
              <div class="bar-label">${r.label}</div>
              <div class="bar-track">
                <div class="bar-fill ${r.color}" style="width:${Math.round((a.byPriority[r.key]??0)/maxPriority*100)}%">
                  <span class="bar-val">${a.byPriority[r.key] ?? 0}</span>
                </div>
              </div>
            </div>
          `)}
        </div>
      ` : nothing}

      <!-- ── Top workflows ── -->
      ${a.topWorkflows.length > 0 ? html`
        <div class="an-card">
          <div class="an-card-title">${m.topWorkflows}</div>
          ${a.topWorkflows.map(wf => html`
            <div class="bar-row">
              <div class="bar-label wf-label">${wf.pmaId}</div>
              <div class="bar-track">
                <div class="bar-fill bar-wf" style="width:${Math.round(wf.count/maxWorkflow*100)}%">
                  <span class="bar-val">${wf.count} ${m.tasks}</span>
                </div>
              </div>
            </div>
          `)}
        </div>
      ` : nothing}
    `;
  }

  private _tile(value: string, label: string, cls: string) {
    return html`
      <div class="tile ${cls}">
        <div class="tile-value">${value}</div>
        <div class="tile-label">${label}</div>
      </div>
    `;
  }

  private _renderLoadingTiles() {
    return html`
      <div class="tiles">
        ${[0,1,2,3].map(() => html`
          <div class="tile tile-skeleton">
            <div class="skel skel-val"></div>
            <div class="skel skel-lbl"></div>
          </div>
        `)}
      </div>
      <div class="an-card">
        ${[80,60,40,70].map(w => html`
          <div class="bar-row">
            <div class="skel" style="width:72px;height:11px;border-radius:3px"></div>
            <div class="bar-track"><div class="skel" style="width:${w}%;height:100%;border-radius:4px"></div></div>
          </div>
        `)}
      </div>
    `;
  }
}
