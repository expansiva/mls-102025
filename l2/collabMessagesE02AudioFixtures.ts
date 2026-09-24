/// <mls fileReference="_102025_/l2/collabMessagesE02AudioFixtures.ts" enhancement="_blank" />

import type { E02AudioProcessingProjection } from '/_102025_/l2/collabMessagesE02Audio.js';

const receipt = { localRequests: 1 as const, providerAttempts: 1, costChargedUsd: 0.0042, resolvedModel: 'audio-fixture', reconciliationPending: false };
const base: E02AudioProcessingProjection = {
  contractVersion: 'john-audio.v1', processingId: 'audio-fixture-p1', sourceAvailable: true,
  transcription: { state: 'completed', receipt, result: { status: 'speech', text: 'Schedule the review for Tuesday.', uncertainties: [] } },
  review: { state: 'awaiting_review', selectedVersion: 1, versions: [{ version: 1, origin: 'model', text: 'Schedule the review for Tuesday.', createdAt: '2026-09-23T12:00:00Z', status: 'speech', uncertainties: [] }] },
  interpretation: { state: 'not_requested', transcriptVersion: null, contextVersion: null, contextSourceIds: [], receipt: null }, error: null,
};

/** Visual-proof fixtures only. Nothing imports or activates these in the normal product path. */
export const E02_AUDIO_VISUAL_FIXTURES = Object.freeze({
  pending: { ...base, transcription: { state: 'sent' as const, receipt: null }, review: { state: 'not_available' as const, selectedVersion: null, versions: [] } },
  transcript: base,
  corrected: { ...base, review: { state: 'reviewed' as const, selectedVersion: 2, versions: [...base.review.versions, { version: 2, origin: 'human' as const, text: 'Schedule the review for next Tuesday.', createdAt: '2026-09-23T12:03:00Z', status: 'speech' as const }] } },
  noSpeech: { ...base, transcription: { state: 'completed' as const, receipt, result: { status: 'no_speech' as const, text: '', uncertainties: [] } }, review: { state: 'awaiting_review' as const, selectedVersion: 1, versions: [{ version: 1, origin: 'model' as const, text: '', createdAt: '2026-09-23T12:00:00Z', status: 'no_speech' as const }] } },
  unintelligible: { ...base, transcription: { state: 'completed' as const, receipt, result: { status: 'unintelligible' as const, text: '', uncertainties: [{ excerpt: 'inaudible speech', reason: 'background_noise' }] } }, review: { state: 'awaiting_review' as const, selectedVersion: 1, versions: [{ version: 1, origin: 'model' as const, text: '', createdAt: '2026-09-23T12:00:00Z', status: 'unintelligible' as const, uncertainties: [{ excerpt: 'inaudible speech', reason: 'background_noise' }] }] } },
  failed: { ...base, transcription: { state: 'failed' as const, receipt }, review: { state: 'not_available' as const, selectedVersion: null, versions: [] }, error: { code: 'structured_output_rejected', phase: 'transcription' as const, retryable: false } },
  costUncertain: { ...base, transcription: { state: 'uncertain' as const, receipt: { localRequests: 1 as const, providerAttempts: null, costChargedUsd: null, resolvedModel: null, reconciliationPending: true } } },
  interpreted: { ...base, interpretation: { state: 'completed' as const, transcriptVersion: 1, contextVersion: 'memory-v3', contextSourceIds: ['message/source-1'], request: 'Explain using my context.', receipt, result: { answer: 'This is a request to schedule a review.', inferences: [{ statement: 'Tuesday is the requested day.', basis: 'transcript' as const }] } } },
  obsolete: { ...base, interpretation: { state: 'obsolete' as const, transcriptVersion: 1, contextVersion: 'memory-v2', contextSourceIds: ['message/source-old'], receipt }, error: { code: 'source_changed', phase: 'interpretation' as const, retryable: false } },
  unavailable: { ...base, sourceAvailable: false },
  xssLiteral: { ...base, review: { state: 'awaiting_review' as const, selectedVersion: 1, versions: [{ version: 1, origin: 'model' as const, text: '<img src=x onerror=alert(1)>', createdAt: '2026-09-23T12:00:00Z', status: 'speech' as const }] } },
});
