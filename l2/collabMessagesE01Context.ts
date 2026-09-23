/// <mls fileReference="_102025_/l2/collabMessagesE01Context.ts" enhancement="_102027_/l2/enhancementLit" />

import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { post } from '/_102025_/l2/shared/api.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';

type Source = { kind: string; ref: string };
type Context = {
  promptVersion: string; templateVersion: string;
  memory: { status: 'included' | 'absent'; version: number | null; language: string; sectionsIncluded: string[]; sources: Source[] };
  historyIds: string[]; sources: Source[]; omissions: Array<{ kind: string; id: string; reason: string }>;
  bytes: { envelope: number }; hashAlgorithm: string; hash: string;
};
type Execution = {
  executionId: string; sourceMessageId?: string; status: 'admitted' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  attempts: number; localRequests?: number; providerAttempts?: number | null; executionMode?: 'bounded' | 'legacy-supervised-pilot'; terminalReason?: string; cost: { amount: number | null; currency: string; reconciliationPending: boolean };
  limits: { maxOutputTokens: number; deadlineMs: number; maxCost?: { amount: number; currency: string } };
  pilot?: { mode: 'legacy-supervised-pilot'; pilotId: string; expiresAt: string; operationalBudgetUsd: number; localRequestLimit: number; localRequests: number; providerAttempts: number | null; observedSpendUsd: number | null; reconciliationPending: boolean };
  delivery?: { status: string; error?: string }; context?: Context;
};
type Response = { statusCode: number; execution: Execution };

const text = {
  en: { open: 'Context sent', close: 'Hide context', openExecution: 'Execution status', closeExecution: 'Hide execution', loading: 'Loading execution context…', unavailable: 'Context is unavailable.', sourceUnavailable: 'That source is no longer available.', refresh: 'Refresh', cancel: 'Cancel execution', status: 'Status', reason: 'Interruption reason', cost: 'Observed cost', pendingCost: 'to be determined', memory: 'Memory', version: 'version', promptVersion: 'Prompt version', templateVersion: 'Context template', none: 'none', sections: 'Sections', history: 'History window', omissions: 'Omissions', sources: 'Sources', limits: 'Limits', bytes: 'Envelope bytes', disclosure: 'This shows the context sent to the model, not its internal reasoning.', pilot: 'Supervised pilot', requests: 'Local requests / provider attempts' },
  pt: { open: 'Contexto enviado', close: 'Ocultar contexto', openExecution: 'Status da execução', closeExecution: 'Ocultar execução', loading: 'Carregando contexto da execução…', unavailable: 'O contexto não está disponível.', sourceUnavailable: 'Essa fonte não está mais disponível.', refresh: 'Atualizar', cancel: 'Cancelar execução', status: 'Status', reason: 'Motivo da interrupção', cost: 'Custo observado', pendingCost: 'a apurar', memory: 'Memória', version: 'versão', promptVersion: 'Versão do prompt', templateVersion: 'Template de contexto', none: 'nenhuma', sections: 'Seções', history: 'Janela de histórico', omissions: 'Omissões', sources: 'Fontes', limits: 'Limites', bytes: 'Bytes do envelope', disclosure: 'Isto mostra o contexto enviado ao modelo, não seu raciocínio interno.', pilot: 'Piloto supervisionado', requests: 'Requisições locais / tentativas do provider' },
};

@customElement('collab-messages-e01-context-102025')
export class CollabMessagesE01Context extends StateLitElement {
  @property() userId = '';
  @property() threadId = '';
  @property() sourceMessageId = '';
  @property() sessionKey = '';
  @property() variant: 'source' | 'response' = 'response';
  @state() private open = false;
  @state() private phase: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
  @state() private execution?: Execution;
  @state() private error = '';
  @state() private feedback = '';
  private identity = '';

  updated(changed: Map<PropertyKey, unknown>) {
    super.updated(changed);
    if (changed.has('userId') || changed.has('threadId') || changed.has('sourceMessageId') || changed.has('sessionKey') || changed.has('variant')) {
      const next = this.identityToken();
      if (this.identity && next !== this.identity) this.clearPrivateState();
      this.identity = next;
    }
  }

