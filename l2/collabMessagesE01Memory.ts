/// <mls fileReference="_102025_/l2/collabMessagesE01Memory.ts" enhancement="_102027_/l2/enhancementLit" />

import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { post } from '/_102025_/l2/shared/api.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';

type Section = 'identity_hints' | 'communication_style' | 'work_rhythm' | 'decision_style' | 'authority_hints' | 'learned_preferences';
type Source = { kind: 'message' | 'memory_section' | 'confirmation'; ref: string };
type MemoryRecord = { version: number; status?: string; confirmation?: { at: string }; sectionSources?: Partial<Record<Section, Source[]>> };
type Snapshot = { record: MemoryRecord; sections: Record<Section, string> };
type Proposal = { proposalId: string; baseVersion: number; updates: Partial<Record<Section, string>>; sources: Partial<Record<Section, Source[]>>; reason: string };
type View = { current: Snapshot | null; reviewCurrent: Snapshot | null; proposals: Proposal[] };
type Response = { statusCode: number; msg?: string; memory: View };

const sectionOrder: Section[] = ['identity_hints', 'communication_style', 'work_rhythm', 'decision_style', 'authority_hints', 'learned_preferences'];
const text = {
  en: {
    title: 'My memory', loading: 'Loading your private memory…', empty: 'No confirmed memory yet.', legacy: 'Earlier memory is waiting for your review and is not sent to John.',
    noAccess: 'This memory is available only in your protected private conversation with John.', error: 'Could not load your memory.', retry: 'Try again',
    proposals: 'Pending proposals', approve: 'Approve', reject: 'Reject', before: 'Before', after: 'Proposed', version: 'Version', sources: 'Sources',
    correction: 'Correct', save: 'Save correction', invalidate: 'Invalidate', invalidateAll: 'Invalidate all memory', cancel: 'Cancel',
    conflict: 'Your memory changed elsewhere. The latest version was loaded; review it before trying again.', saved: 'Memory updated.', rejected: 'Proposal rejected.',
    identity_hints: 'Identity hints', communication_style: 'Communication style', work_rhythm: 'Work rhythm', decision_style: 'Decision style', authority_hints: 'Authority hints', learned_preferences: 'Learned preferences',
  },
  pt: {
    title: 'Minha memória', loading: 'Carregando sua memória privada…', empty: 'Ainda não há memória confirmada.', legacy: 'Uma memória anterior aguarda sua revisão e não é enviada ao John.',
    noAccess: 'Esta memória só está disponível na sua conversa privada protegida com John.', error: 'Não foi possível carregar sua memória.', retry: 'Tentar novamente',
    proposals: 'Propostas pendentes', approve: 'Aprovar', reject: 'Rejeitar', before: 'Antes', after: 'Proposto', version: 'Versão', sources: 'Fontes',
    correction: 'Corrigir', save: 'Salvar correção', invalidate: 'Invalidar', invalidateAll: 'Invalidar toda a memória', cancel: 'Cancelar',
    conflict: 'Sua memória mudou em outro lugar. A versão mais recente foi carregada; revise antes de tentar novamente.', saved: 'Memória atualizada.', rejected: 'Proposta rejeitada.',
    identity_hints: 'Pistas de identidade', communication_style: 'Estilo de comunicação', work_rhythm: 'Ritmo de trabalho', decision_style: 'Estilo de decisão', authority_hints: 'Pistas de autoridade', learned_preferences: 'Preferências aprendidas',
  },
};

@customElement('collab-messages-e01-memory-102025')
export class CollabMessagesE01Memory extends StateLitElement {
  @property() userId = '';
  @property() threadId = '';
  @property() sessionKey = '';
  @state() private view?: View;
  @state() private phase: 'loading' | 'ready' | 'forbidden' | 'error' = 'loading';
  @state() private busy = '';
  @state() private notice = '';
  @state() private editing?: Section;
  @state() private editValue = '';
  private identity = '';
  private operationKeys = new Map<string, string>();

  connectedCallback() { super.connectedCallback(); void this.reload(); }

  updated(changed: Map<PropertyKey, unknown>) {
    super.updated(changed);
    if (changed.has('userId') || changed.has('threadId') || changed.has('sessionKey')) {
      const next = this.identityToken();
      if (next !== this.identity) { this.clearPrivateState(); void this.reload(); }
    }
  }

