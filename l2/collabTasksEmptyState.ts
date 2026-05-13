/// <mls fileReference="_102025_/l2/collabTasksEmptyState.ts" enhancement="_102027_/l2/enhancementLit" />

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';

@customElement('collab-tasks-empty-state-102025')
export class CollabTasksEmptyState extends StateLitElement {

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

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