  render() {
    const t = this.copy();
    const openLabel = this.variant === 'source' ? t.openExecution : t.open;
    const closeLabel = this.variant === 'source' ? t.closeExecution : t.close;
    return html`<div class="e01-context-control">
      <button class="e01-context-toggle" aria-expanded=${this.open ? 'true' : 'false'} @click=${this.toggle}>${this.open ? closeLabel : openLabel}</button>
      ${this.open ? this.renderPanel(t) : nothing}
    </div>`;
  }

  private renderPanel(t: typeof text.en) {
    if (this.phase === 'loading') return html`<div class="e01-context-panel" role="status">${t.loading}</div>`;
    if (this.phase === 'error' || !this.execution) return html`<div class="e01-context-panel error" role="alert">${this.error || t.unavailable}<button @click=${this.load}>${t.refresh}</button></div>`;
    const e = this.execution; const c = e.context; const active = ['admitted', 'queued', 'running'].includes(e.status);
    const pilotCost = e.pilot
      ? `${e.pilot.observedSpendUsd === null ? t.pendingCost : `${e.pilot.observedSpendUsd} USD`}${e.pilot.reconciliationPending && e.pilot.observedSpendUsd !== null ? ` + ${t.pendingCost}` : ''}`
      : null;
    return html`<section class="e01-context-panel" aria-label=${this.variant === 'source' ? t.openExecution : t.open}>
      ${this.variant === 'response' ? html`<p class="e01-context-disclosure">${t.disclosure}</p>` : nothing}
      ${this.feedback ? html`<p class="e01-context-feedback" role="status">${this.feedback}</p>` : nothing}
      <dl><dt>${t.status}</dt><dd class="status ${e.status}">${this.statusLabel(e.status)}</dd>
        ${e.terminalReason ? html`<dt>${t.reason}</dt><dd>${this.reasonLabel(e.terminalReason)}</dd>` : nothing}
        <dt>${t.cost}</dt><dd>${pilotCost ?? (e.cost.amount === null ? t.pendingCost : `${e.cost.amount} ${e.cost.currency}`)}</dd>
        ${e.pilot ? html`<dt>${t.pilot}</dt><dd>${e.pilot.pilotId} · ${e.pilot.operationalBudgetUsd} USD</dd><dt>${t.requests}</dt><dd>${e.pilot.localRequests}/${e.pilot.localRequestLimit} · ${e.pilot.providerAttempts ?? t.pendingCost}</dd>` : nothing}
        <dt>${t.limits}</dt><dd>${e.limits.maxOutputTokens} tokens · ${Math.round(e.limits.deadlineMs / 1000)}s${e.limits.maxCost ? ` · ${e.limits.maxCost.amount} ${e.limits.maxCost.currency}` : ''}</dd>
      </dl>
      ${this.variant === 'response' && c ? html`
        <dl><dt>${t.promptVersion}</dt><dd>${c.promptVersion}</dd><dt>${t.templateVersion}</dt><dd>${c.templateVersion}</dd><dt>${t.memory}</dt><dd>${c.memory.status === 'included' ? `${t.version} ${c.memory.version}` : t.none}</dd><dt>${t.sections}</dt><dd>${c.memory.sectionsIncluded.join(', ') || t.none}</dd><dt>${t.history}</dt><dd>${c.historyIds.length}</dd><dt>${t.bytes}</dt><dd>${c.bytes.envelope}</dd></dl>
        ${this.renderSources(c.sources, t)}
        ${c.omissions.length ? html`<details><summary>${t.omissions} (${c.omissions.length})</summary><ul>${c.omissions.map(item => html`<li>${item.kind}: ${item.id} — ${item.reason}</li>`)}</ul></details>` : nothing}
      ` : nothing}
      <div class="e01-context-actions"><button @click=${this.load}>${t.refresh}</button>${active ? html`<button class="danger" @click=${this.cancel}>${t.cancel}</button>` : nothing}</div>
    </section>`;
  }