  render() {
    const t = this.copy();
    if (this.phase === 'loading') return html`<section class="e01-memory-state" role="status">${t.loading}</section>`;
    if (this.phase === 'forbidden') return html`<section class="e01-memory-state error" role="alert">${t.noAccess}</section>`;
    if (this.phase === 'error') return html`<section class="e01-memory-state error" role="alert">${t.error}<button @click=${this.reload}>${t.retry}</button></section>`;
    const current = this.view?.current;
    const legacy = !current && this.view?.reviewCurrent;
    return html`<section class="e01-memory-panel" aria-label=${t.title}>
      ${this.notice ? html`<div class="e01-memory-notice" role="status" tabindex="-1">${this.notice}</div>` : nothing}
      ${legacy ? this.renderLegacy(legacy, t) : nothing}
      ${!current ? html`<p class="e01-memory-empty">${t.empty}</p>` : html`
        <div class="e01-memory-version">${t.version} ${current.record.version}</div>
        ${sectionOrder.map(section => this.renderSection(section, current, t))}
        <button class="danger" ?disabled=${!!this.busy} @click=${() => this.invalidate('all')}>${t.invalidateAll}</button>
      `}
      ${this.renderProposals(t)}
    </section>`;
  }

  private renderLegacy(legacy: Snapshot, t: typeof text.en) {
    return html`<section class="e01-memory-legacy" aria-label=${t.legacy}>
      <div role="status">${t.legacy}</div>
      <div class="e01-memory-version">${t.version} ${legacy.record.version}</div>
      ${sectionOrder.map(section => {
        const content = legacy.sections[section]?.trim();
        return content ? html`<article class="e01-memory-section legacy"><h3>${t[section]}</h3><pre>${content}</pre>${this.renderSources(legacy.record.sectionSources?.[section] || [], t)}</article>` : nothing;
      })}
    </section>`;
  }

  private renderSection(section: Section, current: Snapshot, t: typeof text.en) {
    const content = current.sections[section]?.trim();
    if (!content) return nothing;
    const editing = this.editing === section;
    return html`<article class="e01-memory-section">
      <h3>${t[section]}</h3>
      ${editing ? html`
        <textarea data-section=${section} aria-label="${t.correction}: ${t[section]}" .value=${this.editValue} @input=${(e: Event) => this.editValue = (e.target as HTMLTextAreaElement).value}></textarea>
        <div class="e01-memory-actions"><button ?disabled=${!!this.busy || !this.editValue.trim()} @click=${() => this.correct(section)}>${t.save}</button><button @click=${() => this.stopEditing(section)}>${t.cancel}</button></div>
      ` : html`<pre>${content}</pre><div class="e01-memory-actions"><button class="e01-memory-correct" data-section=${section} aria-label="${t.correction}: ${t[section]}" @click=${() => this.startEditing(section, content)}>${t.correction}</button><button class="danger" ?disabled=${!!this.busy} @click=${() => this.invalidate(section)}>${t.invalidate}</button></div>`}
      ${this.renderSources(current.record.sectionSources?.[section] || [], t)}
    </article>`;
  }

  private renderProposals(t: typeof text.en) {
    const proposals = this.view?.proposals || [];
    if (!proposals.length) return nothing;
    const base = this.view?.current?.sections || this.view?.reviewCurrent?.sections;
    return html`<section class="e01-memory-proposals"><h2>${t.proposals}</h2>${proposals.map(proposal => html`
      <article class="e01-memory-proposal">
        <p>${proposal.reason}</p>
        ${Object.entries(proposal.updates).map(([name, after]) => html`<div class="e01-memory-diff"><strong>${t[name as Section]}</strong><div><small>${t.before}</small><pre>${base?.[name as Section] || '—'}</pre></div><div><small>${t.after}</small><pre>${after || '—'}</pre></div></div>`)}
        ${this.renderSources(Object.values(proposal.sources).flat(), t)}
        <div class="e01-memory-actions"><button ?disabled=${!!this.busy} @click=${() => this.decide(proposal, 'confirm')}>${t.approve}</button><button ?disabled=${!!this.busy} @click=${() => this.decide(proposal, 'reject')}>${t.reject}</button></div>
      </article>`)}</section>`;
  }

  private renderSources(sources: Source[], t: typeof text.en) {
    if (!sources.length) return nothing;
    return html`<div class="e01-memory-sources"><small>${t.sources}</small>${sources.map(source => source.kind === 'message'
      ? html`<button @click=${() => this.openSource(source.ref)}>${source.ref.split('/').pop()}</button>`
      : html`<span>${source.kind}: ${source.ref}</span>`)}</div>`;
  }

