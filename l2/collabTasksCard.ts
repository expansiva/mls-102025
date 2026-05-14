/// <mls fileReference="_102025_/l2/collabTasksCard.ts" enhancement="_102027_/l2/enhancementLit" />

/// **collab_i18n_start**
const message_pt = {
  open: 'Abrir sala da task',
  todo: 'A fazer',
  inProgress: 'Em andamento',
  paused: 'Pausado',
  done: 'Concluído',
  failed: 'Falhou',
};
const message_en = {
  open: 'Open task room',
  todo: 'To do',
  inProgress: 'In progress',
  paused: 'Paused',
  done: 'Done',
  failed: 'Failed',
};
/// **collab_i18n_end**

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import * as msg from '/_102025_/l2/shared/interfaces.js';
import { openElementInServiceDetails } from '/_102027_/l2/libCommom.js';
import { getUserId } from '/_102025_/l2/collabMessagesHelper.js';

function getMsg() {
  return document.documentElement.lang === 'pt' ? message_pt : message_en;
}

type TagColor = 'bug' | 'feature' | 'business' | 'process' | 'neutral';

const TAG_COLOR_MAP: Record<string, TagColor> = {
  bug: 'bug',
  feature: 'feature',
  business: 'business',
  process: 'process',
  empresa: 'business',
  processo: 'process',
};

function tagColor(tag: string, vocab?: msg.TagVocabularyEntry[]): TagColor {
  if (vocab) {
    const entry = vocab.find(e => e.tag === tag);
    if (entry) return entry.color;
  }
  return TAG_COLOR_MAP[tag.toLowerCase()] || 'neutral';
}

function assigneeColorIndex(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (hash + userId.charCodeAt(i)) & 0xff;
  return hash % 5;
}

function assigneeInitials(userId: string): string {
  const parts = userId.split(/[\s._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return userId.slice(0, 2).toUpperCase();
}

const STATUS_EMOJI: Record<string, string> = {
  'todo': '⬜',
  'in progress': '▶️',
  'paused': '⏸️',
  'done': '✅',
  'failed': '❌',
};

const STATUS_CLASS: Record<string, string> = {
  'todo': 'board-status-todo',
  'in progress': 'board-status-in-progress',
  'paused': 'board-status-paused',
  'done': 'board-status-done',
  'failed': 'board-status-failed',
};

@customElement('collab-tasks-card-102025')
export class CollabTasksCard extends StateLitElement {

  @property({ type: Object }) task: msg.TaskData | undefined;
  @property({ type: Array }) tagVocabulary: msg.TagVocabularyEntry[] = [];
  @property({ type: String }) boardStatus: string = '';

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'button');
    this.addEventListener('click', this._onClick.bind(this));
    this.addEventListener('keydown', this._onKeyDown.bind(this));
  }

  updated(changed: Map<string, unknown>) {
    super.updated(changed);
    if (changed.has('boardStatus')) this._applyStatusClass();
  }

  private _applyStatusClass() {
    // Remove any previous status class
    Object.values(STATUS_CLASS).forEach(c => this.classList.remove(c));
    if (this.boardStatus) {
      const cls = STATUS_CLASS[this.boardStatus];
      if (cls) {
        this.classList.add(cls);
        this.classList.add('has-board-status');
      }
    } else {
      this.classList.remove('has-board-status');
    }
  }

  render() {
    const task = this.task;
    if (!task) return nothing;
    const m = getMsg();
    const firstTag = task.tags?.[0];
    const tc = firstTag ? tagColor(firstTag, this.tagVocabulary) : null;
    const pmaId = task.taskRoom?.pmaId;
    const assignees = task.assignees ?? [];
    const visibleAssignees = assignees.slice(0, 3);
    const overflowCount = assignees.length - visibleAssignees.length;
    const statusEmoji = STATUS_EMOJI[task.status] ?? '';
    const statusLabel = (m as any)[task.status === 'in progress' ? 'inProgress' : task.status] ?? task.status;

    return html`
      <div class="card-title">${task.title}</div>
      ${task.description ? html`<div class="card-description">${task.description}</div>` : nothing}
      <div class="card-meta">
        ${firstTag && tc ? html`<span class="badge b-${tc}">${firstTag}</span>` : nothing}
        ${task.priority ? html`<span class="priority-pill priority-${task.priority}">${task.priority}</span>` : nothing}
        ${pmaId ? html`<span class="pma-badge">${pmaId}</span>` : nothing}
      </div>
      <div class="card-footer">
        <div class="assignee-row">
          ${visibleAssignees.map(uid => html`
            <span
              class="assignee-chip assignee-${assigneeColorIndex(uid)}"
              title=${uid}
            >${assigneeInitials(uid)}</span>
          `)}
          ${overflowCount > 0 ? html`<span class="assignee-chip assignee-overflow">+${overflowCount}</span>` : nothing}
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${task.dueDate ? html`<span class="due-pill">📅 ${task.dueDate}</span>` : nothing}
          ${statusEmoji ? html`<span class="status-emoji" title=${statusLabel}>${statusEmoji}</span>` : nothing}
        </div>
      </div>
    `;
  }

  private async _onClick() {
    const task = this.task;
    if (!task) return;
    await import('/_102025_/l2/collabMessagesTaskRoom.js');
    const room = document.createElement('collab-messages-task-room-102025') as HTMLElement & {
      task?: msg.TaskData;
      userId?: string;
    };
    room.task = task;
    room.userId = getUserId() || '';
    openElementInServiceDetails(room);
  }

  private _onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._onClick();
    }
  }
}