  private renderSources(sources: Source[], t: typeof text.en) {
    if (!sources.length) return nothing;
    return html`<div class="e01-context-sources"><strong>${t.sources}</strong>${sources.map(source => source.kind === 'message'
      ? html`<button @click=${() => this.openSource(source.ref)}>${source.ref.split('/').pop()}</button>`
      : html`<span>${source.kind}: ${source.ref}</span>`)}</div>`;
  }

  private toggle = () => { this.open = !this.open; if (this.open && this.phase === 'idle') void this.load(); };
  private load = async () => {
    const identity = this.identityToken();
    if (!this.userId || !this.threadId || !this.sourceMessageId) return;
    this.phase = 'loading'; this.error = ''; this.feedback = '';
    try {
      const response = await post<Response>({ action: 'getE01Execution', userId: this.userId, threadId: this.threadId, sourceMessageId: this.sourceMessageId } as any);
      if (identity !== this.identityToken()) return;
      this.execution = response.execution; this.phase = 'ready';
    } catch (error) { if (identity === this.identityToken()) { this.phase = 'error'; this.error = (error as Error).message || this.copy().unavailable; } }
  };

  private async cancel() {
    if (!this.execution || ['completed', 'failed', 'cancelled'].includes(this.execution.status)) return;
    const identity = this.identityToken();
    const executionId = this.execution.executionId;
    try {
      const response = await post<Response>({ action: 'cancelE01Execution', userId: this.userId, threadId: this.threadId, executionId } as any);
      if (identity !== this.identityToken()) return;
      this.execution = { ...response.execution, context: this.execution.context }; this.phase = 'ready';
    } catch (error) { if (identity === this.identityToken()) { this.phase = 'error'; this.error = (error as Error).message || this.copy().unavailable; } }
  }

  private async openSource(ref: string) {
    const identity = this.identityToken();
    try {
      await post<Response>({ action: 'getE01Execution', userId: this.userId, threadId: this.threadId, sourceMessageId: this.sourceMessageId, openSourceMessageId: ref } as any);
      if (identity !== this.identityToken()) return;
      this.dispatchEvent(new CustomEvent('e01-open-source', { detail: { messageId: ref }, bubbles: true, composed: true }));
    } catch { if (identity === this.identityToken()) this.feedback = this.copy().sourceUnavailable; }
  }

  private statusLabel(status: Execution['status']): string {
    const pt = (document.documentElement.lang || 'en').toLowerCase().startsWith('pt');
    const labels: Record<Execution['status'], [string, string]> = { admitted: ['admitted', 'admitida'], queued: ['queued', 'na fila'], running: ['running', 'em execução'], completed: ['completed', 'concluída'], failed: ['failed', 'falhou'], cancelled: ['cancelled', 'cancelada'] };
    return labels[status]?.[pt ? 1 : 0] || status;
  }

  private reasonLabel(reason: string): string {
    const pt = (document.documentElement.lang || 'en').toLowerCase().startsWith('pt');
    const labels: Record<string, [string, string]> = { cancelled: ['cancelled', 'cancelada'], timeout: ['time limit reached', 'tempo limite atingido'], budget_exceeded: ['limit unavailable or exceeded', 'limite indisponível ou excedido'], provider_error: ['provider error', 'erro do provedor'], context_changed: ['context changed', 'contexto alterado'], context_missing: ['context unavailable', 'contexto indisponível'], outcome_unknown: ['outcome unknown', 'resultado desconhecido'] };
    return labels[reason]?.[pt ? 1 : 0] || reason;
  }

  private clearPrivateState() { this.open = false; this.phase = 'idle'; this.execution = undefined; this.error = ''; this.feedback = ''; }
  private identityToken() { return `${this.sessionKey}|${this.userId}|${this.threadId}|${this.sourceMessageId}|${this.variant}`; }
  private copy(): typeof text.en { return (document.documentElement.lang || 'en').toLowerCase().startsWith('pt') ? text.pt : text.en; }
}
