/// <mls fileReference="_102025_/l2/collabTasksCard.ts" enhancement="_102027_/l2/enhancementLit" />

/// **collab_i18n_start**
const message_pt = { open: 'Abrir sala da task' };
const message_en = { open: 'Open task room' };
/// **collab_i18n_end**

import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import * as msg from '/_102025_/l2/shared/interfaces.js';
import { dispatchThreadOpen } from '/_102025_/l2/collabMessagesEvents.js';

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

@customElement('collab-tasks-card-102025')
export class CollabTasksCard extends StateLitElement {

  @property({ type: Object }) task: msg.TaskData | undefined;
  @property({ type: Array }) tagVocabulary: msg.TagVocabularyEntry[] = [];

  static styles = css`
    :host {
      display: block;
      background: var(--color-background-primary, #fff);
      border: 1px solid var(--color-border, #e5e7eb);
      border-radius: 8px;
      padding: 10px 12px;
      cursor: pointer;
      transition: box-shadow 0.15s, border-color 0.15s;
      margin-bottom: 8px;
    }
    :host(:hover) {
      border-color: var(--color-accent, #6366f1);
      box-shadow: 0 2px 8px rgba(99,102,241,0.12);
    }
    .card-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-primary, #111);
      margin-bottom: 6px;
      line-height: 1.4;
    }
    .card-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }
    .badge {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 9999px;
      letter-spacing: 0.02em;
    }
    .b-bug    { background: #fee2e2; color: #991b1b; }
    .b-feature { background: #dbeafe; color: #1e40af; }
    .b-business { background: #fef3c7; color: #92400e; }
    .b-process { background: #d1fae5; color: #065f46; }
    .b-neutral { background: var(--color-background-secondary, #f3f4f6); color: var(--color-text-secondary, #6b7280); }
    .priority-pill {
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 4px;
      background: var(--color-background-secondary, #f3f4f6);
      color: var(--color-text-secondary, #6b7280);
    }
    .priority-high, .priority-urgent { background: #fef3c7; color: #b45309; }
    .due-pill {
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 4px;
      background: var(--color-background-secondary, #f3f4f6);
      color: var(--color-text-secondary, #6b7280);
    }
    .pma-badge {
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 4px;
      background: var(--color-background-secondary, #ede9fe);
      color: var(--color-accent, #6366f1);
    }
  `;

  render() {
    const task = this.task;
    if (!task) return nothing;
    const firstTag = task.tags?.[0];
    const tc = firstTag ? tagColor(firstTag, this.tagVocabulary) : null;
    const pmaId = task.taskRoom?.pmaId;

    return html`
      <div class="card-title">${task.title}</div>
      <div class="card-meta">
        ${firstTag && tc ? html`<span class="badge b-${tc}">${firstTag}</span>` : nothing}
        ${task.priority ? html`<span class="priority-pill priority-${task.priority}">${task.priority}</span>` : nothing}
        ${task.dueDate ? html`<span class="due-pill">📅 ${task.dueDate}</span>` : nothing}
        ${pmaId ? html`<span class="pma-badge">${pmaId}</span>` : nothing}
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this._onClick.bind(this));
  }

  private _onClick() {
    const task = this.task;
    if (!task?.taskRoom?.threadId) return;
    dispatchThreadOpen(task.taskRoom.threadId, task.PK);
  }
}
