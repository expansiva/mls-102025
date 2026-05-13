/// <mls fileReference="_102025_/l2/collabTasksEmptyState.ts" enhancement="_102027_/l2/enhancementLit" />

import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';

@customElement('collab-tasks-empty-state-102025')
export class CollabTasksEmptyState extends StateLitElement {

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 200px;
      padding: 40px 20px;
      text-align: center;
      color: var(--color-text-secondary, #9ca3af);
    }
    .icon {
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.4;
    }
    .title {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-primary, #374151);
      margin-bottom: 6px;
    }
    .subtitle {
      font-size: 13px;
      color: var(--color-text-secondary, #9ca3af);
      max-width: 300px;
    }
    ::slotted(*) { margin-top: 16px; }
  `;

  render() {
    return html`
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"></rect>
        <rect x="14" y="3" width="7" height="7" rx="1"></rect>
        <rect x="3" y="14" width="7" height="7" rx="1"></rect>
        <rect x="14" y="14" width="7" height="7" rx="1"></rect>
      </svg>
      ${this.title ? html`<div class="title">${this.title}</div>` : ''}
      ${this.subtitle ? html`<div class="subtitle">${this.subtitle}</div>` : ''}
      <slot></slot>
    `;
  }
}
