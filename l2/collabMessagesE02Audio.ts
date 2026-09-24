/// <mls fileReference="_102025_/l2/collabMessagesE02Audio.ts" enhancement="_102027_/l2/enhancementLit" />

import { html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import { msgGetAttachmentUrl, post } from '/_102025_/l2/shared/api.js';
import { E02AudioPollingSession } from '/_102025_/l2/e02AudioPolling.js';
import { clearE02PrivateCacheOnAccessError } from '/_102025_/l2/e02AudioPrivacy.js';

export const E02_AUDIO_UI_LIMITS = Object.freeze({
  maxFileBytes: 524_288,
  maxDurationSeconds: 60,
  maxCorrectionChars: 12_000,
  maxInterpretationRequestChars: 2_000,
});

export type E02PhaseState = 'not_requested' | 'validated' | 'admitted' | 'sent' | 'uncertain' | 'completed' | 'failed' | 'cancelled' | 'obsolete';
export type E02TranscriptStatus = 'speech' | 'no_speech' | 'unintelligible';

export interface E02AudioReceipt {
  localRequests: 0 | 1;
  providerAttempts: number | null;
  costChargedUsd: number | null;
  resolvedModel: string | null;
  reconciliationPending: boolean;
}

export interface E02TranscriptVersion {
  version: number;
  origin: 'model' | 'human' | 'deterministic';
  detectorVersion?: 'wav-pcm16-zero.v1';
  text: string;
  createdAt: string;
  status?: E02TranscriptStatus;
  uncertainties?: Array<{ excerpt: string; reason: string }>;
}

export interface E02AudioProcessingProjection {
  contractVersion: 'john-audio.v1';
  processingId: string;
  sourceAvailable: boolean;
  transcription: { state: E02PhaseState; receipt: E02AudioReceipt | null; result?: { status: E02TranscriptStatus; text: string; uncertainties: Array<{ excerpt: string; reason: string }>; origin?: 'model' | 'deterministic'; detectorVersion?: 'wav-pcm16-zero.v1' } };
  review: { state: 'not_available' | 'awaiting_review' | 'reviewed'; selectedVersion: number | null; versions: E02TranscriptVersion[] };
  interpretation: {
    state: E02PhaseState; transcriptVersion: number | null; contextVersion: string | null;
    contextSourceIds: string[]; receipt: E02AudioReceipt | null; request?: string;
    result?: { answer: string; inferences: Array<{ statement: string; basis: 'transcript' | 'confirmed_context' | 'both' }> };
  };
  error: { code: string; phase: 'validation' | 'transcription' | 'interpretation'; retryable: boolean } | null;
}

export type E02GetAudioProcessingRequest =
  | { action: 'getAudioProcessing'; userId: string; processingId: string; source?: never }
  | { action: 'getAudioProcessing'; userId: string; source: { threadId: string; messageId: string; attachmentId: string }; processingId?: never };

type ProcessingResponse = { statusCode: number; processing: E02AudioProcessingProjection };
type Copy = typeof copy.en;

const copy = {
  en: {
    loadAudio: 'Load audio', openAudio: 'Open audio', audioPlayer: 'Audio attachment', unavailable: 'Audio source is unavailable.',
    transcribe: 'Transcribe', transcribing: 'Requesting…', limits: 'Transcription accepts MP3/WAV, up to 60 seconds and 512 KiB.',
    uploadNotice: 'An allowed upload is not necessarily eligible for transcription.', tooLarge: 'This file is larger than the transcription limit.',
    formatUnsupported: 'Only MP3 and WAV can be transcribed.', durationTooLong: 'This audio is longer than 60 seconds.', durationUnknown: 'The duration could not be verified in this browser. The server will verify it.',
    original: 'Automatic transcript', localResult: 'Local result', review: 'Human review', interpretation: 'Contextual interpretation', version: 'version', originModel: 'automatic', originHuman: 'human',
    noSpeech: 'No speech detected.', digitalSilence: 'No speech: digital silence detected.', originDeterministic: 'local detector', unintelligible: 'Speech was unintelligible.', uncertain: 'Uncertain passages', correction: 'Correct transcript',
    save: 'Save correction', saving: 'Saving…', conflict: 'A newer version exists. Your edit was kept; review the new version before saving again.',
    interpretationRequest: 'What should John interpret using your confirmed context?', interpret: 'Interpret with my context', interpreting: 'Requesting…',
    reinterpretNotice: 'Saving does not start an interpretation. Reinterpreting does not transcribe the audio again.',
    status: 'Status', refresh: 'Refresh', cancel: 'Cancel', pending: 'pending', running: 'running', awaitingReview: 'awaiting review',
    completed: 'completed', failed: 'failed', cancelled: 'cancelled', obsolete: 'obsolete', costPending: 'cost to reconcile',
    phaseValidation: 'validating source', phaseTranscription: 'transcribing audio', phaseInterpretation: 'interpreting reviewed text',
    usedRevision: 'Transcript revision', usedContext: 'Confirmed context', sources: 'Sources', none: 'none', cost: 'Cost', limitations: 'Pilot limitation',
    limitationText: 'Interpretation is limited to the selected transcript revision and confirmed context. It performs no action and does not update memory.',
    sourceUnavailable: 'The source or access is no longer available. Cached private content was cleared.', genericError: 'Audio processing is unavailable.',
    noProcessing: 'No audio processing is available yet.',
  },
  pt: {
    loadAudio: 'Carregar áudio', openAudio: 'Abrir áudio', audioPlayer: 'Anexo de áudio', unavailable: 'A fonte do áudio não está disponível.',
    transcribe: 'Transcrever', transcribing: 'Solicitando…', limits: 'A transcrição aceita MP3/WAV, até 60 segundos e 512 KiB.',
    uploadNotice: 'Um upload permitido não é necessariamente elegível para transcrição.', tooLarge: 'Este arquivo excede o limite da transcrição.',
    formatUnsupported: 'Somente MP3 e WAV podem ser transcritos.', durationTooLong: 'Este áudio tem mais de 60 segundos.', durationUnknown: 'Não foi possível verificar a duração neste navegador. O servidor fará a validação.',
    original: 'Transcrição automática', localResult: 'Resultado local', review: 'Revisão humana', interpretation: 'Interpretação contextual', version: 'versão', originModel: 'automática', originHuman: 'humana',
    noSpeech: 'Nenhuma fala foi detectada.', digitalSilence: 'Nenhuma fala: silêncio digital detectado.', originDeterministic: 'detector local', unintelligible: 'A fala estava ininteligível.', uncertain: 'Trechos incertos', correction: 'Corrigir transcrição',
    save: 'Salvar correção', saving: 'Salvando…', conflict: 'Existe uma versão mais nova. Sua edição foi mantida; revise a nova versão antes de salvar novamente.',
    interpretationRequest: 'O que John deve interpretar usando seu contexto confirmado?', interpret: 'Interpretar com meu contexto', interpreting: 'Solicitando…',
    reinterpretNotice: 'Salvar não inicia uma interpretação. Reinterpretar não transcreve o áudio novamente.',
    status: 'Estado', refresh: 'Atualizar', cancel: 'Cancelar', pending: 'pendente', running: 'rodando', awaitingReview: 'aguardando revisão',
    completed: 'concluído', failed: 'falha', cancelled: 'cancelado', obsolete: 'obsoleto', costPending: 'custo a conciliar',
    phaseValidation: 'validando fonte', phaseTranscription: 'transcrevendo áudio', phaseInterpretation: 'interpretando texto revisado',
    usedRevision: 'Revisão da transcrição', usedContext: 'Contexto confirmado', sources: 'Fontes', none: 'nenhuma', cost: 'Custo', limitations: 'Limitação do piloto',
    limitationText: 'A interpretação se limita à revisão selecionada e ao contexto confirmado. Ela não executa ações nem atualiza a memória.',
    sourceUnavailable: 'A fonte ou o acesso não está mais disponível. O conteúdo privado em cache foi limpo.', genericError: 'O processamento de áudio não está disponível.',
    noProcessing: 'Ainda não há processamento disponível para este áudio.',
  },
};

let nextAudioControlId = 0;

@customElement('collab-messages-e02-audio-102025')
export class CollabMessagesE02Audio extends StateLitElement {
  private readonly controlId = `e02-audio-${++nextAudioControlId}`;
  @property() userId = '';
  @property() threadId = '';
  @property() messageId = '';
  @property() attachmentId = '';
  @property() fileName = '';
  @property({ type: Number }) sizeBytes = 0;
  @property() contentType = '';
  @property() sessionKey = '';
  @property() processingId = '';
  @property({ attribute: false }) fixture?: E02AudioProcessingProjection;

  @state() private audioUrl = '';
  @state() private durationSeconds: number | null = null;
  @state() private durationInvalid = false;
  @state() private processing?: E02AudioProcessingProjection;
  @state() private busy: 'load' | 'transcribe' | 'correct' | 'interpret' | 'cancel' | '' = '';
  @state() private error = '';
  @state() private feedback = '';
  @state() private noProcessing = false;
  @state() private correctionDraft = '';
  @state() private interpretationRequest = '';
  @state() private selectedVersion: number | null = null;
  @query('textarea.correction-input') private correctionInput?: HTMLTextAreaElement;

  private identity = '';
  private pollingSession?: E02AudioPollingSession;
  private loadGeneration = 0;
  private readGeneration = 0;
  private discovering = false;
  private readonly idempotencyKeys = new Map<string, string>();

  connectedCallback() {
    super.connectedCallback();
    this.identity = this.identityToken();
    if (this.fixture) this.applyProcessing(this.fixture, false);
    else if (this.userId && this.threadId && this.messageId && this.attachmentId) void this.loadProcessing();
  }

  disconnectedCallback() {
    this.clearPrivateState();
    super.disconnectedCallback();
  }

  updated(changed: Map<PropertyKey, unknown>) {
    super.updated(changed);
    if (['userId', 'threadId', 'messageId', 'attachmentId', 'sessionKey'].some(key => changed.has(key))) {
      const next = this.identityToken();
      if (this.identity && next !== this.identity) this.clearPrivateState();
      this.identity = next;
      if (!this.fixture && this.userId && this.threadId && this.messageId && this.attachmentId) void this.loadProcessing();
    }
    if (changed.has('processingId') && !this.fixture && this.processingId && this.processingId !== this.processing?.processingId) void this.loadProcessing();
    if (changed.has('fixture') && this.fixture) this.applyProcessing(this.fixture, false);
  }

  render() {
    const t = this.copy();
    const formatEligible = this.isFormatEligible();
    const sizeEligible = this.sizeBytes > 0 && this.sizeBytes <= E02_AUDIO_UI_LIMITS.maxFileBytes;
    const durationEligible = this.durationSeconds === null || this.durationSeconds <= E02_AUDIO_UI_LIMITS.maxDurationSeconds;
    const canTranscribe = formatEligible && sizeEligible && durationEligible && !this.durationInvalid && this.busy !== 'transcribe';
    return html`<section class="e02-audio" aria-label=${t.audioPlayer}>
      <div class="audio-source">
        <div class="audio-heading"><strong>${this.fileName}</strong><small>${this.formatFileSize(this.sizeBytes)}</small></div>
        ${this.audioUrl ? html`<audio controls preload="metadata" src=${this.audioUrl} @loadedmetadata=${this.onMetadata} @error=${this.onAudioError}></audio>` : html`
          <button class="secondary" @click=${this.loadAudio} ?disabled=${this.busy === 'load'}>${t.loadAudio}</button>`}
        ${this.audioUrl ? html`<button class="link" @click=${this.openAudio}>${t.openAudio}</button>` : nothing}
      </div>
      <div class="transcription-gate">
        <p>${t.limits}</p><p class="notice">${t.uploadNotice}</p>
        ${!formatEligible ? html`<p class="error" role="alert">${t.formatUnsupported}</p>` : nothing}
        ${!sizeEligible ? html`<p class="error" role="alert">${t.tooLarge}</p>` : nothing}
        ${this.durationInvalid ? html`<p class="notice">${t.durationUnknown}</p>` : nothing}
        ${this.durationSeconds !== null && !durationEligible ? html`<p class="error" role="alert">${t.durationTooLong}</p>` : nothing}
        <button class="primary" @click=${this.requestTranscription} ?disabled=${!canTranscribe}>${this.busy === 'transcribe' ? t.transcribing : t.transcribe}</button>
      </div>
      ${this.error ? html`<p class="error" role="alert">${this.error}</p>` : nothing}
      ${this.feedback ? html`<p class="feedback" role="status">${this.feedback}</p>` : nothing}
      ${this.noProcessing ? html`<p class="notice" role="status">${t.noProcessing}</p>` : nothing}
      ${this.processing ? this.renderProcessing(this.processing, t) : nothing}
    </section>`;
  }

  private renderProcessing(p: E02AudioProcessingProjection, t: Copy) {
    if (!p.sourceAvailable) return html`<p class="error" role="alert">${t.sourceUnavailable}</p>`;
    const active = this.isActive(p.transcription.state) || this.isActive(p.interpretation.state);
    const phase = this.isActive(p.interpretation.state) ? t.phaseInterpretation : this.isActive(p.transcription.state) ? t.phaseTranscription : t.phaseValidation;
    return html`<div class="processing">
      <div class="processing-status" role="status" aria-live="polite"><strong>${t.status}:</strong> ${this.statusLabel(p, t)}${active ? html` · ${phase}` : nothing}</div>
      ${this.renderReceipt(p.transcription.receipt, t)}
      ${this.renderTranscript(p, t)}
      ${this.renderInterpretation(p, t)}
      <div class="processing-actions"><button class="secondary" @click=${this.loadProcessing} ?disabled=${!!this.busy}>${t.refresh}</button>${active ? html`<button class="danger" @click=${this.cancelProcessing} ?disabled=${!!this.busy}>${t.cancel}</button>` : nothing}</div>
    </div>`;
  }

  private renderTranscript(p: E02AudioProcessingProjection, t: Copy) {
    const automatic = p.review.versions.find(item => item.origin === 'model' || item.origin === 'deterministic') || (p.transcription.result ? {
      version: 1, origin: p.transcription.result.origin || 'model' as const, detectorVersion: p.transcription.result.detectorVersion,
      text: p.transcription.result.text, createdAt: '', status: p.transcription.result.status, uncertainties: p.transcription.result.uncertainties,
    } : undefined);
    if (!automatic && p.review.state === 'not_available') return nothing;
    const selected = p.review.versions.find(item => item.version === this.selectedVersion) || p.review.versions[p.review.versions.length - 1] || automatic;
    return html`<section class="transcript-panel" aria-labelledby=${`${this.controlId}-transcript`}>
      <h4 id=${`${this.controlId}-transcript`}>${automatic?.origin === 'deterministic' ? t.localResult : t.original}</h4>
      ${automatic ? this.renderTranscriptVersion(automatic, t) : nothing}
      ${p.review.versions.filter(item => item.origin === 'human').length ? html`<h4>${t.review}</h4><div class="version-list">${p.review.versions.filter(item => item.origin === 'human').map(item => html`
        <button class=${item.version === this.selectedVersion ? 'selected' : ''} @click=${() => this.selectVersion(item)} aria-pressed=${item.version === this.selectedVersion ? 'true' : 'false'}>${t.version} ${item.version} · ${t.originHuman}</button>`)}</div>
        ${selected?.origin === 'human' ? this.renderTranscriptVersion(selected, t) : nothing}` : nothing}
      ${selected && (selected.origin === 'deterministic' || selected.status !== 'no_speech' && selected.status !== 'unintelligible') ? html`
        <label for=${`${this.controlId}-correction`}>${t.correction}</label>
        <textarea id=${`${this.controlId}-correction`} class="correction-input" .value=${this.correctionDraft} maxlength=${E02_AUDIO_UI_LIMITS.maxCorrectionChars} @input=${(event: Event) => this.correctionDraft = (event.currentTarget as HTMLTextAreaElement).value}></textarea>
        <button class="primary" @click=${this.saveCorrection} ?disabled=${this.busy === 'correct' || !this.correctionDraft.trim()}>${this.busy === 'correct' ? t.saving : t.save}</button>
      ` : nothing}
      ${selected?.text.trim() ? html`<div class="interpret-request"><p class="notice">${t.reinterpretNotice}</p><label for=${`${this.controlId}-interpretation-request`}>${t.interpretationRequest}</label>
        <textarea id=${`${this.controlId}-interpretation-request`} .value=${this.interpretationRequest} maxlength=${E02_AUDIO_UI_LIMITS.maxInterpretationRequestChars} @input=${(event: Event) => this.interpretationRequest = (event.currentTarget as HTMLTextAreaElement).value}></textarea>
        <button class="primary" @click=${this.requestInterpretation} ?disabled=${this.busy === 'interpret' || !this.interpretationRequest.trim()}>${this.busy === 'interpret' ? t.interpreting : t.interpret}</button></div>` : nothing}
    </section>`;
  }

  private renderTranscriptVersion(version: E02TranscriptVersion, t: Copy) {
    const status = version.status || 'speech';
    return html`<article class="transcript-version"><div class="version-meta">${t.version} ${version.version} · ${version.origin === 'model' ? t.originModel : version.origin === 'deterministic' ? t.originDeterministic : t.originHuman}</div>
      ${status === 'no_speech' ? html`<p>${version.origin === 'deterministic' ? t.digitalSilence : t.noSpeech}</p>` : status === 'unintelligible' ? html`<p>${t.unintelligible}</p>` : html`<p class="transcript-text">${version.text}</p>`}
      ${version.uncertainties?.length ? html`<details><summary>${t.uncertain} (${version.uncertainties.length})</summary><ul>${version.uncertainties.map(item => html`<li><q>${item.excerpt}</q> — ${item.reason}</li>`)}</ul></details>` : nothing}
    </article>`;
  }

  private renderInterpretation(p: E02AudioProcessingProjection, t: Copy) {
    const interpretation = p.interpretation;
    if (!interpretation.result && interpretation.state === 'not_requested') return nothing;
    return html`<section class="interpretation-panel"><h4>${t.interpretation}</h4>
      ${interpretation.result ? html`<p class="interpretation-answer">${interpretation.result.answer}</p><ul>${interpretation.result.inferences.map(item => html`<li>${item.statement} <small>(${item.basis})</small></li>`)}</ul>` : nothing}
      <dl><dt>${t.usedRevision}</dt><dd>${interpretation.transcriptVersion ?? t.none}</dd><dt>${t.usedContext}</dt><dd>${interpretation.contextVersion || t.none}</dd><dt>${t.sources}</dt><dd>${interpretation.contextSourceIds.join(', ') || t.none}</dd><dt>${t.limitations}</dt><dd>${t.limitationText}</dd></dl>
      ${this.renderReceipt(interpretation.receipt, t)}
    </section>`;
  }

  private renderReceipt(receipt: E02AudioReceipt | null, t: Copy) {
    if (!receipt) return nothing;
    const amount = receipt.costChargedUsd === null ? t.costPending : `${receipt.costChargedUsd} USD`;
    return html`<p class="receipt"><strong>${t.cost}:</strong> ${amount}${receipt.reconciliationPending && receipt.costChargedUsd !== null ? ` + ${t.costPending}` : ''}</p>`;
  }

  private async loadAudio() {
    if (!this.userId || !this.threadId || !this.messageId || !this.attachmentId || this.busy) return;
    const generation = ++this.loadGeneration; const identity = this.identityToken(); this.busy = 'load'; this.error = '';
    try {
      const result = await msgGetAttachmentUrl({ userId: this.userId, threadId: this.threadId, messageId: this.messageId, attachmentId: this.attachmentId });
      if (generation !== this.loadGeneration || identity !== this.identityToken()) return;
      if (!result.success || !result.response?.url) {
        const error = new Error(result.error || this.copy().unavailable) as Error & { statusCode?: number };
        error.statusCode = result.statusCode;
        throw error;
      }
      this.audioUrl = result.response.url;
    } catch (error) { if (this.isConnected && generation === this.loadGeneration && identity === this.identityToken() && !this.clearRevokedAccess(error)) this.error = this.safeError(error); }
    finally { if (this.isConnected && generation === this.loadGeneration && identity === this.identityToken()) this.busy = ''; }
  }

  private openAudio = () => { if (this.audioUrl) window.open(this.audioUrl, '_blank', 'noopener,noreferrer'); };
  private onMetadata = (event: Event) => {
    const duration = (event.currentTarget as HTMLAudioElement).duration;
    this.durationInvalid = !Number.isFinite(duration) || duration <= 0;
    this.durationSeconds = this.durationInvalid ? null : duration;
  };
  private onAudioError = () => { this.revokeAudioUrl(); this.error = this.copy().unavailable; };

  private async requestTranscription() {
    if (this.busy || !this.isFormatEligible() || this.sizeBytes <= 0 || this.sizeBytes > E02_AUDIO_UI_LIMITS.maxFileBytes) return;
    await this.perform('transcribe', {
      action: 'requestAudioTranscription', source: { threadId: this.threadId, messageId: this.messageId, attachmentId: this.attachmentId },
      idempotencyKey: this.operationKey('transcription'),
    });
  }

  private async saveCorrection() {
    const p = this.processing; const selected = this.selectedVersion;
    if (!p || selected === null || !this.correctionDraft.trim() || this.busy) return;
    const preservedDraft = this.correctionDraft;
    try {
      await this.perform('correct', { action: 'correctAudioTranscript', processingId: p.processingId, text: preservedDraft, expectedVersion: selected, idempotencyKey: this.operationKey(`correct:${selected}:${preservedDraft}`) });
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode === 409) {
        this.correctionDraft = preservedDraft; this.feedback = this.copy().conflict; await this.loadProcessing(false); await this.updateComplete; this.correctionInput?.focus();
      } else throw error;
    }
  }

  private async requestInterpretation() {
    const p = this.processing; const version = this.selectedVersion;
    if (!p || version === null || !p.review.versions.find(item => item.version === version)?.text.trim() || !this.interpretationRequest.trim() || this.busy) return;
    await this.perform('interpret', { action: 'requestAudioInterpretation', processingId: p.processingId, transcriptVersion: version, request: this.interpretationRequest.trim(), idempotencyKey: this.operationKey(`interpret:${version}:${this.interpretationRequest.trim()}`) });
  }

  private async cancelProcessing() {
    if (!this.processing || this.busy) return;
    await this.perform('cancel', { action: 'cancelAudioProcessing', processingId: this.processing.processingId });
  }

  private async perform(kind: 'transcribe' | 'correct' | 'interpret' | 'cancel', body: Record<string, unknown>) {
    const identity = this.identityToken(); const generation = ++this.readGeneration; this.discovering = false; this.busy = kind; this.error = ''; this.feedback = ''; this.noProcessing = false;
    try {
      const response = await post<ProcessingResponse>({ ...body, userId: this.userId } as never);
      if (!this.isConnected || identity !== this.identityToken() || generation !== this.readGeneration) return;
      this.applyProcessing(response.processing, kind !== 'correct'); this.startPolling(true);
    } catch (error) {
      if (!this.isConnected || identity !== this.identityToken() || generation !== this.readGeneration) return;
      if ((error as { statusCode?: number }).statusCode === 409 && kind === 'correct') throw error;
      if (!this.clearRevokedAccess(error)) this.error = this.safeError(error);
    } finally { if (this.isConnected && identity === this.identityToken() && generation === this.readGeneration) this.busy = ''; }
  }

  private loadProcessing = async (showError = true) => {
    if (this.fixture) { this.applyProcessing(this.fixture, false); return; }
    const id = this.processing?.processingId || this.processingId;
    if (!this.userId || !this.threadId || !this.messageId || !this.attachmentId || this.busy) return;
    const discovery = !id;
    if (discovery && this.discovering) return;
    if (discovery) this.discovering = true;
    const identity = this.identityToken(); const generation = ++this.readGeneration;
    try {
      const request: E02GetAudioProcessingRequest = id
        ? { action: 'getAudioProcessing', userId: this.userId, processingId: id }
        : { action: 'getAudioProcessing', userId: this.userId, source: { threadId: this.threadId, messageId: this.messageId, attachmentId: this.attachmentId } };
      const response = await post<ProcessingResponse>(request as never);
      if (!this.isConnected || identity !== this.identityToken() || generation !== this.readGeneration) return;
      this.noProcessing = false;
      this.applyProcessing(response.processing, false); if (this.hasActivePhase(response.processing)) this.startPolling();
    } catch (error) {
      if (!this.isConnected || identity !== this.identityToken() || generation !== this.readGeneration) return;
      if (discovery && !this.processing && (error as { statusCode?: number }).statusCode === 404) {
        this.noProcessing = true;
      } else if (!this.clearRevokedAccess(error) && showError) this.error = this.safeError(error);
    } finally { if (discovery && generation === this.readGeneration) this.discovering = false; }
  };

  private applyProcessing(processing: E02AudioProcessingProjection, resetDraft: boolean) {
    if (!processing.sourceAvailable) {
      this.clearRevokedAccess({ statusCode: 404 });
      return;
    }
    this.processing = processing; this.processingId = processing.processingId;
    this.noProcessing = false;
    const selected = processing.review.selectedVersion ?? processing.review.versions[processing.review.versions.length - 1]?.version ?? null;
    this.selectedVersion = selected;
    if (resetDraft || !this.correctionDraft) this.correctionDraft = processing.review.versions.find(item => item.version === selected)?.text || processing.transcription.result?.text || '';
  }

  private selectVersion(version: E02TranscriptVersion) { this.selectedVersion = version.version; this.correctionDraft = version.text; }
  private startPolling(reset = false) {
    if (!this.processing || !this.hasActivePhase(this.processing) || this.fixture) { this.stopPolling(); return; }
    if (reset) this.stopPolling();
    if (this.pollingSession?.active) return;
    this.pollingSession = new E02AudioPollingSession(20, 2_000, async () => {
      if (!this.isConnected || !this.processing || !this.hasActivePhase(this.processing)) return false;
      await this.loadProcessing(false);
      return this.isConnected && !!this.processing && this.hasActivePhase(this.processing);
    });
    this.pollingSession.start();
  }
  private stopPolling() { this.pollingSession?.stop(); this.pollingSession = undefined; }
  private hasActivePhase(p: E02AudioProcessingProjection) { return p.sourceAvailable && (this.isActive(p.transcription.state) || this.isActive(p.interpretation.state)); }
  private isActive(state: E02PhaseState) { return ['validated', 'admitted', 'sent'].includes(state); }

  private statusLabel(p: E02AudioProcessingProjection, t: Copy) {
    if (p.transcription.receipt?.reconciliationPending || p.interpretation.receipt?.reconciliationPending || p.transcription.state === 'uncertain' || p.interpretation.state === 'uncertain') return t.costPending;
    const state = p.interpretation.state !== 'not_requested' ? p.interpretation.state : p.transcription.state;
    if (state === 'validated') return t.pending; if (state === 'admitted' || state === 'sent') return t.running;
    if (state === 'completed' && p.review.state === 'awaiting_review') return t.awaitingReview;
    const labels: Partial<Record<E02PhaseState, string>> = { completed: t.completed, failed: t.failed, cancelled: t.cancelled, obsolete: t.obsolete };
    return labels[state] || t.pending;
  }

  private isFormatEligible() { return ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave'].includes(this.contentType.toLowerCase()) || /\.(mp3|wav)$/i.test(this.fileName); }
  private operationKey(scope: string) { const current = this.idempotencyKeys.get(scope); if (current) return current; const key = typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`; this.idempotencyKeys.set(scope, key); return key; }
  private identityToken() { return `${this.sessionKey}|${this.userId}|${this.threadId}|${this.messageId}|${this.attachmentId}`; }
  private copy(): Copy { return (document.documentElement.lang || 'en').toLowerCase().startsWith('pt') ? copy.pt : copy.en; }
  private safeError(error: unknown) { return error instanceof Error && error.message ? error.message : this.copy().genericError; }
  private formatFileSize(bytes: number) { return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KiB`; }
  private revokeAudioUrl() { this.loadGeneration++; this.audioUrl = ''; this.durationSeconds = null; this.durationInvalid = false; }
  private clearRevokedAccess(error: unknown): boolean {
    const result = clearE02PrivateCacheOnAccessError(error, {
      audioUrl: this.audioUrl, processingId: this.processingId, processing: this.processing,
      correctionDraft: this.correctionDraft, interpretationRequest: this.interpretationRequest,
      selectedVersion: this.selectedVersion, feedback: this.feedback,
    });
    if (!result.revoked) return false;
    this.stopPolling(); this.loadGeneration++; this.readGeneration++; this.discovering = false; this.noProcessing = false; this.busy = '';
    this.audioUrl = result.cache.audioUrl; this.processingId = result.cache.processingId;
    this.processing = result.cache.processing; this.correctionDraft = result.cache.correctionDraft;
    this.interpretationRequest = result.cache.interpretationRequest;
    this.selectedVersion = result.cache.selectedVersion; this.feedback = result.cache.feedback;
    this.durationSeconds = null; this.durationInvalid = false; this.idempotencyKeys.clear();
    this.error = this.copy().sourceUnavailable;
    return true;
  }
  private clearPrivateState() { this.readGeneration++; this.discovering = false; this.noProcessing = false; this.busy = ''; this.stopPolling(); this.revokeAudioUrl(); this.processingId = ''; this.processing = undefined; this.error = ''; this.feedback = ''; this.correctionDraft = ''; this.interpretationRequest = ''; this.selectedVersion = null; this.idempotencyKeys.clear(); }
}
