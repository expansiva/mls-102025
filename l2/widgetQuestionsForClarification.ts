/// <mls fileReference="_102025_/l2/widgetQuestionsForClarification.ts" enhancement="_102027_/l2/enhancementLit" /> 

import { html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import { IAgent, IAgentAsync } from '/_102027_/l2/aiAgentBase.js';
import { ClarificationValue } from '/_102027_/l2/aiAgentOrchestration.js';

export class WidgetQuestionsForClarification102025 extends StateLitElement {

  @property({ type: Object }) value: ClarificationValue | null = null;

  @property({ type: Boolean }) readonly = false;

  @property() mode: 'new' | 'old' = 'old';

  // Local state for editing answers
  @state()
  private localAnswers: { [key: string]: string | boolean } = {};

  @state()
  private autoAcceptRemainingSeconds = 0;

  private autoAcceptTimer: number | null = null;
  private autoAcceptTimerKey = '';
  private autoAcceptCancelledFor = '';

  disconnectedCallback() {
    this.clearAutoAcceptTimer();
    super.disconnectedCallback?.();
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (name === 'value') {
      try {
        this.value = JSON.parse(newVal);
      } catch (e) {
        console.log("error on widgetQuestionsForClarification.attributeChangedCallback", e);
        this.value = null;
      }
    }
    super.attributeChangedCallback?.(name, oldVal, newVal);
  }

  updated(changedProps: Map<string, any>) {
    // Initialize answers when value changes
    if (changedProps.has('value') && this.value) {
      const initialAnswers: { [key: string]: string | boolean } = {};
      Object.entries(this.value.questions).forEach(([key, q]) => {
        initialAnswers[key] = q.answer ?? (q.type === 'boolean' ? false : '');
      });
      this.localAnswers = initialAnswers;
    }
    if (changedProps.has('value') || changedProps.has('readonly')) {
      this.syncAutoAcceptTimer();
    }
  }

  // Input change handler for all field types
  private onInputChange(questionId: string, value: string | boolean) {
    this.cancelAutoAccept();
    this.localAnswers = {
      ...this.localAnswers,
      [questionId]: value,
    };
    // Keep 'value' in sync with localAnswers (two-way)
    if (this.value) {
      this.value = {
        ...this.value,
        questions: Object.fromEntries(
          Object.entries(this.value.questions).map(([key, q]) => [
            key,
            { ...q, answer: this.localAnswers[key] ?? q.answer }
          ])
        )
      };
    }
  }

  private onCancel() {
    this.cancelAutoAccept();
    if (this.value && !this.readonly) {

      this.dispatchEvent(
        new CustomEvent('clarification-finish', {
          detail: {
            value: this.value,
            action: 'cancel'
          },
          bubbles: true,
          composed: true
        })
      );
      return;

    }
  }

  private onContinue() {
    this.cancelAutoAccept();
    // Update answers into 'value'
    if (this.value && !this.readonly) {
      this.value = {
        ...this.value,
        questions: Object.fromEntries(
          Object.entries(this.value.questions).map(([key, q]) => [
            key,
            { ...q, answer: this.localAnswers[key] }
          ])
        )
      };

      this.dispatchEvent(
        new CustomEvent('clarification-finish', {
          detail: {
            value: this.value,
            action: 'continue'
          },
          bubbles: true,
          composed: true
        })
      );
      return;
    }
  }

  private syncAutoAcceptTimer() {
    const seconds = this.getAutoAcceptSeconds();
    const key = this.getAutoAcceptKey(seconds);
    if (!this.value || this.readonly || seconds <= 0 || this.autoAcceptCancelledFor === key) {
      this.clearAutoAcceptTimer();
      return;
    }
    if (this.autoAcceptTimer !== null && this.autoAcceptTimerKey === key) return;
    this.clearAutoAcceptTimer();
    this.autoAcceptTimerKey = key;
    this.autoAcceptRemainingSeconds = seconds;
    this.autoAcceptTimer = window.setInterval(() => {
      this.autoAcceptRemainingSeconds = Math.max(0, this.autoAcceptRemainingSeconds - 1);
      if (this.autoAcceptRemainingSeconds === 0) {
        this.clearAutoAcceptTimer();
        this.onContinue();
      }
    }, 1000);
  }

  private cancelAutoAccept() {
    const seconds = this.getAutoAcceptSeconds();
    if (seconds > 0) this.autoAcceptCancelledFor = this.getAutoAcceptKey(seconds);
    this.clearAutoAcceptTimer();
  }

  private clearAutoAcceptTimer() {
    if (this.autoAcceptTimer !== null) {
      window.clearInterval(this.autoAcceptTimer);
      this.autoAcceptTimer = null;
    }
    this.autoAcceptTimerKey = '';
    this.autoAcceptRemainingSeconds = 0;
  }

  private getAutoAcceptSeconds(): number {
    const raw = (this.value as (ClarificationValue & { autoAcceptSeconds?: unknown }) | null)?.autoAcceptSeconds;
    return typeof raw === 'number' && Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
  }

  private getAutoAcceptKey(seconds: number): string {
    return `${this.value?.taskId || ''}:${this.value?.stepId || ''}:${seconds}`;
  }

  private renderAutoAcceptCounter() {
    if (this.autoAcceptRemainingSeconds <= 0) return '';
    const text = this.value?.userLanguage === 'pt-BR'
      ? `Auto-aceitando em ${this.autoAcceptRemainingSeconds}s...`
      : `Auto-accepting in ${this.autoAcceptRemainingSeconds}s...`;
    return html`<div class="auto-accept-counter" role="status">${text}</div>`;
  }

  render() {
    if (!this.value || !this.value.questions || !this.value.legends) return html`<div>No questions available. value is ${typeof this.value}</div>`;

    const isDisabled = this.readonly === true;
    return html`
    <h2 class='title'>${this.value.title}</h2>
    <form
      class="clarification-form"
      @submit=${(e: Event) => e.preventDefault()}
      @click=${() => this.cancelAutoAccept()}
      @focusin=${() => this.cancelAutoAccept()}
      @input=${() => this.cancelAutoAccept()}
      @keydown=${() => this.cancelAutoAccept()}
    >
      ${this.renderAutoAcceptCounter()}
      ${Object.entries(this.value.questions).map(([key, q]) => html`
        <div
          class="clarification-question"
          data-type=${q.type}
        >
          ${q.type === 'boolean' ? html`
            <label style="display: flex; align-items: center; gap: 0.6em;">
              <input
                type="checkbox"
                .checked=${!!this.localAnswers[key]}
                @change=${(e: Event) => this.onInputChange(key, (e.target as HTMLInputElement).checked)}
                style="margin: 0;"
              />
              <span>${q.question}</span>
            </label>
          ` : q.type === 'MoSCoW' ? html`
            <div style="display: flex; align-items: center; gap: 1em;">
              <select
                style="min-width: 110px;"
                .value=${String(this.localAnswers[key] ?? '')}
                @change=${(e: Event) => this.onInputChange(key, (e.target as HTMLSelectElement).value)}
              >
                <option value="">Select...</option>
                <option value="must">Must</option>
                <option value="should">Should</option>
                <option value="could">Could</option>
                <option value="wont">Won't</option>
              </select>
              <span class="moscow-label">${q.question}</span>
            </div>
          ` : q.type === 'range' ? html`
            <label style="display: flex; align-items: center; gap: 1em;">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                .value=${String(this.localAnswers[key] ?? q.answer ?? 50)}
                @input=${(e: Event) => this.onInputChange(key, (e.target as HTMLInputElement).value)}
                style="width: 180px;"
              />
              <span style="min-width: 34px; text-align: right;">
                ${this.localAnswers[key] ?? q.answer ?? 50}
              </span>
              <span style="flex:1;">${q.question}</span>
            </label>
          ` : html`
            <label>${q.question}</label>
            ${q.type === 'open' ? html`
              <textarea
                .value=${String(this.localAnswers[key] ?? '')}
                @input=${(e: Event) => this.onInputChange(key, (e.target as HTMLTextAreaElement).value)}
                rows="2"
              ></textarea>
            ` : q.type === 'select' && q.options ? html`
              <select
                @change=${(e: Event) => this.onInputChange(key, (e.target as HTMLSelectElement).value)}
              >
                <option value="" ?selected=${!this.localAnswers[key]}>Select...</option>
                ${q.options.map(option => html`
                  <option value=${option.id} ?selected=${String(this.localAnswers[key] ?? '') === option.id}>${option.label}</option>
                `)}
              </select>
            ` : null}
          `}
        </div>
      `)} 
      <div class="clarification-actions">
        <button type="button" class="action-btn cancel" @click=${this.onCancel} ?disabled=${isDisabled}>Cancel</button>
        <button type="button" class="action-btn continue" @click=${this.onContinue} ?disabled=${isDisabled}>Continue</button>
      </div>
      ${this.value.legends?.length ? html`
        <div class="clarification-legends" style="margin-top:2em;">
          ${this.value.legends.map(line => html`<div>${line}</div>`)}
        </div>
      ` : ''}
    </form>
  `;
  }
}

if (!customElements.get('widget-questions-for-clarification-102025')) {
  customElements.define('widget-questions-for-clarification-102025', WidgetQuestionsForClarification102025);
}