  private reload = async () => {
    if (!this.userId || !this.threadId) return;
    const identity = this.identityToken();
    this.identity = identity;
    this.view = undefined; this.phase = 'loading'; this.notice = '';
    try {
      const response = await post<Response>({ action: 'getUserMemory', userId: this.userId, threadId: this.threadId } as any);
      if (identity !== this.identityToken()) return;
      this.view = response.memory; this.phase = 'ready';
    } catch (error) {
      if (identity !== this.identityToken()) return;
      this.view = undefined;
      this.phase = (error as { statusCode?: number }).statusCode === 403 ? 'forbidden' : 'error';
    }
  };

  private async decide(proposal: Proposal, decision: 'confirm' | 'reject') {
    await this.mutate(`proposal:${proposal.proposalId}:${decision}`, {
      action: 'decideUserMemoryProposal', userId: this.userId, threadId: this.threadId, proposalId: proposal.proposalId,
      decision, expectedVersion: proposal.baseVersion,
    }, decision === 'reject' ? this.copy().rejected : this.copy().saved);
  }

  private async correct(section: Section) {
    const identity = this.identityToken();
    const version = this.view?.current?.record.version;
    if (version === undefined || !this.editValue.trim()) return;
    const saved = await this.mutate(`correct:${section}:${version}`, { action: 'correctUserMemory', userId: this.userId, threadId: this.threadId, section, content: this.editValue.trim(), expectedVersion: version }, this.copy().saved);
    if (saved && identity === this.identityToken()) await this.stopEditing(section);
  }

  private async invalidate(section: Section | 'all') {
    const version = this.view?.current?.record.version;
    if (version === undefined) return;
    await this.mutate(`invalidate:${section}:${version}`, { action: 'invalidateUserMemory', userId: this.userId, threadId: this.threadId, section, expectedVersion: version }, this.copy().saved);
  }

  private async mutate(key: string, request: Record<string, unknown>, success: string): Promise<boolean> {
    if (this.busy) return false;
    const identity = this.identityToken();
    const idempotencyKey = this.operationKeys.get(key) || this.newKey();
    this.operationKeys.set(key, idempotencyKey); this.busy = key; this.notice = '';
    try {
      await post({ ...request, idempotencyKey } as any);
      if (identity !== this.identityToken()) return false;
      this.operationKeys.delete(key); await this.reload();
      if (identity !== this.identityToken()) return false;
      this.notice = success;
      return true;
    } catch (error) {
      if (identity !== this.identityToken()) return false;
      if ((error as { statusCode?: number }).statusCode === 409) {
        this.operationKeys.delete(key); await this.reload();
        if (identity !== this.identityToken()) return false;
        this.notice = this.copy().conflict;
        await this.updateComplete;
        (this.querySelector('.e01-memory-notice') as HTMLElement | null)?.focus();
      } else this.notice = (error as Error).message || this.copy().error;
      return false;
    } finally { if (identity === this.identityToken()) this.busy = ''; }
  }

  private async openSource(ref: string) {
    const identity = this.identityToken();
    try {
      await post<Response>({ action: 'getUserMemory', userId: this.userId, threadId: this.threadId, openSourceMessageId: ref } as any);
      if (identity !== this.identityToken()) return;
      this.dispatchEvent(new CustomEvent('e01-open-source', { detail: { messageId: ref }, bubbles: true, composed: true }));
    } catch { if (identity === this.identityToken()) this.notice = this.copy().noAccess; }
  }

  private async startEditing(section: Section, value: string) {
    this.editing = section; this.editValue = value;
    await this.updateComplete;
    (this.querySelector(`textarea[data-section="${section}"]`) as HTMLTextAreaElement | null)?.focus();
  }
  private async stopEditing(section?: Section) {
    this.editing = undefined; this.editValue = '';
    await this.updateComplete;
    if (section) (this.querySelector(`button.e01-memory-correct[data-section="${section}"]`) as HTMLButtonElement | null)?.focus();
  }
  private clearPrivateState() { this.identity = ''; this.view = undefined; this.phase = 'loading'; this.busy = ''; this.notice = ''; this.editing = undefined; this.editValue = ''; this.operationKeys.clear(); }
  private identityToken() { return `${this.sessionKey}|${this.userId}|${this.threadId}`; }
  private newKey() { return `e01-ui-${crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`}`; }
  private copy(): typeof text.en { const lang = (document.documentElement.lang || 'en').toLowerCase(); return lang.startsWith('pt') ? text.pt : text.en; }
}
